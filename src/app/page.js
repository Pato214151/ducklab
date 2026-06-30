import Link from 'next/link';
import { Receipt, Monitor, Globe, ShoppingCart, Bot, Wrench, Target, MessageSquare, ShieldCheck, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import DuckMark from '@/components/DuckMark';

const services = [
  { Icon: Receipt, title: 'Sistemas POS', desc: 'Punto de venta con inventario, facturación y reportes en tiempo real.' },
  { Icon: Monitor, title: 'Apps de Escritorio', desc: 'Software nativo y veloz para Windows con interfaces profesionales.' },
  { Icon: Globe, title: 'Desarrollo Web', desc: 'Plataformas modernas, escalables y seguras con Next.js y React.' },
  { Icon: ShoppingCart, title: 'Tiendas Online', desc: 'E-commerce a medida con pagos integrados (MercadoPago, PSE, Nequi).' },
  { Icon: Bot, title: 'IA y Automatización', desc: 'Bots de WhatsApp, traducción en tiempo real e integración de LLMs.' },
  { Icon: Wrench, title: 'Soporte y Mantenimiento', desc: 'Actualizaciones, backups y monitoreo continuo de tus sistemas.' },
];

const values = [
  { Icon: Target, t: '100% a medida', d: 'Nada de plantillas genéricas. Tu sistema, tus reglas.' },
  { Icon: MessageSquare, t: 'Trato directo', d: 'Hablas conmigo, no con un call center. Respuestas claras.' },
  { Icon: ShieldCheck, t: 'Precios claros', d: 'Sin costos ocultos. Sabes desde el inicio cuánto y cuándo.' },
];

const projects = [
  { img: '/images/proyectos/pengos-landing.png', name: 'Pengos', desc: 'Overlay de traducción de voz en tiempo real para gamers: escuchas el juego en inglés y ves subtítulos en español al instante.', tags: ['Python', 'Groq Whisper', 'Llama', 'WebRTC VAD'] },
  { img: '/images/proyectos/raloz.png', name: 'Raloz COL SAS', desc: 'Sistema integral para una empresa de uniformes escolares: panel administrativo, POS y tienda pública con pagos en línea.', tags: ['Flask', 'React', 'PostgreSQL', 'MercadoPago'] },
  { img: '/images/proyectos/pocitos.png', name: 'Pocitos Azufrados', desc: 'Sistema POS de escritorio para club y restaurante, con visor de cocina en tiempo real por web.', tags: ['Python', 'Tkinter', 'SQLite', 'Flask'] },
];

const steps = [
  { n: '01', title: 'Conversamos', desc: 'Entiendo tu negocio y definimos el alcance. La primera consulta es gratis.' },
  { n: '02', title: 'Construyo', desc: 'Desarrollo tu solución a medida con entregas y demos frecuentes.' },
  { n: '03', title: 'Entrego y acompaño', desc: 'Despliegue, capacitación y soporte continuo desde tu portal privado.' },
];

export default function Home() {
  return (
    <main className="grain bg-pearl relative min-h-screen text-[#0b0b0c] selection:bg-[#db1f2e]/20">
      <Navbar />

      {/* Hilo láser — firma vertical en el margen izquierdo (desktop) */}
      <div className="laser-line pointer-events-none fixed left-8 top-0 z-30 hidden h-full w-px lg:block" />

      {/* ───────────────── Hero ───────────────── */}
      <section className="relative isolate overflow-hidden px-4 pt-40 pb-28 md:pt-52 md:pb-40">
        {/* Rejilla perla muy tenue */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_75%)]" />
        {/* Halo rojo de un solo punto */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_40%_at_50%_-5%,rgba(219,31,46,0.10),transparent_60%)]" />

        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#56565d] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#db1f2e]" />
            Desarrollo de software · Colombia
          </span>

          <h1 className="mt-9 text-5xl font-bold leading-[0.95] tracking-tight md:text-8xl">
            Transformo ideas
            <br />
            en{' '}
            <span className="relative inline-block text-[#db1f2e]">
              soluciones
              {/* Subrayado láser que barre */}
              <span className="laser-underline absolute -bottom-2 left-0 h-[3px] w-full bg-[#db1f2e]" />
            </span>
            <br />
            digitales
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#56565d] md:text-xl">
            Sistemas POS, aplicaciones de escritorio, plataformas web y automatización con IA.
            Diseñadas, construidas y mantenidas para tu negocio.
          </p>

          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/planes" className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b0b0c] px-8 py-3.5 font-semibold text-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] transition hover:-translate-y-0.5 hover:bg-[#db1f2e] hover:shadow-[0_18px_40px_-14px_rgba(219,31,46,0.5)] sm:w-auto">
              Ver planes
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/contacto" className="inline-flex w-full items-center justify-center rounded-full border border-black/15 bg-white/40 px-8 py-3.5 font-semibold text-[#0b0b0c] transition hover:border-black/30 hover:bg-white/70 sm:w-auto">
              Hablemos
            </Link>
          </div>

          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8 border-t border-black/10 pt-10">
            {[
              { k: '+5', v: 'Años de experiencia' },
              { k: '100%', v: 'Proyectos en producción' },
              { k: '24/7', v: 'Soporte directo' },
            ].map((s) => (
              <div key={s.v}>
                <div className="text-3xl font-bold tracking-tight text-[#0b0b0c] md:text-5xl">{s.k}</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#56565d]">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Quiénes somos ───────────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionTitle tone="light" overline="Quiénes somos" title="Software a medida," accent="hecho contigo" />
          <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-[#56565d]">
            En <span className="font-semibold text-[#0b0b0c]">Ducklab</span> convierto las necesidades reales de tu negocio en
            herramientas digitales que funcionan. Trato directo, sin intermediarios: tú hablas con quien programa.
            Cada proyecto se construye a tu medida y queda respaldado con soporte continuo.
          </p>
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {values.map((v) => (
              <div key={v.t} className="group relative overflow-hidden rounded-2xl border border-black/[0.08] bg-white/70 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)] p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-black/15 hover:bg-white/80">
                <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-x-100" />
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-white text-[#db1f2e]">
                  <v.Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="mb-1 font-semibold text-[#0b0b0c]">{v.t}</h3>
                <p className="text-sm text-[#56565d]">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Servicios ───────────────── */}
      <section id="servicios" className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle tone="light" overline="Qué hago" title="Mis" accent="servicios" subtitle="Soluciones tecnológicas para cada necesidad." />
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-black/[0.08] bg-black/[0.06] sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <div key={s.title} className="group relative bg-[#eeeef0] p-8 transition-colors duration-300 hover:bg-white">
                <span className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-y-100" />
                <div className="mb-5 flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-white text-[#0b0b0c] transition-colors group-hover:text-[#db1f2e]">
                    <s.Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-xs tracking-widest text-black/25">0{i + 1}</span>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#0b0b0c]">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[#56565d]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Proyectos ───────────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle tone="light" overline="Portafolio" title="Proyectos" accent="reales" subtitle="Trabajos en producción en Colombia." />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {projects.map((p) => (
              <div key={p.name} className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white/70 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1 hover:border-black/15 hover:bg-white/85">
                {/* Captura real del proyecto */}
                <div className="relative aspect-[16/10] overflow-hidden border-b border-black/[0.08] bg-[#0b0b0c]">
                  <img
                    src={p.img}
                    alt={`Captura del proyecto ${p.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-x-100" />
                  {/* Marca Ducklab — proyecto desarrollado por nosotros */}
                  <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 py-1 pl-1 pr-2.5 backdrop-blur-sm">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#ef4444] to-[#b91c1c]">
                      <DuckMark className="h-3 w-3 text-white" />
                    </span>
                    <span className="text-[11px] font-semibold tracking-wide text-white">Ducklab</span>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="mb-2 text-2xl font-bold text-[#0b0b0c]">{p.name}</h3>
                  <p className="mb-6 flex-1 text-sm leading-relaxed text-[#56565d]">{p.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <span key={t} className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-[#56565d]">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── Proceso ───────────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle tone="light" overline="Cómo funciono" title="Un proceso" accent="simple y claro" subtitle="Sin sorpresas, paso a paso." />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-black/[0.08] bg-white/70 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)] p-8">
                <div className="font-mono text-5xl font-bold text-[#db1f2e]/25">{s.n}</div>
                <h3 className="mt-4 text-xl font-semibold text-[#0b0b0c]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#56565d]">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-center text-[#56565d]">
            <Clock className="h-4 w-4 shrink-0 text-[#db1f2e]" strokeWidth={1.5} />
            Tiempo de entrega: <span className="font-semibold text-[#0b0b0c]">de 1 a 4 meses</span> según la complejidad del sistema.
          </p>
        </div>
      </section>

      {/* ───────────────── CTA final ───────────────── */}
      <section className="relative overflow-hidden px-4 py-12">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#0b0b0c] px-6 py-24 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(219,31,46,0.22),transparent_70%)]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight md:text-6xl">¿Listo para digitalizar tu negocio?</h2>
            <p className="mt-6 text-lg text-gray-300 md:text-xl">Mira los planes o escríbeme. La primera consulta es 100% gratuita.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/planes" className="inline-flex w-full items-center justify-center rounded-full bg-[#db1f2e] px-8 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(219,31,46,0.35)] transition hover:bg-[#ef4444] sm:w-auto">
                Ver planes
              </Link>
              <Link href="/contacto" className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10 sm:w-auto">
                Contáctame
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
