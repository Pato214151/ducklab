import 'server-only'
import { query } from './db-pool'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

function toCamelCase(row) {
  if (!row) return null
  const result = {}
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = value
  }
  return result
}

function toSnakeKey(key) {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase()
}

// Columnas actualizables por tabla. Las keys del objeto `updates` acaban
// interpoladas en el SQL, así que sin esta whitelist una key maliciosa
// (p.ej. "password = 'x' --") se colaría en la consulta.
const UPDATABLE_COLUMNS = {
  systems: new Set([
    'name', 'icon', 'type', 'description', 'fileName', 'fileSize', 'version',
    'status', 'externalUrl', 'runbook', 'licenseActive', 'gitRepo', 'gitBranch',
    'lastCommitSha', 'lastCommitMsg', 'lastCommitDate',
  ]),
}

function buildUpdateQuery(table, id, updates) {
  const allowed = UPDATABLE_COLUMNS[table]
  if (!allowed) throw new Error(`buildUpdateQuery: tabla sin whitelist de columnas: ${table}`)
  const entries = Object.entries(updates).filter(([k, v]) => v !== undefined && allowed.has(k))
  if (entries.length === 0) return null
  const setClauses = entries.map(([key], i) => `${toSnakeKey(key)} = $${i + 1}`)
  const values = entries.map(([_, value]) => value)
  values.push(id)
  return {
    text: `UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
    values,
  }
}

/* ─────────── USERS ─────────── */

export async function getUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function getUserById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function updateUserLastLogin(id) {
  const { rows } = await query('UPDATE users SET last_login = NOW() WHERE id = $1 RETURNING *', [id])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function createUser({ name, email, password, role = 'client', plan = null }) {
  const exists = await query('SELECT id FROM users WHERE email = $1', [email])
  if (exists.rows.length) return { error: 'email_exists' }
  const hash = bcrypt.hashSync(password, 10)
  const { rows } = await query(
    'INSERT INTO users (name, email, password, role, plan) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, email, hash, role, plan]
  )
  const u = toCamelCase(rows[0])
  delete u.password
  return u
}

/* ─────────── DOWNLOADS ─────────── */

export async function getDownloadsByClient(clientId) {
  const { rows } = await query(
    'SELECT * FROM downloads WHERE client_id = $1 ORDER BY created_at DESC',
    [clientId]
  )
  return rows.map(toCamelCase)
}

export async function getDownloadById(id) {
  const { rows } = await query('SELECT * FROM downloads WHERE id = $1', [id])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function createDownload({ systemId, name, fileName, fileSize = '', version, description = '', changelog = '' }) {
  const sys = await query('SELECT client_id FROM systems WHERE id = $1', [systemId])
  if (sys.rows.length === 0) return { error: 'system_not_found' }
  const clientId = sys.rows[0].client_id
  const { rows } = await query(
    `INSERT INTO downloads (system_id, client_id, name, description, file_name, file_size, version, changelog)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [systemId, clientId, name, description, fileName, fileSize, version, changelog]
  )
  await query(
    "UPDATE systems SET version = $1, file_name = $2, file_size = COALESCE(NULLIF($3, ''), file_size) WHERE id = $4",
    [version, fileName, fileSize, systemId]
  )
  return toCamelCase(rows[0])
}

/* ─────────── TICKETS ─────────── */

const TICKET_WITH_MESSAGES = `
  SELECT t.*, COALESCE(
    json_agg(
      json_build_object(
        'id', tm.id,
        'userId', tm.user_id,
        'userName', tm.user_name,
        'text', tm.text,
        'isStaff', tm.is_staff,
        'createdAt', tm.created_at
      ) ORDER BY tm.created_at
    ) FILTER (WHERE tm.id IS NOT NULL),
    '[]'::json
  ) AS messages
  FROM tickets t
  LEFT JOIN ticket_messages tm ON tm.ticket_id = t.id
`

