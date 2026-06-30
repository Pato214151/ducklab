import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getUserById } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const user = await getUserById(session.userId)
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  const { password, ...safeUser } = user
  return NextResponse.json(safeUser)
}
