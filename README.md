# 💰 HuertaFinan - Sistema ERP Financiero

**HuertaFinan** es un sistema ERP financiero integral, moderno, profesional y responsive para la gestión de finanzas personales y empresariales en soles (S/) y multimoneda (USD, EUR). Diseñado para funcionar de manera óptima en **celulares (Android / iPhone)**, **tablets**, **laptops** y **computadoras de escritorio**, con soporte completo como aplicación instalable (**PWA**).

---

## 🚀 Características Principales

### 1. 📊 Dashboard Financiero en Vivo
- **Saldo Disponible Real**: Suma automática de todas las cuentas activas (excluye inactivas).
- **Distribución de Fondos**: Desglose inmediato entre dinero en efectivo y cuentas bancarias / billeteras digitales.
- **Flujo Mensual**: Ingresos del mes, gastos del mes y cálculo automático de ganancia o pérdida neta.
- **Gráfico de Flujo de Efectivo**: Comparativa visual diaria de ingresos vs. gastos de los últimos 7 días.
- **Gastos por Categoría**: Visualización porcentual de los principales rubros de gasto.
- **Saldo por Cuenta**: Vista rápida del saldo actual de cada una de tus cuentas.
- **Próximos Pagos y Deudas**: Alertas de vencimientos inmediatos de servicios y cuotas de préstamos.
- **Últimos Movimientos**: Historial reciente de transacciones con acceso rápido.

### 2. 🏦 Bancos y Cuentas Financieras
- Registro de cuentas ilimitadas:
  - **Efectivo** (Caja chica, bóveda, mano)
  - **Banco** (BCP, BBVA, Interbank, Scotiabank, etc.)
  - **Cuenta de Ahorro**
  - **Cuenta Corriente**
  - **Yape**
  - **Plin**
  - **Otras cuentas**
- Campos por cuenta: Nombre, Tipo, Entidad bancaria, N° de cuenta/CCI/teléfono, Saldo inicial, Saldo actual y Estado (**Activa / Inactiva**).
- **Cálculo Automático**: El saldo actual se calcula de forma exacta:
  $$\text{Saldo Actual} = \text{Saldo Inicial} + \text{Ingresos} - \text{Gastos} + \text{Transferencias Entrantes} - \text{Transferencias Salientes}$$
- Al editar o eliminar cualquier movimiento, los saldos se recalculan automáticamente sin desfasarse.

### 3. 📈 Registro de Ingresos
- Registro detallado: Fecha, hora, descripción, categoría, monto, cuenta receptora, método de pago, cliente/persona y observaciones.
- Aumenta automáticamente el saldo de la cuenta elegida en tiempo real.

### 4. 📉 Registro de Gastos
- Registro diario: Fecha, hora, concepto, categoría (Alimentación, Transporte, Alquiler, Servicios, Compras, Personal, Bancos, Impuestos, etc.), monto, cuenta emisora, método de pago, proveedor y comprobante.
- Deduce automáticamente el saldo de la cuenta emisora.

### 5. ⇄ Transferencias entre Cuentas
- Mueve fondos entre tus propias cuentas (ejemplo: S/500 de BCP a Yape).
- Disminuye el saldo de la cuenta de origen y aumenta el de destino.
- **Cero impacto en ingresos o gastos**: No altera el estado de resultados del mes.

### 6. 💳 Control de Deudas y Cobranzas
- Administración de pasivos (*lo que debo*) y activos (*lo que me deben*).
- Registro de acreedor/deudor, concepto, monto original, monto pagado, saldo pendiente, cuotas y fechas.
- 4 estados automáticos: **Pendiente**, **Parcial**, **Pagada** y **Vencida**.
- Registro de abonos que descuentan el saldo pendiente y generan el egreso/ingreso en la cuenta seleccionada.

### 7. ⏰ Módulo de Pagos Programados
- Control de servicios fijos y recurrentes (Alquiler S/800, Internet S/100, Cuota Banco S/500, Luz S/150).
- Frecuencia configurable: Único, semanal, mensual o anual.
- Botón **"Pagar Ahora"**: Realiza el pago en un clic, debita el dinero de la cuenta y actualiza el próximo vencimiento.

### 8. 🏢 Administración de Alquileres
- Registro de inmuebles en alquiler (tanto los que cobras como inquilinos como los que tú pagas como arrendatario).
- Control de pagos mensuales con recibos y comprobantes.

### 9. 📑 Libro de Movimientos
- Pantalla completa con todos los ingresos, gastos y transferencias.
- Filtros rápidos de fecha: **Hoy**, **Esta semana**, **Este mes**, **Mes anterior**, y **Fecha personalizada**.
- Filtros por **Tipo** (Ingresos, Gastos, Transferencias), **Cuenta** y **Categoría**.
- Buscador por texto libre.
- **Acciones**: Ver detalle completo en modal, Editar y Eliminar con recálculo automático de saldos.

### 10. 📊 Reportes y Exportación
- Reporte por período: Diario, Semanal, Mensual, Anual e Histórico.
- Gráficos de:
  - Ingresos vs. Gastos y Margen Neto.
  - Gastos por categoría.
  - **Evolución del saldo en el tiempo**.
  - Movimientos y rendimiento por cuenta.
- Exportación a **Excel (.xlsx)** e **Impresión / PDF**.

### 11. 📱 Instalable como PWA (Mobile & Desktop)
- Totalmente instalable en **Android, iPhone (iOS) y PC** como aplicación nativa.
- Funciona sin conexión (Offline) mediante Service Workers y caché local.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Empaquetador**: [Vite](https://vitejs.dev/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **PWA**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- **Exportación**: [xlsx](https://sheetjs.com/)
- **Persistencia**: LocalStorage aislado por usuario + Esquema relacional con RLS para Supabase/PostgreSQL.

---

## 💻 Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/vision-al-desarrollo-chacchan/huerta-finanzas.git
   cd huerta-finanzas
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

4. **Compilar para producción**:
   ```bash
   npm run build
   ```
   Los archivos listos para producción se generarán en la carpeta `dist/`.

---

## 🌐 Opciones de Despliegue

### Despliegue en Cloudflare Pages (Gratis)
1. Ve al panel de Cloudflare y selecciona **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Selecciona el repositorio `vision-al-desarrollo-chacchan/huerta-finanzas`.
3. Configura:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Haz clic en **Save and Deploy**.

### Despliegue en Vercel o Netlify
Solo conecta el repositorio en [Vercel](https://vercel.com) o [Netlify](https://netlify.com); detectará automáticamente Vite y compilará la carpeta `dist`.
