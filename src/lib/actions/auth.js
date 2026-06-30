'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import bcrypt from 'bcryptjs'
import { LoginSchema, RequestResetSchema, ResetPasswordSchema } from '@/lib/definitions'
import { getUserByEmail, createPasswordReset, getPasswordResetByToken, resetUserPassword, updateUserLastLogin } from '@/lib/db'
import { createSession, deleteSession, getSession } from '@/lib/session'
import { checkRateLimit, resetRateLimit } from '@/lib/rate-limit'
import { sendPasswordResetEmail } from '@/lib/email'

export async function login(state, formData) {
  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rlKey = `login-action:${ip}`
  const rl = checkRateLimit(rlKey, { max: 5, windowMs: 15 * 60 * 1000 })
  if (!rl.allowed) {
    return { errors: null, message: `Por tu seguridad pausamos el acceso un momento. Vuelve a intentarlo en ${rl.retryAfter} segundos.` }
  }

  const validatedFields = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: null,
    }
  }

  const { email, password } = validatedFields.data

  const user = await getUserByEmail(email)
  if (!user) {
    return { errors: null, message: 'Correo o contraseña incorrectos' }
  }

  const passwordMatch = bcrypt.compareSync(password, user.password)
  if (!passwordMatch) {
    return { errors: null, message: 'Correo o contraseña incorrectos' }
  }

  resetRateLimit(rlKey)
  await updateUserLastLogin(user.id)
  await createSession(user.id, user.role)
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function requestPasswordReset(state, formData) {
  const validated = RequestResetSchema.safeParse({
    email: formData.get('email'),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, success: false }
  }

  const { email } = validated.data
  const user = await getUserByEmail(email)
  if (!user) {
    // No revelar si el email existe o no
    return { success: true, message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.' }
  }

  const token = await createPasswordReset(email)
  if (!token) {
    return { success: true, message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.' }
  }

  const resetLink = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/recuperar/${token}`
  await sendPasswordResetEmail(email, resetLink)

  return { 
    success: true, 
    message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña.',
    // En desarrollo mostramos el link directamente
    devLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
  }
}

export async function resetPassword(state, formData) {
  const validated = ResetPasswordSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, success: false }
  }

  const { token, password } = validated.data
  const reset = await getPasswordResetByToken(token)
  if (!reset) {
    return { errors: { token: ['El enlace es inválido o ha expirado.'] }, success: false }
  }

  const user = await resetUserPassword(token, password)
  if (!user) {
    return { errors: { token: ['Error al restablecer la contraseña.'] }, success: false }
  }

  redirect('/login?reset=ok')
}
