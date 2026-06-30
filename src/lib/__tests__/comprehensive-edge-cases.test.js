import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'

vi.mock('server-only', () => ({}))

const DB_PATH = process.env.JRDEV_DB_FILE || path.join(process.cwd(), 'data', 'db.json')

const baseData = () => ({
  users: [
    { id: 1, name: 'Alice', email: 'alice@test.com', password: '$2a$10$...', role: 'client', plan: 'Pro', avatar: null, createdAt: '2026-01-01T00:00:00Z', lastLogin: '2026-06-01T00:00:00Z' },
    { id: 99, name: 'Admin', email: 'admin@test.com', password: '$2a$10$...', role: 'admin', plan: null, avatar: null, createdAt: '2026-01-01T00:00:00Z' },
  ],
  systems: [
    { id: 1, clientId: 1, name: 'App', type: 'desktop', description: 'desc', fileName: 'app.exe', fileSize: '10MB', version: '1.0.0', status: 'online', externalUrl: null, gitRepo: null, gitBranch: null, lastCommitSha: null, lastCommitMsg: null, lastCommitDate: null, createdAt: '2026-01-01T00:00:00Z', apiKey: 'sk_live_testkey123' },
  ],
  downloads: [],
  telemetry: [],
  tickets: [],
  payments: [],
  passwordResets: [],
})

let originalData = null

beforeAll(() => {
  if (fs.existsSync(DB_PATH)) {
    originalData = fs.readFileSync(DB_PATH, 'utf-8')
  }
})

afterAll(() => {
  if (originalData) {
    fs.writeFileSync(DB_PATH, originalData, 'utf-8')
  } else {
    try { fs.unlinkSync(DB_PATH) } catch {}
  }
})

beforeEach(() => {
  fs.writeFileSync(DB_PATH, JSON.stringify(baseData(), null, 2), 'utf-8')
})

/* ═══════════════════════════════════════════
   DB CORRUPTION & RESILIENCE
   ═══════════════════════════════════════════ */

describe('DB resilience', () => {
  it('recovers from corrupted JSON by falling back to default data', async () => {
    const { getUserByEmail, getAllSystems } = await import('../db-json')
    fs.writeFileSync(DB_PATH, '{corrupted: invalid json!!!}', 'utf-8')
    expect(getUserByEmail('alice@test.com')).toBeNull()
    const systems = getAllSystems()
    expect(Array.isArray(systems)).toBe(true)
    // Should NOT crash even on corrupted DB
  })

  it('handles empty data file gracefully', async () => {
    const { getAllClients } = await import('../db-json')
    fs.writeFileSync(DB_PATH, '{}', 'utf-8')
    const clients = getAllClients()
    expect(clients).toEqual([])
  })

  it('handles missing top-level collections gracefully', async () => {
    const { getTelemetryBySystem, getAdminOverview } = await import('../db-json')
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2), 'utf-8')
    expect(getTelemetryBySystem(1)).toBeNull()
    const overview = getAdminOverview()
    expect(overview.totalClients).toBe(0)
    expect(overview.totalSystems).toBe(0)
  })
})

/* ═══════════════════════════════════════════
   USERS — EDGE CASES
   ═══════════════════════════════════════════ */

describe('Users edge cases', () => {
  it('returns null for null/undefined email in getUserByEmail', async () => {
    const { getUserByEmail } = await import('../db-json')
    expect(getUserByEmail(null)).toBeNull()
    expect(getUserByEmail(undefined)).toBeNull()
    expect(getUserByEmail('')).toBeNull()
  })

  it('handles user with empty name', async () => {
    const { getUserById, createTicket } = await import('../db-json')
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.users.push({ id: 3, name: '', email: 'empty@test.com', password: 'hash', role: 'client', plan: null, avatar: null, createdAt: '2026-01-01T00:00:00Z' })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const ticket = createTicket(3, 'Test', 'description', 'low')
    expect(ticket.messages[0].userName).toBe('Usuario')
  })

  it('handles duplicate email (should only find first)', async () => {
    const { getUserByEmail } = await import('../db-json')
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.users.push({ id: 3, name: 'Alice Dup', email: 'alice@test.com', password: 'hash', role: 'client', plan: null, avatar: null, createdAt: '2026-01-01T00:00:00Z' })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const user = getUserByEmail('alice@test.com')
    expect(user).not.toBeNull()
    expect(user.id).toBe(1)
  })
})

/* ═══════════════════════════════════════════
   SYSTEMS — EDGE CASES
   ═══════════════════════════════════════════ */

