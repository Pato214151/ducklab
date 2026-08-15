import './globals.css';
import { Inter, Sora, JetBrains_Mono } from 'next/font/google';
import { LanguageProvider } from '@/lib/LanguageContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const sora = Sora({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-display', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Ducklab | Custom Software Development',
  description: 'POS systems, desktop apps, web platforms and AI automation. Custom software designed, built and maintained for your business.',
  keywords: ['custom software', 'POS system', 'web development', 'desktop apps', 'restaurant software', 'Ducklab'],
  openGraph: {
    title: 'Ducklab | Custom Software Development',
    description: 'POS systems, desktop apps, web platforms and AI automation. Built to your exact needs.',
    siteName: 'Ducklab',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ducklab | Custom Software Development',
    description: 'POS systems, desktop apps, web platforms and AI automation.',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${sora.variable} ${jetbrains.variable}`}>
      <body className="font-sans antialiased">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
