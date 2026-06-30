import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getSystemsWithStatusByClient, getDownloadsByClient } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const systems = await getSystemsWithStatusByClient(session.userId)
  const downloads = await getDownloadsByClient(session.userId)

  const apps = systems.map(sys => ({
    id: sys.id,
    name: sys.name,
    description: sys.description,
    version: sys.version,
    type: sys.type,
    externalUrl: sys.externalUrl,
    fileName: sys.fileName,
    fileSize: sys.fileSize,
    status: sys.status,
    downloads: downloads.filter(d => d.systemId === sys.id),
    icon: sys.icon || (sys.name === 'Pengos' ? '🐧' : sys.name === 'Raloz COL SAS' ? '👔' : sys.name === 'Pocitos Azufrados POS' ? '🏊' : '📦'),
  }))

  return NextResponse.json(apps)
}
