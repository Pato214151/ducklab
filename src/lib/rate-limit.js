// Limitador de intentos en memoria (ventana fija por clave, p.ej. por IP).
// Suficiente para una sola instancia. Si escalas a varias, migrar a Redis.

const buckets = new Map()

/**
 * @param {string} key - identificador (p.ej. `login:<ip>`)
 * @param {{max?: number, windowMs?: number}} opts
 * @returns {{allowed: boolean, remaining: number, retryAfter: number}}
 */
export function checkRateLimit(key, { max = 5, windowMs = 15 * 60 * 1000 } = {}) {
  // max <= 0 significa "bloquear todo".
  if (max <= 0) return { allowed: false, remaining: 0, retryAfter: 0 }

  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, retryAfter: 0 }
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { allowed: true, remaining: max - entry.count, retryAfter: 0 }
}

// Limpia el contador de una clave (p.ej. tras un login exitoso).
export function resetRateLimit(key) {
  buckets.delete(key)
}

// Solo para tests.
export function _clearAllRateLimits() {
  buckets.clear()
}
