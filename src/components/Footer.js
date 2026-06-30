import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import DuckMark from '@/components/DuckMark';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 relative overflow-hidden">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent shadow-[0_0_30px_rgba(239,68,68,0.3)]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <DuckMark className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Duck<span className="text-[#db1f2e]">lab</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Desarrollo de software profesional en Colombia. Transformamos ideas complejas en soluciones digitales elegantes y eficientes.
            </p>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Servicios</h4>
            <ul className="space-y-3">
              {['Desarrollo Web', 'Sistemas POS', 'Apps de Escritorio', 'Automatización IA'].map((item) => (
                <li key={item}>
                  <Link href="/#servicios" className="text-gray-400 hover:text-red-400 transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Legal</h4>
            <ul className="space-y-3">
              {[
                { label: 'Términos y Condiciones', href: '/legal/terminos' },
                { label: 'Política de Privacidad', href: '/legal/privacidad' },
                { label: 'Política de Cookies', href: '/legal/cookies' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-gray-400 hover:text-red-400 transition-colors text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide">Contacto</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-red-500" strokeWidth={1.5} /> jramirezramirez2005@gmail.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-red-500" strokeWidth={1.5} /> +57 320 318 2862
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-red-500" strokeWidth={1.5} /> Colombia
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Ducklab. Todos los derechos reservados.
          </p>
          <div className="flex space-x-4">
            <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold tracking-wide text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-all">
              GH
            </a>
            <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold tracking-wide text-gray-400 hover:bg-red-500/20 hover:text-red-500 transition-all">
              IN
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
