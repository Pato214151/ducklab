/** Pantalla de error de una página (con botón para reintentar). */

'use client'

import Link from 'next/link'

export default function Error({ error, reset }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_40%,rgba(239,68,68,0.12),transparent_70%)]" />
      <div className="text-5xl">😕</div>
      <h1 className="mt-4 text-2xl font-bold md:text-3xl">Algo salió mal de nuestro lado</h1>
      <p className="mt-3 max-w-md text-gray-400">
        No te preocupes, tu información está segura. Fue un problema temporal nuestro, no tuyo.
        Intenta de nuevo en un momento.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-full bg-red-600 px-7 py-3 font-semibold text-white transition hover:bg-red-500"
        >
          Reintentar
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3 font-semibold text-white transition hover:bg-white/5"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
