/**
 * Server Actions de la página de detalle de un sistema (solo admin):
 * licencia, errores, runbook, último commit de GitHub y API key.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { resolveError, updateSystem, updateSystemFromGit, regenerateSystemApiKey, getSystemById, updateSystemCommit, setSystemLicense } from '@/lib/db'
import { recordAudit } from '@/lib/audit'

/** Activa o desactiva la licencia del sistema (lo consulta /api/license). */
export async function toggleLicenseAction(formData) {
  const session = await requireAdmin()
  const systemId = Number(formData.get('systemId'))
  const active = formData.get('active') === 'true'
  await setSystemLicense(systemId, active)
  await recordAudit(session, 'license.toggle', {
    targetType: 'system', targetId: systemId,
    details: active ? 'Activó la licencia del sistema' : 'Desactivó la licencia del sistema',
  })
  revalidatePath(`/dashboard/admin/systems/${systemId}`)
}

/** Marca un error reportado por el sistema como resuelto. */
export async function resolveErrorAction(formData) {
  const session = await requireAdmin()
  const systemId = Number(formData.get('systemId'))
  const errorId = Number(formData.get('errorId'))
  await resolveError(systemId, errorId)
  await recordAudit(session, 'error.resolve', {
    targetType: 'system', targetId: systemId, details: `Marcó como resuelto el error #${errorId}`,
  })
  revalidatePath(`/dashboard/admin/systems/${systemId}`)
}

/** Guarda el runbook (instrucciones de soporte) del sistema. */
export async function saveRunbookAction(formData) {
  const session = await requireAdmin()
  const systemId = Number(formData.get('systemId'))
  const runbook = formData.get('runbook') || ''
  await updateSystem(systemId, { runbook })
  await recordAudit(session, 'runbook.update', {
    targetType: 'system', targetId: systemId, details: 'Actualizó el runbook del sistema',
  })
  revalidatePath(`/dashboard/admin/systems/${systemId}`)
}

/** Trae el último commit del repo público en GitHub. */
export async function refreshFromGitAction(formData) {
  await requireAdmin()
  const systemId = Number(formData.get('systemId'))

  // Intenta traer el ÚLTIMO commit real desde la API pública de GitHub.
  const system = await getSystemById(systemId)
  const match = system?.gitRepo?.match(/github\.com\/([^/]+)\/([^/.]+)/)
  if (match) {
    const branch = system.gitBranch || 'main'
    try {
      const res = await fetch(`https://api.github.com/repos/${match[1]}/${match[2]}/commits/${branch}`, {
        headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'ducklab-portal' },
        cache: 'no-store',
      })
      if (res.ok) {
        const c = await res.json()
        await updateSystemCommit(systemId, {
          sha: c.sha ? c.sha.slice(0, 12) : null,
          message: c.commit?.message ? c.commit.message.split('\n')[0] : null,
          date: c.commit?.author?.date || null,
        })
        revalidatePath(`/dashboard/admin/systems/${systemId}`)
        return
      }
    } catch (e) {
      // Repo privado o sin acceso → cae al fallback simulado.
    }
  }

  await updateSystemFromGit(systemId)
  revalidatePath(`/dashboard/admin/systems/${systemId}`)
}

/** Crea una API key nueva (la anterior deja de funcionar). */
export async function regenerateApiKeyAction(formData) {
  const session = await requireAdmin()
  const systemId = Number(formData.get('systemId'))
  await regenerateSystemApiKey(systemId)
  await recordAudit(session, 'apikey.regenerate', {
    targetType: 'system', targetId: systemId, details: 'Regeneró la API key de telemetría',
  })
  revalidatePath(`/dashboard/admin/systems/${systemId}`)
}
