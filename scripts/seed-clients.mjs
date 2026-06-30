/**
 * Crea el admin (Julián) y los clientes reales (Raloz COL SAS, Los Pocitos
 * Azufrados) con sus sistemas, sacados de sus repositorios.
 *
 * Uso:
 *   node --env-file=.env.local scripts/seed-clients.mjs
 *
 * - Idempotente: si un usuario (por email) o sistema (por nombre) ya existe,
 *   NO lo duplica.
 * - Contraseñas: genera temporales aleatorias y las escribe SOLO en
 *   credenciales-iniciales.txt (gitignored). No se imprimen en consola.
 */
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import pg from 'pg'

// ── Datos a crear ──────────────────────────────────────────────
const ADMIN = { name: 'Julián Ramírez', email: 'jramirezramirez2005@gmail.com', role: 'admin', plan: null }

const CLIENTS = [
  {
    user: { name: 'Raloz COL SAS', email: 'ralozcolsas@ducklab.co', role: 'client', plan: 'Profesional' },
    systems: [
      {
        name: 'Raloz Web — Panel Admin & POS', icon: '🧵', type: 'online',
        externalUrl: 'https://raloz-web.onrender.com',
        description: 'Sistema integral Flask + React: panel administrativo, punto de venta (POS), inventario por tallas, facturación y seguimiento de fabricación. Roles: administrador, vendedor y cajero. Base de datos PostgreSQL.',
      },
      {
        name: 'Tienda Pública Raloz', icon: '🛒', type: 'online',
        externalUrl: 'https://ralozcol-web.pages.dev',
        description: 'Página web / tienda en línea de uniformes escolares: catálogo por colegio, carrito y pagos con MercadoPago. Sincronizada con el inventario del sistema administrativo.',
      },
    ],
  },
  {
    user: { name: 'Los Pocitos Azufrados', email: 'pocitos@ducklab.co', role: 'client', plan: 'Profesional' },
    systems: [
      {
        name: 'Página Web — Los Pocitos Azufrados', icon: '🌐', type: 'online',
        externalUrl: 'https://lospocitosazufrados.com',
        description: 'Sitio web oficial de Los Pocitos Azufrados (hacienda vacacional en Tocaima, Cundinamarca): presentación, galería, carta/menú, mapa y formulario de contacto.',
      },
      {
        name: 'Pocitos Azufrados POS', icon: '🍽️', type: 'desktop',
        externalUrl: null,
        description: 'Sistema POS de escritorio (Python + Tkinter + SQLite) para club y restaurante: ventas, caja, inventario, cuentas abiertas, boletas, reservas de almuerzo, visor de cocina web en tiempo real, facturación electrónica DIAN e impresión de recibos.',
      },
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────
function tempPassword() {
  // 12 chars sin caracteres ambiguos, fáciles de dictar
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.randomBytes(12)
  return Array.from(bytes, (b) => abc[b % abc.length]).join('')
}

async function ensureUser(c, u) {
  const ex = await c.query('SELECT id FROM users WHERE email = $1', [u.email])
  if (ex.rows.length) return { id: ex.rows[0].id, created: false, password: null }
  const password = tempPassword()
  const hash = bcrypt.hashSync(password, 10)
  const { rows } = await c.query(
    'INSERT INTO users (name, email, password, role, plan) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [u.name, u.email, hash, u.role, u.plan]
  )
  return { id: rows[0].id, created: true, password }
}

async function ensureSystem(c, clientId, s) {
  const ex = await c.query('SELECT id FROM systems WHERE client_id = $1 AND name = $2', [clientId, s.name])
  if (ex.rows.length) return { id: ex.rows[0].id, created: false }
  const apiKey = 'sk_live_' + crypto.randomBytes(24).toString('hex')
  const { rows } = await c.query(
    `INSERT INTO systems (client_id, name, icon, type, description, version, status, external_url, api_key)
     VALUES ($1,$2,$3,$4,$5,'1.0.0','offline',$6,$7) RETURNING id`,
    [clientId, s.name, s.icon, s.type, s.description, s.externalUrl, apiKey]
  )
  return { id: rows[0].id, created: true }
}

// ── Main ───────────────────────────────────────────────────────
async function main() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('❌ Falta DATABASE_URL. Corre:  node --env-file=.env.local scripts/seed-clients.mjs')
    process.exit(1)
  }
  const needsSsl = !/@(localhost|127\.0\.0\.1)/.test(DATABASE_URL)
  const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: needsSsl ? { rejectUnauthorized: false } : false })
  const c = await pool.connect()

  const creds = []   // {label, email, password} solo de los creados
  const summary = [] // líneas para consola (SIN contraseñas)

  try {
    await c.query('BEGIN')

    // Admin
    const admin = await ensureUser(c, ADMIN)
    summary.push(`${admin.created ? '✅ creado' : '· ya existía'}  ADMIN   ${ADMIN.name} <${ADMIN.email}>`)
    if (admin.created) creds.push({ label: 'ADMIN — ' + ADMIN.name, email: ADMIN.email, password: admin.password })

    // Clientes + sistemas
    for (const cl of CLIENTS) {
      const u = await ensureUser(c, cl.user)
      summary.push(`${u.created ? '✅ creado' : '· ya existía'}  CLIENTE ${cl.user.name} <${cl.user.email}>`)
      if (u.created) creds.push({ label: 'CLIENTE — ' + cl.user.name, email: cl.user.email, password: u.password })

      for (const s of cl.systems) {
        const sys = await ensureSystem(c, u.id, s)
        summary.push(`   ${sys.created ? '✅' : '·'} sistema [${s.type}] ${s.name}`)
      }
    }

    await c.query('COMMIT')
  } catch (e) {
    await c.query('ROLLBACK')
    console.error('❌ Error — se revirtió TODO (no se creó nada):', e.message)
    process.exitCode = 1
    c.release(); await pool.end()
    return
  }

  c.release()
  await pool.end()

  // Resumen en consola (sin contraseñas)
  console.log('\n' + summary.join('\n'))

  // Contraseñas → archivo local gitignored
  if (creds.length) {
    const out = path.join(process.cwd(), 'credenciales-iniciales.txt')
    const body =
      `CREDENCIALES INICIALES — Ducklab (generadas ${new Date().toLocaleString('es-CO')})\n` +
      `=================================================================\n` +
      `⚠️  Temporales. Cámbialas tras el primer login. BORRA este archivo cuando ya no las necesites.\n` +
      `    Login del portal: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://mi-pagina-web-two-lilac.vercel.app'}/login\n\n` +
      creds.map((x) => `${x.label}\n  Correo:      ${x.email}\n  Contraseña:  ${x.password}\n`).join('\n')
    fs.writeFileSync(out, body, 'utf-8')
    console.log(`\n🔐 ${creds.length} contraseña(s) temporal(es) guardadas en:  credenciales-iniciales.txt`)
    console.log('   (archivo local, NO se sube a git — ábrelo, pásalas y luego bórralo)')
  } else {
    console.log('\nℹ️ No se crearon usuarios nuevos (todos ya existían) — no se generaron contraseñas.')
  }
}

main()
