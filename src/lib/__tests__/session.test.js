import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { encrypt, decrypt } from '../session'

// session.js uses next/headers which requires Next.js runtime
// We test the pure JWT functions (encrypt/decrypt) directly

describe('JWT Session', () => {
  it('encrypt creates a valid JWT string', async () => {
    const token = await encrypt({ userId: 1, role: 'client' })
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3) // header.payload.signature
  })

  it('decrypt returns the original payload', async () => {
    const payload = { userId: 42, role: 'admin' }
    const token = await encrypt(payload)
    const decrypted = await decrypt(token)
    expect(decrypted.userId).toBe(42)
    expect(decrypted.role).toBe('admin')
  })

  it('decrypt returns null for invalid tokens', async () => {
    const result = await decrypt('invalid-token')
    expect(result).toBeNull()
  })

  it('decrypt returns null for tampered tokens', async () => {
    const token = await encrypt({ userId: 1 })
    const [header, payload, signature] = token.split('.')
    const tampered = [header, payload, 'tampered'].join('.')
    const result = await decrypt(tampered)
    expect(result).toBeNull()
  })

  it('decrypt handles empty/undefined gracefully', async () => {
    expect(await decrypt(null)).toBeNull()
    expect(await decrypt(undefined)).toBeNull()
    expect(await decrypt('')).toBeNull()
  })

  it('supports multiple fields in payload', async () => {
    const payload = { userId: 7, role: 'client', expiresAt: new Date().toISOString() }
    const token = await encrypt(payload)
    const decrypted = await decrypt(token)
    expect(decrypted.userId).toBe(7)
    expect(decrypted.role).toBe('client')
    expect(decrypted.expiresAt).toBeDefined()
  })
})
