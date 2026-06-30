import { describe, it, expect, beforeAll, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { PGlite } from '@electric-sql/pglite'

// Postgres REAL en proceso (WASM). Enrutamos el query() de db-pool a pglite.
vi.mock('server-only', () => ({}))
vi.mock('../db-pool', () => ({
  query: (text, params) => globalThis.__pg.query(text, params),
}))

let db
let pg

beforeAll(async () => {
  pg = new PGlite()
  globalThis.__pg = pg

  // 1) Esquema real
  const schema = fs.readFileSync(path.join(process.cwd(), 'schema.sql'), 'utf-8')
  await pg.exec(schema)

  // 2) Semilla mínima
  await pg.exec(`
    INSERT INTO users (id, name, email, password, role, plan) VALUES
      (1, 'Carlos', 'carlos@test.com', 'hash', 'client', 'Pro'),
      (2, 'Maria',  'maria@test.com',  'hash', 'client', 'Basic'),
      (99,'Admin',  'admin@test.com',  'hash', 'admin',  NULL);

    INSERT INTO systems (id, client_id, name, icon, type, description, version, status, external_url, api_key) VALUES
      (1, 1, 'Pengos', '🐧', 'desktop', 'Traductor', '2.5.0', 'online', NULL, 'sk_live_pengos'),
      (2, 1, 'Raloz',  '👔', 'online',  'Gestion',   '1.3.0', 'online', 'https://raloz.test', 'sk_live_raloz');

    INSERT INTO downloads (id, system_id, client_id, name, file_name, version) VALUES
      (1, 1, 1, 'Pengos v2.5.0', 'pengos-v2.5.0.exe', '2.5.0');

    INSERT INTO payments (id, client_id, plan, amount, status, due_date) VALUES
      (1, 1, 'Pro', 100000, 'paid', '2026-06-15'),
      (2, 1, 'Pro', 100000, 'pending', '2026-07-15');
  `)

  // Avanza las secuencias SERIAL (insertamos ids explícitos arriba).
  await pg.exec(`
    SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users));
    SELECT setval(pg_get_serial_sequence('systems','id'), (SELECT MAX(id) FROM systems));
    SELECT setval(pg_get_serial_sequence('downloads','id'), (SELECT MAX(id) FROM downloads));
    SELECT setval(pg_get_serial_sequence('payments','id'), (SELECT MAX(id) FROM payments));
  `)

  db = await import('../db-pg')
})

describe('db-pg · parity (Postgres real vía pglite)', () => {
  it('getUserByEmail / getUserById', async () => {
    const u = await db.getUserByEmail('carlos@test.com')
    expect(u.id).toBe(1)
    expect(u.name).toBe('Carlos')
    expect((await db.getUserById(99)).role).toBe('admin')
    expect(await db.getUserByEmail('nadie@test.com')).toBeNull()
  })

  it('updateUserLastLogin marca la fecha', async () => {
    const before = await db.getUserById(1)
    const after = await db.updateUserLastLogin(1)
    expect(after.lastLogin).not.toBeNull()
    expect(before.lastLogin).toBeNull()
  })

  it('getSystemByApiKey + regenerate', async () => {
    expect((await db.getSystemByApiKey('sk_live_pengos')).name).toBe('Pengos')
    expect(await db.getSystemByApiKey('clave-falsa')).toBeNull()
    expect(await db.getSystemByApiKey('')).toBeNull()

    const regen = await db.regenerateSystemApiKey(2)
    expect(regen.apiKey).toMatch(/^sk_live_[a-f0-9]{48}$/)
    expect(await db.getSystemByApiKey('sk_live_raloz')).toBeNull() // la vieja ya no sirve
  })

  it('updateSystemCommit respeta date:null y no pisa sha/message con null', async () => {
    await db.updateSystemCommit(1, { sha: 'abc123', message: 'commit real', date: '2026-06-01T00:00:00Z' })
    const r = await db.updateSystemCommit(1, { sha: null, message: null, date: null })
    expect(r.lastCommitSha).toBe('abc123')      // COALESCE: no se pisa
    expect(r.lastCommitMsg).toBe('commit real')
    expect(r.lastCommitDate).toBeNull()          // date null se respeta
  })

  it('getSystemsWithStatusByClient incluye estado y errorCount', async () => {
    const systems = await db.getSystemsWithStatusByClient(1)
    expect(systems).toHaveLength(2)
    const pengos = systems.find(s => s.id === 1)
    expect(pengos.status).toBeDefined()
    expect(pengos.errorCount).toBe(0)
  })

  it('createTicket sanea prioridad inválida a "medium" y crea mensaje', async () => {
    const t = await db.createTicket(1, 'Asunto de prueba', 'Descripcion larga del problema', 'invalida')
    expect(t.priority).toBe('medium')
    expect(t.messages).toHaveLength(1)
    expect(t.messages[0].userName).toBe('Carlos')
  })

  it('tickets con mensajes (json_agg) y addMessage actualiza updatedAt', async () => {
    const t = await db.createTicket(1, 'Otro ticket', 'Otra descripcion larga', 'high')
    await db.addMessageToTicket(t.id, 99, 'Admin', 'Respuesta del staff', true)
    const reloaded = await db.getTicketById(t.id)
    expect(reloaded.messages).toHaveLength(2)
    expect(reloaded.messages[1].isStaff).toBe(true)

    const list = await db.getTicketsByClient(1)
    expect(list.length).toBeGreaterThanOrEqual(2)
  })

  it('payments + adelantar pago (bloquea pagadas)', async () => {
    expect((await db.getPaymentsByClient(1)).length).toBe(2)
    const ok = await db.requestEarlyPayment(2, 1)   // pendiente
    expect(ok.earlyRequested).toBe(true)
    expect(await db.requestEarlyPayment(1, 1)).toBeNull()  // ya pagada
    expect(await db.requestEarlyPayment(999, 1)).toBeNull()
  })

  it('telemetría: upsert, errores y resolveError', async () => {
    await db.upsertTelemetry(2, 1, { status: 'error', version: '1.3.0', error: { level: 'critical', message: 'DB caida' } })
    const tel = await db.getTelemetryBySystem(2)
    expect(tel.status).toBe('error')
    expect(tel.errors).toHaveLength(1)

    const errId = tel.errors[0].id
    const resolved = await db.resolveError(2, errId)
    expect(resolved.resolved).toBe(true)
    expect(await db.resolveError(2, 999999)).toBeNull()
  })

  it('getAdminOverview incluye conteos y pendingTickets', async () => {
    const o = await db.getAdminOverview()
    expect(o.totalClients).toBe(2)
    expect(o.totalSystems).toBe(2)
    expect(Array.isArray(o.pendingTickets)).toBe(true)
    expect(Array.isArray(o.systems)).toBe(true)
    expect(o.systems[0].clientName).toBeDefined()
  })

  it('password reset: token seguro + un solo uso', async () => {
    const token = await db.createPasswordReset('carlos@test.com')
    expect(token).toMatch(/^[a-f0-9]{64}$/)        // crypto.randomBytes(32)
    expect((await db.getPasswordResetByToken(token)).email).toBe('carlos@test.com')

    expect(await db.resetUserPassword(token, 'nuevaClave123')).not.toBeNull()
    expect(await db.getPasswordResetByToken(token)).toBeNull()       // ya usado
    expect(await db.resetUserPassword(token, 'otra')).toBeNull()     // no reutilizable
  })

  it('Admin CRUD: createUser / createSystem / createDownload', async () => {
    const u = await db.createUser({ name: 'Nuevo', email: 'nuevo@test.com', password: 'secreta123' })
    expect(u.id).toBeGreaterThan(99)
    expect(u.password).toBeUndefined()
    expect(await db.createUser({ name: 'Dup', email: 'nuevo@test.com', password: '123456' })).toEqual({ error: 'email_exists' })

    const s = await db.createSystem({ clientId: u.id, name: 'POS Nuevo', type: 'online', externalUrl: 'https://x.test' })
    expect(s.apiKey).toMatch(/^sk_live_[a-f0-9]{48}$/)
    expect((await db.getSystemByApiKey(s.apiKey)).name).toBe('POS Nuevo')

    const d = await db.createDownload({ systemId: s.id, name: 'v1.2', version: '1.2.0', fileName: 'pos.exe', fileSize: '50 MB' })
    expect(d.clientId).toBe(u.id)
    expect((await db.getSystemById(s.id)).version).toBe('1.2.0')
    expect(await db.createDownload({ systemId: 99999, name: 'x', version: '1', fileName: 'x.exe' })).toEqual({ error: 'system_not_found' })
  })
})
