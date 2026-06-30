import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { checkRateLimit, resetRateLimit, _clearAllRateLimits } from '../rate-limit'

beforeEach(() => _clearAllRateLimits())

describe('checkRateLimit', () => {
  it('permite hasta "max" intentos y bloquea el siguiente', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('ip-1', { max: 5 }).allowed).toBe(true)
    }
    const blocked = checkRateLimit('ip-1', { max: 5 })
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfter).toBeGreaterThan(0)
    expect(blocked.remaining).toBe(0)
  })

  it('cuenta cada clave de forma independiente', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('ip-A', { max: 5 })
    // ip-A bloqueada, pero ip-B sigue libre
    expect(checkRateLimit('ip-A', { max: 5 }).allowed).toBe(false)
    expect(checkRateLimit('ip-B', { max: 5 }).allowed).toBe(true)
  })

  it('resetRateLimit vuelve a permitir intentos', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('ip-2', { max: 5 })
    expect(checkRateLimit('ip-2', { max: 5 }).allowed).toBe(false)
    resetRateLimit('ip-2')
    expect(checkRateLimit('ip-2', { max: 5 }).allowed).toBe(true)
  })

  it('la ventana expira y se reinicia el contador', () => {
    vi.useFakeTimers()
    try {
      for (let i = 0; i < 5; i++) checkRateLimit('ip-3', { max: 5, windowMs: 1000 })
      expect(checkRateLimit('ip-3', { max: 5, windowMs: 1000 }).allowed).toBe(false)
      vi.advanceTimersByTime(1001)
      expect(checkRateLimit('ip-3', { max: 5, windowMs: 1000 }).allowed).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it('reporta cuántos intentos quedan', () => {
    expect(checkRateLimit('ip-4', { max: 3 }).remaining).toBe(2)
    expect(checkRateLimit('ip-4', { max: 3 }).remaining).toBe(1)
    expect(checkRateLimit('ip-4', { max: 3 }).remaining).toBe(0)
  })
})
