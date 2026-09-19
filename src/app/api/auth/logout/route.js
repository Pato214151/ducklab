/** POST /api/auth/logout: borra la cookie de sesión. */

import { NextResponse } from 'next/server'
import { deleteSession } from '@/lib/session'

export async function POST() {
  await deleteSession()
  return NextResponse.json({ success: true })
}
