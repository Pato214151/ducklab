# Ducklab

**Portal de clientes + Launcher de escritorio** para distribución de software personalizado.

Cada cliente tiene su propia cuenta con acceso a sus aplicaciones, descargas seguras, soporte técnico y gestión de pagos. Como Steam, pero para sistemas POS y software a medida en Colombia.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend Web | Next.js 16, React 19.2, CSS Modules |
| Backend Web | Server Actions, Route Handlers |
| Auth | JWT (jose), bcryptjs, cookies HttpOnly |
| Base de Datos | JSON file → PostgreSQL (próximamente) |
| Launcher Desktop | Python 3, PyQt5, requests |

---

## Empezar

### Requisitos
- Node.js 20.9+
- Python 3.10+ (solo para el launcher)

### Web

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

### Launcher Desktop

```bash
cd launcher
pip install -r requirements.txt
python main.py
```

---

## Credenciales de Prueba

> ⚠️ Las contraseñas de producción son secretas y se rotan. Nunca escribir
> contraseñas reales en este archivo ni mostrarlas en capturas de pantalla.

| Email | Rol | Plan |
|-------|-----|------|
| carlos@empresa.com | Cliente | Profesional |
| maria@negocio.co | Cliente | Básico |
| admin@jrdev.co | Admin | — |

---

## Estructura

```
mi-plataforma/
├── src/
│   ├── app/           # Web (Next.js App Router)
│   │   ├── login/     # Login con autenticación
│   │   ├── dashboard/ # Portal privado del cliente
│   │   │   ├── downloads/   # Descargas seguras
│   │   │   ├── tickets/     # Tickets de soporte
│   │   │   └── payments/    # Historial de pagos
│   │   └── api/       # API REST
│   └── lib/           # Lógica compartida
│       ├── db.js      # Base de datos
│       ├── session.js # JWT sessions
│       ├── dal.js     # Data Access Layer
│       └── actions/   # Server Actions
│
├── launcher/          # App de escritorio (Python)
│   ├── main.py        # Entry point
│   ├── ui/            # Ventanas PyQt5
│   └── lib/           # API client, session, updater
│
├── data/              # Datos persistentes
├── ARCHITECTURE.md    # Documentación técnica
└── README.md          # Este archivo
```

---

## Rutas

| Ruta | Descripción | Auth |
|------|-------------|------|
| `/` | Landing page | No |
| `/planes` | Planes y precios | No |
| `/login` | Inicio de sesión | No |
| `/dashboard` | Dashboard principal | Sí |
| `/dashboard/downloads` | Descargas de software | Sí |
| `/dashboard/tickets` | Tickets de soporte | Sí |
| `/dashboard/tickets/[id]` | Detalle del ticket | Sí |
| `/dashboard/payments` | Historial de pagos | Sí |
| `/api/downloads/[id]` | Descarga de archivos | Sí |

---

## Licencia

Uso privado — Ducklab © 2026
