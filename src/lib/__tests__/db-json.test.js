import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'

vi.mock('server-only', () => ({}))

import {
  getUserByEmail,
  getUserById,
  getDownloadsByClient,
  getDownloadById,
  getTicketsByClient,
  getTicketById,
  addMessageToTicket,
  createTicket,
  getPaymentsByClient,
  getAllClients,
  getAllTickets,
  updateTicketStatus,
  getAllSystems,
  getSystemsByClient,
  getSystemById,
  getTelemetryBySystem,
  upsertTelemetry,
  getAllTelemetry,
  resolveError,
  getAdminOverview,
  updateSystemFromGit,
  createPasswordReset,
  getPasswordResetByToken,
  resetUserPassword,
  getPasswordResetsByEmail,
} from '../db-json'

// Usa la misma BD temporal aislada que configura vitest-setup.js
const DB_PATH = process.env.JRDEV_DB_FILE || path.join(process.cwd(), 'data', 'db.json')

// Latido reciente para que el dead man's switch no marque offline durante el test.
const RECENT_HEARTBEAT = new Date(Date.now() - 60 * 1000).toISOString()

const testData = {
  users: [
    { id: 1, name: 'Alice Client', email: 'alice@test.com', password: '$2a$10$...', role: 'client', plan: 'Pro', avatar: null, createdAt: '2026-01-01T00:00:00Z' },
    { id: 2, name: 'Bob Client', email: 'bob@test.com', password: '$2a$10$...', role: 'client', plan: 'Basic', avatar: null, createdAt: '2026-02-01T00:00:00Z' },
    { id: 99, name: 'Admin User', email: 'admin@test.com', password: '$2a$10$...', role: 'admin', plan: null, avatar: null, createdAt: '2026-01-01T00:00:00Z' },
  ],
  systems: [
    { id: 1, clientId: 1, name: 'App One', type: 'desktop', description: 'First app', fileName: 'app1.exe', fileSize: '10MB', version: '1.0.0', status: 'online', externalUrl: null, gitRepo: 'https://github.com/test/app1', gitBranch: 'main', lastCommitSha: 'abc123', lastCommitMsg: 'Initial', lastCommitDate: '2026-05-01T00:00:00Z', createdAt: '2026-01-15T00:00:00Z' },
    { id: 2, clientId: 1, name: 'App Two', type: 'online', description: 'Second app', fileName: null, fileSize: null, version: '2.0.0', status: 'error', externalUrl: 'https://app2.test.com', gitRepo: null, gitBranch: null, lastCommitSha: null, lastCommitMsg: null, lastCommitDate: null, createdAt: '2026-03-01T00:00:00Z' },
    { id: 3, clientId: 2, name: 'App Three', type: 'desktop', description: 'Third app', fileName: 'app3.exe', fileSize: '20MB', version: '3.0.0', status: 'online', externalUrl: null, gitRepo: 'https://github.com/test/app3', gitBranch: 'main', lastCommitSha: 'def456', lastCommitMsg: 'Update', lastCommitDate: '2026-04-01T00:00:00Z', createdAt: '2026-02-01T00:00:00Z' },
  ],
  downloads: [
    { id: 1, systemId: 1, clientId: 1, name: 'App One v1.0.0', description: 'Release', fileName: 'app1-v1.0.0.exe', fileSize: '10MB', version: '1.0.0', changelog: '- First', createdAt: '2026-06-01T00:00:00Z' },
    { id: 2, systemId: 1, clientId: 1, name: 'App One v0.9.0', description: 'Beta', fileName: 'app1-v0.9.0.exe', fileSize: '9MB', version: '0.9.0', changelog: '- Beta', createdAt: '2026-04-01T00:00:00Z' },
  ],
  telemetry: [
    { id: 1, systemId: 1, clientId: 1, status: 'online', version: '1.0.0', lastHeartbeat: RECENT_HEARTBEAT, errors: [] },
    {
      id: 2, systemId: 2, clientId: 1, status: 'error', version: '2.0.0', lastHeartbeat: RECENT_HEARTBEAT,
      errors: [
        { id: 1, level: 'critical', message: 'DB timeout', stacktrace: 'Error: timeout', loggedAt: '2026-05-01T00:00:00Z', resolved: false },
        { id: 2, level: 'warning', message: 'High memory', stacktrace: null, loggedAt: '2026-04-01T00:00:00Z', resolved: true },
      ],
    },
  ],
  tickets: [
    { id: 1, clientId: 1, systemId: 1, subject: 'Bug', description: 'Something broke', status: 'open', priority: 'high', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z', messages: [{ id: 1, userId: 1, userName: 'Alice Client', text: 'Something broke', isStaff: false, createdAt: '2026-06-01T00:00:00Z' }] },
    { id: 2, clientId: 1, systemId: null, subject: 'Feature request', description: 'Add export', status: 'in_progress', priority: 'medium', createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-10T00:00:00Z', messages: [{ id: 2, userId: 1, userName: 'Alice Client', text: 'Please add export', isStaff: false, createdAt: '2026-05-01T00:00:00Z' }, { id: 3, userId: 99, userName: 'Admin User', text: 'We are working on it', isStaff: true, createdAt: '2026-05-10T00:00:00Z' }] },
    { id: 3, clientId: 2, systemId: 3, subject: 'Login issue', description: 'Cannot login', status: 'resolved', priority: 'high', createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-04-05T00:00:00Z', messages: [{ id: 4, userId: 2, userName: 'Bob Client', text: 'Cannot login', isStaff: false, createdAt: '2026-04-01T00:00:00Z' }] },
  ],
  payments: [
    { id: 1, clientId: 1, plan: 'Pro', amount: 100000, currency: 'COP', status: 'paid', method: 'Transfer', dueDate: '2026-06-15', paidAt: '2026-06-14T00:00:00Z', invoice: 'FAC-001' },
    { id: 2, clientId: 1, plan: 'Pro', amount: 100000, currency: 'COP', status: 'pending', method: null, dueDate: '2026-07-15', paidAt: null, invoice: null },
    { id: 3, clientId: 2, plan: 'Basic', amount: 50000, currency: 'COP', status: 'paid', method: 'Cash', dueDate: '2026-06-10', paidAt: '2026-06-09T00:00:00Z', invoice: 'FAC-002' },
  ],
  passwordResets: [],
}

let originalData = null

beforeAll(() => {
  if (fs.existsSync(DB_PATH)) {
    originalData = fs.readFileSync(DB_PATH, 'utf-8')
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(testData, null, 2), 'utf-8')
})

afterAll(() => {
  if (originalData) {
    fs.writeFileSync(DB_PATH, originalData, 'utf-8')
  }
})

beforeEach(() => {
  fs.writeFileSync(DB_PATH, JSON.stringify(testData, null, 2), 'utf-8')
})

/* ═══════════════════════════════════════════
   USERS
   ═══════════════════════════════════════════ */

describe('getUserByEmail', () => {
  it('returns the user when email exists', () => {
    const user = getUserByEmail('alice@test.com')
    expect(user).not.toBeNull()
    expect(user.id).toBe(1)
    expect(user.name).toBe('Alice Client')
    expect(user.role).toBe('client')
  })

  it('returns null when email does not exist', () => {
    const user = getUserByEmail('nonexistent@test.com')
    expect(user).toBeNull()
  })

  it('is case-sensitive', () => {
    const user = getUserByEmail('ALICE@TEST.COM')
    expect(user).toBeNull()
  })
})

describe('getUserById', () => {
  it('returns the user when id exists', () => {
    const user = getUserById(2)
    expect(user).not.toBeNull()
    expect(user.email).toBe('bob@test.com')
    expect(user.name).toBe('Bob Client')
  })

  it('returns null when id does not exist', () => {
    const user = getUserById(999)
    expect(user).toBeNull()
  })
})

describe('getAllClients', () => {
  it('returns only users with role client', () => {
    const clients = getAllClients()
    expect(clients).toHaveLength(2)
    expect(clients.every(c => c.role === 'client')).toBe(true)
    expect(clients.map(c => c.id)).toEqual(expect.arrayContaining([1, 2]))
  })

  it('does not include admin users', () => {
    const clients = getAllClients()
    expect(clients.find(c => c.role === 'admin')).toBeUndefined()
    expect(clients.find(c => c.id === 99)).toBeUndefined()
  })
})

/* ═══════════════════════════════════════════
   SYSTEMS
   ═══════════════════════════════════════════ */

describe('getAllSystems', () => {
  it('returns all systems', () => {
    const systems = getAllSystems()
    expect(systems).toHaveLength(3)
    expect(systems.map(s => s.id)).toEqual([1, 2, 3])
  })
})

describe('getSystemsByClient', () => {
  it('returns systems for a client that has them', () => {
    const systems = getSystemsByClient(1)
    expect(systems).toHaveLength(2)
    expect(systems.map(s => s.id)).toEqual([1, 2])
  })

  it('returns empty array for a client with no systems', () => {
    const systems = getSystemsByClient(99)
    expect(systems).toEqual([])
  })
})

describe('getSystemById', () => {
  it('returns the system when id exists', () => {
    const system = getSystemById(3)
    expect(system).not.toBeNull()
    expect(system.name).toBe('App Three')
    expect(system.clientId).toBe(2)
  })

  it('returns null when id does not exist', () => {
    const system = getSystemById(999)
    expect(system).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   DOWNLOADS
   ═══════════════════════════════════════════ */

describe('getDownloadsByClient', () => {
  it('returns downloads for a client sorted by createdAt descending', () => {
    const downloads = getDownloadsByClient(1)
    expect(downloads).toHaveLength(2)
    expect(downloads[0].id).toBe(1)
    expect(downloads[1].id).toBe(2)
    expect(new Date(downloads[0].createdAt).getTime()).toBeGreaterThan(new Date(downloads[1].createdAt).getTime())
  })

  it('returns empty array for a client with no downloads', () => {
    const downloads = getDownloadsByClient(2)
    expect(downloads).toEqual([])
  })
})

describe('getDownloadById', () => {
  it('returns the download when id exists', () => {
    const download = getDownloadById(1)
    expect(download).not.toBeNull()
    expect(download.name).toBe('App One v1.0.0')
    expect(download.systemId).toBe(1)
  })

  it('returns null when id does not exist', () => {
    const download = getDownloadById(999)
    expect(download).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   TICKETS
   ═══════════════════════════════════════════ */

describe('getTicketsByClient', () => {
  it('returns tickets for a client sorted by updatedAt descending', () => {
    const tickets = getTicketsByClient(1)
    expect(tickets).toHaveLength(2)
    expect(tickets[0].id).toBe(1)
    expect(tickets[1].id).toBe(2)
    expect(new Date(tickets[0].updatedAt).getTime()).toBeGreaterThan(new Date(tickets[1].updatedAt).getTime())
  })

  it('returns empty array for a client with no tickets', () => {
    const tickets = getTicketsByClient(99)
    expect(tickets).toEqual([])
  })
})

describe('getTicketById', () => {
  it('returns the ticket when id exists', () => {
    const ticket = getTicketById(1)
    expect(ticket).not.toBeNull()
    expect(ticket.subject).toBe('Bug')
    expect(ticket.status).toBe('open')
    expect(ticket.messages).toHaveLength(1)
  })

  it('returns null when id does not exist', () => {
    const ticket = getTicketById(999)
    expect(ticket).toBeNull()
  })
})

describe('createTicket', () => {
  it('creates a new ticket and persists to db', () => {
    const ticket = createTicket(2, 'New issue', 'Test description', 'low')
    expect(ticket).not.toBeNull()
    expect(ticket.clientId).toBe(2)
    expect(ticket.subject).toBe('New issue')
    expect(ticket.description).toBe('Test description')
    expect(ticket.priority).toBe('low')
    expect(ticket.status).toBe('open')
    expect(typeof ticket.id).toBe('number')
    expect(typeof ticket.createdAt).toBe('string')
    expect(typeof ticket.updatedAt).toBe('string')
    expect(ticket.messages).toHaveLength(1)
    expect(ticket.messages[0].text).toBe('Test description')
    expect(ticket.messages[0].userId).toBe(2)
    expect(ticket.messages[0].userName).toBe('Bob Client')
    expect(ticket.messages[0].isStaff).toBe(false)

    const reloaded = getTicketById(ticket.id)
    expect(reloaded).not.toBeNull()
    expect(reloaded.subject).toBe('New issue')
  })

  it('uses default priority medium when not provided', () => {
    const ticket = createTicket(1, 'Test', 'desc')
    expect(ticket.priority).toBe('medium')
  })

  it('uses "Usuario" as fallback name when clientId has no user', () => {
    const ticket = createTicket(999, 'Test', 'desc')
    expect(ticket.messages[0].userName).toBe('Usuario')
  })
})

describe('addMessageToTicket', () => {
  it('adds a message to an existing ticket and persists', () => {
    const msg = addMessageToTicket(1, 99, 'Admin User', 'We are looking into it', true)
    expect(msg).not.toBeNull()
    expect(msg.text).toBe('We are looking into it')
    expect(msg.userId).toBe(99)
    expect(msg.userName).toBe('Admin User')
    expect(msg.isStaff).toBe(true)
    expect(typeof msg.id).toBe('number')
    expect(typeof msg.createdAt).toBe('string')

    const ticket = getTicketById(1)
    expect(ticket.messages).toHaveLength(2)
    expect(ticket.messages[1].text).toBe('We are looking into it')
    expect(ticket.updatedAt).not.toBe(testData.tickets[0].updatedAt)
  })

  it('returns null when ticket does not exist', () => {
    const msg = addMessageToTicket(999, 1, 'Test', 'hello', false)
    expect(msg).toBeNull()
  })
})

describe('getAllTickets', () => {
  it('returns all tickets sorted by updatedAt descending', () => {
    const tickets = getAllTickets()
    expect(tickets).toHaveLength(3)
    expect(tickets[0].id).toBe(1)
    expect(tickets[1].id).toBe(2)
    expect(tickets[2].id).toBe(3)
  })
})

describe('updateTicketStatus', () => {
  it('updates status and updatedAt, persists', () => {
    const updated = updateTicketStatus(1, 'resolved')
    expect(updated).not.toBeNull()
    expect(updated.status).toBe('resolved')
    expect(updated.updatedAt).not.toBe(testData.tickets[0].updatedAt)

    const reloaded = getTicketById(1)
    expect(reloaded.status).toBe('resolved')
  })

  it('returns null when ticket does not exist', () => {
    const result = updateTicketStatus(999, 'closed')
    expect(result).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   PAYMENTS
   ═══════════════════════════════════════════ */

describe('getPaymentsByClient', () => {
  it('returns payments for a client sorted by dueDate descending', () => {
    const payments = getPaymentsByClient(1)
    expect(payments).toHaveLength(2)
    expect(payments[0].id).toBe(2)
    expect(payments[1].id).toBe(1)
    expect(new Date(payments[0].dueDate).getTime()).toBeGreaterThan(new Date(payments[1].dueDate).getTime())
  })

  it('returns empty array for a client with no payments', () => {
    const payments = getPaymentsByClient(99)
    expect(payments).toEqual([])
  })
})

/* ═══════════════════════════════════════════
   TELEMETRY
   ═══════════════════════════════════════════ */

describe('getTelemetryBySystem', () => {
  it('returns telemetry for a system that has it', () => {
    const t = getTelemetryBySystem(1)
    expect(t).not.toBeNull()
    expect(t.systemId).toBe(1)
    expect(t.status).toBe('online')
  })

  it('returns null for a system with no telemetry', () => {
    const t = getTelemetryBySystem(999)
    expect(t).toBeNull()
  })
})

describe('upsertTelemetry', () => {
  it('updates heartbeat on existing telemetry', () => {
    const before = getTelemetryBySystem(1)
    const beforeHeartbeat = before.lastHeartbeat

    const result = upsertTelemetry(1, 1, { status: 'online', version: '1.0.0' })
    expect(result).not.toBeNull()
    expect(result.systemId).toBe(1)
    expect(result.lastHeartbeat).not.toBe(beforeHeartbeat)

    const reloaded = getTelemetryBySystem(1)
    expect(reloaded.lastHeartbeat).not.toBe(beforeHeartbeat)
    expect(reloaded.status).toBe('online')
  })

  it('logs an error on existing telemetry', () => {
    const before = getTelemetryBySystem(1)
    const beforeCount = before.errors.length

    const result = upsertTelemetry(1, 1, {
      status: 'error',
      error: { level: 'critical', message: 'Crash report', stacktrace: 'at main()' },
    })
    expect(result.errors).toHaveLength(beforeCount + 1)
    expect(result.errors[result.errors.length - 1].message).toBe('Crash report')
    expect(result.errors[result.errors.length - 1].level).toBe('critical')
    expect(result.errors[result.errors.length - 1].resolved).toBe(false)

    const reloaded = getTelemetryBySystem(1)
    expect(reloaded.errors).toHaveLength(beforeCount + 1)
  })

  it('uses default error level when not provided', () => {
    const result = upsertTelemetry(1, 1, {
      error: { message: 'Generic error' },
    })
    const newError = result.errors[result.errors.length - 1]
    expect(newError.level).toBe('error')
    expect(newError.stacktrace).toBeNull()
  })

  it('creates new telemetry entry when system has none', () => {
    const result = upsertTelemetry(999, 2, { status: 'online', version: '1.0.0' })
    expect(result).not.toBeNull()
    expect(result.systemId).toBe(999)
    expect(result.clientId).toBe(2)
    expect(result.status).toBe('online')
    expect(result.version).toBe('1.0.0')
    expect(result.errors).toEqual([])

    const reloaded = getTelemetryBySystem(999)
    expect(reloaded).not.toBeNull()
    expect(reloaded.systemId).toBe(999)
  })

  it('creates new telemetry with an error when error is provided', () => {
    const result = upsertTelemetry(888, 2, {
      status: 'error',
      error: { level: 'warning', message: 'High latency' },
    })
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0].message).toBe('High latency')
    expect(result.errors[0].resolved).toBe(false)
  })

  it('uses defaults for new telemetry when minimal data is given', () => {
    const result = upsertTelemetry(777, 1, {})
    expect(result.status).toBe('online')
    expect(result.version).toBe('0.0.0')
  })
})

describe('getAllTelemetry', () => {
  it('returns all telemetry entries', () => {
    const all = getAllTelemetry()
    expect(all).toHaveLength(2)
    expect(all.map(t => t.systemId)).toEqual([1, 2])
  })
})

describe('resolveError', () => {
  it('marks an error as resolved and persists', () => {
    const error = resolveError(2, 1)
    expect(error).not.toBeNull()
    expect(error.id).toBe(1)
    expect(error.resolved).toBe(true)

    const telemetry = getTelemetryBySystem(2)
    const found = telemetry.errors.find(e => e.id === 1)
    expect(found.resolved).toBe(true)
  })

  it('returns null when system does not exist', () => {
    const result = resolveError(999, 1)
    expect(result).toBeNull()
  })

  it('returns null when error id does not exist', () => {
    const result = resolveError(2, 999)
    expect(result).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   ADMIN
   ═══════════════════════════════════════════ */

describe('getAdminOverview', () => {
  it('returns correct overview counts', () => {
    const overview = getAdminOverview()
    expect(overview.totalClients).toBe(2)
    expect(overview.totalSystems).toBe(3)
    expect(overview.systemsOnline).toBe(1)
    expect(overview.systemsError).toBe(1)
    expect(overview.openTickets).toBe(2)
  })

  it('returns recent unresolved errors sorted by loggedAt descending', () => {
    const overview = getAdminOverview()
    expect(overview.recentErrors).toHaveLength(1)
    expect(overview.recentErrors[0].id).toBe(1)
    expect(overview.recentErrors[0].systemId).toBe(2)
    expect(overview.recentErrors[0].clientId).toBe(1)
  })

  it('returns enriched systems with client info and counts', () => {
    const overview = getAdminOverview()
    expect(overview.systems).toHaveLength(3)

    const sys1 = overview.systems.find(s => s.id === 1)
    expect(sys1.clientName).toBe('Alice Client')
    expect(sys1.status).toBe('online')
    expect(sys1.lastHeartbeat).toBe(RECENT_HEARTBEAT)
    expect(sys1.errorCount).toBe(0)
    expect(sys1.ticketCount).toBe(1)

    const sys2 = overview.systems.find(s => s.id === 2)
    expect(sys2.clientName).toBe('Alice Client')
    expect(sys2.status).toBe('error')
    expect(sys2.lastHeartbeat).toBe(RECENT_HEARTBEAT)
    expect(sys2.errorCount).toBe(1)
    expect(sys2.ticketCount).toBe(0)

    const sys3 = overview.systems.find(s => s.id === 3)
    expect(sys3.clientName).toBe('Bob Client')
    expect(sys3.status).toBe('offline')
    expect(sys3.lastHeartbeat).toBeNull()
    expect(sys3.errorCount).toBe(0)
    expect(sys3.ticketCount).toBe(0)
  })
})

/* ═══════════════════════════════════════════
   UPDATE SYSTEM FROM GIT
   ═══════════════════════════════════════════ */

describe('updateSystemFromGit', () => {
  it('updates git commit fields and persists', () => {
    const before = getSystemById(1)

    const result = updateSystemFromGit(1)
    expect(result).not.toBeNull()
    expect(result.id).toBe(1)
    expect(result.lastCommitMsg).toBe('Actualización automática vía webhook')
    expect(result.lastCommitDate).not.toBe(before.lastCommitDate)
    expect(result.lastCommitSha).not.toBe(before.lastCommitSha)
    expect(result.lastCommitSha).toMatch(/^[0-9a-f]{12}$/)

    const reloaded = getSystemById(1)
    expect(reloaded.lastCommitSha).toBe(result.lastCommitSha)
    expect(reloaded.lastCommitDate).toBe(result.lastCommitDate)
  })

  it('returns null when system does not exist', () => {
    const result = updateSystemFromGit(999)
    expect(result).toBeNull()
  })
})

/* ═══════════════════════════════════════════
   PASSWORD RESET
   ═══════════════════════════════════════════ */

describe('createPasswordReset', () => {
  it('creates a reset token for an existing user', () => {
    const token = createPasswordReset('alice@test.com')
    expect(token).not.toBeNull()
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(0)

    const resets = getPasswordResetsByEmail('alice@test.com')
    expect(resets).toHaveLength(1)
    expect(resets[0].token).toBe(token)
    expect(resets[0].used).toBe(false)
    expect(resets[0].email).toBe('alice@test.com')
  })

  it('returns null for a non-existent email', () => {
    const token = createPasswordReset('nonexistent@test.com')
    expect(token).toBeNull()
  })
})

describe('getPasswordResetByToken', () => {
  it('returns the reset object for a valid token', () => {
    const token = createPasswordReset('alice@test.com')
    const reset = getPasswordResetByToken(token)
    expect(reset).not.toBeNull()
    expect(reset.token).toBe(token)
    expect(reset.email).toBe('alice@test.com')
    expect(reset.used).toBe(false)
    expect(reset.expiresAt).toBeDefined()
  })

  it('returns null for a non-existent token', () => {
    const reset = getPasswordResetByToken('invalid-token')
    expect(reset).toBeNull()
  })

  it('returns null for an expired token (expiresAt in the past)', () => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    db.passwordResets.push({
      token: 'expired-token',
      email: 'alice@test.com',
      used: false,
      expiresAt: '2020-01-01T00:00:00Z',
      createdAt: '2020-01-01T00:00:00Z',
    })
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8')

    const reset = getPasswordResetByToken('expired-token')
    expect(reset).toBeNull()
  })
})

describe('getPasswordResetsByEmail', () => {
  it('returns all reset records for the email', () => {
    const token1 = createPasswordReset('alice@test.com')
    const token2 = createPasswordReset('alice@test.com')
    const resets = getPasswordResetsByEmail('alice@test.com')
    expect(resets).toHaveLength(2)
    expect(resets.map(r => r.token)).toEqual([token1, token2])
  })

  it('returns empty array for email with no resets', () => {
    const resets = getPasswordResetsByEmail('bob@test.com')
    expect(resets).toEqual([])
  })
})

describe('resetUserPassword', () => {
  it('resets password and marks token as used', () => {
    const token = createPasswordReset('alice@test.com')

    const user = resetUserPassword(token, 'newpassword123')
    expect(user).not.toBeNull()
    expect(user.id).toBe(1)
    expect(user.email).toBe('alice@test.com')

    const reset = getPasswordResetByToken(token)
    expect(reset).toBeNull()
  })

  it('returns null for an invalid token', () => {
    const result = resetUserPassword('invalid-token', 'newpass')
    expect(result).toBeNull()
  })

  it('returns null when token is already used', () => {
    const token = createPasswordReset('alice@test.com')
    resetUserPassword(token, 'firstpass')
    const result = resetUserPassword(token, 'secondpass')
    expect(result).toBeNull()
  })
})

describe('Password Reset — full flow', () => {
  it('create → getByToken → reset → getByToken is null', () => {
    const token = createPasswordReset('bob@test.com')
    expect(token).not.toBeNull()

    const beforeReset = getPasswordResetByToken(token)
    expect(beforeReset).not.toBeNull()
    expect(beforeReset.used).toBe(false)

    const user = resetUserPassword(token, 'newbobpass')
    expect(user).not.toBeNull()
    expect(user.email).toBe('bob@test.com')

    const afterReset = getPasswordResetByToken(token)
    expect(afterReset).toBeNull()
  })
})
