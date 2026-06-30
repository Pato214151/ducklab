import 'server-only'

const DATABASE_URL = process.env.DATABASE_URL

let pool = null
let connected = false

export async function getPool() {
  if (pool) return pool
  try {
    const { default: pg } = await import('pg')
    // Las bases en la nube (Supabase, Neon, Render) exigen SSL; en local no.
    const needsSsl = !/@(localhost|127\.0\.0\.1)/.test(DATABASE_URL || '')
    pool = new pg.Pool({
      connectionString: DATABASE_URL,
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    })
    const client = await pool.connect()
    await client.query('SELECT 1')
    client.release()
    connected = true
    console.log('[DB] PostgreSQL connected')
    return pool
  } catch {
    console.log('[DB] PostgreSQL not available, using JSON fallback')
    return null
  }
}

export function isPgConnected() {
  return connected
}

export async function query(text, params) {
  const p = await getPool()
  if (!p) throw new Error('PostgreSQL not connected')
  return p.query(text, params)
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
    connected = false
  }
}
