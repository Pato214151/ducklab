import 'server-only'
import { cache } from 'react'
import { getSession, requireAuth } from './session'
import { getUserById } from './db'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) return null
  return { isAuth: true, userId: session.userId, role: session.role }
})

export const getCurrentUser = cache(async () => {
  const session = await requireAuth()
  const user = await getUserById(session.userId)
  if (!user) return null
  const { password, ...safeUser } = user
  return safeUser
})
