'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createTicketAction } from '@/lib/actions/tickets'
import styles from './NewTicket.module.css'

export default function NewTicketForm({ onClose }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createTicketAction, undefined)

  if (state?.success) {
    router.push(`/dashboard/tickets/${state.ticket.id}`)
    return null
  }

  return (
    <form action={action} className={styles.form}>
      <div className={styles.field}>
        <label>Asunto</label>
        <input type="text" name="subject" placeholder="Ej: Error al iniciar el sistema" required />
        {state?.errors?.subject && <p className={styles.error}>{state.errors.subject[0]}</p>}
      </div>

      <div className={styles.field}>
        <label>Prioridad</label>
        <select name="priority" defaultValue="medium">
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>Descripción</label>
        <textarea name="description" rows={5} placeholder="Describe el problema o solicitud en detalle..." required />
        {state?.errors?.description && <p className={styles.error}>{state.errors.description[0]}</p>}
      </div>

      {state?.message && <p className={styles.error}>{state.message}</p>}

      <div className={styles.actions}>
        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancelar</button>
        <button type="submit" disabled={pending} className={styles.submitBtn}>
          {pending ? 'Enviando...' : 'Crear Ticket'}
        </button>
      </div>
    </form>
  )
}
