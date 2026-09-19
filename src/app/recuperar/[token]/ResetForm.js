/** Formulario de nueva contraseña; llama a resetPassword. */

'use client'

import { useActionState } from 'react'
import { resetPassword } from '@/lib/actions/auth'
import styles from './page.module.css'

export default function ResetForm({ token }) {
  const [state, action, pending] = useActionState(resetPassword, undefined)

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="token" value={token} />

      <div className={styles.inputGroup}>
        <label>Nueva Contraseña</label>
        <input
          type="password"
          name="password"
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
          className={styles.inputField}
        />
        {state?.errors?.password && <p className={styles.error}>{state.errors.password}</p>}
      </div>

      <div className={styles.inputGroup}>
        <label>Confirmar Contraseña</label>
        <input
          type="password"
          name="confirmPassword"
          placeholder="Repite la contraseña"
          required
          className={styles.inputField}
        />
        {state?.errors?.confirmPassword && <p className={styles.error}>{state.errors.confirmPassword}</p>}
      </div>

      {state?.errors?.token && <p className={styles.error}>{state.errors.token}</p>}

      <button
        type="submit"
        className={`btn-primary ${styles.submitBtn} ${pending ? styles.loading : ''}`}
        disabled={pending}
      >
        {pending ? 'Restableciendo...' : 'Restablecer contraseña'}
      </button>
    </form>
  )
}
