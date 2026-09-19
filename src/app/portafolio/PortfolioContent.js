/** Portafolio: proyectos realizados con su stack y enlaces. */

'use client';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { useLanguage } from '@/lib/LanguageContext';

const content = {
  en: {
    badge: 'Portfolio',
    h1a: 'Three systems,', h1accent: 'real businesses,', h1b: 'daily use.',
    sub: "I don't build tutorials. Here's the architecture, the stack, and the real screens behind three production systems I designed, shipped, and still maintain.",
    ctaGithub: 'GitHub', ctaLinkedin: 'LinkedIn', ctaStore: 'Live store',
    liveLabel: 'live', activeLabel: 'active project',
    projects: [
      {
        id: 'raloz',
        eyebrow: '01 — Live production system',
        name: 'Raloz',
        tag: 'live',
        summary: 'Raloz is a school-uniform business in Bogotá. I designed, built, and still maintain the full-stack system that runs its store, point of sale, and invoicing — used every day by real cashiers ringing up real sales.',
        detail: 'The public storefront takes orders and hands off to a Flask backend that owns 24 PostgreSQL tables: auth, inventory, stock, invoicing, and a manufacturing pipeline for custom-made garments. The POS side is a 19-module React app admins and cashiers run all day, installable as a PWA with no app store involved.',
        points: [
          'JWT auth with logout blacklist, rate limiting, HSTS/CSP headers, HMAC-verified payment webhooks',
          'MercadoPago checkout → webhook confirmation → invoice generation → stock deduction, fully automated',
          'GitHub Actions runs pytest + typecheck + build on every push, auto-deploys to Render and Cloudflare Pages',
        ],
        stack: ['Flask', 'React', 'Vite', 'PostgreSQL', 'Render', 'Cloudflare'],
        since: '2023 — daily production use since 2025',
        links: [
          { label: 'Live store', href: 'https://ralozcolsas.com' },
          { label: 'Showcase repo', href: 'https://github.com/Pato214151/raloz-showcase' },
        ],
        images: [
          { src: '/images/portfolio/raloz-hero.jpg', alt: 'Raloz storefront hero section' },
          { src: '/images/portfolio/raloz-pos.jpg', alt: 'Raloz POS dashboard (sensitive figures blurred)' },
          { src: '/images/portfolio/raloz-catalogo.jpg', alt: 'Raloz public storefront catalog' },
        ],
      },
      {
        id: 'ducklab',
        eyebrow: '02 — Software distribution platform',
        name: 'Ducklab',
        tag: 'active',
        summary: "This is that platform: a client portal plus desktop launcher for distributing and supporting custom software — think Steam, but for POS systems and bespoke tools sold to small businesses in Colombia.",
        detail: "Each client gets an account with secure downloads, a support ticket system, and payment history. It's also the licensing backbone for my other desktop products — Pocitos Azufrados checks in against this same licensing API before it lets a cashier log in.",
        points: [
          'Next.js 16 web portal + a PyQt5 desktop launcher that checks for updates and installs them',
          'JWT sessions in HttpOnly cookies, rate limiting, CSP/HSTS headers, HMAC-verified webhooks',
          "Telemetry with a deadman switch — if a client's install stops phoning home, I find out before they call me",
        ],
        stack: ['Next.js', 'React 19', 'PyQt5', 'JWT'],
        since: 'Runs per-deployment; not yet a public SaaS',
        links: [{ label: 'Source on GitHub', href: 'https://github.com/Pato214151/ducklab' }],
        images: [
          { src: '/images/portfolio/ducklab-landing.jpg', alt: 'Ducklab landing page' },
          { src: '/images/portfolio/ducklab-login.jpg', alt: 'Ducklab client portal login screen' },
        ],
      },
      {
        id: 'pocitos',
        eyebrow: '03 — Desktop POS, in daily use',
        name: 'Pocitos Azufrados',
        tag: 'live',
        summary: 'Los Pocitos Azufrados is a resort in Tocaima, Cundinamarca — thermal mud pools, a restaurant, a bar. I built the desktop POS its staff use to ring up sales, track inventory, and run the kitchen.',
        detail: "It's a Python/Tkinter/SQLite app with role-based access for admins, co-admins, and cashiers, plus a Flask-connected kitchen module so orders show up where the food actually gets made.",
        points: [
          'Atomic transactions and thread-safe receipt numbering — no double-charged tabs at a busy bar',
          'Validated with a pytest suite and a script covering 34 automated integrity checkpoints',
          "Licensed and monitored through Ducklab's portal — the two projects share real infrastructure",
        ],
        stack: ['Python', 'Tkinter', 'SQLite', 'Flask'],
        since: '2025 — in daily use at the bar',
        links: [{ label: 'Source on GitHub', href: 'https://github.com/Pato214151/pocitos-azufrados' }],
        images: [{ src: '/images/portfolio/pocitos-site.jpg', alt: 'Los Pocitos Azufrados, the resort whose bar runs this POS' }],
        note: "This shows the resort itself, not the POS screens — the app is protected by a license check tied to Ducklab, so its interface isn't publicly screenshottable. That license flow is real: this project can't even boot without checking in first.",
      },
    ],
    closingTitle: 'Open to remote full-stack & backend roles.',
    closingBody: "Three years of solo ownership taught me the parts of the job that don't show up in a tutorial: auth that survives an audit, migrations that don't wake anyone up at 3am, and a CI pipeline that catches problems before customers do. Happy to walk through any of the code above in an interview.",
    closingSkills: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'Flask', 'React', 'Node.js', 'PostgreSQL', 'JWT / OAuth', 'pytest', 'Docker', 'GitHub Actions'],
    closingEmail: 'Email me', closingLinkedin: 'LinkedIn',
  },
  es: {
    badge: 'Portafolio',
    h1a: 'Tres sistemas,', h1accent: 'negocios reales,', h1b: 'uso diario.',
    sub: 'No construyo tutoriales. Esta es la arquitectura, el stack y las pantallas reales detrás de tres sistemas en producción que diseñé, construí y todavía mantengo.',
    ctaGithub: 'GitHub', ctaLinkedin: 'LinkedIn', ctaStore: 'Tienda en vivo',
    liveLabel: 'en vivo', activeLabel: 'proyecto activo',
    projects: [
      {
        id: 'raloz',
        eyebrow: '01 — Sistema en producción',
        name: 'Raloz',
        tag: 'live',
        summary: 'Raloz es un negocio de uniformes escolares en Bogotá. Diseñé, construí y sigo manteniendo el sistema full-stack que corre su tienda, punto de venta y facturación — usado todos los días por cajeras reales cobrando ventas reales.',
        detail: 'La tienda pública toma pedidos y se los pasa a un backend en Flask dueño de 24 tablas en PostgreSQL: auth, inventario, stock, facturación y un flujo de manufactura para prendas a medida. El POS es una app React de 19 módulos que administradores y cajeros usan todo el día, instalable como PWA sin necesidad de tienda de apps.',
        points: [
          'JWT con lista negra de logout, rate limiting, cabeceras HSTS/CSP, webhooks de pago verificados con HMAC',
          'Checkout de MercadoPago → confirmación por webhook → factura → descuento de stock, todo automático',
          'GitHub Actions corre pytest + typecheck + build en cada push, despliega solo a Render y Cloudflare Pages',
        ],
        stack: ['Flask', 'React', 'Vite', 'PostgreSQL', 'Render', 'Cloudflare'],
        since: '2023 — en producción diaria desde 2025',
        links: [
          { label: 'Tienda en vivo', href: 'https://ralozcolsas.com' },
          { label: 'Repo showcase', href: 'https://github.com/Pato214151/raloz-showcase' },
        ],
        images: [
          { src: '/images/portfolio/raloz-hero.jpg', alt: 'Hero de la tienda de Raloz' },
          { src: '/images/portfolio/raloz-pos.jpg', alt: 'Dashboard del POS de Raloz (cifras sensibles difuminadas)' },
          { src: '/images/portfolio/raloz-catalogo.jpg', alt: 'Catálogo público de la tienda Raloz' },
        ],
      },
      {
        id: 'ducklab',
        eyebrow: '02 — Plataforma de distribución de software',
        name: 'Ducklab',
        tag: 'active',
        summary: 'Esta es esa plataforma: un portal de clientes más un launcher de escritorio para distribuir y dar soporte a software a medida — como Steam, pero para sistemas POS y herramientas hechas a medida para pequeños negocios en Colombia.',
        detail: 'Cada cliente tiene su cuenta con descargas seguras, sistema de tickets de soporte e historial de pagos. También es la columna de licenciamiento de mis otros productos de escritorio — Pocitos Azufrados valida contra esta misma API de licencias antes de dejar entrar a un cajero.',
        points: [
          'Portal web en Next.js 16 + un launcher de escritorio en PyQt5 que busca e instala actualizaciones',
          'Sesiones JWT en cookies HttpOnly, rate limiting, cabeceras CSP/HSTS, webhooks verificados con HMAC',
          'Telemetría con un "deadman switch" — si la instalación de un cliente deja de reportarse, me entero antes de que me llame',
        ],
        stack: ['Next.js', 'React 19', 'PyQt5', 'JWT'],
        since: 'Corre por despliegue; todavía no es un SaaS público',
        links: [{ label: 'Código en GitHub', href: 'https://github.com/Pato214151/ducklab' }],
        images: [
          { src: '/images/portfolio/ducklab-landing.jpg', alt: 'Landing de Ducklab' },
          { src: '/images/portfolio/ducklab-login.jpg', alt: 'Pantalla de login del portal de clientes de Ducklab' },
        ],
      },
      {
        id: 'pocitos',
        eyebrow: '03 — POS de escritorio, en uso diario',
        name: 'Pocitos Azufrados',
        tag: 'live',
        summary: 'Los Pocitos Azufrados es un resort en Tocaima, Cundinamarca — piscinas de lodo termal, restaurante y bar. Construí el POS de escritorio que su personal usa para cobrar ventas, controlar inventario y llevar la cocina.',
        detail: 'Es una app en Python/Tkinter/SQLite con acceso por roles para administradores, co-admins y cajeros, más un módulo de cocina conectado por Flask para que los pedidos aparezcan donde realmente se prepara la comida.',
        points: [
          'Transacciones atómicas y numeración de recibos thread-safe — ninguna cuenta cobrada dos veces en un bar a tope',
          'Validado con una suite de pytest y un script que cubre 34 puntos de integridad automatizados',
          'Licenciado y monitoreado a través del portal de Ducklab — los dos proyectos comparten infraestructura real',
        ],
        stack: ['Python', 'Tkinter', 'SQLite', 'Flask'],
        since: '2025 — en uso diario en el bar',
        links: [{ label: 'Código en GitHub', href: 'https://github.com/Pato214151/pocitos-azufrados' }],
        images: [{ src: '/images/portfolio/pocitos-site.jpg', alt: 'Los Pocitos Azufrados, el resort cuyo bar corre este POS' }],
        note: 'Esto muestra el resort en sí, no las pantallas del POS — la app está protegida por una validación de licencia contra Ducklab, así que su interfaz no es capturable públicamente. Ese flujo de licencia es real: este proyecto ni siquiera arranca sin validar primero.',
      },
    ],
    closingTitle: 'Abierto a roles remotos de full-stack y backend.',
    closingBody: 'Tres años de dueño único de estos proyectos me enseñaron las partes del trabajo que no salen en un tutorial: auth que sobrevive una auditoría, migraciones que no despiertan a nadie a las 3am, y un pipeline de CI que atrapa problemas antes que los clientes. Encantado de repasar cualquiera de estos códigos en una entrevista.',
    closingSkills: ['Python', 'JavaScript', 'TypeScript', 'SQL', 'Flask', 'React', 'Node.js', 'PostgreSQL', 'JWT / OAuth', 'pytest', 'Docker', 'GitHub Actions'],
    closingEmail: 'Escríbeme', closingLinkedin: 'LinkedIn',
  },
};

