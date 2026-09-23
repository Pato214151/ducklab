/**
 * Foto de perfil redonda. Si /images/julian.jpg todavía no existe,
 * muestra las iniciales para que la página nunca quede con una imagen rota.
 */

'use client';
import { useEffect, useRef, useState } from 'react';

export default function Avatar({ size = 40, className = '' }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  // Si la imagen falló antes de que React se hidratara, onError no se dispara.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  const box = { width: size, height: size };

  if (failed) {
    return (
      <span
        style={box}
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#ef4444] to-[#7f1d1d] font-bold text-white ${className}`}
      >
        <span style={{ fontSize: size * 0.38 }}>JR</span>
      </span>
    );
  }

  return (
    <img
      ref={ref}
      src="/images/julian.jpg"
      alt="Julian Ramírez"
      style={box}
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
