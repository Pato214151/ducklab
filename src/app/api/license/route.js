import { NextResponse } from 'next/server'
import { getSystemByApiKey } from '@/lib/db'

/**
 * Verificación de licencia: el sistema (ej. Pocitos POS) pregunta si está activo.
 * Se autentica con su API KEY. El admin controla active/inactive desde el portal.
 *
 *   GET /api/license
 *   Authorization: Bearer sk_live_xxx
 *   → { active: true|false, message }
 */
export async function GET(request) {
  const auth = request.headers.get('authorization') || ''
  const key = auth.startsWith('Bearer ') ? auth.slice(7).trim() : request.headers.get('x-api-key')
  if (!key) {
    return NextResponse.json({ active: false, error: 'Falta la API key' }, { status: 401 })
  }
  const system = await getSystemByApiKey(key)
  if (!system) {
    return NextResponse.json({ active: false, error: 'API key inválida' }, { status: 401 })
  }
  // Por defecto activo (licenseActive null/undefined = activo).
  const active = system.licenseActive !== false
  return NextResponse.json({
    active,
    system: system.name,
    message: active ? 'ok' : 'Tu plan con Ducklab está inactivo. Contáctanos para reactivarlo.',
  })
}
