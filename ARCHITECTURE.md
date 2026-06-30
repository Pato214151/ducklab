# Arquitectura de Ducklab

> Plataforma para **distribuir y operar software a medida** para clientes —
> estilo "Steam para tu software". Este documento describe sus componentes, sus
> flujos y, sobre todo, **cómo está protegida en cada capa**.

---

## 1. Visión general

Ducklab se compone de **tres piezas** que se comunican entre sí:

| Pieza | Qué es | Dónde corre |
|-------|--------|-------------|
| **Portal** | Web pública + portal de clientes + panel admin + API | Next.js 16 / React 19 → **Vercel** |
| **Launcher** | App de escritorio que instala, actualiza y abre los sistemas del cliente | PyQt5 + QtWebEngine (Windows) |
| **Sistemas del cliente** | El software entregado: web (ej. Raloz) o escritorio (ej. Pocitos POS) | Render / el PC del cliente |

La **base de datos** (PostgreSQL en **Supabase**) es la fuente de verdad del
portal. La **distribución de binarios** se hace por **GitHub Releases**.

---

## 2. Componentes

### 2.1 Portal (Next.js, Vercel)
- **Landing** pública (marketing, planes, blog, legales).
- **Portal de clientes** (`/dashboard`): cada cliente ve solo sus sistemas,
  descargas, tickets, pagos y estado en vivo.
- **Panel admin** (`/dashboard/admin`): gestión de clientes/sistemas/versiones,
  telemetría, **licencias** y **auditoría**.
- **API** (route handlers): `me`, `my-apps`, `downloads`, `telemetry`, `backup`,
  `license`, `webhook/github`, `cron/health-check`.

### 2.2 Capa de datos
- **`src/lib/db.js`** despacha a **`db-pg.js`** (Postgres/producción) o
  **`db-json.js`** (JSON/desarrollo y tests) según `DATABASE_URL` → **paridad**
  entre ambos backends.
- Consultas **siempre parametrizadas** (`$1, $2…`) → sin inyección SQL.

### 2.3 Launcher (escritorio)
- Descarga el instalador del cliente desde GitHub Releases, lo **descomprime** e
  instala, y detecta **actualizaciones** comparando versiones contra el portal.
- **Navegador embebido (Chromium/QtWebEngine)**: los sistemas *web* se abren
  **dentro** del launcher (perfil con caché en disco → sesión persistente).
- Se distribuye como **instalador de un clic** (Inno Setup, por-usuario, sin UAC).

### 2.4 Sistemas del cliente
- **Web** (ej. Raloz, Flask + React en Render): el launcher los abre embebidos;
  requieren internet.
- **Escritorio** (ej. Pocitos POS, Python + SQLite): funcionan **offline**; sus
  datos viven en `%LOCALAPPDATA%` (fuera de la app → actualizar no borra ventas).

---

## 3. Seguridad — capa por capa 🔒

La seguridad es el eje del diseño. De afuera hacia adentro:

### Capa 1 — Autenticación
- **JWT firmado (HS256)** con `SESSION_SECRET` (obligatorio en producción; la
  app **no arranca** sin él).
- Sesión en **cookie `HttpOnly` + `Secure` (prod) + `SameSite=Lax`** → no
  accesible por scripts, no viaja en cross-site.
- Contraseñas con **bcrypt** (nunca en texto plano); mínimo **8 caracteres**.
- **Rate-limit** en login (5 intentos / 15 min por IP → `429`).

### Capa 2 — Autorización
- **`proxy.js`** bloquea `/dashboard/*` sin sesión.
- **Route handlers** verifican **propiedad del recurso** (un cliente solo accede
  a *sus* descargas/sistemas; `requireAdmin` para lo administrativo).
- `/api/me` nunca devuelve el hash; `/api/my-apps` no expone la API key.

### Capa 3 — APIs máquina-a-máquina
- **Telemetría / Respaldo / Licencia**: autenticadas con la **API key del
  sistema** (`sk_live_…`, una por sistema). Rate-limit por sistema.
- **Webhook de GitHub**: firma **HMAC `x-hub-signature-256`** comparada a tiempo
  constante, **fail-closed** (sin secreto configurado → `503`, no procesa nada).
- **Cron** (dead-man switch): protegido por `CRON_SECRET`, **fail-closed**.

### Capa 4 — Cabeceras del navegador
`Content-Security-Policy` · `Strict-Transport-Security` (HSTS) ·
`X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff` ·
`Referrer-Policy` · `Permissions-Policy`.

### Capa 5 — Datos y operación
- **Secretos jamás en git** (`.env.local`, credenciales y `db.json` ignorados).
- **Semilla limpia** en los zips públicos (NUNCA datos reales del cliente).
- **Audit log**: queda registro de cada acción admin (crear, regenerar key,
  licencia…) → trazabilidad.
- **Licencia controlada desde el portal** con **tolerancia offline** (gracia de
  30 días): control de negocio sin tumbar al cliente por un corte de internet.

---

## 4. Flujos clave

1. **Login** → cliente entra al portal/launcher (JWT en cookie `HttpOnly`).
2. **Estado en vivo** → cada sistema manda *latido* (`POST /api/telemetry` con
   su API key); el dead-man switch alerta si un **servidor** deja de responder
   (los de escritorio, intermitentes, no se alertan).
3. **Instalar / Actualizar** → el launcher baja de GitHub Releases y compara la
   versión contra el portal; los datos del cliente se conservan.
4. **Respaldo a la nube** → el POS sube su BD (`POST /api/backup`) cuando hay
   internet; se guardan los últimos respaldos por sistema.
5. **Licencia** → el sistema pregunta `GET /api/license` al abrir; el admin lo
   activa/desactiva desde el portal (con caché offline).

---

## 5. Decisiones de arquitectura

- **Paridad db-pg/db-json**: mismo contrato; Postgres en prod, JSON en dev/tests
  (sin tocar la BD real, vía `JRDEV_DB_FILE`).
- **Launcher onedir + instalador, sin UPX**: arranque instantáneo e instalación
  de un clic; sin UPX para reducir falsos positivos de antivirus.
- **Datos del POS en `%LOCALAPPDATA%`**: sobreviven a las actualizaciones.
- **API key por sistema**: misma credencial para telemetría, respaldo y licencia
  → un solo secreto por sistema, fácil de rotar (regenerar desde el panel).

---

## 6. Pendiente / a futuro
- Dominio propio (`ducklab.co`) + correo verificado (sacar de spam).
- Pasarela de pagos (Wompi / MercadoPago).
- Offline-first real para sistemas **web** (PWA + sincronización con resolución
  de conflictos).

---

_Última actualización: 2026-06-21._
