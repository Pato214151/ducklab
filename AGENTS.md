<!--
This file is read by AI coding agents. Keep it up-to-date.
-->

# Ducklab — Contexto para AI Agents

## Proyecto
Portal de clientes tipo Steam para distribuir software a medida (POS, escritorio, web).
Cada cliente tiene cuenta propia con sus apps asignadas, descargas seguras, tickets y pagos.

## Stack
- Web: Next.js 16, React 19.2, CSS Modules
- Auth: jose (JWT), bcryptjs, cookies HttpOnly
- DB: JSON file (data/db.json), migrar a PostgreSQL después
- Launcher: Python 3.10+, PyQt5, requests

## Estructura clave
```
src/
  lib/
    db.js       — Funciones de acceso a datos (JSON)
    session.js  — JWT: encrypt, decrypt, createSession, getSession, requireAuth
    dal.js      — verifySession (cache), getCurrentUser
    definitions.js — Schemas Zod
    actions/
      auth.js     — login(), logout() Server Actions
      tickets.js  — createTicketAction, addMessageAction
  app/
    proxy.js    — Auth middleware (Next.js 16 proxy)
    login/      — Página de login
    dashboard/  — Portal protegido (layout, home, downloads, tickets, payments)
    api/
      me/route.js       — GET /api/me (usuario actual)
      my-apps/route.js  — GET /api/my-apps (apps del cliente)
      downloads/[id]/route.js — GET /api/downloads/[id]

launcher/
  main.py       — Entry point PyQt5
  ui/           — login_window.py, main_window.py, styles.py
  lib/          — api.py, apps.py
  config.py     — SERVER_URL, APP_DIR
```

## Breaking Changes Next.js 16 (importante)
- `cookies()` y `headers()` son async (requieren `await`)
- `params` y `searchParams` en pages/routes son async
- `proxy.js` reemplaza a `middleware.js`, export `proxy()` no `middleware()`
- Turbopack por defecto

## Credenciales prueba
⚠️ NUNCA escribir contraseñas reales aquí ni en capturas. Las de producción son
secretas y se rotan; estas son solo cuentas de ejemplo para desarrollo local.
- carlos@empresa.com (cliente, Plan Profesional)
- maria@negocio.co (cliente, Plan Básico)
- admin@jrdev.co (admin)

## Arquitectura seguridad
1. proxy.js — filtro rutas no autenticadas
2. session.js — JWT firmado HS256, cookies HttpOnly
3. dal.js — Data Access Layer con React cache
4. Server Actions — validación Zod server-side
5. Route Handlers — verificación propiedad del recurso
