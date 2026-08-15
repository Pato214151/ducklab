'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Wrench, Rocket, CheckCircle2, X, Check, Store, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { useLanguage } from '@/lib/LanguageContext';

const WHATSAPP = 'https://wa.me/573203182862';

const stepIcons = [MessageCircle, Wrench, Rocket];

const content = {
  en: {
    badge: 'How it works',
    heroTitle: 'One system,', heroAccent: 'zero surprises',
    heroSub: 'This is exactly how we take you from a first conversation to a working system in your business — restaurant, retail store, or anything in between. No jargon, no hidden steps.',
    ctaTalk: "Let's talk", ctaPricing: 'See pricing',

    forWhoOverline: 'Who this is for', forWhoTitle: 'Built for any business that', forWhoAccent: 'sells and stocks products',
    forWho: ['Restaurants & bars', 'Clothing stores', 'Toy stores', 'Resale & accessory shops', 'Convenience stores', 'Specialty retail'],

    compareOverline: 'Why it makes sense', compareTitle: 'Stop paying a', compareAccent: 'commission on every sale',
    compareSub: 'Big providers charge a monthly fee plus a cut of every card transaction. We charge once — the system is yours to use.',
    compareThem: 'Toast / Square', compareUs: 'Ducklab',
    themRows: ['Monthly fee, forever', '2.6% + 10¢ on every card sale', 'Generic template, limited customization', 'Support through a call center'],
    usRows: ['One-time payment', 'No per-transaction commission', 'Built around how your business actually works', 'You talk directly to the person who built it'],

    stepsOverline: 'The process', stepsTitle: 'From first call to', stepsAccent: 'live system',
    steps: [
      { title: 'Free consultation', desc: "We talk about your business: what you sell, how you operate day to day, what you're using today. No cost, no commitment." },
      { title: 'We build it for you', desc: "You see progress with real demos along the way — not a surprise at the end. You approve each step before we move on." },
      { title: 'Install & train your team', desc: "We set it up on-site (remote walkthrough), train your staff, and stay reachable while everyone gets comfortable with it." },
    ],

    includedOverline: 'What you get', includedTitle: 'Everything your business', includedAccent: 'actually needs',
    included: [
      'Point of sale: checkout, tabs, returns',
      'Live kitchen screen for restaurants — orders appear instantly, no shouting',
      'Inventory that updates itself as you sell — sizes, variants, stock alerts',
      'Reports: what sold, when, and how much you made',
      'Staff accounts with different access levels',
      'Automatic daily backups — you never lose a sale',
    ],

    maintOverline: 'After delivery', maintTitle: "You're never", maintAccent: 'on your own',
    maintDesc: 'Every system includes a support plan: bug fixes, updates, and a direct line to me by WhatsApp or email — not a ticket queue.',

    proofOverline: 'Not a promise', proofTitle: 'Already running,', proofAccent: 'for real businesses',
    proofSub: 'These aren’t mockups — they’re live systems processing real sales today.',

    testimonialsOverline: 'In their own words', testimonialsTitle: 'What business owners', testimonialsAccent: 'actually say',
    testimonials: [
      {
        quote: "Before, I sold only through WhatsApp — writing out prices one by one with no real control. Now I have my own online store: customers come in, pick what they need, and pay through a secure link. As soon as they pay, the invoice generates itself, inventory gets deducted, and the receipt lands in their inbox — without me lifting a finger. Even when the internet is slow, the site keeps working, and a WhatsApp bot answers prices, hours, and warranty questions around the clock. I went from 'manual service' to selling while I sleep.",
        author: 'Julian', context: 'Owner, RALOZ COL SAS — Website & Online Store',
      },
      {
        quote: "The admin panel changed my business. I invoice at the counter, track inventory in real time, manage the daily cash register, see sales and profit reports, and answer customer WhatsApp messages — all from one place. I have it installed as an app on my phone, so I can sell from wherever I am and print the ticket at the counter later. I stopped losing sales to stock mismatches and juggling notebooks. It's like having an extra employee who never gets the numbers wrong.",
        author: 'Julian', context: 'Owner, RALOZ COL SAS — POS & Admin Panel',
      },
    ],

    finalTitle: 'Ready to see it for your business?',
    finalSub: 'Free consultation. No commitment. Bring your questions.',

    faqOverline: 'Common questions', faqTitle: 'Before you', faqAccent: 'ask',
    faq: [
      { q: 'Will my website show up on Google?', a: "Yes. Where the server is located doesn't stop people from finding you — what matters is your own domain, fast loading, and a Google Business Profile (for restaurants and stores, this is what makes you show up on Google Maps searches like \"restaurants near me\")." },
      { q: 'Do I get my own domain?', a: 'Yes, for websites and online stores you get your own domain (yourbusiness.com). A POS/kitchen system for internal use doesn\'t need one — only your staff uses it.' },
      { q: 'Where is my data hosted?', a: 'On professional cloud infrastructure (Vercel + Supabase), with servers positioned for fast access from the US. Daily automatic backups included.' },
      { q: 'Do I need any technical knowledge?', a: "No. You get trained on the system itself — hosting, servers, and backups are handled for you as part of the maintenance plan." },
      { q: 'What if I outgrow the system?', a: "It's built to grow with you — more staff, more locations, more features can be added later without starting over." },
      { q: "What if I don't want a monthly maintenance plan?", a: "For a desktop POS (offline), that's fine — it keeps working, you just won't get bug fixes or updates. For a cloud/web system, hosting and maintenance go together as one plan: if you cancel, you get a 30-day grace period to export your data before the system is paused. We don't split \"hosting only\" from support." },
      { q: 'Can I host it under my own Vercel/Supabase account instead?', a: "Yes. You create your own accounts, we deploy the system there, and you pay the hosting bill directly — no monthly fee to us. Since there's no ongoing plan, the one-time project price is higher, and any future changes are billed hourly instead of included." },
    ],
  },
  es: {
    badge: 'Cómo funciona',
    heroTitle: 'Un sistema,', heroAccent: 'cero sorpresas',
    heroSub: 'Así es exactamente el camino desde la primera conversación hasta tener el sistema funcionando en tu negocio — restaurante, tienda de ropa, o lo que sea. Sin tecnicismos, sin pasos escondidos.',
    ctaTalk: 'Hablemos', ctaPricing: 'Ver precios',

    forWhoOverline: 'Para quién es', forWhoTitle: 'Hecho para cualquier negocio que', forWhoAccent: 'vende y maneja inventario',
    forWho: ['Restaurantes y bares', 'Tiendas de ropa', 'Tiendas de juguetes', 'Reventa y accesorios', 'Tiendas de conveniencia', 'Retail especializado'],

    compareOverline: 'Por qué tiene sentido', compareTitle: 'Deja de pagar', compareAccent: 'comisión por cada venta',
    compareSub: 'Los grandes proveedores cobran mensualidad más un porcentaje de cada venta con tarjeta. Nosotros cobramos una vez — el sistema queda tuyo.',
    compareThem: 'Toast / Square', compareUs: 'Ducklab',
    themRows: ['Mensualidad, para siempre', '2.6% + 10¢ en cada venta con tarjeta', 'Plantilla genérica, poca personalización', 'Soporte por call center'],
    usRows: ['Pago único', 'Sin comisión por transacción', 'Construido según cómo trabaja tu negocio', 'Hablas directo con quien lo construyó'],

    stepsOverline: 'El proceso', stepsTitle: 'De la primera llamada al', stepsAccent: 'sistema funcionando',
    steps: [
      { title: 'Consulta gratuita', desc: 'Hablamos de tu negocio: qué vendes, cómo operas el día a día, qué usas hoy. Sin costo, sin compromiso.' },
      { title: 'Lo construimos para ti', desc: 'Ves el avance con demos reales en el camino — no una sorpresa al final. Apruebas cada paso antes de seguir.' },
      { title: 'Instalación y capacitación', desc: 'Lo instalamos (guía remota), capacitamos a tu equipo, y seguimos disponibles mientras todos se acostumbran.' },
    ],

    includedOverline: 'Qué incluye', includedTitle: 'Todo lo que tu negocio', includedAccent: 'realmente necesita',
    included: [
      'Punto de venta: cobro, cuentas, devoluciones',
      'Pantalla de cocina en vivo para restaurantes — los pedidos llegan al instante, sin gritar',
      'Inventario que se actualiza solo — tallas, variantes, alertas de stock',
      'Reportes: qué se vendió, cuándo y cuánto ganaste',
      'Cuentas de empleados con distintos niveles de acceso',
      'Respaldo automático diario — nunca pierdes una venta',
    ],

    maintOverline: 'Después de la entrega', maintTitle: 'Nunca quedas', maintAccent: 'solo',
    maintDesc: 'Cada sistema incluye un plan de soporte: corrección de errores, actualizaciones, y línea directa conmigo por WhatsApp o correo — no una fila de tickets.',

    proofOverline: 'No es una promesa', proofTitle: 'Ya está funcionando,', proofAccent: 'con negocios reales',
    proofSub: 'No son maquetas — son sistemas reales procesando ventas hoy mismo.',

    testimonialsOverline: 'En sus propias palabras', testimonialsTitle: 'Lo que dicen los', testimonialsAccent: 'dueños de negocio',
    testimonials: [
      {
        quote: 'Antes vendía solo por WhatsApp, escribiendo precios uno por uno y sin control de nada. Ahora tengo mi tienda en línea propia: los clientes entran, eligen lo que necesitan y pagan con un link seguro. Apenas pagan, se genera la factura sola, se descuenta el inventario y les llega el comprobante al correo — sin que yo mueva un dedo. Hasta cuando el internet está lento la página sigue funcionando, y un bot de WhatsApp responde precios, horarios y garantías a toda hora. Pasé de "atender manual" a vender mientras duermo.',
        author: 'Julian', context: 'Dueño, RALOZ COL SAS — Sitio web y tienda en línea',
      },
      {
        quote: 'El panel administrativo me cambió el negocio. Facturo en el mostrador, controlo el inventario en tiempo real, manejo la caja del día, veo reportes de ventas y ganancias, y respondo el WhatsApp de los clientes — todo desde un solo lugar. Lo tengo instalado como app en el celular, así que vendo desde donde esté y luego imprimo el ticket en la taquilla. Dejé de perder ventas por descuadres de stock y de andar con cuadernos. Es como tener un empleado extra que nunca se equivoca con las cuentas.',
        author: 'Julian', context: 'Dueño, RALOZ COL SAS — POS y panel administrativo',
      },
    ],

    finalTitle: '¿Listo para verlo en tu propio negocio?',
    finalSub: 'Consulta gratuita. Sin compromiso. Trae tus preguntas.',

    faqOverline: 'Preguntas frecuentes', faqTitle: 'Antes de que', faqAccent: 'preguntes',
    faq: [
      { q: '¿Mi sitio va a aparecer en Google?', a: 'Sí. Dónde esté el servidor no impide que te encuentren — lo que importa es tener tu propio dominio, que cargue rápido, y un Google Business Profile (para restaurantes y tiendas, esto es lo que te hace aparecer en Google Maps cuando alguien busca "restaurantes cerca de mí").' },
      { q: '¿Tengo mi propio dominio?', a: 'Sí, para sitios web y tiendas online tienes tu propio dominio (tunegocio.com). Un sistema POS/cocina de uso interno no lo necesita — solo lo usa tu personal.' },
      { q: '¿Dónde se guardan mis datos?', a: 'En infraestructura profesional en la nube (Vercel + Supabase), con servidores posicionados para acceso rápido desde USA. Incluye respaldo automático diario.' },
      { q: '¿Necesito saber de tecnología?', a: 'No. Te capacito en el uso del sistema — el hosting, servidores y respaldos quedan cubiertos dentro del plan de mantenimiento.' },
      { q: '¿Qué pasa si mi negocio crece?', a: 'El sistema está hecho para crecer contigo — más empleados, más sucursales, más funciones se pueden agregar después sin empezar de cero.' },
      { q: '¿Y si no quiero plan de mantenimiento mensual?', a: 'Para un POS de escritorio (offline) no hay problema — sigue funcionando, solo que sin corrección de errores ni actualizaciones. Para un sistema en la nube/web, hosting y mantenimiento van juntos en un solo plan: si cancelas, tienes 30 días de gracia para exportar tus datos antes de que se pause. No se separa "solo hosting" del soporte.' },
      { q: '¿Puedo alojarlo en mi propia cuenta de Vercel/Supabase?', a: 'Sí. Creas tus propias cuentas, nosotros desplegamos el sistema ahí, y pagas el hosting directamente — sin mensualidad para nosotros. Como no hay plan continuo, el precio del proyecto inicial es más alto, y cualquier cambio futuro se cobra por hora en vez de estar incluido.' },
    ],
  },
};