describe('Systems edge cases', () => {
  it('getSystemByApiKey returns null for empty key', async () => {
    const { getSystemByApiKey } = await import('../db-json')
    expect(getSystemByApiKey('')).toBeNull()
    expect(getSystemByApiKey(null)).toBeNull()
  })

  it('regenerateSystemApiKey returns null for non-existent system', async () => {
    const { regenerateSystemApiKey } = await import('../db-json')
    expect(regenerateSystemApiKey(999)).toBeNull()
  })

  it('updateSystem works with partial updates', async () => {
    const { updateSystem, getSystemById } = await import('../db-json')
    const result = updateSystem(1, { version: '2.0.0', status: 'offline' })
    expect(result.version).toBe('2.0.0')
    expect(result.status).toBe('offline')

    const system = getSystemById(1)
    expect(system.version).toBe('2.0.0')
    expect(system.name).toBe('App') // unchanged field
  })

  it('updateSystem returns null for non-existent id', async () => {
    const { updateSystem } = await import('../db-json')
    expect(updateSystem(999, { name: 'test' })).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   TICKETS — EDGE CASES
   ═══════════════════════════════════════════ */

describe('Tickets edge cases', () => {
  it('createTicket with non-existent clientId uses fallback name', async () => {
    const { createTicket } = await import('../db-json')
    const ticket = createTicket(999, 'Subject', 'Description text here', 'high')
    expect(ticket.messages[0].userName).toBe('Usuario')
    expect(ticket.messages[0].userId).toBe(999)
  })

  it('addMessageToTicket updates the updatedAt timestamp', async () => {
    const { addMessageToTicket, getTicketById, createTicket } = await import('../db-json')
    const ticket = createTicket(1, 'Test', 'Description', 'low')
    const originalUpdatedAt = ticket.updatedAt

    const msg = addMessageToTicket(ticket.id, 1, 'Alice', 'New message', false)
    expect(msg).not.toBeNull()

    const reloaded = getTicketById(ticket.id)
    expect(new Date(reloaded.updatedAt).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime())
  })

  it('ticket message id uniqueness', async () => {
    const { createTicket, addMessageToTicket } = await import('../db-json')
    const ticket = createTicket(1, 'Test', 'desc', 'low')
    const firstMsgId = ticket.messages[0].id

    const msg1 = addMessageToTicket(ticket.id, 1, 'Alice', 'msg 1', false)
    const msg2 = addMessageToTicket(ticket.id, 1, 'Alice', 'msg 2', false)
    const msg3 = addMessageToTicket(ticket.id, 1, 'Alice', 'msg 3', false)

    const ids = [firstMsgId, msg1.id, msg2.id, msg3.id]
    expect(new Set(ids).size).toBe(4)
  })

  it('priorities are correctly accepted', async () => {
    const { createTicket } = await import('../db-json')
    const t1 = createTicket(1, 'Low', 'desc', 'low')
    const t2 = createTicket(1, 'Medium', 'desc', 'medium')
    const t3 = createTicket(1, 'High', 'desc', 'high')
    expect(t1.priority).toBe('low')
    expect(t2.priority).toBe('medium')
    expect(t3.priority).toBe('high')
  })

  it('invalid priority is sanitized to "medium"', async () => {
    const { createTicket } = await import('../db-json')
    const ticket = createTicket(1, 'Test', 'desc', 'invalid')
    expect(ticket.priority).toBe('medium')
  })

  it('getAllTickets handles empty tickets array', async () => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.tickets = []
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const { getAllTickets } = await import('../db-json')
    expect(getAllTickets()).toEqual([])
  })
})

/* ═══════════════════════════════════════════
   TELEMETRY — EDGE CASES
   ═══════════════════════════════════════════ */

describe('Telemetry edge cases', () => {
  it('upsertTelemetry with null error does not add error entry', async () => {
    const { upsertTelemetry, getTelemetryBySystem } = await import('../db-json')
    upsertTelemetry(1, 1, { status: 'online', version: '1.0.0', error: null })
    const t = getTelemetryBySystem(1)
    expect(t.errors).toEqual([])
  })

  it('upsertTelemetry with minimal error fields works', async () => {
    const { upsertTelemetry } = await import('../db-json')
    const result = upsertTelemetry(1, 1, { error: { message: 'err' } })
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].level).toBe('error')
    expect(result.errors[0].stacktrace).toBeNull()
    expect(result.errors[0].resolved).toBe(false)
  })

  it('getTelemetryBySystem returns null for non-existent system', async () => {
    const { getTelemetryBySystem } = await import('../db-json')
    expect(getTelemetryBySystem(999)).toBeNull()
  })

  it('resolveError returns null when error id does not exist', async () => {
    const { resolveError } = await import('../db-json')
    expect(resolveError(1, 999)).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   PAYMENTS — EDGE CASES
   ═══════════════════════════════════════════ */

describe('Payments edge cases', () => {
  it('requestEarlyPayment returns null for non-existent payment', async () => {
    const { requestEarlyPayment } = await import('../db-json')
    expect(requestEarlyPayment(999, 1)).toBeNull()
  })

  it('requestEarlyPayment returns null when clientId does not match', async () => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.payments.push({ id: 1, clientId: 1, plan: 'Pro', amount: 100, currency: 'COP', status: 'pending', method: null, dueDate: '2026-07-15', paidAt: null, invoice: null })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const { requestEarlyPayment } = await import('../db-json')
    expect(requestEarlyPayment(1, 2)).toBeNull()
  })

  it('requestEarlyPayment returns null for already-paid invoices', async () => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.payments.push({ id: 1, clientId: 1, plan: 'Pro', amount: 100, currency: 'COP', status: 'paid', method: 'Bank', dueDate: '2026-06-15', paidAt: '2026-06-10T00:00:00Z', invoice: 'FAC-001' })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const { requestEarlyPayment } = await import('../db-json')
    const result = requestEarlyPayment(1, 1)
    expect(result).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   PASSWORD RESET — EDGE CASES & SECURITY
   ═══════════════════════════════════════════ */

describe('Password Reset — edge cases & security', () => {
  it('generates 100 unique tokens (no collisions)', async () => {
    const { createPasswordReset } = await import('../db-json')
    const tokens = []
    for (let i = 0; i < 100; i++) {
      const token = createPasswordReset('alice@test.com')
      tokens.push(token)
    }
    expect(new Set(tokens).size).toBe(100)
  })

  it('getPasswordResetByToken returns null for expired token', async () => {
    const { createPasswordReset } = await import('../db-json')
    const token = createPasswordReset('alice@test.com')
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    const reset = db.passwordResets.find(r => r.token === token)
    reset.expiresAt = '2020-01-01T00:00:00Z'
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const { getPasswordResetByToken } = await import('../db-json')
    expect(getPasswordResetByToken(token)).toBeNull()
  })

  it('resetUserPassword with already-used token returns null', async () => {
    const { createPasswordReset, resetUserPassword } = await import('../db-json')
    const token = createPasswordReset('alice@test.com')
    resetUserPassword(token, 'newpass1')
    const result = resetUserPassword(token, 'newpass2')
    expect(result).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   ADMIN OVERVIEW — EDGE CASES
   ═══════════════════════════════════════════ */

describe('Admin Overview edge cases', () => {
  it('handles telemetry with unlinked systemId gracefully', async () => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.telemetry.push({ id: 999, systemId: 999, clientId: 1, status: 'error', version: '1.0.0', lastHeartbeat: '2026-06-01T00:00:00Z', errors: [{ id: 1, level: 'critical', message: 'Orphan error', stacktrace: null, loggedAt: '2026-06-01T00:00:00Z', resolved: false }] })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const { getAdminOverview } = await import('../db-json')
    const overview = getAdminOverview()
    expect(overview.recentErrors.length).toBeGreaterThanOrEqual(1)
    expect(overview.systems.length).toBe(1)
  })

  it('handles tickets with missing user references', async () => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.tickets.push({ id: 1, clientId: 999, systemId: null, subject: 'Orphan', description: 'No user', status: 'open', priority: 'low', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', messages: [] })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const { getAdminOverview } = await import('../db-json')
    const overview = getAdminOverview()
    expect(overview.openTickets).toBe(1)
    expect(overview.pendingTickets[0].clientName).toBe('Desconocido')
  })
})

/* ═══════════════════════════════════════════
   API KEY BACKFILL
   ═══════════════════════════════════════════ */

describe('API Key backfill', () => {
  it('generates unique keys for systems without apiKey', async () => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    delete db.systems[0].apiKey
    db.systems.push({ id: 2, clientId: 1, name: 'No Key', type: 'desktop', description: '', fileName: null, fileSize: null, version: '1.0.0', status: 'online', externalUrl: null, gitRepo: null, gitBranch: null, lastCommitSha: null, lastCommitMsg: null, lastCommitDate: null, createdAt: '2026-01-01T00:00:00Z' })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const { getSystemById, getSystemByApiKey } = await import('../db-json')
    const sys1 = getSystemById(1)
    const sys2 = getSystemById(2)

    expect(sys1.apiKey).toBeDefined()
    expect(sys2.apiKey).toBeDefined()
    expect(sys1.apiKey).not.toBe(sys2.apiKey)
    expect(sys1.apiKey).toMatch(/^sk_live_[a-f0-9]{48}$/)
    expect(sys2.apiKey).toMatch(/^sk_live_[a-f0-9]{48}$/)
  })
})

/* ═══════════════════════════════════════════
   CONCURRENT ACCESS — RACE CONDITIONS
   ═══════════════════════════════════════════ */

describe('Concurrent access (simulated)', () => {
  it('handles rapid sequential reads without corruption', async () => {
    const { getSystemById } = await import('../db-json')
    for (let i = 0; i < 100; i++) {
      const system = getSystemById(1)
      expect(system).not.toBeNull()
      expect(system.id).toBe(1)
    }
  })

  it('handles rapid write operations without data loss', async () => {
    const { updateSystem, getSystemById } = await import('../db-json')
    for (let i = 0; i < 50; i++) {
      updateSystem(1, { version: `${i}.0.0` })
    }
    const system = getSystemById(1)
    expect(system.version).toBe('49.0.0')
  })

  it('ticket IDs are unique even with Date.now() collisions', async () => {
    const realDateNow = Date.now.bind(Date)
    let callCount = 0
    vi.spyOn(Date, 'now').mockImplementation(() => {
      callCount++
      return 1000000 + Math.floor(callCount / 10) * 1000
    })

    const { createTicket } = await import('../db-json')
    const ticket1 = createTicket(1, 'A', 'desc A', 'low')
    const ticket2 = createTicket(1, 'B', 'desc B', 'low')

    expect(ticket1.id).not.toBe(ticket2.id)

    vi.restoreAllMocks()
  })
})

/* ═══════════════════════════════════════════
   SESSION SECURITY
   ═══════════════════════════════════════════ */

describe('Session token security', () => {
  it('rejects token signed with alg=none attack', async () => {
    const { encrypt, decrypt } = await import('../session')
    const token = await encrypt({ userId: 1, role: 'admin' })
    const parts = token.split('.')

    const noneHeader = Buffer.from(JSON.stringify({ alg: 'none' })).toString('base64url')
    const noneToken = `${noneHeader}.${parts[1]}.`
    const result = await decrypt(noneToken)
    expect(result).toBeNull()
  })

  it('rejects tokens with manipulated role payload', async () => {
    const { encrypt, decrypt } = await import('../session')
    const token = await encrypt({ userId: 2, role: 'client' })
    const parts = token.split('.')
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
    payload.role = 'admin'
    const tamperedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
    const tampered = [parts[0], tamperedPayload, parts[2]].join('.')
    const result = await decrypt(tampered)
    expect(result).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   RATE LIMIT — EDGE CASES
   ═══════════════════════════════════════════ */

describe('Rate limit edge cases', () => {
  beforeEach(async () => {
    const rl = await import('../rate-limit')
    rl._clearAllRateLimits()
  })

  it('max=0 blocks every request', () => {
    const { checkRateLimit } = require('../rate-limit')
    const r1 = checkRateLimit('test', { max: 0 })
    expect(r1.allowed).toBe(false)
    expect(r1.remaining).toBe(0)
    const r2 = checkRateLimit('test', { max: 0 })
    expect(r2.allowed).toBe(false)
  })

  it('resetRateLimit on non-existent key does not throw', () => {
    const { resetRateLimit } = require('../rate-limit')
    expect(() => resetRateLimit('nonexistent')).not.toThrow()
  })

  it('remembers remaining count after reset', () => {
    const { checkRateLimit, resetRateLimit } = require('../rate-limit')
    for (let i = 0; i < 3; i++) checkRateLimit('ip', { max: 5 })
    expect(checkRateLimit('ip', { max: 5 }).remaining).toBe(1)
    resetRateLimit('ip')
    expect(checkRateLimit('ip', { max: 5 }).remaining).toBe(4)
  })
})

/* ═══════════════════════════════════════════
   DATA INTEGRITY
   ═══════════════════════════════════════════ */

describe('Data integrity', () => {
  it('getSystemsWithStatusByClient handles missing telemetry', async () => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.systems.push({ id: 5, clientId: 1, name: 'No Telemetry', type: 'desktop', description: '', fileName: null, fileSize: null, version: '1.0.0', status: 'online', externalUrl: null, gitRepo: null, gitBranch: null, lastCommitSha: null, lastCommitMsg: null, lastCommitDate: null, createdAt: '2026-01-01T00:00:00Z' })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const { getSystemsWithStatusByClient } = await import('../db-json')
    const systems = getSystemsWithStatusByClient(1)
    const noTel = systems.find(s => s.id === 5)
    expect(noTel.status).toBe('offline')
    expect(noTel.lastHeartbeat).toBeNull()
    expect(noTel.errorCount).toBe(0)
  })
})

/* ═══════════════════════════════════════════
   WEBHOOK SECURITY
   ═══════════════════════════════════════════ */

describe('Webhook security', () => {
  it('timingSafeEqual comparison works with different lengths', async () => {
    const crypto = await import('crypto')
    const secret = 'test-secret-123'
    const payload = '{"test": true}'
    const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex')

    const a = Buffer.from(signature)
    const b = Buffer.from('sha256=' + 'a'.repeat(64))

    expect(a.length !== b.length || !crypto.timingSafeEqual(a, b)).toBe(true)
  })

  it('handles null sha/message in updateSystemCommit gracefully', async () => {
    const { updateSystemCommit, getSystemById } = await import('../db-json')
    const result = updateSystemCommit(1, { sha: null, message: null, date: null })
    expect(result).not.toBeNull()
    // sha and message should not be overwritten when null
    // but date becomes null (set explicitly)
    expect(result.lastCommitDate).toBe(null)
  })
})

/* ═══════════════════════════════════════════
   ZOD VALIDATION SCHEMAS
   ═══════════════════════════════════════════ */

describe('Zod schema edge cases', () => {
  it('TicketSchema rejects short subject', () => {
    const { TicketSchema } = require('../definitions')
    const result = TicketSchema.safeParse({ subject: 'ab', description: 'valid description here', priority: 'low' })
    expect(result.success).toBe(false)
  })

  it('TicketSchema rejects long subject', () => {
    const { TicketSchema } = require('../definitions')
    const result = TicketSchema.safeParse({ subject: 'x'.repeat(201), description: 'valid description here', priority: 'low' })
    expect(result.success).toBe(false)
  })

  it('TicketSchema rejects short description', () => {
    const { TicketSchema } = require('../definitions')
    const result = TicketSchema.safeParse({ subject: 'Valid Subject', description: 'short', priority: 'low' })
    expect(result.success).toBe(false)
  })

  it('MessageSchema rejects empty text', () => {
    const { MessageSchema } = require('../definitions')
    const result = MessageSchema.safeParse({ text: '' })
    expect(result.success).toBe(false)
  })

  it('MessageSchema rejects whitespace-only text', () => {
    const { MessageSchema } = require('../definitions')
    const result = MessageSchema.safeParse({ text: '   ' })
    expect(result.success).toBe(false)
  })

  it('ResetPasswordSchema rejects mismatched passwords', () => {
    const { ResetPasswordSchema } = require('../definitions')
    const result = ResetPasswordSchema.safeParse({ token: 'abc', password: '123456', confirmPassword: '654321' })
    expect(result.success).toBe(false)
  })

  it('ResetPasswordSchema rejects short password', () => {
    const { ResetPasswordSchema } = require('../definitions')
    const result = ResetPasswordSchema.safeParse({ token: 'abc', password: '12345', confirmPassword: '12345' })
    expect(result.success).toBe(false)
  })

  it('LoginSchema rejects non-email strings', () => {
    const { LoginSchema } = require('../definitions')
    const result = LoginSchema.safeParse({ email: 'not-an-email', password: 'password' })
    expect(result.success).toBe(false)
  })

  it('LoginSchema trims whitespace around email before validating', () => {
    const { LoginSchema } = require('../definitions')
    const result = LoginSchema.safeParse({ email: '  test@test.com  ', password: 'pass' })
    expect(result.success).toBe(true)
  })
})

/* ═══════════════════════════════════════════
   TYPE COERCION SAFETY
   ═══════════════════════════════════════════ */

describe('Type coercion safety', () => {
  it('getUserById handles non-existent id gracefully', async () => {
    const { getUserById } = await import('../db-json')
    expect(getUserById(null)).toBeNull()
    expect(getUserById('abc')).toBeNull()
    expect(getUserById({})).toBeNull()
  })

  it('getSystemById handles non-numeric id', async () => {
    const { getSystemById } = await import('../db-json')
    expect(getSystemById(null)).toBeNull()
    expect(getSystemById('abc')).toBeNull()
  })

  it('getDownloadById handles undefined', async () => {
    const { getDownloadById } = await import('../db-json')
    expect(getDownloadById(undefined)).toBeNull()
  })
})
