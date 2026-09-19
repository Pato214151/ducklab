/**
 * Lógica de proxy de Next.js (antes "middleware") para las rutas protegidas.
 * Sin sesión no deja entrar a /dashboard (manda a /login) y con sesión
 * no deja volver a /login.
 */

import { NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

const protectedRoutes = ['/dashboard']

/** Decide si deja pasar, o redirige, según la cookie de sesión. */
export async function proxy(request) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  const session = await decrypt(sessionCookie)

  if (isProtectedRoute && !session?.userId) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  if (path === '/login' && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
