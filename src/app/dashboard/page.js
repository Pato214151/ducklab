/** Inicio del dashboard del cliente: resumen de descargas, tickets y plan. */

import { requireAuth } from '@/lib/session'
import { getUserById, getDownloadsByClient, getTicketsByClient } from '@/lib/db'
import { ShineCard } from '@/components/ui/shine-card'
import { Download, LifeBuoy, Clock, CalendarDays } from 'lucide-react'
import styles from './page.module.css'
import Link from 'next/link'

export default async function DashboardHome() {
  const session = await requireAuth()
  const user = await getUserById(session.userId)
  const downloads = await getDownloadsByClient(session.userId)
  const tickets = await getTicketsByClient(session.userId)

  const openTickets = tickets.filter(t => t.status !== 'resolved').length
  const lastDownload = downloads[0]

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bienvenido, {user?.name?.split(' ')[0] || 'Usuario'}</h1>
          <p className={styles.subtitle}>Panel de control de tu cuenta</p>
        </div>
        <div className={styles.headerBadge}>
          Plan <strong>{user?.plan || 'Personalizado'}</strong>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <ShineCard className={`glass ${styles.statCard}`}>
          <div className={styles.statIcon}><Download size={22} strokeWidth={1.5} /></div>
          <div className={styles.statInfo}>
            <h3>{downloads.length}</h3>
            <p>Actualizaciones disponibles</p>
          </div>
        </ShineCard>
        <ShineCard className={`glass ${styles.statCard}`}>
          <div className={styles.statIcon}><LifeBuoy size={22} strokeWidth={1.5} /></div>
          <div className={styles.statInfo}>
            <h3>{openTickets}</h3>
            <p>Tickets activos</p>
          </div>
        </ShineCard>
        <ShineCard className={`glass ${styles.statCard}`}>
          <div className={styles.statIcon}><Clock size={22} strokeWidth={1.5} /></div>
          <div className={styles.statInfo}>
            <h3>{user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('es-CO') : 'Hoy'}</h3>
            <p>Última conexión</p>
          </div>
        </ShineCard>
        <ShineCard className={`glass ${styles.statCard}`}>
          <div className={styles.statIcon}><CalendarDays size={22} strokeWidth={1.5} /></div>
          <div className={styles.statInfo}>
            <h3>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO') : 'N/A'}</h3>
            <p>Cliente desde</p>
          </div>
        </ShineCard>
      </div>

      <div className={styles.sectionGrid}>
        {lastDownload && (
          <ShineCard className={`glass ${styles.section}`}>
            <div className={styles.sectionHeader}>
              <h2>Última Actualización</h2>
              <Link href="/dashboard/downloads" className={styles.viewAll}>Ver todas</Link>
            </div>
            <div className={styles.downloadItem}>
              <div className={styles.downloadInfo}>
                <h4>{lastDownload.name}</h4>
                <p className={styles.downloadDesc}>{lastDownload.description}</p>
                <span className={styles.downloadMeta}>{lastDownload.version} · {lastDownload.fileSize}</span>
              </div>
            </div>
          </ShineCard>
        )}

        {tickets.length > 0 && (
          <ShineCard className={`glass ${styles.section}`}>
            <div className={styles.sectionHeader}>
              <h2>Tickets Recientes</h2>
              <Link href="/dashboard/tickets" className={styles.viewAll}>Ver todos</Link>
            </div>
            {tickets.slice(0, 3).map(ticket => (
              <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className={styles.ticketItem}>
                <div className={styles.ticketInfo}>
                  <h4>{ticket.subject}</h4>
                  <span className={`${styles.status} ${styles[`status${ticket.status}`]}`}>
                    {ticket.status === 'open' ? 'Abierto' : ticket.status === 'in_progress' ? 'En progreso' : 'Resuelto'}
                  </span>
                </div>
                <span className={styles.ticketDate}>{new Date(ticket.updatedAt).toLocaleDateString('es-CO')}</span>
              </Link>
            ))}
          </ShineCard>
        )}

        <ShineCard className={`glass ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h2>Mis Sistemas</h2>
            <Link href="/dashboard/sistemas" className={styles.viewAll}>Ver todos</Link>
          </div>
          <div className={styles.downloadItem}>
            <div className={styles.downloadInfo}>
              <h4>Accede a tus sistemas</h4>
              <p className={styles.downloadDesc}>Abre tu sistema o página web y revisa su estado en tiempo real.</p>
            </div>
          </div>
        </ShineCard>
      </div>
    </div>
  )
}