export default function PortfolioContent() {
  const { lang } = useLanguage();
  const t = content[lang];

  return (
    <main className="grain bg-pearl relative min-h-screen text-[#0b0b0c] selection:bg-[#db1f2e]/20">
      <Navbar />

      {/* ───────────────── Hero ───────────────── */}
      <section className="relative isolate overflow-hidden px-4 pt-40 pb-24 md:pt-52 md:pb-32">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_75%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_40%_at_50%_-5%,rgba(219,31,46,0.10),transparent_60%)]" />

        <div className="mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#56565d] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#db1f2e]" />
            {t.badge}
          </span>

          <h1 className="mt-9 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            {t.h1a} <span className="text-[#db1f2e]">{t.h1accent}</span> {t.h1b}
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#56565d] md:text-xl">
            {t.sub}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="https://github.com/Pato214151" target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b0b0c] px-8 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#db1f2e] sm:w-auto">
              {t.ctaGithub} →
            </a>
            <a href="https://www.linkedin.com/in/julian-camilo-ramirez-ramirez-783337382/" target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-full border border-black/15 bg-white/40 px-8 py-3.5 font-semibold text-[#0b0b0c] transition hover:border-black/30 hover:bg-white/70 sm:w-auto">
              {t.ctaLinkedin}
            </a>
            <a href="https://ralozcolsas.com" target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-full border border-black/15 bg-white/40 px-8 py-3.5 font-semibold text-[#0b0b0c] transition hover:border-black/30 hover:bg-white/70 sm:w-auto">
              {t.ctaStore}
            </a>
          </div>
        </div>
      </section>

      {/* ───────────────── Proyectos ───────────────── */}
      {t.projects.map((p, i) => (
        <section key={p.id} id={p.id} className={`px-4 py-20 ${i % 2 === 1 ? 'bg-[#0b0b0c]' : ''}`}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className={`mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] ${i % 2 === 1 ? 'text-[#f87171]' : 'text-[#db1f2e]'}`}>
                  {p.eyebrow}
                </p>
                <h2 className={`text-4xl font-bold tracking-tight md:text-5xl ${i % 2 === 1 ? 'text-white' : 'text-[#0b0b0c]'}`}>
                  {p.name}
                </h2>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${
                i % 2 === 1 ? 'bg-white/10 text-white' : 'bg-black/[0.04] text-[#0b0b0c]'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${p.tag === 'live' ? 'animate-pulse bg-[#4ade80]' : 'bg-[#db1f2e]'}`} />
                {p.tag === 'live' ? t.liveLabel : t.activeLabel}
              </span>
            </div>

            {/* Imágenes */}
            <div className={`mb-10 grid gap-4 ${p.images.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              {p.images.map((img) => (
                <div key={img.src} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-[#0b0b0c] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)]">
                  <img src={img.src} alt={img.alt} loading="lazy" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>

            {p.note && (
              <p className={`mb-10 rounded-xl border-l-2 border-[#db1f2e] px-5 py-4 text-sm leading-relaxed ${
                i % 2 === 1 ? 'bg-white/[0.04] text-gray-300' : 'bg-black/[0.03] text-[#56565d]'
              }`}>
                {p.note}
              </p>
            )}

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
              <div>
                <p className={`mb-4 max-w-[64ch] text-[15.5px] leading-relaxed ${i % 2 === 1 ? 'text-gray-300' : 'text-[#56565d]'}`}>
                  {p.summary}
                </p>
                <p className={`mb-6 max-w-[64ch] text-[15.5px] leading-relaxed ${i % 2 === 1 ? 'text-gray-300' : 'text-[#56565d]'}`}>
                  {p.detail}
                </p>
                <ul className="space-y-2.5">
                  {p.points.map((pt) => (
                    <li key={pt} className={`flex gap-3 text-sm leading-relaxed ${i % 2 === 1 ? 'text-gray-400' : 'text-[#56565d]'}`}>
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#db1f2e]" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`rounded-2xl border p-5 ${i % 2 === 1 ? 'border-white/10 bg-white/[0.04]' : 'border-black/[0.08] bg-white/70'}`}>
                <p className={`mb-2 font-mono text-[10.5px] uppercase tracking-[0.2em] ${i % 2 === 1 ? 'text-gray-500' : 'text-[#8a8a91]'}`}>Stack</p>
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <span key={s} className={`rounded-full border px-2.5 py-1 font-mono text-[11px] ${
                      i % 2 === 1 ? 'border-white/10 bg-white/5 text-gray-300' : 'border-black/10 bg-black/[0.03] text-[#56565d]'
                    }`}>{s}</span>
                  ))}
                </div>
                <p className={`mb-2 font-mono text-[10.5px] uppercase tracking-[0.2em] ${i % 2 === 1 ? 'text-gray-500' : 'text-[#8a8a91]'}`}>{lang === 'en' ? 'Since' : 'Desde'}</p>
                <p className={`mb-5 text-[13.5px] ${i % 2 === 1 ? 'text-gray-300' : 'text-[#0b0b0c]'}`}>{p.since}</p>
                <p className={`mb-2 font-mono text-[10.5px] uppercase tracking-[0.2em] ${i % 2 === 1 ? 'text-gray-500' : 'text-[#8a8a91]'}`}>Links</p>
                <div className="flex flex-col gap-1.5">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-[13.5px] font-semibold text-[#db1f2e] hover:underline">
                      {l.label} →
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ───────────────── Cierre ───────────────── */}
      <section className="relative overflow-hidden px-4 py-12">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#0b0b0c] px-6 py-20 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(219,31,46,0.22),transparent_70%)]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.closingTitle}</h2>
            <p className="mt-6 text-base leading-relaxed text-gray-300 md:text-lg">{t.closingBody}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {t.closingSkills.map((s) => (
                <span key={s} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] text-gray-300">{s}</span>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="mailto:jramirezramirez2005@gmail.com" className="inline-flex w-full items-center justify-center rounded-full bg-[#db1f2e] px-8 py-3.5 font-semibold text-white shadow-[0_0_30px_rgba(219,31,46,0.35)] transition hover:bg-[#ef4444] sm:w-auto">
                {t.closingEmail}
              </a>
              <a href="https://www.linkedin.com/in/julian-camilo-ramirez-ramirez-783337382/" target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10 sm:w-auto">
                {t.closingLinkedin}
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
