import Link from 'next/link';
import { Download, Monitor, Globe, ArrowUpRight } from 'lucide-react';
import { requireAuth } from '@/lib/session';
import { getSystemsWithStatusByClient } from '@/lib/db';

const statusMap = {
  online: { dot: 'bg-green-500', label: 'En línea', text: 'text-green-400' },
  error: { dot: 'bg-red-500', label: 'Con errores', text: 'text-red-400' },
  offline: { dot: 'bg-gray-500', label: 'Sin conexión', text: 'text-gray-400' },
};

export default async function SistemasPage() {
  const session = await requireAuth();
  const systems = await getSystemsWithStatusByClient(session.userId);

  return (
    <div className="text-white">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Sistemas</h1>
          <p className="mt-1 text-gray-400">Accede a tus sistemas y revisa su estado en tiempo real.</p>
        </div>
        <a
          href="https://github.com/Pato214151/jrdev-launcher/releases/latest/download/DucklabLauncher-Setup.exe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(239,68,68,0.25)] transition hover:bg-red-500"
        >
          <Download size={16} strokeWidth={2} /> Descargar Launcher (Windows)
        </a>
      </div>

      {systems.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-gray-400">
          Aún no tienes sistemas asignados.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {systems.map((sys) => {
            const st = statusMap[sys.status] || statusMap.offline;
            const isWeb = sys.type === 'online';
            // En sistemas de escritorio, external_url guarda la URL del instalador (GitHub Releases).
            const downloadUrl = sys.type === 'desktop' ? sys.externalUrl : null;
            return (
              <div key={sys.id} className="glass flex h-full flex-col rounded-2xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold leading-snug">{sys.name}</h3>
                  <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                    <span className={st.text}>{st.label}</span>
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-400">{sys.description}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">
                    {sys.type === 'desktop'
                      ? <><Monitor size={13} strokeWidth={1.75} /> Escritorio</>
                      : <><Globe size={13} strokeWidth={1.75} /> Web</>}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-gray-300">v{sys.version}</span>
                  {sys.errorCount > 0 && (
                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-400">
                      {sys.errorCount} {sys.errorCount === 1 ? 'error' : 'errores'}
                    </span>
                  )}
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  {sys.lastHeartbeat
                    ? `Última señal: ${new Date(sys.lastHeartbeat).toLocaleString('es-CO')}`
                    : 'Sin señal registrada'}
                </div>

                <div className="mt-auto flex gap-3 border-t border-white/10 pt-5">
                  {isWeb ? (
                    <a
                      href={sys.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      Abrir sistema <ArrowUpRight size={16} strokeWidth={2} />
                    </a>
                  ) : downloadUrl ? (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
                    >
                      <Download size={16} strokeWidth={2} /> Descargar v{sys.version}
                    </a>
                  ) : (
                    <span
                      className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-400"
                      title="El instalador se subirá muy pronto"
                    >
                      Instalador en camino
                    </span>
                  )}
                  <Link
                    href="/dashboard/tickets"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
                  >
                    Reportar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
