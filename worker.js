import {cents, balances, validDate} from './finance.js';
const enc=new TextEncoder();
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
async function key(secret){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function sign(secret,data){return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',await key(secret),enc.encode(data))),b=>b.toString(16).padStart(2,'0')).join('');}
async function equal(a,b){const [x,y]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(a)),crypto.subtle.digest('SHA-256',enc.encode(b))]);return new Uint8Array(x).reduce((v,c,i)=>v|(c^new Uint8Array(y)[i]),0)===0;}
async function authorized(req,env){const token=(req.headers.get('Cookie')||'').match(/(?:^|;\s*)session=([^;]+)/)?.[1]||''; const [expiry,sig]=token.split('.');return /^\d+$/.test(expiry||'') && Number(expiry)>Date.now() && !!sig && await equal(sig,await sign(env.APP_PASSWORD,expiry));}
async function state(db){const a=await db.prepare('SELECT * FROM accounts ORDER BY rowid').all();const m=await db.prepare('SELECT * FROM movements ORDER BY date DESC, created_at DESC, rowid DESC').all();const setup=await db.prepare('SELECT start_date FROM settings WHERE id=1').first();return {accounts:balances(a.results,m.results),movements:m.results,startDate:setup?.start_date||null};}
async function route(req,env){
 const url=new URL(req.url),path=url.pathname;
 if(!path.startsWith('/api/')) return env.ASSETS.fetch(req);
 if(!env.DB || !env.APP_PASSWORD || env.APP_PASSWORD.length<16) return json({error:'Falta configurar la base de datos y una contraseña de al menos 16 caracteres.'},503);
 if(req.method!=='GET' && req.headers.get('Origin')!==url.origin) return json({error:'Origen no permitido.'},403);
 if(Number(req.headers.get('Content-Length')||0)>16000) return json({error:'Solicitud demasiado grande.'},413);
 if(path==='/api/login' && req.method==='POST'){
  const ip=req.headers.get('CF-Connecting-IP')||'local',now=Math.floor(Date.now()/900000);
  const attempt=await env.DB.prepare('INSERT INTO login_attempts(ip,window,count) VALUES(?,?,1) ON CONFLICT(ip) DO UPDATE SET count=CASE WHEN window=excluded.window THEN count+1 ELSE 1 END, window=excluded.window RETURNING count').bind(ip,now).first();
  if(attempt.count>10)return json({error:'Demasiados intentos. Espera 15 minutos.'},429);
  const body=await req.json();if(typeof body.password!=='string'||body.password.length>256||!await equal(body.password,env.APP_PASSWORD))return json({error:'Contraseña incorrecta.'},401);
  const expiry=String(Date.now()+7*86400000);return json({ok:true},200,{'Set-Cookie':`session=${expiry}.${await sign(env.APP_PASSWORD,expiry)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`});
 }
 if(!await authorized(req,env))return json({error:'Inicia sesión para continuar.'},401);
 if(path==='/api/logout' && req.method==='POST')return json({ok:true},200,{'Set-Cookie':'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
 if(path==='/api/state' && req.method==='GET')return json(await state(env.DB));
 if(path==='/api/setup' && req.method==='POST'){
  const b=await req.json();if(!validDate(b.date))return json({error:'Fecha inválida.'},400);
  const ids=['yape','plin','bcp','cash'],names=['Yape','Interbank / Plin','BCP','Efectivo'];
  const statements=[env.DB.prepare('INSERT INTO settings(id,start_date) VALUES(1,?)').bind(b.date)];
  for(let i=0;i<ids.length;i++){const amount=cents(b[ids[i]]),reserve=ids[i]==='bcp'?cents(b.reserve):0;if(reserve>amount)throw new Error('La reserva no puede superar el saldo de BCP.');statements.push(env.DB.prepare('INSERT INTO accounts(id,name,opening,reserve) VALUES(?,?,?,?)').bind(ids[i],names[i],amount,reserve));}
  try{await env.DB.batch(statements);}catch{return json({error:'Los saldos iniciales ya están guardados. Recarga la página.'},409);}return json(await state(env.DB));
 }
 if(path==='/api/movements' && req.method==='POST'){
  const b=await req.json(),s=await state(env.DB),amount=cents(b.amount);
  if(!s.startDate)throw new Error('Configura primero tus saldos iniciales.');
  if(!['income','expense','transfer'].includes(b.kind)||!s.accounts.some(a=>a.id===b.account)||!validDate(b.date)||b.date<s.startDate||amount<=0||typeof b.note!=='string'||!b.note.trim()||b.note.length>160||!/^[-\w]{20,64}$/.test(b.id||''))throw new Error('Revisa la cuenta, fecha, motivo y monto.');
  if(b.kind==='transfer'&&(!s.accounts.some(a=>a.id===b.destination)||b.destination===b.account))throw new Error('Elige una cuenta de destino diferente.');
  // Client-generated unique id makes a retry safe after a lost response.
  await env.DB.prepare('INSERT INTO movements(id,kind,account,destination,amount,note,date) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(b.id,b.kind,b.account,b.kind==='transfer'?b.destination:null,amount,b.note.trim(),b.date).run();return json(await state(env.DB));
 }
 if(path.startsWith('/api/movements/')&&req.method==='DELETE'){await env.DB.prepare('DELETE FROM movements WHERE id=?').bind(decodeURIComponent(path.slice('/api/movements/'.length))).run();return json(await state(env.DB));}
 return json({error:'Ruta no encontrada.'},404);
}
export default {async fetch(req,env){let response;try{response=await route(req,env);}catch(e){response=json({error:e instanceof SyntaxError?'Solicitud inválida.':e.message?.startsWith('D1')?'No se pudo guardar. Inténtalo de nuevo.':e.message||'Ocurrió un error.'},400);}const r=new Response(response.body,response);r.headers.set('X-Content-Type-Options','nosniff');r.headers.set('Referrer-Policy','same-origin');r.headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");return r;}};
