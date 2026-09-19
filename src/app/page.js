/**
 * Landing pública de Ducklab (bilingüe): hero con el portátil 3D,
 * servicios, proyectos, proceso de trabajo y llamada a la acción.
 * Los textos de cada idioma están en el objeto `content`.
 */

'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Receipt, Monitor, Globe, ShoppingCart, Bot, Wrench, Target, MessageSquare, ShieldCheck, Clock, MessageCircle, QrCode, ArrowRight, PenTool, Rocket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import DuckMark from '@/components/DuckMark';
import Laptop3D from '@/components/Laptop3D';
import { useLanguage } from '@/lib/LanguageContext';

const serviceIcons = [Receipt, Monitor, Globe, ShoppingCart, Bot, MessageCircle, QrCode, Wrench];
const valueIcons = [Target, MessageSquare, ShieldCheck];
const stepIcons = [MessageCircle, PenTool, Rocket];
// Metadatos por proyecto, en el mismo orden que content[lang].projects.
// `img: null` → la tarjeta dibuja una portada generada con la inicial y el gradiente.
// `url: null` → tarjeta no clickeable (proyecto propio aún no publicado, o
// esta misma página en el caso de Ducklab).
const projectMeta = [
  { img: '/images/proyectos/raloz.jpg', tags: ['Flask', 'React', 'PostgreSQL', 'Payments'], from: '#db1f2e', to: '#7f1d1d', url: 'https://ralozcol-web.pages.dev' },
  { img: '/images/proyectos/pocitos.jpg', tags: ['Python', 'Tkinter', 'SQLite', 'Flask'], from: '#1B6E3A', to: '#0D4020', url: 'https://lospocitosazufrados.com' },
  { img: '/images/proyectos/ducklab.jpg', tags: ['Next.js', 'React 19', 'PostgreSQL', 'PyQt5'], from: '#ef4444', to: '#450a0a', url: null },
  { img: '/images/proyectos/sonyduck.jpg', tags: ['React', 'TypeScript', 'Prisma', 'Node.js'], from: '#e11d48', to: '#1f1f23', url: null },
  { img: '/images/proyectos/pengos-landing.jpg', tags: ['Python', 'Groq Whisper', 'Llama', 'WebRTC VAD'], from: '#10b981', to: '#064e3b', url: null },
];

