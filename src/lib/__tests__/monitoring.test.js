import { describe, it, expect, beforeEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

vi.mock('server-only', () => ({}))

const DB_PATH = process.env.JRDEV_DB_FILE || path.join(process.cwd(), 'data', 'db.json')

const minutesAgo = (m) => new Date(Date.now() - m * 60 * 1000).toISOString()

function writeDb(telemetryStatus, lastHeartbeat) {
  const data = {
    users: [
      { id: 1, name: 'Carlos', email: 'carlos@test.com', password: 'h', role: 'client', plan: 'Pro', createdAt: '2026-01-01T00:00:00Z' },
      { id: 99, name: 'Admin', email: 'admin@test.com', password: 'h', role: 'admin', plan: null, createdAt: '2026-01-01T00:00:00Z' },
    ],
    systems: [
      { id: 1, clientId: 1, name: 'Pocitos POS', icon: '🏊', type: 'online', description: 'POS', version: '2.1.0', status: 'online', externalUrl: null, apiKey: 'sk_live_x', createdAt: '2026-01-01T00:00:00Z' },
    ],
    downloads: [],
    telemetry: [
      { id: 1, systemId: 1, clientId: 1, status: telemetryStatus, version: '2.1.0', lastHeartbeat, errors: [] },
    ],
    tickets: [], payments: [], passwordResets: [],
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

describe("Dead man's switch (latido vencido)", () => {
  it('un sistema "online" con latido viejo (>5min) se reporta offline', async () => {
    writeDb('online', minutesAgo(10))
    const { getSystemsWithStatusByClient } = await import('../db-json')
    const systems = getSystemsWithStatusByClient(1)
    expect(systems[0].status).toBe('offline')
  })

  it('un sistema "online" con latido fresco sigue online', async () => {
    writeDb('online', minutesAgo(1))
    const { getSystemsWithStatusByClient } = await import('../db-json')
    expect(getSystemsWithStatusByClient(1)[0].status).toBe('online')
  })

  it('getStaleOnlineSystems detecta el sistema sin latido', async () => {
    writeDb('online', minutesAgo(10))
    const { getStaleOnlineSystems } = await import('../db-json')
    const stale = getStaleOnlineSystems()
    expect(stale).toHaveLength(1)
    expect(stale[0].name).toBe('Pocitos POS')
  })

  it('getStaleOnlineSystems NO incluye los que ya están offline', async () => {
    writeDb('offline', minutesAgo(30))
    const { getStaleOnlineSystems } = await import('../db-json')
    expect(getStaleOnlineSystems()).toHaveLength(0)
  })

  it('markSystemOffline marca el estado en telemetría', async () => {
    writeDb('online', minutesAgo(10))
    const { markSystemOffline, getTelemetryBySystem } = await import('../db-json')
    markSystemOffline(1)
    expect(getTelemetryBySystem(1).status).toBe('offline')
  })

  it('getAdminEmails devuelve solo correos de admins', async () => {
    writeDb('online', minutesAgo(1))
    const { getAdminEmails } = await import('../db-json')
    expect(getAdminEmails()).toEqual(['admin@test.com'])
  })
})
