/** Artículo del blog (/blog/:slug). Se genera estático en el build. */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { posts, getPost } from '../posts';

/** Lista los slugs para pre-generar cada artículo. */
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Artículo | Ducklab' };
  return {
    title: `${post.title} | Ducklab`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <main className="grain relative min-h-screen bg-[#e9e9ec] text-[#0b0b0c] selection:bg-[#db1f2e]/20">
      <Navbar />

      <div className="laser-line pointer-events-none fixed left-8 top-0 z-30 hidden h-full w-px lg:block" />

      <article className="relative overflow-hidden px-4 pt-36 pb-24 md:pt-44">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_45%_40%_at_50%_-5%,rgba(219,31,46,0.10),transparent_60%)]" />
        <div className="mx-auto max-w-2xl">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#56565d] transition hover:text-[#db1f2e]">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Volver al blog
          </Link>

          <div className="mt-8 mb-4 flex items-center gap-3 text-xs">
            <span className="rounded-full bg-[#db1f2e]/10 px-3 py-1 font-mono uppercase tracking-wider text-[#db1f2e]">{post.tag}</span>
            <span className="font-mono tracking-wide text-[#9a9aa1]">{post.date} · {post.readTime} de lectura</span>
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-[#3f3f46]">{post.intro}</p>

          <div className="mt-10 space-y-5">
            {post.body.map((block, i) => {
              if (block.h) {
                return <h2 key={i} className="pt-4 text-xl font-bold text-[#0b0b0c]">{block.h}</h2>;
              }
              if (block.ul) {
                return (
                  <ul key={i} className="space-y-2.5">
                    {block.ul.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-[#56565d]">
                        <Check className="mt-1 h-4 w-4 shrink-0 text-[#db1f2e]" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return <p key={i} className="text-[15px] leading-relaxed text-[#56565d]">{block.p}</p>;
            })}
          </div>

          {/* CTA */}
          <div className="mt-14 rounded-2xl border border-black/[0.08] bg-white/60 p-8 text-center">
            <h3 className="text-xl font-bold text-[#0b0b0c]">¿Hablamos de tu negocio?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#56565d]">
              La primera consulta técnica es gratuita. Cuéntame qué necesitas y vemos cómo la tecnología te ayuda.
            </p>
            <Link
              href="/contacto"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[#0b0b0c] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#db1f2e]"
            >
              Escríbeme
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </main>
  );
}
