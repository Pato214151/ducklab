/**
 * Data Access Layer: lecturas de sesión/usuario cacheadas por petición
 * (React cache) para no repetir consultas en la misma página.
 */

import 'server-only'
import { cache } from 'react'
import { getSession, requireAuth } from './session'
import { getUserById } from './db'

/** Datos básicos de la sesión, o null. */
export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) return null
  return { isAuth: true, userId: session.userId, role: session.role }
})

/** Usuario logueado sin el hash de la contraseña. */
export const getCurrentUser = cache(async () => {
  const session = await requireAuth()
  const user = await getUserById(session.userId)
  if (!user) return null
  const { password, ...safeUser } = user
  return safeUser
})