const content = {
  en: {
    badge: 'Custom Software Development',
    h1a: 'Software that powers', h1accent: 'real business.',
    sub: 'POS systems, desktop apps, web platforms and AI automation. Designed, built and maintained for your business.',
    ctaProjects: 'View projects', ctaTalk: "Let's talk about your idea",
    stats: [{ k: '+5', v: 'Years of experience' }, { k: '100%', v: 'Projects in production' }, { k: '24/7', v: 'Direct support' }],
    aboutOverline: 'About us', aboutTitle: 'Custom software,', aboutAccent: 'built with you',
    aboutBody: "I turn your business's real needs into digital tools that actually work. Direct contact, no middlemen: you talk to the person who builds it. Every project is custom-built and backed by ongoing support.",
    values: [
      { t: '100% custom', d: 'No generic templates. Your system, your rules.' },
      { t: 'Direct contact', d: 'You talk to me, not a call center. Clear answers.' },
      { t: 'Clear pricing', d: 'No hidden costs. You know how much and when, from day one.' },
    ],
    servicesOverline: 'What I do', servicesTitle: 'My', servicesAccent: 'services', servicesSubtitle: 'Technology solutions for every need.',
    services: [
      { title: 'POS Systems', desc: 'Point of sale with inventory, invoicing and real-time reports.' },
      { title: 'Desktop Apps', desc: 'Fast, native software for Windows with professional interfaces.' },
      { title: 'Web Development', desc: 'Modern, scalable and secure platforms with Next.js and React.' },
      { title: 'Online Stores', desc: 'Custom e-commerce with integrated payments (Stripe, card processing).' },
      { title: 'AI & Automation', desc: 'WhatsApp bots, real-time translation and LLM integrations.' },
      { title: 'Web Chatbot', desc: 'Virtual assistant built into your site, answers and helps customers instantly.' },
      { title: 'Digital Menu (QR)', desc: 'Feed-style menu: customers scan and scroll through dishes, no more PDF menus.' },
      { title: 'Support & Maintenance', desc: 'Updates, backups and continuous monitoring for your systems.' },
    ],
    portfolioOverline: 'Portfolio', portfolioTitle: 'Real', portfolioAccent: 'projects', portfolioSubtitle: 'Live, production-grade work.',
    filterAll: 'All',
    projects: [
      { name: 'Raloz COL SAS', desc: 'Full e-commerce and POS platform for a school uniform business: admin panel, point of sale and online store with payments.', cat: 'POS', live: true },
      { name: 'Pocitos Azufrados', desc: 'Desktop POS system for a club and restaurant, with a real-time kitchen display over the web.', cat: 'POS', live: true },
      { name: 'Ducklab', desc: 'This very platform: client portal, secure downloads, licensing, telemetry and a desktop launcher for delivering software.', cat: 'Web', live: true },
      { name: 'SonYDuck', desc: 'Music streaming platform with AI features, playlists and an elegant dark interface.', cat: 'Web', live: false },
      { name: 'Pengos', desc: 'Real-time voice translation overlay for gamers: hear the game in English, see subtitles in Spanish instantly.', cat: 'AI', live: false },
    ],
    processOverline: 'How I work', processTitle: 'A simple,', processAccent: 'clear process', processSubtitle: 'No surprises, step by step.',
    steps: [
      { n: '01', title: 'We talk', desc: 'I understand your business and define the scope. First consultation is free.' },
      { n: '02', title: 'I build', desc: 'I develop your custom solution with frequent demos and updates.' },
      { n: '03', title: 'Deliver & support', desc: 'Deployment, training and ongoing support from your private portal.' },
    ],
    delivery: 'Delivery time: ', deliveryStrong: '1 to 4 months', deliveryEnd: ' depending on system complexity.',
    ctaTitle: 'Ready to digitize your business?', ctaSub: 'Check the pricing or message me. First consultation is 100% free.',
    ctaPricing2: 'View pricing', ctaContact: 'Contact me',
    capture: 'Screenshot of', builtBy: 'Ducklab', viewLive: 'View live site',
  },
  es: {
    badge: 'Desarrollo de Software a Medida',
    h1a: 'Software que impulsa negocios', h1accent: 'reales.',
    sub: 'Sistemas POS, apps de escritorio, plataformas web y automatización con IA. Diseñadas, construidas y mantenidas para tu negocio.',
    ctaProjects: 'Ver proyectos', ctaTalk: 'Hablemos de tu idea',
    stats: [{ k: '+5', v: 'Años de experiencia' }, { k: '100%', v: 'Proyectos en producción' }, { k: '24/7', v: 'Soporte directo' }],
    aboutOverline: 'Quiénes somos', aboutTitle: 'Software a medida,', aboutAccent: 'hecho contigo',
    aboutBody: 'Convierto las necesidades reales de tu negocio en herramientas digitales que funcionan. Trato directo, sin intermediarios: hablas con quien programa. Cada proyecto se construye a tu medida y queda respaldado con soporte continuo.',
    values: [
      { t: '100% a medida', d: 'Nada de plantillas genéricas. Tu sistema, tus reglas.' },
      { t: 'Trato directo', d: 'Hablas conmigo, no con un call center. Respuestas claras.' },
      { t: 'Precios claros', d: 'Sin costos ocultos. Sabes desde el inicio cuánto y cuándo.' },
    ],
    servicesOverline: 'Qué hago', servicesTitle: 'Mis', servicesAccent: 'servicios', servicesSubtitle: 'Soluciones tecnológicas para cada necesidad.',
    services: [
      { title: 'Sistemas POS', desc: 'Punto de venta con inventario, facturación y reportes en tiempo real.' },
      { title: 'Apps de Escritorio', desc: 'Software nativo y veloz para Windows con interfaces profesionales.' },
      { title: 'Desarrollo Web', desc: 'Plataformas modernas, escalables y seguras con Next.js y React.' },
      { title: 'Tiendas Online', desc: 'E-commerce a medida con pagos integrados (Stripe, tarjeta).' },
      { title: 'IA y Automatización', desc: 'Bots de WhatsApp, traducción en tiempo real e integración de LLMs.' },
      { title: 'Chatbot Web', desc: 'Asistente virtual integrado a tu sitio, responde y atiende clientes al instante.' },
      { title: 'Carta Digital (QR)', desc: 'Menú tipo feed: el cliente escanea y navega los platos con scroll, no un PDF con texto.' },
      { title: 'Soporte y Mantenimiento', desc: 'Actualizaciones, backups y monitoreo continuo de tus sistemas.' },
    ],
    portfolioOverline: 'Portafolio', portfolioTitle: 'Proyectos', portfolioAccent: 'reales', portfolioSubtitle: 'Trabajos reales en producción.',
    filterAll: 'Todos',
    projects: [
      { name: 'Raloz COL SAS', desc: 'Sistema integral para una empresa de uniformes escolares: panel administrativo, POS y tienda pública con pagos en línea.', cat: 'POS', live: true },
      { name: 'Pocitos Azufrados', desc: 'Sistema POS de escritorio para club y restaurante, con visor de cocina en tiempo real por web.', cat: 'POS', live: true },
      { name: 'Ducklab', desc: 'Esta misma plataforma: portal de clientes, descargas seguras, licencias, telemetría y launcher de escritorio para entregar software.', cat: 'Web', live: true },
      { name: 'SonYDuck', desc: 'Plataforma de música en streaming con funciones de IA, listas de reproducción e interfaz oscura elegante.', cat: 'Web', live: false },
      { name: 'Pengos', desc: 'Overlay de traducción de voz en tiempo real para gamers: escuchas el juego en inglés y ves subtítulos en español al instante.', cat: 'IA', live: false },
    ],
    processOverline: 'Cómo funciono', processTitle: 'Un proceso', processAccent: 'simple y claro', processSubtitle: 'Sin sorpresas, paso a paso.',
    steps: [
      { n: '01', title: 'Conversamos', desc: 'Entiendo tu negocio y definimos el alcance. La primera consulta es gratis.' },
      { n: '02', title: 'Construyo', desc: 'Desarrollo tu solución a medida con entregas y demos frecuentes.' },
      { n: '03', title: 'Entrego y acompaño', desc: 'Despliegue, capacitación y soporte continuo desde tu portal privado.' },
    ],
    delivery: 'Tiempo de entrega: ', deliveryStrong: 'de 1 a 4 meses', deliveryEnd: ' según la complejidad del sistema.',
    ctaTitle: '¿Listo para digitalizar tu negocio?', ctaSub: 'Mira los precios o escríbeme. La primera consulta es 100% gratuita.',
    ctaPricing2: 'Ver precios', ctaContact: 'Contáctame',
    capture: 'Captura de', builtBy: 'Ducklab', viewLive: 'Ver sitio en vivo',
  },
};

