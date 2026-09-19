/**
 * Página /recuperar/:token: verifica que el enlace siga vigente y muestra
 * el formulario para la nueva contraseña.
 */

import Link from 'next/link'
import { getPasswordResetByToken } from '@/lib/db'
import ResetForm from './ResetForm'
import styles from './page.module.css'

export default async function ResetPage({ params }) {
  const { token } = await params
  const reset = await getPasswordResetByToken(token)
  const valid = !!reset

  return (
    <main className={styles.container}>
      <div className={`glass ${styles.card} ${!valid ? styles.invalidCard : ''}`}>
        {valid ? (
          <>
            <h1 className={styles.title}>Nueva contraseña</h1>
            <p className={styles.subtitle}>Ingresa tu nueva contraseña para acceder al portal.</p>
            <ResetForm token={token} />
          </>
        ) : (
          <>
            <h1 className={styles.title}>Enlace inválido</h1>
            <p className={styles.subtitle}>
              Este enlace de recuperación ha expirado o ya fue utilizado. Solicita uno nuevo.
            </p>
            <Link href="/recuperar" className={styles.retryLink}>Solicitar nuevo enlace</Link>
          </>
        )}
      </div>
    </main>
  )
}
