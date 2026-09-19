/**
 * Sesiones con JWT firmado (jose) guardado en la cookie HttpOnly `session`
 * (dura 7 días). requireAuth/requireAdmin redirigen si no hay permiso.
 */

import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

/** Clave para firmar los JWT; en producción es obligatorio SESSION_SECRET. */
function resolveSecret() {
  const secret = process.env.SESSION_SECRET
  if (secret && secret.length >= 16) return secret

  // En producción NUNCA arrancar sin un secreto fuerte configurado:
  // si faltara, cualquiera podría falsificar sesiones de admin.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET no está configurado (o es muy corto). Define una clave secreta ' +
      'fuerte en las variables de entorno antes de desplegar. Genera una con: ' +
      'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"'
    )
  }

  // Solo desarrollo: clave evidente e insegura. No se usa en producción.
  return 'INSECURE-dev-only-secret-change-me'
}

const encodedKey = new TextEncoder().encode(resolveSecret())

/** Firma el contenido de la sesión como JWT. */
export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

/** Verifica el JWT; devuelve el contenido o null. */
export async function decrypt(session) {
  if (!session) return null
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

/** Crea la cookie de sesión tras un login correcto. */
export async function createSession(userId, role) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId, role, expiresAt })
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

/** Lee la sesión actual de la cookie (o null). */
export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  if (!sessionCookie) return null
  return decrypt(sessionCookie)
}

/** Borra la cookie (logout). */
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

/** Exige sesión; si no hay, redirige a /login. */
export async function requireAuth() {
  const session = await getSession()
  if (!session?.userId) {
    redirect('/login')
  }
  return session
}

/** Exige sesión de admin; si no, redirige al dashboard. */
export async function requireAdmin() {
  const session = await requireAuth()
  if (session.role !== 'admin') {
    redirect('/dashboard')
  }
  return session
}
