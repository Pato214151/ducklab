/** Bitácora de auditoría de las acciones del admin (se ve en /dashboard/admin/auditoria). */

import 'server-only'
import { logAudit, getUserById } from '@/lib/db'

/**
 * Registra una acción de admin para trazabilidad. Resuelve el nombre del actor
 * y NUNCA rompe la acción principal si el registro falla.
 *
 *   await recordAudit(session, 'client.create', {
 *     targetType: 'client', targetId: id, details: 'Creó cliente "X"',
 *   })
 */
export async function recordAudit(session, action, { targetType = null, targetId = null, details = null } = {}) {
  try {
    const user = session?.userId ? await getUserById(session.userId) : null
    await logAudit({
      actorId: session?.userId ?? null,
      actorName: user?.name ?? null,
      action,
      targetType,
      targetId,
      details,
    })
  } catch (e) {
    console.error('[Audit] No se pudo registrar la acción:', e)
  }
}
