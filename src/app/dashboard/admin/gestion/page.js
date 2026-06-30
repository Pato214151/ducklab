import { requireAdmin } from '@/lib/session'
import { getAllClients, getAllSystems } from '@/lib/db'
import GestionForms from './GestionForms'

export default async function GestionPage() {
  await requireAdmin()
  const [clients, systems] = await Promise.all([getAllClients(), getAllSystems()])

  return (
    <div className="text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gestión</h1>
        <p className="mt-1 text-gray-400">Da de alta clientes, registra sistemas y publica versiones — sin tocar la base de datos.</p>
      </div>

      <GestionForms clients={clients} systems={systems} />

      {/* Referencia: clientes y sus sistemas */}
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-bold">Clientes registrados ({clients.length})</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {clients.map((c) => {
            const sus = systems.filter((s) => s.clientId === c.id)
            return (
              <div key={c.id} className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{c.name}</h3>
                    <p className="text-sm text-gray-400">{c.email}</p>
                  </div>
                  {c.plan && <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">{c.plan}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sus.length === 0 ? (
                    <span className="text-xs text-gray-500">Sin sistemas aún</span>
                  ) : (
                    sus.map((s) => (
                      <span key={s.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
                        {s.icon || '📦'} {s.name} · v{s.version}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
