# Huerta Finanzas

Control personal de ingresos variables, gastos y transferencias en soles. Interfaz adaptable a celular, con Yape independiente, Interbank/Plin compartido, BCP y efectivo. Una reserva de BCP se muestra fuera del disponible. Los movimientos y saldos iniciales se guardan en Cloudflare D1, no en GitHub ni en el navegador.

## Estado

Código listo para configurar y desplegar. El repositorio por sí solo no activa la aplicación: hacen falta una base D1, una contraseña secreta y un despliegue en Cloudflare Workers. No está conectado a bancos; cada movimiento se registra manualmente. No usar GitHub Pages: no ejecuta este servidor.

## Instalación y publicación

Requiere Node.js 22 o posterior y una cuenta de Cloudflare con Workers y D1.

1. `npm ci`
2. `npx wrangler login`
3. `npx wrangler d1 create huerta-finanzas`
4. Copiar el `database_id` devuelto dentro de la entrada `d1_databases` en `wrangler.jsonc`, manteniendo el binding `DB`.
5. `npm run db:remote`
6. `npx wrangler secret put APP_PASSWORD` e introducir una contraseña única de al menos 16 caracteres. Nunca escribirla en archivos del repositorio. Este comando puede pedir crear el Worker si aún no existe.
7. `npm run deploy`
8. Abrir la URL del Worker, iniciar sesión y registrar los saldos iniciales reales. El dinero inicial no cuenta como ingreso. La fecha predeterminada es el 1 de septiembre de 2026 y se puede ajustar antes de guardar.

La configuración usa [Workers con archivos estáticos](https://developers.cloudflare.com/workers/static-assets/binding/) y [D1](https://developers.cloudflare.com/d1/). El código puede ser público, los datos y secretos deben seguir en los recursos privados de Cloudflare.

## Uso

- Registrar cada ingreso o gasto con cuenta, fecha, monto y motivo.
- Usar Transferencia cuando se mueve dinero entre cuentas propias.
- El resumen mensual excluye transferencias y saldos iniciales; las tarjetas de cuentas siempre muestran el saldo actual de todos los movimientos.
- Para corregir un movimiento, eliminarlo con la × y volver a registrarlo; la aplicación pide confirmación y recalcula los saldos.
- La reserva es un objetivo fijo de BCP: se protege hasta el menor valor entre la reserva inicial y el saldo BCP actual. Si se vuelve a ingresar dinero en BCP, se vuelve a cubrir ese objetivo. No es una cuenta adicional. En esta primera versión no hay editor de la meta de reserva.
- Se permiten saldos negativos para que puedas registrar gastos reales aunque falte un ingreso por anotar.
- Efectivo empieza con el monto que introduzcas; no se asume un saldo real.

## Desarrollo

Crear `.dev.vars` localmente con `APP_PASSWORD=una-contraseña-de-prueba-larga`. Ese archivo está excluido de Git. Ejecutar `npm run db:local` y `npm run dev`. No utilizar datos personales en fixtures ni contraseñas reales en pruebas.

`npm test` valida decimales, transferencias, reserva y control de acceso. Las pruebas de autenticación usan una base simulada; validar D1 real después de configurar Cloudflare. Las operaciones monetarias usan céntimos enteros. La inserción de saldos iniciales es transaccional; los movimientos llevan una clave de idempotencia para evitar duplicados al reintentar.

## Acceso y limitaciones

Es una aplicación para una sola persona. Sesión firmada de siete días, cookie HttpOnly/Secure/SameSite, validación de origen, consultas preparadas y límite de 10 intentos de inicio por IP cada ventana de 15 minutos. Cambiar APP_PASSWORD invalida todas las sesiones. El cierre de sesión borra la cookie del dispositivo; no revoca copias previas del token. Proteger también la cuenta de Cloudflare y la de GitHub.

Los datos sobreviven al cierre del navegador y son compartidos entre tus dispositivos al entrar con la contraseña. El guardado requiere internet. Al fallar una solicitud el formulario se conserva mientras no cierres ni recargues la pestaña. No existe sincronización automática con Yape, Plin ni bancos.