export default function Home() {
  const { lang } = useLanguage();
  const t = content[lang];
  const [filter, setFilter] = useState('all');
  // Las categorías salen de los propios proyectos: agregar uno nuevo no obliga
  // a tocar esta lista. Se leen del idioma activo para que el filtro traduzca.
  const categories = ['all', ...new Set(t.projects.map((p) => p.cat))];

  return (
    <main className="grain-dark relative min-h-screen bg-[#08080a] text-[#fafafa] selection:bg-[#db1f2e]/30">
      <Navbar />

      <div className="laser-line pointer-events-none fixed left-8 top-0 z-30 hidden h-full w-px lg:block" />

      {/* ───────────────── Hero ───────────────── */}
      <section className="relative isolate overflow-hidden px-4 pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Rejilla técnica + halo rojo, la firma visual de la marca */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_10%,#000_25%,transparent_78%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_72%_35%,rgba(219,31,46,0.18),transparent_65%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_35%_at_20%_0%,rgba(239,68,68,0.08),transparent_60%)]" />

        {/* Haces de luz cenital sobre el 3D. Son tres conos difuminados que
            caen desde el borde superior; el degradado los apaga antes de
            llegar al contenido para que nunca compitan con el texto. */}
        <div className="light-beams pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-[85%] lg:block">
          <span className="beam beam-a" />
          <span className="beam beam-b" />
          <span className="beam beam-c" />
        </div>

        {/* En móvil es una columna: titular → portátil → acciones, para que el
            3D no quede enterrado bajo los botones. En lg pasa a dos columnas y
            el portátil ocupa toda la altura de la derecha. */}
        <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-6">
          {/* Titular */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#a1a1aa] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#db1f2e]" />
              {t.badge}
            </span>

            <h1 className="mt-8 text-4xl font-bold leading-[1.02] tracking-tight sm:text-5xl xl:text-6xl">
              {t.h1a}{' '}
              <span className="relative inline-block text-[#db1f2e]">
                {t.h1accent}
                <span className="laser-underline absolute -bottom-2 left-0 h-[3px] w-full bg-[#db1f2e]" />
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[#a1a1aa] lg:mx-0">
              {t.sub}
            </p>
          </div>

          {/* Columna 3D */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Laptop3D lang={lang} />
          </div>

          {/* Acciones y cifras */}
          <div className="text-center lg:text-left">
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/portafolio" className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#db1f2e] px-8 py-3.5 font-semibold text-white shadow-[0_18px_44px_-16px_rgba(219,31,46,0.75)] transition hover:-translate-y-0.5 hover:bg-[#ef4444] sm:w-auto">
                {t.ctaProjects}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </Link>
              <Link href="/contacto" className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:border-white/30 hover:bg-white/[0.09] sm:w-auto">
                {t.ctaTalk}
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            </div>

            <div className="mx-auto mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8 lg:mx-0">
              {t.stats.map((s) => (
                <div key={s.v}>
                  <div className="text-3xl font-bold tracking-tight text-[#db1f2e] md:text-4xl">{s.k}</div>
                  <div className="mt-1.5 font-mono text-[10px] uppercase leading-tight tracking-[0.12em] text-[#71717a]">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── Servicios ───────────────── */}
      <section id="servicios" className="relative overflow-hidden px-4 py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_45%_at_50%_0%,rgba(219,31,46,0.12),transparent_65%)]" />
        <div className="relative mx-auto max-w-6xl">
          <SectionTitle tone="dark" overline={t.servicesOverline} title={t.servicesTitle} accent={t.servicesAccent} subtitle={t.servicesSubtitle} />
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {t.services.map((s, i) => {
              const Icon = serviceIcons[i];
              return (
                <div key={s.title} className="group relative bg-[#0e0e11] p-6 transition-colors duration-300 hover:bg-[#161619]">
                  <span className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-y-100" />
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#db1f2e]/25 bg-[#db1f2e]/10 text-[#f87171]">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-1.5 flex items-center gap-2 text-[15px] font-semibold text-white">
                    {s.title}
                    <ArrowRight className="h-3.5 w-3.5 text-[#db1f2e] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" strokeWidth={2.5} />
                  </h3>
                  <p className="text-[13px] leading-relaxed text-[#8a8a96]">{s.desc}</p>
                </div>
              );
            })}
            {/* Celda 9: mini-CTA que completa la grilla de 3×3 */}
            <Link href="/contacto" className="group relative flex flex-col items-center justify-center bg-[#db1f2e] p-6 text-center transition-colors duration-300 hover:bg-[#ef4444]">
              <span className="text-lg font-semibold text-white">
                {lang === 'en' ? 'Something else in mind?' : '¿Tienes otra idea?'}
              </span>
              <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-white/85">
                {lang === 'en' ? "Let's talk" : 'Hablemos'}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────────── Proyectos ───────────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle tone="dark" overline={t.portfolioOverline} title={t.portfolioTitle} accent={t.portfolioAccent} subtitle={t.portfolioSubtitle} />

          {/* Filtros por categoría */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
            {categories.map((c) => {
              const active = filter === c;
              const label = c === 'all' ? t.filterAll : c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'border-[#db1f2e] bg-[#db1f2e] text-white shadow-[0_8px_24px_-10px_rgba(219,31,46,0.7)]'
                      : 'border-white/10 bg-white/[0.03] text-[#a1a1aa] hover:border-white/25 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.projects.map((p, i) => {
              const meta = projectMeta[i];
              if (filter !== 'all' && p.cat !== filter) return null;
              // Tarjeta clickeable solo cuando hay un sitio real al que llevar
              // (proyectos propios sin publicar se quedan como tarjeta estática).
              const Card = meta.url ? 'a' : 'div';
              const cardProps = meta.url
                ? { href: meta.url, target: '_blank', rel: 'noopener noreferrer' }
                : {};
              return (
                <Card
                  key={p.name}
                  {...cardProps}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e11] transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:bg-[#131316] hover:shadow-[0_30px_60px_-30px_rgba(219,31,46,0.45)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-white/[0.08] bg-black">
                    {meta.img ? (
                      <img
                        src={meta.img}
                        alt={`${t.capture} ${p.name}`}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      // Portada generada: inicial sobre gradiente propio del proyecto.
                      <div
                        className="flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-[1.04]"
                        style={{ background: `linear-gradient(135deg, ${meta.from}, ${meta.to})` }}
                      >
                        <span className="text-6xl font-bold tracking-tight text-white/90">{p.name.charAt(0)}</span>
                      </div>
                    )}
                    <span className="absolute inset-x-0 top-0 z-10 h-[3px] origin-left scale-x-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-x-100" />
                    {p.live && (
                      <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ade80]" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white">Live</span>
                      </span>
                    )}
                    <span className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 py-1 pl-1 pr-2.5 backdrop-blur-sm">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-[#ef4444] to-[#b91c1c]">
                        <DuckMark className="h-3 w-3 text-white" />
                      </span>
                      <span className="text-[11px] font-semibold tracking-wide text-white">{t.builtBy}</span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h3 className="mb-2 text-2xl font-bold text-white">{p.name}</h3>
                    <p className="mb-6 flex-1 text-sm leading-relaxed text-[#a1a1aa]">{p.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {meta.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] font-medium tracking-wide text-[#a1a1aa] transition-colors group-hover:border-[#db1f2e]/40 group-hover:text-white">{tag}</span>
                      ))}
                    </div>
                    {meta.url && (
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#db1f2e]">
                        {t.viewLive}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── Proceso ───────────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <SectionTitle tone="dark" overline={t.processOverline} title={t.processTitle} accent={t.processAccent} subtitle={t.processSubtitle} />
          {/* Línea de tiempo: los conectores punteados son los que comunican
              que es una secuencia y no tres servicios sueltos. */}
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
            {t.steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={step.n} className="relative">
                  {i < t.steps.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[calc(50%+2rem)] top-6 hidden h-px w-[calc(100%-4rem)] sm:block"
                      style={{ backgroundImage: 'linear-gradient(to right, rgba(219,31,46,0.55) 55%, transparent 55%)', backgroundSize: '11px 1px' }}
                    />
                  )}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#db1f2e]/30 bg-[#db1f2e]/10 text-[#f87171]">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                      <span className="absolute -bottom-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#db1f2e] font-mono text-[10px] font-bold text-white">
                        {step.n}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#8a8a96]">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-center text-[#a1a1aa]">
            <Clock className="h-4 w-4 shrink-0 text-[#db1f2e]" strokeWidth={1.5} />
            {t.delivery}<span className="font-semibold text-white">{t.deliveryStrong}</span>{t.deliveryEnd}
          </p>
        </div>
      </section>

      {/* ───────────────── Quiénes somos ───────────────── */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <SectionTitle tone="dark" overline={t.aboutOverline} title={t.aboutTitle} accent={t.aboutAccent} />
          <p className="mx-auto max-w-3xl text-center text-lg leading-relaxed text-[#a1a1aa]">
            <span className="font-semibold text-white">Ducklab</span> — {t.aboutBody}
          </p>
          <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {t.values.map((v, i) => {
              const Icon = valueIcons[i];
              return (
                <div key={v.t} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e11] p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#131316]">
                  <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#db1f2e]">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mb-1 font-semibold text-white">{v.t}</h3>
                  <p className="text-sm text-[#a1a1aa]">{v.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA final ───────────────── */}
      <section className="relative overflow-hidden px-4 py-12">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0b0b0d] px-6 py-24 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(219,31,46,0.22),transparent_70%)]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-4xl font-bold tracking-tight md:text-6xl">{t.ctaTitle}</h2>
            <p className="mt-6 text-lg text-[#a1a1aa] md:text-xl">{t.ctaSub}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/planes" className="inline-flex w-full items-center justify-center rounded-full bg-[#db1f2e] px-8 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(219,31,46,0.35)] transition hover:bg-[#ef4444] sm:w-auto">
                {t.ctaPricing2}
              </Link>
              <Link href="/contacto" className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10 sm:w-auto">
                {t.ctaContact}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
