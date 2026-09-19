/** Componente invisible que refresca los datos de la página cada N segundos. */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Refresca los datos del server component cada N segundos, sin recargar la página.
export default function AutoRefresh({ seconds = 20 }) {
  const router = useRouter()
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000)
    return () => clearInterval(id)
  }, [router, seconds])
  return null
}
