/** Formulario de login; llama a la Server Action `login` y muestra sus errores. */

'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'
import styles from './page.module.css'

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const searchParams = useSearchParams()
  const resetOk = searchParams.get('reset') === 'ok'

  return (
    <form action={action} className={styles.form}>
      {resetOk && (
        <p className={styles.successMsg}>Contraseña restablecida correctamente. Inicia sesión.</p>
      )}
      <div className={styles.inputGroup}>
        <label>Correo Electrónico</label>
        <input
          type="email"
          name="email"
          placeholder="cliente@empresa.com"
          required
          className={styles.inputField}
        />
        {state?.errors?.email && <p className={styles.error}>{state.errors.email[0]}</p>}
      </div>

      <div className={styles.inputGroup}>
        <div className={styles.passwordHeader}>
          <label>Contraseña</label>
          <Link href="/recuperar" className={styles.forgotLink}>¿Olvidaste tu contraseña?</Link>
        </div>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          required
          className={styles.inputField}
        />
        {state?.errors?.password && <p className={styles.error}>{state.errors.password[0]}</p>}
      </div>

      {state?.message && <p className={styles.error}>{state.message}</p>}

      <button
        type="submit"
        className={`btn-primary ${styles.submitBtn} ${pending ? styles.loading : ''}`}
        disabled={pending}
      >
        {pending ? 'Conectando...' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}
