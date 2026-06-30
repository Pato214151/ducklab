import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSystemById, getTelemetryBySystem, getUserById } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import { ShineCard } from '@/components/ui/shine-card'
import { Monitor, Globe, ArrowUpRight, RefreshCw, KeyRound, Plug, Check } from 'lucide-react'
import AutoRefresh from '@/components/AutoRefresh'
import { resolveErrorAction, saveRunbookAction, refreshFromGitAction, regenerateApiKeyAction, toggleLicenseAction } from '@/lib/actions/admin'
import styles from './page.module.css'

export default async function SystemDetailPage({ params }) {
  const resolvedParams = await params
  const session = await requireAdmin()
  const system = await getSystemById(Number(resolvedParams.id))
  if (!system) redirect('/dashboard/admin')

  const telemetry = await getTelemetryBySystem(system.id)
  const client = system.clientId ? await getUserById(system.clientId) : null
  const errors = telemetry?.errors?.filter(e => !e.resolved) || []
  const allErrors = telemetry?.errors || []
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tu-portal.com'

  return (
    <>
      <AutoRefresh seconds={20} />
    <div>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/admin">← Panel Admin</Link>
        <span> / {system.name}</span>
      </div>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{system.name}</h1>
          <div className={styles.metaRow}>
            <span className={`${styles.badge} ${system.type === 'desktop' ? styles.badgeDesktop : styles.badgeOnline}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              {system.type === 'desktop'
                ? <><Monitor size={13} strokeWidth={1.75} /> Escritorio</>
                : <><Globe size={13} strokeWidth={1.75} /> Web</>}
            </span>
            <span className={`${styles.statusBadge} ${system.status === 'online' ? styles.statusOnline : styles.statusError}`}>
              {telemetry?.status === 'online' ? 'En línea' : 'Con errores'}
            </span>
            <span className={styles.version}>v{system.version}</span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Info del sistema */}
        <ShineCard className={`glass ${styles.card}`}>
          <h3>Información del Sistema</h3>
          <div className={styles.infoList}>
            <div className={styles.infoRow}><span>Cliente</span><span>{client?.name || 'N/A'}</span></div>
            <div className={styles.infoRow}><span>Tipo</span><span>{system.type === 'desktop' ? 'Escritorio' : 'Web'}</span></div>
            <div className={styles.infoRow}><span>Versión</span><span>v{system.version}</span></div>
            <div className={styles.infoRow}><span>Descripción</span><span>{system.description}</span></div>
            {system.externalUrl && (
              <div className={styles.infoRow}>
                <span>URL Externa</span>
                <a href={system.externalUrl} target="_blank" rel="noopener noreferrer" className={styles.extLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {system.externalUrl} <ArrowUpRight size={14} strokeWidth={2} />
                </a>
              </div>
            )}
            {telemetry?.lastHeartbeat && (
              <div className={styles.infoRow}><span>Último Heartbeat</span><span>{new Date(telemetry.lastHeartbeat).toLocaleString('es-CO')}</span></div>
            )}
          </div>
        </ShineCard>

        {/* Git */}
        <ShineCard className={`glass ${styles.card}`}>
          <h3>GitHub</h3>
          {system.gitRepo ? (
            <div className={styles.infoList}>
              <div className={styles.infoRow}><span>Repo</span><a href={system.gitRepo} target="_blank" rel="noopener noreferrer" className={styles.extLink} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{system.gitRepo.split('/').slice(-2).join('/')} <ArrowUpRight size={14} strokeWidth={2} /></a></div>
              <div className={styles.infoRow}><span>Branch</span><span>{system.gitBranch}</span></div>
              <div className={styles.infoRow}><span>Último commit</span><span className={styles.commitMsg}>{system.lastCommitMsg || 'N/A'}</span></div>
              {system.lastCommitDate && (
                <div className={styles.infoRow}><span>Fecha</span><span>{new Date(system.lastCommitDate).toLocaleString('es-CO')}</span></div>
              )}
              <form action={refreshFromGitAction}>
                <input type="hidden" name="systemId" value={system.id} />
                <button type="submit" className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5">
                  <RefreshCw size={15} strokeWidth={2} /> Refrescar desde Git
                </button>
              </form>
            </div>
          ) : (
            <p className={styles.noGit}>No vinculado a GitHub</p>
          )}
        </ShineCard>
      </div>

      {/* Informe de ejecución */}
      <ShineCard className={`glass ${styles.card}`} duration={12} borderWidth={1.5}>
        <h3>Informe de Ejecución</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 12px' }}>
          Cómo desplegar y ejecutar este sistema (notas para ti y tu equipo de ingeniería).
        </p>
        <form action={saveRunbookAction}>
          <input type="hidden" name="systemId" value={system.id} />
          <textarea
            name="runbook"
            defaultValue={system.runbook || ''}
            rows={6}
            placeholder="Ej: 1) git push a main → Render despliega solo.  2) Variables de entorno: DATABASE_URL, SESSION_SECRET...  3) Comando de arranque: npm start  4) Pasos para resolver errores comunes..."
            className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-gray-500 focus:border-red-500/50 focus:outline-none"
          />
          <button type="submit" className="mt-3 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
            Guardar informe
          </button>
        </form>
      </ShineCard>

      {/* Licencia / activación */}
      <ShineCard className={`glass ${styles.card}`}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><KeyRound size={18} strokeWidth={1.75} /> Licencia / activación</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 16px' }}>
          Controla si este sistema puede usarse. Si lo desactivas (ej. cliente no al día), la app verifica con el portal y deja de abrir. Tiene tolerancia offline.
        </p>
        <div className="flex items-center gap-4">
          {system.licenseActive !== false ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Activa
              </span>
              <form action={toggleLicenseAction}>
                <input type="hidden" name="systemId" value={system.id} />
                <input type="hidden" name="active" value="false" />
                <button type="submit" className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20">
                  Desactivar
                </button>
              </form>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm font-semibold text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Inactiva
              </span>
              <form action={toggleLicenseAction}>
                <input type="hidden" name="systemId" value={system.id} />
                <input type="hidden" name="active" value="true" />
                <button type="submit" className="rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-400 transition hover:bg-green-500/20">
                  Activar
                </button>
              </form>
            </>
          )}
        </div>
      </ShineCard>

      {/* Conectar este sistema */}
      <ShineCard className={`glass ${styles.card}`}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Plug size={18} strokeWidth={1.75} /> Conectar este sistema</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 16px' }}>
          Para que el estado (en línea / con error) sea real, tu sistema debe enviar un &quot;latido&quot; con su API key.
        </p>

        <div className="space-y-5">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">API Key del sistema</div>
            <div className="flex items-center gap-3">
              <code className="flex-1 overflow-x-auto rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-red-300">{system.apiKey}</code>
              <form action={regenerateApiKeyAction}>
                <input type="hidden" name="systemId" value={system.id} />
                <button type="submit" className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/5">
                  Regenerar
                </button>
              </form>
            </div>
            <p className="mt-1 text-xs text-gray-500">Trátala como una contraseña. Si se filtra, regenérala.</p>
          </div>

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-gray-500">Endpoints</div>
            <div className="space-y-1 text-xs text-gray-300">
              <div>Telemetría: <code className="text-red-300">POST {baseUrl}/api/telemetry</code></div>
              <div>Webhook GitHub: <code className="text-red-300">{baseUrl}/api/webhook/github</code></div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">Código de latido (Python)</div>
            <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-gray-200">{`import requests, time

API_KEY = "${system.apiKey}"
PORTAL  = "${baseUrl}"

def heartbeat(status="online", version="${system.version}", error=None):
    requests.post(f"\${PORTAL}/api/telemetry",
        headers={"Authorization": f"Bearer \${API_KEY}"},
        json={"status": status, "version": version, "error": error},
        timeout=10)

while True:
    try:
        heartbeat()                 # 🟢 reporta "en línea"
    except Exception:
        pass
    time.sleep(60)                  # cada minuto`}</pre>
            <p className="mt-2 text-xs text-gray-500">
              Para reportar un fallo: <code className="text-red-300">{`heartbeat(status="error", error={"level":"critical","message":"DB caída"})`}</code>
            </p>
          </div>
        </div>
      </ShineCard>

      {/* Errores */}
      <ShineCard className={`glass ${styles.card} ${styles.errorsCard}`}>
        <h3>Errores {errors.length > 0 && <span className={styles.errorCount}>({errors.length} sin resolver)</span>}</h3>
        {allErrors.length === 0 ? (
          <p className={styles.noErrors}>Sin errores registrados</p>
        ) : (
          <div className={styles.errorList}>
            {allErrors.map(err => (
              <div key={err.id} className={`${styles.errorItem} ${err.resolved ? styles.resolved : ''}`}>
                <div className={styles.errorHeader}>
                  <span className={`${styles.errorLevel} ${styles[`level${err.level}`]}`}>{err.level}</span>
                  <span className={err.resolved ? styles.resolvedTag : styles.unresolvedTag}>
                    {err.resolved ? 'Resuelto' : 'Activo'}
                  </span>
                  <span className={styles.errorTime}>{new Date(err.loggedAt).toLocaleString('es-CO')}</span>
                </div>
                <p className={styles.errorMsg}>{err.message}</p>
                {err.stacktrace && <pre className={styles.stacktrace}>{err.stacktrace}</pre>}
                {!err.resolved && (
                  <form action={resolveErrorAction}>
                    <input type="hidden" name="systemId" value={system.id} />
                    <input type="hidden" name="errorId" value={err.id} />
                    <button type="submit" className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400 transition hover:bg-green-500/20">
                      <Check size={13} strokeWidth={2.5} /> Marcar como resuelto
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </ShineCard>
    </div>
    </>
  )
}
