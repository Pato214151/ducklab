import { describe, it, expect, beforeEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

vi.mock('server-only', () => ({}))

const DB_PATH = process.env.JRDEV_DB_FILE || path.join(process.cwd(), 'data', 'db.json')

beforeEach(() => {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [
      { id: 1, name: 'Carlos', email: 'carlos@test.com', password: 'h', role: 'client', plan: 'Pro', createdAt: '2026-01-01T00:00:00Z' },
      { id: 99, name: 'Admin', email: 'admin@test.com', password: 'h', role: 'admin', createdAt: '2026-01-01T00:00:00Z' },
    ],
    systems: [
      { id: 1, clientId: 1, name: 'Pengos', icon: '🐧', type: 'desktop', version: '1.0.0', status: 'online', apiKey: 'sk_live_x', createdAt: '2026-01-01T00:00:00Z' },
    ],
    downloads: [], telemetry: [], tickets: [], payments: [], passwordResets: [],
  }, null, 2), 'utf-8')
})

describe('Admin CRUD — alta de clientes/sistemas/versiones', () => {
  it('createUser: id secuencial, contraseña hasheada y sin filtrarla', async () => {
    const { createUser, getUserByEmail } = await import('../db-json')
    const u = createUser({ name: 'Nuevo', email: 'nuevo@test.com', password: 'secreta123' })
    expect(u.id).toBe(100) // max(1, 99) + 1
    expect(u.role).toBe('client')
    expect(u.password).toBeUndefined()
    const stored = getUserByEmail('nuevo@test.com')
    expect(stored.password).not.toBe('secreta123') // bcrypt
  })

  it('createUser: rechaza email duplicado', async () => {
    const { createUser } = await import('../db-json')
    expect(createUser({ name: 'X', email: 'carlos@test.com', password: '123456' })).toEqual({ error: 'email_exists' })
  })

  it('createSystem: genera API key y id secuencial', async () => {
    const { createSystem, getSystemByApiKey } = await import('../db-json')
    const s = createSystem({ clientId: 1, name: 'POS Nuevo', type: 'online' })
    expect(s.id).toBe(2)
    expect(s.apiKey).toMatch(/^sk_live_[a-f0-9]{48}$/)
    expect(getSystemByApiKey(s.apiKey).name).toBe('POS Nuevo')
  })

  it('createDownload: publica versión y actualiza el sistema', async () => {
    const { createDownload, getSystemById } = await import('../db-json')
    const d = createDownload({ systemId: 1, name: 'Pengos 2.0', version: '2.0.0', fileName: 'pengos-2.0.0.exe', fileSize: '70 MB' })
    expect(d.clientId).toBe(1)
    const sys = getSystemById(1)
    expect(sys.version).toBe('2.0.0')
    expect(sys.fileName).toBe('pengos-2.0.0.exe')
  })

  it('createDownload: falla si el sistema no existe', async () => {
    const { createDownload } = await import('../db-json')
    expect(createDownload({ systemId: 999, name: 'X', version: '1.0', fileName: 'x.exe' })).toEqual({ error: 'system_not_found' })
  })
})
