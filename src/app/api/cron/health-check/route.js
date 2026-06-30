import { NextResponse } from 'next/server'
import { getStaleOnlineSystems, markSystemOffline, getAdminEmails, getUserById } from '@/lib/db'
import { sendCriticalErrorAlerts } from '@/lib/email'

/**
 * Dead man's switch. Marca offline los sistemas que dejaron de mandar latido
 * (> 5 min) y avisa al admin y al cliente. Pensado para un cron externo:
 *
 *   GET /api/cron/health-check
 *   Authorization: Bearer <CRON_SECRET>   (o  ?key=<CRON_SECRET>)
 *
 * Conéctalo a cron-job.org, Vercel Cron o un cron de Render (cada 1-5 min).
 */
export async function GET(request) {
  // Fail-closed: sin CRON_SECRET configurado, el endpoint NO corre (antes se
  // ejecutaba sin auth, así cualquiera podía marcar sistemas offline y spamear
  // alertas). Configura CRON_SECRET en el servidor y mándalo desde el cron.
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Cron no configurado' }, { status: 503 })
  }
  const auth = request.headers.get('authorization') || ''
  const provided = auth.startsWith('Bearer ') ? auth.slice(7) : new URL(request.url).searchParams.get('key')
  if (provided !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const stale = await getStaleOnlineSystems()
  const adminEmails = await getAdminEmails()
  const markedOffline = []

  for (const system of stale) {
    await markSystemOffline(system.id)
    markedOffline.push(system.name)

    // Los sistemas de ESCRITORIO prenden de forma intermitente (cierran de
    // noche): marcamos su estado offline, pero NO alertamos para no mandar
    // falsas alarmas. El dead-man switch (alerta) es solo para servidores.
    if (system.type === 'desktop') continue

    try {
      const client = await getUserById(system.clientId)
      await sendCriticalErrorAlerts({
        system,
        error: { level: 'critical', message: `${system.name} dejó de responder (sin latido por más de 5 minutos).` },
        adminEmails,
        clientEmail: client?.email,
        portalUrl: process.env.NEXT_PUBLIC_URL || '',
      })
    } catch (e) {
      console.error('[HealthCheck] No se pudo alertar:', e)
    }
  }

  return NextResponse.json({ checked: stale.length, markedOffline })
}
