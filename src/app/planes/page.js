import Link from 'next/link';
import { Globe, Laptop, Rocket, Crown, Check, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';

export const metadata = {
  title: 'Planes y Precios | Ducklab',
  description: 'Precios claros para páginas web, sistemas POS y apps a medida. Planes mensuales de mantenimiento desde $200.000.',
};

const projectPlans = [
  {
    Icon: Globe, name: 'Página Web', price: '400.000',
    desc: 'Sitio web profesional, responsive y rápido, con tu dominio.',
    features: ['Diseño a medida', 'Responsive (móvil y PC)', 'Dominio + hosting', 'SEO básico'],
  },
  {
    Icon: MessageCircle, name: 'Bot de WhatsApp', price: '500.000',
    desc: 'Atención automatizada por WhatsApp: responde y notifica a tus clientes 24/7.',
    features: ['Respuestas automáticas', 'Notificaciones a clientes', 'Conectable a tu sistema', 'Disponible 24/7'],
  },
  {
    Icon: Laptop, name: 'Sistema POS / App', price: '600.000',
    desc: 'Punto de venta o aplicación online a medida para tu negocio.',
    features: ['Inventario y ventas', 'Panel de administración', 'Reportes', 'Usuarios y permisos'],
  },
  {
    Icon: Rocket, name: 'Página + Sistema', price: '1.100.000', promo: '800.000', popular: true,
    desc: 'El sitio web y el sistema, integrados y funcionando juntos.',
    features: ['Todo lo anterior', 'Web + sistema integrados', 'Una sola entrega', 'Capacitación incluida'],
  },
  {
    Icon: Crown, name: 'Paquete Completo', price: '1.500.000',
    desc: 'Página web + app + sistema. La solución integral para tu empresa.',
    features: ['Página web', 'App / escritorio', 'Sistema online', 'Todo conectado'],
  },
];

export default function Planes() {
  return (
    <main className="grain bg-pearl relative min-h-screen text-[#0b0b0c] selection:bg-[#db1f2e]/20">
      <Navbar />

      <div className="laser-line pointer-events-none fixed left-8 top-0 z-30 hidden h-full w-px lg:block" />

      <section className="relative overflow-hidden px-4 pt-36 pb-24 md:pt-44">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_40%_at_50%_-5%,rgba(219,31,46,0.10),transparent_60%)]" />
        <div className="mx-auto max-w-6xl">
          <SectionTitle tone="light" overline="Planes y precios" title="Precios claros," accent="sin costos ocultos" subtitle="La primera consulta técnica es 100% gratuita." />

          <p className="mb-6 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-[#56565d]">Proyectos · pago único</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projectPlans.map((p) => (
              <div
                key={p.name}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 ${
                  p.popular
                    ? 'border-[#db1f2e]/40 bg-white shadow-[0_20px_60px_-30px_rgba(219,31,46,0.5)]'
                    : 'border-black/[0.08] bg-white/70 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)] hover:-translate-y-1 hover:border-black/15 hover:bg-white/85'
                }`}
              >
                {!p.popular && <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-x-100" />}
                {p.popular && (
                  <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-md bg-[#db1f2e] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white">Promoción</span>
                )}
                <div className={`mb-4 mt-2 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-white ${p.popular ? 'text-[#db1f2e]' : 'text-[#0b0b0c]'}`}>
                  <p.Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold text-[#0b0b0c]">{p.name}</h3>
                <p className="mt-1 mb-4 text-sm text-[#56565d]">{p.desc}</p>
                <div className="mb-5">
                  {p.promo ? (
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-[#0b0b0c]">${p.promo}</span>
                      <span className="mb-1 text-sm text-[#9a9aa1] line-through">${p.price}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-[#0b0b0c]">${p.price}</span>
                  )}
                  <span className="ml-1 text-sm text-[#9a9aa1]">COP</span>
                </div>
                <ul className="mb-6 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#3f3f46]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#db1f2e]" strokeWidth={2} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contacto"
                  className={`mt-auto inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    p.popular ? 'bg-[#db1f2e] text-white hover:bg-[#ef4444]' : 'bg-[#0b0b0c] text-white hover:bg-[#db1f2e]'
                  }`}
                >
                  Lo quiero
                </Link>
              </div>
            ))}
          </div>

          {/* Plan mensual */}
          <div className="mt-8 overflow-hidden rounded-2xl border border-black/[0.08] bg-white/70 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)]">
            <div className="flex flex-col items-center gap-6 p-8 md:flex-row md:justify-between md:p-10">
              <div className="max-w-xl text-center md:text-left">
                <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-[#db1f2e]">Plan mensual · mantenimiento</p>
                <h3 className="text-2xl font-bold text-[#0b0b0c]">Garantía de tu sistema, siempre activa</h3>
                <p className="mt-2 text-[#56565d]">
                  Incluye resolución de bugs, actualizaciones de seguridad, backups automáticos y
                  asistencia prioritaria por WhatsApp o correo.
                </p>
              </div>
              <div className="shrink-0 text-center">
                <div className="text-sm text-[#9a9aa1]">Desde</div>
                <div className="text-4xl font-bold text-[#0b0b0c]">$200.000<span className="text-lg font-normal text-[#9a9aa1]">/mes</span></div>
                <Link href="/contacto" className="mt-4 inline-flex items-center justify-center rounded-full bg-[#0b0b0c] px-7 py-3 font-semibold text-white transition hover:bg-[#db1f2e]">Activar plan</Link>
              </div>
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-[#56565d]">
            El precio final depende de la complejidad del proyecto. Los casos muy complejos se cotizan aparte
            con una tarifa personalizada. Tiempo de entrega: de 1 a 4 meses según el sistema.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
