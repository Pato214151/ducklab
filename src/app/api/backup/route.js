import { NextResponse } from 'next/server'
import { getSystemByApiKey, saveSystemBackup } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'

// Tope por respaldo. Se mantiene bajo el límite de body de Vercel (~4.5 MB).
// Para BD más grandes habría que migrar a almacenamiento de objetos (Supabase
// Storage); para un POS pequeño esto sobra.
const MAX_BYTES = 4 * 1024 * 1024

/**
 * Recibe el respaldo (BD local) de un sistema de escritorio y lo guarda en la
 * nube. Se autentica con la API KEY del sistema (igual que la telemetría).
 *
 *   POST /api/backup
 *   Authorization: Bearer sk_live_xxx
 *   body: bytes del archivo (la BD)
 */
export async function POST(request) {
  const auth = request.headers.get('authorization') || ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : request.headers.get('x-api-key')
  if (!key) {
    return NextResponse.json({ error: 'Falta la API key' }, { status: 401 })
  }

  const system = await getSystemByApiKey(key)
  if (!system) {
    return NextResponse.json({ error: 'API key inválida' }, { status: 401 })
  }

  // Pocos respaldos por hora por sistema.
  const rl = checkRateLimit(`backup:${system.id}`, { max: 6, windowMs: 60 * 60 * 1000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiados respaldos' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  let buf
  try {
    buf = Buffer.from(await request.arrayBuffer())
  } catch {
    return NextResponse.json({ error: 'No se pudo leer el respaldo' }, { status: 400 })
  }
  if (buf.length === 0) {
    return NextResponse.json({ error: 'Respaldo vacío' }, { status: 400 })
  }
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: 'Respaldo demasiado grande' }, { status: 413 })
  }

  const fileName = (request.headers.get('x-file-name') || `${system.name}.db`).slice(0, 200)
  await saveSystemBackup({ systemId: system.id, clientId: system.clientId, fileName, data: buf })

  return NextResponse.json({ ok: true, size: buf.length })
}
