export function cents(value) {
  const s = String(value ?? '').trim().replace(',', '.');
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(s)) throw new Error('Ingresa un monto válido con máximo dos decimales.');
  const [whole, fraction=''] = s.split('.');
  return Number(whole)*100 + Number(fraction.padEnd(2,'0'));
}
export function balances(accounts, movements) {
  return accounts.map(a => {
    let balance = a.opening;
    for (const m of movements) {
      if (m.account === a.id) balance += m.kind === 'income' ? m.amount : -m.amount;
      if (m.kind === 'transfer' && m.destination === a.id) balance += m.amount;
    }
    const reserved = Math.min(a.reserve, Math.max(0, balance));
    return {...a, balance, reserved, available: balance-reserved};
  });
}
export function validDate(date) {
  return typeof date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && new Date(date).toISOString().slice(0,10)===date;
}
