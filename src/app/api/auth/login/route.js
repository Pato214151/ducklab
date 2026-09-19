/**
 * POST /api/auth/login: login por JSON (lo usa el launcher de escritorio).
 * Mismo control que el formulario web: límite de intentos y cookie de sesión.
 */

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { LoginSchema } from '@/lib/definitions'
import { getUserByEmail, updateUserLastLogin } from '@/lib/db'
import { createSession } from '@/lib/session'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rlKey = `login:${ip}`
    const rl = checkRateLimit(rlKey, { max: 5, windowMs: 15 * 60 * 1000 })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Por tu seguridad pausamos el acceso un momento. Vuelve a intentarlo en ${rl.retryAfter} segundos.` },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    const body = await request.json()
    const validatedFields = LoginSchema.safeParse({
      email: body.email,
      password: body.password,
    })

    if (!validatedFields.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validatedFields.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { email, password } = validatedFields.data
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    const passwordMatch = bcrypt.compareSync(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
    }

    resetRateLimit(rlKey)
    await updateUserLastLogin(user.id)
    await createSession(user.id, user.role)

    const { password: _, ...safeUser } = user
    const response = NextResponse.json({ user: safeUser })

    return response
  } catch (e) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
