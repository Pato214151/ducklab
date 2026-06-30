import { NextResponse } from 'next/server'
import { getSystemByApiKey, upsertTelemetry, getAdminEmails, getUserById } from '@/lib/db'
import { sendCriticalErrorAlerts } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * Telemetría de sistemas desplegados (Render, escritorio, etc.).
 * Se autentica con la API KEY del sistema — NO con sesión de navegador,
 * porque un sistema corriendo no tiene cookies.
 *
 *   POST /api/telemetry
 *   Authorization: Bearer sk_live_xxx   (o header  x-api-key: sk_live_xxx)
 *   body: { status, version, error? }
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

  // Rate limit por sistema: evita que una key (aunque válida) inunde la BD de
  // errores/latidos. 60/min es de sobra para telemetría legítima.
  const rl = checkRateLimit(`telemetry:${system.id}`, { max: 60, windowMs: 60 * 1000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  try {
    const body = await request.json()
    const { status, version, error } = body

    await upsertTelemetry(system.id, system.clientId, {
      status: status || 'online',
      version: version || system.version || '0.0.0',
      error: error || null,
    })

    // Alerta automática cuando entra un error crítico: avisa al admin y al cliente
    // ANTES de que el cliente note el problema. No bloquea la respuesta si falla.
    if (error && error.level === 'critical') {
      try {
        const [adminEmails, client] = await Promise.all([
          getAdminEmails(),
          getUserById(system.clientId),
        ])
        await sendCriticalErrorAlerts({
          system,
          error,
          adminEmails,
          clientEmail: client?.email,
          portalUrl: process.env.NEXT_PUBLIC_URL || '',
        })
      } catch (e) {
        console.error('[Telemetry] No se pudo enviar la alerta:', e)
      }
    }

    return NextResponse.json({ success: true, system: system.name })
  } catch (e) {
    return NextResponse.json({ error: 'Cuerpo inválido (se espera JSON)' }, { status: 400 })
  }
}
