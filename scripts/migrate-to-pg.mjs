/**
 * Migra los datos de data/db.json a PostgreSQL.
 *
 * Uso:
 *   1. Crea una base PostgreSQL (Supabase, Render, Neon o local).
 *   2. Pon DATABASE_URL en .env.local
 *   3. Corre:  npm run migrate:pg
 *
 * Es idempotente: crea el esquema si no existe e inserta con ON CONFLICT DO NOTHING.
 */
import fs from 'fs'
import path from 'path'

/**
 * Inserta todos los datos del JSON usando una función query(text, params).
 * Se exporta para poder testearla contra Postgres real (pglite).
 */
export async function seedData(query, data) {
  for (const u of data.users || []) {
    await query(
      `INSERT INTO users (id, name, email, password, role, plan, avatar, last_login, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
      [u.id, u.name, u.email, u.password, u.role, u.plan, u.avatar, u.lastLogin || null, u.createdAt || new Date()]
    )
  }

  for (const s of data.systems || []) {
    await query(
      `INSERT INTO systems (id, client_id, name, icon, type, description, file_name, file_size, version, status,
         external_url, api_key, runbook, git_repo, git_branch, last_commit_sha, last_commit_msg, last_commit_date, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT (id) DO NOTHING`,
      [s.id, s.clientId, s.name, s.icon, s.type, s.description, s.fileName, s.fileSize, s.version, s.status,
       s.externalUrl, s.apiKey, s.runbook || null, s.gitRepo, s.gitBranch, s.lastCommitSha, s.lastCommitMsg, s.lastCommitDate, s.createdAt || new Date()]
    )
  }

  for (const d of data.downloads || []) {
    await query(
      `INSERT INTO downloads (id, system_id, client_id, name, description, file_name, file_size, version, changelog, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (id) DO NOTHING`,
      [d.id, d.systemId, d.clientId, d.name, d.description, d.fileName, d.fileSize, d.version, d.changelog, d.createdAt || new Date()]
    )
  }

  for (const t of data.telemetry || []) {
    await query(
      `INSERT INTO telemetry (id, system_id, client_id, status, version, last_heartbeat)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
      [t.id, t.systemId, t.clientId, t.status, t.version, t.lastHeartbeat || new Date()]
    )
    for (const e of t.errors || []) {
      await query(
        `INSERT INTO telemetry_errors (telemetry_id, level, message, stacktrace, logged_at, resolved)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [t.id, e.level, e.message, e.stacktrace, e.loggedAt || new Date(), e.resolved || false]
      )
    }
  }

  for (const tk of data.tickets || []) {
    await query(
      `INSERT INTO tickets (id, client_id, system_id, subject, description, status, priority, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
      [tk.id, tk.clientId, tk.systemId, tk.subject, tk.description, tk.status, tk.priority, tk.createdAt || new Date(), tk.updatedAt || new Date()]
    )
    for (const m of tk.messages || []) {
      await query(
        `INSERT INTO ticket_messages (ticket_id, user_id, user_name, text, is_staff, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [tk.id, m.userId, m.userName, m.text, m.isStaff || false, m.createdAt || new Date()]
      )
    }
  }

  for (const p of data.payments || []) {
    await query(
      `INSERT INTO payments (id, client_id, plan, amount, currency, status, method, due_date, paid_at, invoice, early_requested, early_requested_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
      [p.id, p.clientId, p.plan, p.amount, p.currency, p.status, p.method, p.dueDate, p.paidAt, p.invoice, p.earlyRequested || false, p.earlyRequestedAt || null]
    )
  }

  // Reinicia las secuencias para que los próximos IDs automáticos no colisionen.
  for (const tbl of ['users', 'systems', 'downloads', 'telemetry', 'telemetry_errors', 'tickets', 'ticket_messages', 'payments', 'password_resets']) {
    await query(
      `SELECT setval(pg_get_serial_sequence('${tbl}', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM ${tbl}), 1))`
    )
  }
}

// ── CLI ──
async function main() {
  const root = process.cwd()
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('❌ Falta DATABASE_URL.\n   Corre:  node --env-file=.env.local scripts/migrate-to-pg.mjs')
    process.exit(1)
  }
  const dbPath = path.join(root, 'data', 'db.json')
  if (!fs.existsSync(dbPath)) {
    console.error('❌ No existe data/db.json. Arranca el portal una vez (npm run dev) para generar el seed.')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  const schema = fs.readFileSync(path.join(root, 'schema.sql'), 'utf-8')
  const pg = (await import('pg')).default
  const needsSsl = !/@(localhost|127\.0\.0\.1)/.test(DATABASE_URL)
  const pool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: needsSsl ? { rejectUnauthorized: false } : false,
  })
  const c = await pool.connect()
  try {
    console.log('▶ Creando/verificando esquema…')
    await c.query(schema)
    await c.query('BEGIN')
    await seedData((text, params) => c.query(text, params), data)
    await c.query('COMMIT')
    console.log('✅ Migración completa. El portal usará PostgreSQL automáticamente con DATABASE_URL.')
  } catch (e) {
    await c.query('ROLLBACK')
    console.error('❌ Error — se revirtió todo:', e.message)
    process.exitCode = 1
  } finally {
    c.release()
    await pool.end()
  }
}

// Solo ejecuta el CLI si se corre directamente (no al importar en tests).
if (process.argv[1] && process.argv[1].endsWith('migrate-to-pg.mjs')) {
  main()
}
