/** Título de sección reutilizable (etiqueta + título + subtítulo). */

export default function SectionTitle({ overline, title, accent, subtitle, tone = 'dark' }) {
  const light = tone === 'light';
  return (
    <div className="mb-14 text-center">
      {overline && (
        <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.35em] text-[#db1f2e]">
          {overline}
        </p>
      )}
      <h2
        className={`text-4xl font-bold tracking-tight md:text-5xl ${
          light ? 'text-[#0b0b0c]' : 'text-white'
        }`}
      >
        {title} {accent && <span className="text-[#db1f2e]">{accent}</span>}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-lg ${light ? 'text-[#56565d]' : 'text-gray-400'}`}>{subtitle}</p>
      )}
    </div>
  );
}
