/** Indicador de carga mientras llega una página del dashboard. */

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-gray-400">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-red-500" />
      <p className="text-sm">Cargando tu información…</p>
    </div>
  )
}
