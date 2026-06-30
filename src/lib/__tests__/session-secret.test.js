import { describe, it, expect, vi, afterEach } from 'vitest'

// Verifica el endurecimiento del secreto de sesión:
//  - en producción no arranca sin SESSION_SECRET
//  - tokens firmados con un secreto distinto son rechazados (anti-falsificación)

const ORIGINAL_SECRET = process.env.SESSION_SECRET
const ORIGINAL_ENV = process.env.NODE_ENV

afterEach(() => {
  if (ORIGINAL_SECRET === undefined) delete process.env.SESSION_SECRET
  else process.env.SESSION_SECRET = ORIGINAL_SECRET
  process.env.NODE_ENV = ORIGINAL_ENV
  vi.resetModules()
})

describe('SESSION_SECRET hardening', () => {
  it('lanza error en producción si falta SESSION_SECRET', async () => {
    vi.resetModules()
    process.env.NODE_ENV = 'production'
    delete process.env.SESSION_SECRET
    await expect(import('../session')).rejects.toThrow(/SESSION_SECRET/)
  })

  it('lanza error en producción si SESSION_SECRET es muy corto', async () => {
    vi.resetModules()
    process.env.NODE_ENV = 'production'
    process.env.SESSION_SECRET = 'corto'
    await expect(import('../session')).rejects.toThrow(/SESSION_SECRET/)
  })

  it('rechaza un token firmado con OTRO secreto (anti-falsificación)', async () => {
    vi.resetModules()
    process.env.NODE_ENV = 'test'
    process.env.SESSION_SECRET = 'secreto-A-1234567890abcdefghij'
    const modA = await import('../session')
    const token = await modA.encrypt({ userId: 1, role: 'admin' })

    vi.resetModules()
    process.env.SESSION_SECRET = 'secreto-B-1234567890abcdefghij'
    const modB = await import('../session')
    expect(await modB.decrypt(token)).toBeNull()
  })

  it('acepta el token cuando el secreto coincide', async () => {
    vi.resetModules()
    process.env.NODE_ENV = 'test'
    process.env.SESSION_SECRET = 'secreto-consistente-1234567890ab'
    const mod = await import('../session')
    const token = await mod.encrypt({ userId: 9, role: 'admin' })
    const out = await mod.decrypt(token)
    expect(out.userId).toBe(9)
    expect(out.role).toBe('admin')
  })
})
