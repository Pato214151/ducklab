/** Pantalla de error cuando falla el layout raíz (último recurso). */

'use client'

// Red de seguridad de último recurso: captura errores incluso en el layout raíz.
export default function GlobalError({ error, reset }) {
  return (
    <html lang="es" className="dark">
      <body style={{ background: '#0a0a0a', color: '#fff', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
        <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '3rem' }}>😕</div>
          <h1 style={{ marginTop: '1rem', fontSize: '1.6rem', fontWeight: 700 }}>Algo salió mal</h1>
          <p style={{ marginTop: '0.75rem', maxWidth: '28rem', color: '#a1a1aa' }}>
            Tu información está segura. Fue un problema temporal nuestro. Intenta de nuevo.
          </p>
          <button
            onClick={() => reset()}
            style={{ marginTop: '2rem', borderRadius: '9999px', background: '#dc2626', color: '#fff', border: 'none', padding: '0.75rem 1.75rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  )
}
