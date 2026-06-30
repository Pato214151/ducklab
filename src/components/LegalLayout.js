import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LegalLayout({ title, updated, children }) {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-red-500/30">
      <Navbar />
      <section className="px-4 pt-36 pb-24 md:pt-44">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
          {updated && <p className="mt-3 text-sm text-gray-500">Última actualización: {updated}</p>}
          <div className="mt-10 space-y-6 leading-relaxed text-gray-300 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_a]:text-red-400 [&_a:hover]:underline">
            {children}
          </div>
          <p className="mt-12 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-gray-500">
            Este documento es una base general. Antes de operar comercialmente, conviene revisarlo con un abogado para ajustarlo a tu caso y a la normativa colombiana vigente.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
