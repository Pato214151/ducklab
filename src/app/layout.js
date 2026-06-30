import './globals.css';
import { Inter, Sora, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Ducklab | Desarrollo de Software a Medida',
  description: 'Sistemas POS, aplicaciones de escritorio, plataformas web y automatización con IA. Software a medida diseñado, construido y mantenido para tu negocio en Colombia.',
  keywords: ['software a medida', 'sistema POS', 'desarrollo web', 'apps de escritorio', 'Colombia', 'Ducklab'],
  openGraph: {
    title: 'Ducklab | Desarrollo de Software a Medida',
    description: 'Sistemas POS, apps de escritorio, plataformas web y automatización con IA. Hecho a tu medida.',
    siteName: 'Ducklab',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ducklab | Desarrollo de Software a Medida',
    description: 'Sistemas POS, apps de escritorio, plataformas web y automatización con IA.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`dark ${inter.variable} ${sora.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