export async function getTicketsByClient(clientId) {
  const { rows } = await query(
    `${TICKET_WITH_MESSAGES} WHERE t.client_id = $1 GROUP BY t.id ORDER BY t.updated_at DESC`,
    [clientId]
  )
  return rows.map(toCamelCase)
}

export async function getTicketById(id) {
  const { rows } = await query(
    `${TICKET_WITH_MESSAGES} WHERE t.id = $1 GROUP BY t.id`,
    [id]
  )
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function addMessageToTicket(ticketId, userId, userName, text, isStaff) {
  await query(
    'UPDATE tickets SET updated_at = NOW() WHERE id = $1',
    [ticketId]
  )
  const { rows } = await query(
    'INSERT INTO ticket_messages (ticket_id, user_id, user_name, text, is_staff) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [ticketId, userId, userName, text, isStaff]
  )
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function createTicket(clientId, subject, description, priority) {
  const userRow = await getUserById(clientId)
  const userName = userRow?.name || 'Usuario'

  const { rows: tickets } = await query(
    'INSERT INTO tickets (client_id, subject, description, priority) VALUES ($1, $2, $3, $4) RETURNING *',
    [clientId, subject, description, ['low', 'medium', 'high'].includes(priority) ? priority : 'medium']
  )
  const ticket = tickets[0]

  const { rows: messages } = await query(
    'INSERT INTO ticket_messages (ticket_id, user_id, user_name, text, is_staff) VALUES ($1, $2, $3, $4, FALSE) RETURNING *',
    [ticket.id, clientId, userName, description]
  )

  return {
    ...toCamelCase(ticket),
    messages: messages.map(toCamelCase),
  }
}

/* ─────────── PAYMENTS ─────────── */

export async function getPaymentsByClient(clientId) {
  const { rows } = await query(
    'SELECT * FROM payments WHERE client_id = $1 ORDER BY due_date DESC',
    [clientId]
  )
  return rows.map(toCamelCase)
}

export async function requestEarlyPayment(paymentId, clientId) {
  const { rows: found } = await query(
    'SELECT status FROM payments WHERE id = $1 AND client_id = $2',
    [paymentId, clientId]
  )
  if (found.length === 0) return null
  if (found[0].status === 'paid') return null
  const { rows } = await query(
    'UPDATE payments SET early_requested = TRUE, early_requested_at = NOW() WHERE id = $1 RETURNING *',
    [paymentId]
  )
  return toCamelCase(rows[0])
}

/* ─────────── CLIENTS ─────────── */

export async function getAllClients() {
  const { rows } = await query("SELECT * FROM users WHERE role = 'client'")
  return rows.map(toCamelCase)
}

export async function getAdminEmails() {
  const { rows } = await query("SELECT email FROM users WHERE role = 'admin' AND email IS NOT NULL")
  return rows.map(r => r.email)
}

export async function getStaleOnlineSystems() {
  const { rows } = await query(`
    SELECT s.*, tl.last_heartbeat
    FROM telemetry tl
    JOIN systems s ON s.id = tl.system_id
    WHERE tl.status <> 'offline' AND tl.last_heartbeat < NOW() - INTERVAL '5 minutes'
  `)
  return rows.map(toCamelCase)
}

export async function markSystemOffline(systemId) {
  const { rows } = await query("UPDATE telemetry SET status = 'offline' WHERE system_id = $1 RETURNING *", [systemId])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function getAllTickets() {
  const { rows } = await query(
    `${TICKET_WITH_MESSAGES} GROUP BY t.id ORDER BY t.updated_at DESC`
  )
  return rows.map(toCamelCase)
}

export async function updateTicketStatus(ticketId, status) {
  const { rows } = await query(
    'UPDATE tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, ticketId]
  )
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

/* ─────────── SYSTEMS ─────────── */

export async function getAllSystems() {
  const { rows } = await query('SELECT * FROM systems')
  return rows.map(toCamelCase)
}

export async function getSystemsByClient(clientId) {
  const { rows } = await query('SELECT * FROM systems WHERE client_id = $1', [clientId])
  return rows.map(toCamelCase)
}

export async function getSystemById(id) {
  const { rows } = await query('SELECT * FROM systems WHERE id = $1', [id])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function updateSystem(id, updates) {
  const q = buildUpdateQuery('systems', id, updates)
  if (!q) return null
  const { rows } = await query(q.text, q.values)
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function createSystem({ clientId, name, icon = '📦', type = 'online', description = '', externalUrl = null, gitRepo = null, gitBranch = null, version = '1.0.0' }) {
  const apiKey = 'sk_live_' + crypto.randomBytes(24).toString('hex')
  const { rows } = await query(
    `INSERT INTO systems (client_id, name, icon, type, description, version, status, external_url, api_key, git_repo, git_branch)
     VALUES ($1,$2,$3,$4,$5,$6,'online',$7,$8,$9,$10) RETURNING *`,
    [clientId, name, icon, type, description, version, externalUrl, apiKey, gitRepo, gitBranch || (gitRepo ? 'main' : null)]
  )
  return toCamelCase(rows[0])
}

export async function getSystemByApiKey(apiKey) {
  if (!apiKey) return null
  const { rows } = await query('SELECT * FROM systems WHERE api_key = $1', [apiKey])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function regenerateSystemApiKey(systemId) {
  const apiKey = 'sk_live_' + crypto.randomBytes(24).toString('hex')
  const { rows } = await query('UPDATE systems SET api_key = $1 WHERE id = $2 RETURNING *', [apiKey, systemId])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function updateSystemCommit(systemId, { sha, message, date }) {
  const { rows } = await query(`
    UPDATE systems SET
      last_commit_sha = COALESCE($1, last_commit_sha),
      last_commit_msg = COALESCE($2, last_commit_msg),
      last_commit_date = $3
    WHERE id = $4
    RETURNING *
  `, [sha ?? null, message ?? null, date !== undefined ? date : new Date().toISOString(), systemId])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function getSystemsWithStatusByClient(clientId) {
  const { rows } = await query(`
    SELECT s.*,
      CASE WHEN tl.last_heartbeat IS NULL OR tl.last_heartbeat < NOW() - INTERVAL '5 minutes'
           THEN 'offline' ELSE COALESCE(tl.status, 'offline') END AS status,
      tl.last_heartbeat,
      COALESCE((SELECT COUNT(*)::int FROM telemetry_errors te JOIN telemetry t2 ON t2.id = te.telemetry_id WHERE t2.system_id = s.id AND te.resolved = FALSE), 0) AS error_count
    FROM systems s
    LEFT JOIN telemetry tl ON tl.system_id = s.id
    WHERE s.client_id = $1
  `, [clientId])
  return rows.map(toCamelCase)
}

/* ─────────── TELEMETRY ─────────── */

const TELEMETRY_WITH_ERRORS = `
  SELECT t.*, COALESCE(
    json_agg(
      json_build_object(
        'id', te.id,
        'level', te.level,
        'message', te.message,
        'stacktrace', te.stacktrace,
        'loggedAt', te.logged_at,
        'resolved', te.resolved
      ) ORDER BY te.logged_at
    ) FILTER (WHERE te.id IS NOT NULL),
    '[]'::json
  ) AS errors
  FROM telemetry t
  LEFT JOIN telemetry_errors te ON te.telemetry_id = t.id
`

export async function getTelemetryBySystem(systemId) {
  const { rows } = await query(
    `${TELEMETRY_WITH_ERRORS} WHERE t.system_id = $1 GROUP BY t.id`,
    [systemId]
  )
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function upsertTelemetry(systemId, clientId, data) {
  const { rows: existing } = await query('SELECT id FROM telemetry WHERE system_id = $1', [systemId])

  if (existing.length > 0) {
    await query(
      'UPDATE telemetry SET status = $1, version = $2, last_heartbeat = NOW() WHERE system_id = $3',
      [data.status || 'online', data.version || existing[0].version, systemId]
    )
  } else {
    await query(
      'INSERT INTO telemetry (system_id, client_id, status, version, last_heartbeat) VALUES ($1, $2, $3, $4, NOW())',
      [systemId, clientId, data.status || 'online', data.version || '0.0.0']
    )
  }

  if (data.error) {
    const { rows: tel } = await query('SELECT id FROM telemetry WHERE system_id = $1', [systemId])
    if (tel.length > 0) {
      await query(
        'INSERT INTO telemetry_errors (telemetry_id, level, message, stacktrace) VALUES ($1, $2, $3, $4)',
        [tel[0].id, data.error.level || 'error', data.error.message, data.error.stacktrace || null]
      )
    }
  }

  return getTelemetryBySystem(systemId)
}

export async function getAllTelemetry() {
  const { rows } = await query(`${TELEMETRY_WITH_ERRORS} GROUP BY t.id`)
  return rows.map(toCamelCase)
}

export async function resolveError(systemId, errorId) {
  const { rows } = await query(`
    UPDATE telemetry_errors te
    SET resolved = TRUE
    FROM telemetry t
    WHERE te.id = $1 AND te.telemetry_id = t.id AND t.system_id = $2
    RETURNING te.*
  `, [errorId, systemId])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

/* ─────────── ADMIN ─────────── */

export async function getAdminOverview() {
  const [{ rows: clients }, { rows: systems }, { rows: online }, { rows: error }, { rows: open }, { rows: pendingTickets }, { rows: recentErrors }, { rows: systemsDetail }] = await Promise.all([
    query("SELECT COUNT(*)::int AS count FROM users WHERE role = 'client'"),
    query('SELECT COUNT(*)::int AS count FROM systems'),
    query("SELECT COUNT(*)::int AS count FROM telemetry WHERE status = 'online' AND last_heartbeat >= NOW() - INTERVAL '5 minutes'"),
    query("SELECT COUNT(*)::int AS count FROM telemetry WHERE status = 'error' AND last_heartbeat >= NOW() - INTERVAL '5 minutes'"),
    query("SELECT COUNT(*)::int AS count FROM tickets WHERE status != 'resolved'"),
    query(`
      SELECT t.id, t.subject, t.status, t.priority, t.updated_at,
             COALESCE(u.name, 'Desconocido') AS client_name
      FROM tickets t
      LEFT JOIN users u ON u.id = t.client_id
      WHERE t.status != 'resolved'
      ORDER BY t.updated_at DESC
      LIMIT 5
    `),
    query(`
      SELECT te.*, t.system_id, t.client_id
      FROM telemetry_errors te
      JOIN telemetry t ON t.id = te.telemetry_id
      WHERE te.resolved = FALSE
      ORDER BY te.logged_at DESC
      LIMIT 20
    `),
    query(`
      SELECT
        s.*,
        COALESCE(u.name, 'Desconocido') AS client_name,
        CASE WHEN tl.last_heartbeat IS NULL OR tl.last_heartbeat < NOW() - INTERVAL '5 minutes'
             THEN 'offline' ELSE COALESCE(tl.status, 'offline') END AS status,
        tl.last_heartbeat,
        COALESCE((SELECT COUNT(*)::int FROM telemetry_errors te2 JOIN telemetry t2 ON t2.id = te2.telemetry_id WHERE t2.system_id = s.id AND te2.resolved = FALSE), 0) AS error_count,
        COALESCE((SELECT COUNT(*)::int FROM tickets tk WHERE tk.system_id = s.id AND tk.status != 'resolved'), 0) AS ticket_count
      FROM systems s
      LEFT JOIN users u ON u.id = s.client_id
      LEFT JOIN telemetry tl ON tl.system_id = s.id
    `),
  ])

  return {
    totalClients: clients[0].count,
    totalSystems: systems[0].count,
    systemsOnline: online[0].count,
    systemsError: error[0].count,
    openTickets: open[0].count,
    pendingTickets: pendingTickets.map(toCamelCase),
    recentErrors: recentErrors.map(toCamelCase),
    // No exponer la apiKey de telemetría en el overview (viene en SELECT s.*).
    systems: systemsDetail.map((r) => {
      const s = toCamelCase(r)
      delete s.apiKey
      return s
    }),
  }
}

export async function updateSystemFromGit(systemId) {
  const sha = Math.random().toString(16).substring(2, 14)
  const { rows } = await query(`
    UPDATE systems SET
      last_commit_date = NOW(),
      last_commit_msg = 'Actualización automática vía webhook',
      last_commit_sha = $1
    WHERE id = $2
    RETURNING *
  `, [sha, systemId])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

/* ─────────── PASSWORD RESET ─────────── */

export async function createPasswordReset(email) {
  const { rows: users } = await query('SELECT id FROM users WHERE email = $1', [email])
  if (users.length === 0) return null

  const token = crypto.randomBytes(32).toString('hex')
  await query(
    'INSERT INTO password_resets (token, email, expires_at) VALUES ($1, $2, NOW() + INTERVAL \'1 hour\')',
    [token, email]
  )
  return token
}

export async function getPasswordResetByToken(token) {
  const { rows } = await query(
    'SELECT * FROM password_resets WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
    [token]
  )
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}

export async function resetUserPassword(token, newPassword) {
  const { rows: resets } = await query(
    'SELECT * FROM password_resets WHERE token = $1 AND used = FALSE AND expires_at > NOW()',
    [token]
  )
  if (resets.length === 0) return null

  const email = resets[0].email
  const hashed = bcrypt.hashSync(newPassword, 10)

  const { rows: users } = await query(
    'UPDATE users SET password = $1 WHERE email = $2 RETURNING *',
    [hashed, email]
  )
  if (users.length === 0) return null

  await query('UPDATE password_resets SET used = TRUE WHERE token = $1', [token])
  return toCamelCase(users[0])
}

export async function getPasswordResetsByEmail(email) {
  const { rows } = await query(
    'SELECT * FROM password_resets WHERE email = $1 ORDER BY created_at DESC',
    [email]
  )
  return rows.map(toCamelCase)
}

/* ─────────── AUDIT LOG ─────────── */

export async function logAudit({ actorId = null, actorName = null, action, targetType = null, targetId = null, details = null }) {
  await query(
    `INSERT INTO audit_log (actor_id, actor_name, action, target_type, target_id, details)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [actorId, actorName, action, targetType, targetId != null ? String(targetId) : null, details]
  )
}

export async function getAuditLog(limit = 100) {
  const { rows } = await query(
    'SELECT * FROM audit_log ORDER BY created_at DESC, id DESC LIMIT $1',
    [limit]
  )
  return rows.map(toCamelCase)
}

/* ─────────── BACKUPS EN LA NUBE ─────────── */

export async function saveSystemBackup({ systemId, clientId = null, fileName = 'backup.db', data }) {
  await query(
    `INSERT INTO system_backups (system_id, client_id, file_name, size_bytes, data)
     VALUES ($1,$2,$3,$4,$5)`,
    [systemId, clientId, fileName, data.length, data]
  )
  // Conserva solo los 2 respaldos más recientes por sistema.
  await query(
    `DELETE FROM system_backups WHERE system_id = $1 AND id NOT IN (
       SELECT id FROM system_backups WHERE system_id = $1 ORDER BY created_at DESC LIMIT 2
     )`,
    [systemId]
  )
}

export async function getLatestBackupMeta(systemId) {
  const { rows } = await query(
    'SELECT id, file_name, size_bytes, created_at FROM system_backups WHERE system_id = $1 ORDER BY created_at DESC LIMIT 1',
    [systemId]
  )
  return rows[0] ? toCamelCase(rows[0]) : null
}

/* ─────────── LICENCIA ─────────── */

export async function setSystemLicense(systemId, active) {
  const { rows } = await query('UPDATE systems SET license_active = $1 WHERE id = $2 RETURNING *', [!!active, systemId])
  if (rows.length === 0) return null
  return toCamelCase(rows[0])
}
