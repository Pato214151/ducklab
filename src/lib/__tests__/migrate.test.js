import { describe, it, expect, beforeAll, vi } from 'vitest'
import fs from 'fs'
import path from 'path'
import { PGlite } from '@electric-sql/pglite'
import { seedData } from '../../../scripts/migrate-to-pg.mjs'

// Valida que el script de migración inserta bien contra Postgres real (pglite).
vi.mock('server-only', () => ({}))
vi.mock('../db-pool', () => ({ query: (t, p) => globalThis.__pgm.query(t, p) }))

const sample = {
  users: [
    { id: 1, name: 'Carlos', email: 'c@t.com', password: 'h', role: 'client', plan: 'Pro', avatar: null, lastLogin: '2026-06-01T00:00:00Z', createdAt: '2026-01-01T00:00:00Z' },
    { id: 99, name: 'Admin', email: 'a@t.com', password: 'h', role: 'admin', plan: null, avatar: null, createdAt: '2026-01-01T00:00:00Z' },
  ],
  systems: [
    { id: 1, clientId: 1, name: 'Pengos', icon: '🐧', type: 'desktop', description: 'd', fileName: 'p.exe', fileSize: '10MB', version: '2.5.0', status: 'online', externalUrl: null, apiKey: 'sk_live_x', runbook: null, gitRepo: null, gitBranch: null, lastCommitSha: null, lastCommitMsg: null, lastCommitDate: null, createdAt: '2026-01-01T00:00:00Z' },
  ],
  downloads: [{ id: 1, systemId: 1, clientId: 1, name: 'Pengos 2.5', description: 'r', fileName: 'p.exe', fileSize: '10MB', version: '2.5.0', changelog: '-', createdAt: '2026-06-01T00:00:00Z' }],
  telemetry: [{ id: 1, systemId: 1, clientId: 1, status: 'error', version: '2.5.0', lastHeartbeat: '2026-06-01T00:00:00Z', errors: [{ id: 1, level: 'critical', message: 'boom', stacktrace: null, loggedAt: '2026-06-01T00:00:00Z', resolved: false }] }],
  tickets: [{ id: 5, clientId: 1, systemId: 1, subject: 'Bug', description: 'algo', status: 'open', priority: 'high', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z', messages: [{ id: 50, userId: 1, userName: 'Carlos', text: 'hola', isStaff: false, createdAt: '2026-06-01T00:00:00Z' }] }],
  payments: [{ id: 1, clientId: 1, plan: 'Pro', amount: 100000, currency: 'COP', status: 'pending', method: null, dueDate: '2026-07-15', paidAt: null, invoice: null, earlyRequested: false, earlyRequestedAt: null }],
  passwordResets: [],
}

let db
beforeAll(async () => {
  const pg = new PGlite()
  globalThis.__pgm = pg
  const schema = fs.readFileSync(path.join(process.cwd(), 'schema.sql'), 'utf-8')
  await pg.exec(schema)
  await seedData((t, p) => pg.query(t, p), sample)
  db = await import('../db-pg')
})

describe('migrate-to-pg · seedData contra Postgres real', () => {
  it('migra usuarios (con last_login) y separa clientes de admin', async () => {
    expect((await db.getUserById(1)).name).toBe('Carlos')
    expect((await db.getUserById(1)).lastLogin).not.toBeNull()
    expect(await db.getAllClients()).toHaveLength(1)
  })

  it('migra sistemas con api_key e icon', async () => {
    const s = await db.getSystemByApiKey('sk_live_x')
    expect(s.name).toBe('Pengos')
    expect(s.icon).toBe('🐧')
  })

  it('migra telemetría con errores anidados', async () => {
    const t = await db.getTelemetryBySystem(1)
    expect(t.status).toBe('error')
    expect(t.errors).toHaveLength(1)
    expect(t.errors[0].message).toBe('boom')
  })

  it('migra tickets con mensajes anidados', async () => {
    const t = await db.getTicketById(5)
    expect(t.subject).toBe('Bug')
    expect(t.messages).toHaveLength(1)
  })

  it('migra pagos', async () => {
    expect((await db.getPaymentsByClient(1))[0].amount).toBeDefined()
  })

  it('reinicia las secuencias: un INSERT nuevo no colisiona con ids migrados', async () => {
    const t = await db.createTicket(1, 'Nuevo ticket', 'descripcion larga aqui', 'low')
    expect(t.id).toBeGreaterThan(5)
  })
})
