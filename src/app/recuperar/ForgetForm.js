'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from '@/lib/actions/auth'
import styles from './page.module.css'

export default function ForgetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)

  return (
    <form action={action} className={styles.form}>
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

      {state?.message && <p className={state.success ? styles.success : styles.error}>{state.message}</p>}

      {state?.devLink && (
        <div className={styles.devBox}>
          <strong>🔧 Modo desarrollo:</strong>
          <a href={state.devLink} className={styles.devLink}>{state.devLink}</a>
        </div>
      )}

      <button
        type="submit"
        className={`btn-primary ${styles.submitBtn} ${pending ? styles.loading : ''}`}
        disabled={pending}
      >
        {pending ? 'Enviando...' : 'Enviar instrucciones'}
      </button>
    </form>
  )
}
