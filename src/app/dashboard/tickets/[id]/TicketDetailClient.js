/** Conversación de un ticket: mensajes y formulario de respuesta. */

'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { addMessageAction } from '@/lib/actions/tickets'
import { ShineCard } from '@/components/ui/shine-card'
import styles from './page.module.css'

export default function TicketDetailClient({ ticket, userId, userName }) {
  const [state, action, pending] = useActionState(
    (prev, formData) => addMessageAction(ticket.id, formData),
    undefined
  )
  const formRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [ticket.messages])

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  const statusColors = {
    open: { bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', label: 'Abierto' },
    in_progress: { bg: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', label: 'En progreso' },
    resolved: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', label: 'Resuelto' },
  }
  const statusInfo = statusColors[ticket.status] || statusColors.open

  return (
    <div>
      <div className={styles.header}>
        <div>
          <div className={styles.breadcrumb}>
            <Link href="/dashboard/tickets">← Tickets</Link>
          </div>
          <h1 className={styles.title}>{ticket.subject}</h1>
          <div className={styles.meta}>
            <span className={styles.status} style={{ background: statusInfo.bg, color: statusInfo.color }}>
              {statusInfo.label}
            </span>
            <span className={styles.priority}>
              {ticket.priority === 'high' ? 'Alta prioridad' : ticket.priority === 'medium' ? 'Prioridad media' : 'Prioridad baja'}
            </span>
            <span className={styles.date}>
              Creado {new Date(ticket.createdAt).toLocaleDateString('es-CO', { dateStyle: 'long' })}
            </span>
          </div>
        </div>
      </div>

      <ShineCard className={`glass ${styles.messagesCard}`} shineColor="#6366f1,#a855f7,#6366f1" duration={12} borderWidth={1.5}>
        <div className={styles.messages}>
          {ticket.messages.map(msg => (
            <div key={msg.id} className={`${styles.message} ${msg.isStaff ? styles.staff : styles.client}`}>
              <div className={styles.messageHeader}>
                <span className={styles.messageUser}>{msg.userName}</span>
                {msg.isStaff && <span className={styles.staffBadge}>Soporte</span>}
                <span className={styles.messageTime}>
                  {new Date(msg.createdAt).toLocaleDateString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <p className={styles.messageText}>{msg.text}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {ticket.status !== 'resolved' && (
          <form ref={formRef} action={action} className={styles.replyForm}>
            <textarea
              name="text"
              placeholder="Escribe tu mensaje..."
              rows={3}
              required
              className={styles.replyInput}
            />
            {state?.errors?.text && <p className={styles.error}>{state.errors.text[0]}</p>}
            <button type="submit" disabled={pending} className={styles.replyBtn}>
              {pending ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        )}
      </ShineCard>
    </div>
  )
}
