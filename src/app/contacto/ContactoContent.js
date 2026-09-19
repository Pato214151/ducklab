/** Contenido de /contacto: canales de contacto (WhatsApp, correo). */

'use client';
import { MessageCircle, Mail, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/LanguageContext';

const WHATSAPP = 'https://wa.me/573203182862';
const EMAIL = 'jramirezramirez2005@gmail.com';
const channelIcons = [MessageCircle, Mail, MapPin];

const content = {
  en: {
    overline: 'Contact', title: "Let's talk about your project",
    sub: 'Tell me what you need. The first technical consultation is 100% free, no strings attached.',
    channels: [
      { title: 'WhatsApp', value: 'Fast response', href: WHATSAPP, cta: 'Message', external: true },
      { title: 'Email', value: EMAIL, href: `mailto:${EMAIL}`, cta: 'Send', external: false },
      { title: 'Location', value: '100% Remote', href: null, cta: null, external: false },
    ],
    bigCta: 'Message me on WhatsApp',
  },
  es: {
    overline: 'Contacto', title: 'Hablemos de tu proyecto',
    sub: 'Cuéntame qué necesitas. La primera consulta técnica es 100% gratuita y sin compromiso.',
    channels: [
      { title: 'WhatsApp', value: 'Respuesta rápida', href: WHATSAPP, cta: 'Escribir', external: true },
      { title: 'Correo', value: EMAIL, href: `mailto:${EMAIL}`, cta: 'Enviar', external: false },
      { title: 'Ubicación', value: '100% Remoto', href: null, cta: null, external: false },
    ],
    bigCta: 'Escríbeme por WhatsApp',
  },
};

export default function ContactoContent() {
  const { lang } = useLanguage();
  const t = content[lang];

  return (
    <main className="grain bg-pearl relative min-h-screen text-[#0b0b0c] selection:bg-[#db1f2e]/20">
      <Navbar />

      <div className="laser-line pointer-events-none fixed left-8 top-0 z-30 hidden h-full w-px lg:block" />

      <section className="relative overflow-hidden px-4 pt-36 pb-28 md:pt-44">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_40%_at_50%_-5%,rgba(219,31,46,0.10),transparent_60%)]" />
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-[#db1f2e]">{t.overline}</p>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{t.title}</h1>
          <p className="mt-6 text-lg text-[#56565d] md:text-xl">{t.sub}</p>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {t.channels.map((c, i) => {
              const Icon = channelIcons[i];
              return (
                <div key={c.title} className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-black/[0.08] bg-white/70 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-black/15 hover:bg-white/85">
                  <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-black/10 bg-white text-[#db1f2e]">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-[#0b0b0c]">{c.title}</h3>
                  <p className="mt-1 mb-4 flex-1 text-sm text-[#56565d]">{c.value}</p>
                  {c.href && (
                    <a
                      href={c.href}
                      {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="inline-flex items-center justify-center rounded-full bg-[#0b0b0c] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#db1f2e]"
                    >
                      {c.cta}
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-12">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#db1f2e] px-10 py-4 text-lg font-semibold text-white shadow-[0_0_30px_rgba(219,31,46,0.3)] transition hover:bg-[#ef4444]"
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} /> {t.bigCta}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