export default function DemoContent() {
  const { lang } = useLanguage();
  const t = content[lang];
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <main className="grain bg-pearl relative min-h-screen text-[#0b0b0c] selection:bg-[#db1f2e]/20">
      <Navbar />
      <div className="laser-line pointer-events-none fixed left-8 top-0 z-30 hidden h-full w-px lg:block" />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-36 pb-20 md:pt-44">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_40%_at_50%_-5%,rgba(219,31,46,0.10),transparent_60%)]" />
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white/50 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[#56565d] backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#db1f2e]" />
            {t.badge}
          </span>
          <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-7xl">
            {t.heroTitle} <span className="text-[#db1f2e]">{t.heroAccent}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#56565d] md:text-xl">{t.heroSub}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0b0b0c] px-8 py-3.5 font-semibold text-white transition hover:bg-[#db1f2e] sm:w-auto">
              {t.ctaTalk}
            </a>
            <Link href="/planes" className="inline-flex w-full items-center justify-center rounded-full border border-black/15 bg-white/40 px-8 py-3.5 font-semibold text-[#0b0b0c] transition hover:border-black/30 hover:bg-white/70 sm:w-auto">
              {t.ctaPricing}
            </Link>
          </div>
        </div>
      </section>

      {/* Para quién es */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-[#db1f2e]">{t.forWhoOverline}</p>
          <h2 className="mb-8 text-2xl font-bold tracking-tight md:text-4xl">
            {t.forWhoTitle} <span className="text-[#db1f2e]">{t.forWhoAccent}</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {t.forWho.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 px-4 py-2 text-sm font-medium text-[#3f3f46]">
                <Store className="h-4 w-4 text-[#db1f2e]" strokeWidth={1.5} /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Comparación */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle tone="light" overline={t.compareOverline} title={t.compareTitle} accent={t.compareAccent} subtitle={t.compareSub} />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[0.08] bg-white/60 p-7">
              <h3 className="mb-5 text-center font-mono text-sm font-semibold uppercase tracking-wide text-[#9a9aa1]">{t.compareThem}</h3>
              <ul className="space-y-4">
                {t.themRows.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm text-[#56565d]">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-[#9a9aa1]" strokeWidth={2} /> {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#db1f2e]/30 bg-white p-7 shadow-[0_20px_60px_-30px_rgba(219,31,46,0.4)]">
              <h3 className="mb-5 text-center font-mono text-sm font-semibold uppercase tracking-wide text-[#db1f2e]">{t.compareUs}</h3>
              <ul className="space-y-4">
                {t.usRows.map((r) => (
                  <li key={r} className="flex items-start gap-2.5 text-sm font-medium text-[#0b0b0c]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#db1f2e]" strokeWidth={2.5} /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle tone="light" overline={t.stepsOverline} title={t.stepsTitle} accent={t.stepsAccent} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {t.steps.map((s, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={s.title} className="relative rounded-2xl border border-black/[0.08] bg-white/70 p-7 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)]">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-white text-[#db1f2e]">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <span className="absolute right-6 top-6 font-mono text-3xl font-bold text-[#db1f2e]/20">0{i + 1}</span>
                  <h3 className="mb-2 text-lg font-semibold text-[#0b0b0c]">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-[#56565d]">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <SectionTitle tone="light" overline={t.includedOverline} title={t.includedTitle} accent={t.includedAccent} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {t.included.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-black/[0.08] bg-white/60 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#db1f2e]" strokeWidth={1.75} />
                <span className="text-sm text-[#3f3f46]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mantenimiento */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-black/[0.08] bg-white/70 p-10 text-center shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)]">
          <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-[#db1f2e]">{t.maintOverline}</p>
          <h3 className="text-2xl font-bold text-[#0b0b0c] md:text-3xl">
            {t.maintTitle} <span className="text-[#db1f2e]">{t.maintAccent}</span>
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-[#56565d]">{t.maintDesc}</p>
        </div>
      </section>

      {/* Prueba / portafolio corto */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <SectionTitle tone="light" overline={t.proofOverline} title={t.proofTitle} accent={t.proofAccent} subtitle={t.proofSub} />
          <Link href="/#servicios" className="inline-flex items-center justify-center rounded-full bg-[#0b0b0c] px-7 py-3 font-semibold text-white transition hover:bg-[#db1f2e]">
            {lang === 'en' ? 'See real projects' : 'Ver proyectos reales'}
          </Link>
        </div>
      </section>

      {/* Testimonios */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle tone="light" overline={t.testimonialsOverline} title={t.testimonialsTitle} accent={t.testimonialsAccent} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {t.testimonials.map((item) => (
              <div key={item.context} className="flex flex-col rounded-2xl border border-black/[0.08] bg-white/70 p-7 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)]">
                <p className="flex-1 text-sm leading-relaxed text-[#3f3f46]">&ldquo;{item.quote}&rdquo;</p>
                <div className="mt-5 border-t border-black/[0.06] pt-4">
                  <p className="font-semibold text-[#0b0b0c]">{item.author}</p>
                  <p className="text-xs text-[#9a9aa1]">{item.context}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <SectionTitle tone="light" overline={t.faqOverline} title={t.faqTitle} accent={t.faqAccent} />
          <div className="space-y-3">
            {t.faq.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={item.q} className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white/70">
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-[#0b0b0c]">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-[#db1f2e] transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2} />
                  </button>
                  {open && (
                    <p className="px-6 pb-5 text-sm leading-relaxed text-[#56565d]">{item.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden px-4 py-12">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-[#0b0b0c] px-6 py-20 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(219,31,46,0.22),transparent_70%)]" />
          <div className="relative mx-auto max-w-xl">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t.finalTitle}</h2>
            <p className="mt-5 text-lg text-gray-300">{t.finalSub}</p>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#db1f2e] px-10 py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(219,31,46,0.3)] transition hover:bg-[#ef4444]">
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} /> {t.ctaTalk}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
