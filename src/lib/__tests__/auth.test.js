import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

// Usa la misma BD temporal aislada que configura vitest-setup.js (nunca la real)
const DB_PATH = process.env.JRDEV_DB_FILE || path.join(process.cwd(), 'data', 'db.json')
let originalData = null

// Mock next/navigation redirect
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url) => { throw new Error(`REDIRECT:${url}`) }),
}))

// Mock next/headers cookies
const cookieStore = new Map()
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: (name) => cookieStore.get(name) ? { value: cookieStore.get(name) } : undefined,
    set: (name, value, opts) => cookieStore.set(name, value),
    delete: (name) => cookieStore.delete(name),
  })),
  headers: vi.fn(() => ({
    get: () => null, // sin x-forwarded-for en tests → IP 'unknown'
  })),
}))

const testData = {
  users: [
    { id: 1, name: 'Test User', email: 'test@test.com', password: '$2a$10$Q7G6VSKZXlW4xK5yZ8W9Ue8X9Y0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', role: 'client', plan: 'Pro', avatar: null, createdAt: '2026-01-01T00:00:00Z' },
  ],
  systems: [],
  downloads: [],
  telemetry: [],
  tickets: [],
  payments: [],
  passwordResets: [],
}

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

describe('Auth Actions', () => {
  it('login validates required fields', async () => {
    const { login } = await import('../actions/auth')
    const formData = new FormData()
    formData.set('email', '')
    formData.set('password', '')
    const result = await login({}, formData)
    expect(result.errors).toBeDefined()
    expect(result.errors.email).toBeDefined()
    expect(result.errors.password).toBeDefined()
  })

  it('login rejects invalid email format', async () => {
    const { login } = await import('../actions/auth')
    const formData = new FormData()
    formData.set('email', 'not-an-email')
    formData.set('password', 'cliente123')
    const result = await login({}, formData)
    expect(result.errors).toBeDefined()
    expect(result.errors.email).toBeDefined()
  })

  it('login rejects wrong password', async () => {
    const { login } = await import('../actions/auth')
    const formData = new FormData()
    formData.set('email', 'test@test.com')
    formData.set('password', 'wrongpassword')
    const result = await login({}, formData)
    expect(result.errors).toBeNull()
    expect(result.message).toBe('Correo o contraseña incorrectos')
  })

  it('login rejects non-existent email', async () => {
    const { login } = await import('../actions/auth')
    const formData = new FormData()
    formData.set('email', 'noexiste@test.com')
    formData.set('password', 'cliente123')
    const result = await login({}, formData)
    expect(result.errors).toBeNull()
    expect(result.message).toBe('Correo o contraseña incorrectos')
  })
})

describe('Password Reset Actions', () => {
  it('requestPasswordReset does not reveal if email exists', async () => {
    const { requestPasswordReset } = await import('../actions/auth')
    const formData = new FormData()
    formData.set('email', 'nonexistent@test.com')
    const result = await requestPasswordReset({}, formData)
    expect(result.success).toBe(true)
    expect(result.message).toContain('Si el correo existe')
  })

  it('requestPasswordReset validates email format', async () => {
    const { requestPasswordReset } = await import('../actions/auth')
    const formData = new FormData()
    formData.set('email', 'bad-email')
    const result = await requestPasswordReset({}, formData)
    expect(result.success).toBe(false)
    expect(result.errors.email).toBeDefined()
  })
})
