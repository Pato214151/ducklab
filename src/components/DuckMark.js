// Mascota de Ducklab — patito minimalista (silueta flotante).
// El cuerpo usa currentColor (normalmente blanco dentro del badge rojo);
// el ojo es un punto rojo oscuro que recorta sobre el cuerpo.
export default function DuckMark({ className = 'h-6 w-6', eye = '#8a1212' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <ellipse cx="12.6" cy="15.4" rx="7.6" ry="4.2" fill="currentColor" />
      <circle cx="8.4" cy="9.4" r="4.5" fill="currentColor" />
      <path d="M12 7.7 L18.6 8.4 c0.9 0.1 0.9 1.3 0 1.4 L12 10.7 Z" fill="currentColor" />
      <circle cx="9.7" cy="8.6" r="1.05" fill={eye} />
    </svg>
  );
}
