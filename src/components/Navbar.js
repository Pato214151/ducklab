'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import DuckMark from '@/components/DuckMark';
import { useLanguage } from '@/lib/LanguageContext';

const navLinksByLang = {
  en: [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/demo' },
    { name: 'Pricing', href: '/planes' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contacto' },
  ],
  es: [
    { name: 'Inicio', href: '/' },
    { name: 'Cómo Funciona', href: '/demo' },
    { name: 'Precios', href: '/planes' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contacto', href: '/contacto' },
  ],
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { lang, toggleLang } = useLanguage();
  const navLinks = navLinksByLang[lang];
  const portalLabel = lang === 'es' ? 'Portal Clientes' : 'Client Portal';
  // Las páginas públicas usan fondo perla (tema claro); login/portal son oscuras.
  const light = ['/', '/planes', '/blog', '/contacto', '/demo'].includes(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? light
            ? 'border-b border-black/[0.08] bg-[#ececed]/85 backdrop-blur-md'
            : 'border-b border-white/10 bg-black/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-700 shadow-[0_4px_14px_-4px_rgba(219,31,46,0.5)]">
              <DuckMark className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${light ? 'text-[#0b0b0c]' : 'text-white'}`}>
              Duck<span className="text-[#db1f2e]">lab</span>
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              const base = light
                ? active ? 'text-[#0b0b0c]' : 'text-[#56565d] hover:text-[#0b0b0c]'
                : active ? 'text-white' : 'text-gray-300 hover:text-white';
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`group relative text-sm font-medium transition-colors ${base}`}
                >
                  {link.name}
                  <span className={`absolute -bottom-1 left-0 h-[2px] bg-[#db1f2e] transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              );
            })}
            <button
              onClick={toggleLang}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide transition ${
                light ? 'border-black/15 text-[#56565d] hover:border-black/30 hover:text-[#0b0b0c]' : 'border-white/20 text-gray-300 hover:text-white'
              }`}
              aria-label="Switch language"
            >
              {lang === 'en' ? 'ES' : 'EN'}
            </button>
            <Link
              href="/login"
              className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              {portalLabel}
            </Link>
          </div>

          {/* Mobile button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`transition-colors lg:hidden ${light ? 'text-[#0b0b0c] hover:text-[#db1f2e]' : 'text-gray-300 hover:text-white'}`}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`absolute left-0 top-20 w-full overflow-hidden border-b backdrop-blur-xl transition-all duration-300 lg:hidden ${
          light ? 'border-black/[0.08] bg-[#e9e9ec]/95' : 'border-white/10 bg-black/95'
        } ${mobileMenuOpen ? 'max-h-[400px] py-4' : 'max-h-0 py-0'}`}
      >
        <div className="flex flex-col gap-4 px-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-lg font-medium transition-colors ${
                pathname === link.href
                  ? 'text-[#db1f2e]'
                  : light ? 'text-[#56565d] hover:text-[#0b0b0c]' : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className={`flex items-center justify-between border-t pt-4 ${light ? 'border-black/[0.08]' : 'border-white/10'}`}>
            <span className={`text-sm font-medium ${light ? 'text-[#56565d]' : 'text-gray-300'}`}>{lang === 'en' ? 'Language' : 'Idioma'}</span>
            <button
              onClick={toggleLang}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wide transition ${
                light ? 'border-black/15 text-[#56565d] hover:border-black/30 hover:text-[#0b0b0c]' : 'border-white/20 text-gray-300 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'ES' : 'EN'}
            </button>
          </div>
          <div className={`border-t pt-4 ${light ? 'border-black/[0.08]' : 'border-white/10'}`}>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full rounded-full bg-red-600 px-5 py-2.5 text-center font-semibold text-white transition hover:bg-red-500"
            >
              {portalLabel}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
