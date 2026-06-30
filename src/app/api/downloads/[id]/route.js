import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getDownloadById } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET(request, { params }) {
  const resolvedParams = await params
  const session = await requireAuth()
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const download = await getDownloadById(Number(resolvedParams.id))
  if (!download) {
    return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
  }

  if (download.clientId !== session.userId && session.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const filePath = path.join(process.cwd(), 'data', 'files', download.fileName)

  // Si el instalador real aún no está subido, NO generamos un archivo falso
  // (eso descargaba un .exe que en realidad era un bloc de notas). Avisamos claro.
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: 'El instalador todavía no está disponible. Escríbenos a soporte y lo subimos enseguida.' },
      { status: 404 }
    )
  }

  const fileBuffer = fs.readFileSync(filePath)
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Disposition': `attachment; filename="${download.fileName}"`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': fileBuffer.length.toString(),
    },
  })
}
