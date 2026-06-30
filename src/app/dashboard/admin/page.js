import { redirect } from 'next/navigation'
import { getAdminOverview } from '@/lib/db'
import { requireAdmin } from '@/lib/session'
import Link from 'next/link'
import { ShineCard } from '@/components/ui/shine-card'
import { Users, CircleCheck, CircleAlert, LifeBuoy, Monitor, Globe } from 'lucide-react'
import AutoRefresh from '@/components/AutoRefresh'
import styles from './page.module.css'

export default async function AdminPage() {
  const session = await requireAdmin()
  const overview = await getAdminOverview()

  return (
    <div>
      <AutoRefresh seconds={20} />
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel Admin</h1>
          <p className={styles.subtitle}>Monitoreo general de todos los sistemas · se actualiza solo</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <ShineCard className={`glass ${styles.statCard}`}>
          <div className={styles.statIcon}><Users size={22} strokeWidth={1.5} /></div>
          <div className={styles.statInfo}>
            <h3>{overview.totalClients}</h3>
            <p>Clientes activos</p>
          </div>
        </ShineCard>
        <ShineCard className={`glass ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.green}`}><CircleCheck size={22} strokeWidth={1.5} /></div>
          <div className={styles.statInfo}>
            <h3>{overview.systemsOnline}</h3>
            <p>Sistemas en línea</p>
          </div>
        </ShineCard>
        <ShineCard className={`glass ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.red}`}><CircleAlert size={22} strokeWidth={1.5} /></div>
          <div className={styles.statInfo}>
            <h3>{overview.systemsError}</h3>
            <p>Sistemas con error</p>
          </div>
        </ShineCard>
        <ShineCard className={`glass ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.yellow}`}><LifeBuoy size={22} strokeWidth={1.5} /></div>
          <div className={styles.statInfo}>
            <h3>{overview.openTickets}</h3>
            <p>Tickets abiertos</p>
          </div>
        </ShineCard>
      </div>

      <div className={styles.sectionGrid}>
        {/* Sistemas */}
        <ShineCard className={`glass ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h2>Sistemas</h2>
          </div>
          <div className={styles.systemList}>
            {overview.systems.map(sys => (
              <Link key={sys.id} href={`/dashboard/admin/systems/${sys.id}`} className={styles.systemCard}>
                <div className={styles.systemTop}>
                  <div className={styles.systemInfo}>
                    <h4>{sys.name}</h4>
                    <span className={styles.clientName}>{sys.clientName}</span>
                  </div>
                  <span className={`${styles.statusDot} ${sys.status === 'online' ? styles.online : sys.status === 'error' ? styles.error : styles.offline}`} />
                </div>
                <div className={styles.systemMeta}>
                  <span>v{sys.version}</span>
                  <span className={sys.type === 'desktop' ? styles.badgeDesktop : styles.badgeOnline}>
                    {sys.type === 'desktop'
                      ? <><Monitor size={12} strokeWidth={1.75} /> Escritorio</>
                      : <><Globe size={12} strokeWidth={1.75} /> Web</>}
                  </span>
                  {sys.errorCount > 0 && <span className={styles.errorBadge}>{sys.errorCount} errores</span>}
                  {sys.ticketCount > 0 && <span className={styles.ticketBadge}>{sys.ticketCount} tickets</span>}
                </div>
                <div className={styles.systemFooter}>
                  {sys.lastHeartbeat ? (
                    <span className={styles.heartbeat}>
                      Último heartbeat: {new Date(sys.lastHeartbeat).toLocaleString('es-CO')}
                    </span>
                  ) : (
                    <span className={styles.noData}>Sin heartbeat</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </ShineCard>

        {/* Errores recientes */}
        <ShineCard className={`glass ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h2>Errores Recientes</h2>
          </div>
          {overview.recentErrors.length === 0 ? (
            <p className={styles.emptyText}>No hay errores sin resolver</p>
          ) : (
            <div className={styles.errorList}>
              {overview.recentErrors.map(err => (
                <div key={err.id} className={styles.errorItem}>
                  <div className={styles.errorHeader}>
                    <span className={`${styles.errorLevel} ${styles[`level${err.level}`]}`}>
                      {err.level}
                    </span>
                    <span className={styles.errorTime}>{new Date(err.loggedAt).toLocaleString('es-CO')}</span>
                  </div>
                  <p className={styles.errorMsg}>{err.message}</p>
                  {err.stacktrace && (
                    <pre className={styles.stacktrace}>{err.stacktrace}</pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </ShineCard>

        {/* Tickets pendientes */}
        <ShineCard className={`glass ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h2>Tickets Pendientes</h2>
            <Link href="/dashboard/tickets" className={styles.viewAll}>Ver todos</Link>
          </div>
          {!overview.pendingTickets || overview.pendingTickets.length === 0 ? (
            <p className={styles.emptyText}>No hay tickets abiertos</p>
          ) : (
            <div className={styles.ticketList}>
              {overview.pendingTickets.map(ticket => (
                <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className={styles.systemCard}>
                  <div className={styles.systemTop}>
                    <div className={styles.systemInfo}>
                      <h4>{ticket.subject}</h4>
                      <span className={styles.clientName}>{ticket.clientName}</span>
                    </div>
                    <span className={`${styles.errorLevel} ${styles[`level${ticket.priority}`] || ''}`}>
                      {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Media' : 'Baja'}
                    </span>
                  </div>
                  <div className={styles.systemFooter}>
                    <span className={styles.heartbeat}>
                      {ticket.status === 'open' ? 'Abierto' : 'En progreso'} · {new Date(ticket.updatedAt).toLocaleDateString('es-CO')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </ShineCard>
      </div>
    </div>
  )
}
