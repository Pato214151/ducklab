import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-4 text-center text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_40%,rgba(239,68,68,0.15),transparent_70%)]" />

      <p className="bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-8xl font-bold tracking-tighter text-transparent md:text-9xl">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold md:text-4xl">Página no encontrada</h1>
      <p className="mt-3 max-w-md text-gray-400">
        La página que buscas no existe o fue movida. Volvamos a un lugar seguro.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 font-semibold text-white shadow-[0_0_30px_rgba(239,68,68,0.25)] transition hover:bg-red-500"
        >
          Volver al inicio
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3 font-semibold text-white transition hover:bg-white/5"
        >
          Ir al portal
        </Link>
      </div>
    </main>
  );
}
