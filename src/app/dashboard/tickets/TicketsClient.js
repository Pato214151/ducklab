/** Lista de tickets del cliente y botón para abrir uno nuevo. */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, X } from 'lucide-react'
import NewTicketForm from './NewTicketForm'
import { ShineCard } from '@/components/ui/shine-card'
import styles from './page.module.css'

export default function TicketsClient({ tickets }) {
  const [showNew, setShowNew] = useState(false)

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Soporte</h1>
          <p className={styles.subtitle}>Tus tickets y solicitudes</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowNew(true)}>
          <Plus size={16} strokeWidth={2.5} /> Nuevo Ticket
        </button>
      </div>

      {showNew && (
        <div className={styles.modalOverlay} onClick={() => setShowNew(false)}>
          <ShineCard className={`glass ${styles.modal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nuevo Ticket</h2>
              <button className={styles.modalClose} onClick={() => setShowNew(false)} aria-label="Cerrar"><X size={20} strokeWidth={1.75} /></button>
            </div>
            <NewTicketForm onClose={() => setShowNew(false)} />
          </ShineCard>
        </div>
      )}

      {tickets.length === 0 ? (
        <ShineCard className={`glass ${styles.empty}`}>
          <p>No tienes tickets. Crea uno para recibir soporte.</p>
        </ShineCard>
      ) : (
        <div className={styles.list}>
          {tickets.map(ticket => (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className={`glass ${styles.ticketCard}`}>
              <div className={styles.ticketHeader}>
                <h3>{ticket.subject}</h3>
                <span className={`${styles.status} ${styles[`status${ticket.status}`]}`}>
                  {ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En progreso' : 'Resuelto'}
                </span>
              </div>
              <p className={styles.ticketDesc}>{ticket.description}</p>
              <div className={styles.ticketFooter}>
                <span className={`${styles.priority} ${styles[`priority${ticket.priority}`]}`}>
                  {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                </span>
                <span className={styles.messageCount}>{ticket.messages.length} mensajes</span>
                <span className={styles.ticketDate}>{new Date(ticket.updatedAt).toLocaleDateString('es-CO')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
