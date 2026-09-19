/** Listado del blog (/blog). Los artículos están en posts.js. */

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { posts } from './posts';

export const metadata = {
  title: 'Blog | Ducklab',
  description: 'Ideas y consejos para sacarle provecho a la tecnología en tu negocio.',
};

export default function Blog() {
  return (
    <main className="grain bg-pearl relative min-h-screen text-[#0b0b0c] selection:bg-[#db1f2e]/20">
      <Navbar />

      <div className="laser-line pointer-events-none fixed left-8 top-0 z-30 hidden h-full w-px lg:block" />

      <section className="relative overflow-hidden px-4 pt-36 pb-24 md:pt-44">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_40%_at_50%_-5%,rgba(219,31,46,0.10),transparent_60%)]" />
        <div className="mx-auto max-w-6xl">
          <SectionTitle tone="light" overline="Blog" title="Ideas y" accent="consejos" subtitle="Aprende a sacarle provecho a la tecnología en tu negocio." />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white/70 shadow-[0_14px_44px_-30px_rgba(0,0,0,0.55)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-black/15 hover:bg-white/85"
              >
                <span className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#db1f2e] transition-transform duration-300 group-hover:scale-x-100" />
                <div className="mb-4 flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-[#db1f2e]/10 px-3 py-1 font-mono uppercase tracking-wider text-[#db1f2e]">{post.tag}</span>
                  <span className="font-mono tracking-wide text-[#9a9aa1]">{post.date} · {post.readTime}</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#0b0b0c] transition-colors group-hover:text-[#db1f2e]">{post.title}</h3>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-[#56565d]">{post.excerpt}</p>
                <span className="text-sm font-semibold text-[#db1f2e]">Leer más →</span>
              </Link>
            ))}
          </div>
          <p className="mt-12 text-center text-sm text-[#56565d]">Pronto más artículos. ¿Tienes una duda técnica? Escríbeme y la convertimos en un post.</p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
