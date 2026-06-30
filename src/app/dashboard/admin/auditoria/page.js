import { requireAdmin } from '@/lib/session'
import { getAuditLog } from '@/lib/db'

const ACTIONS = {
  'client.create': { label: 'Cliente creado', dot: 'bg-green-500' },
  'system.create': { label: 'Sistema creado', dot: 'bg-green-500' },
  'download.publish': { label: 'Versión publicada', dot: 'bg-blue-500' },
  'apikey.regenerate': { label: 'API key regenerada', dot: 'bg-yellow-500' },
  'error.resolve': { label: 'Error resuelto', dot: 'bg-emerald-500' },
  'runbook.update': { label: 'Runbook actualizado', dot: 'bg-gray-500' },
}

function fmt(d) {
  try {
    return new Date(d).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return d
  }
}

export const metadata = { title: 'Auditoría | Ducklab' }

export default async function AuditoriaPage() {
  await requireAdmin()
  const entries = await getAuditLog(200)

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Auditoría</h1>
        <p className="mt-1 text-gray-400">Registro de las acciones de administración para trazabilidad.</p>
      </div>

      {entries.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-400">
          Aún no hay actividad registrada. Las acciones de admin aparecerán aquí.
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-2xl">
          <div className="hidden grid-cols-[180px_160px_1fr] gap-4 border-b border-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 md:grid">
            <span>Fecha</span>
            <span>Acción</span>
            <span>Detalle · Quién</span>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {entries.map((e) => {
              const a = ACTIONS[e.action] || { label: e.action, dot: 'bg-gray-500' }
              return (
                <li key={e.id} className="grid grid-cols-1 gap-1 px-6 py-4 md:grid-cols-[180px_160px_1fr] md:gap-4">
                  <span className="text-sm text-gray-400">{fmt(e.createdAt)}</span>
                  <span className="inline-flex items-center gap-2 text-sm">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${a.dot}`} />
                    {a.label}
                  </span>
                  <span className="text-sm text-gray-300">
                    {e.details || '—'}
                    {e.actorName && <span className="text-gray-500"> · {e.actorName}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
