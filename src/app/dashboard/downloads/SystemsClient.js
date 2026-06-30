'use client'

import Link from 'next/link'
import { Package, Monitor, Globe, Download, ArrowUpRight } from 'lucide-react'
import { ShineCard } from '@/components/ui/shine-card'
import styles from './page.module.css'

export default function SystemsClient({ systems, allDownloads }) {
  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Descargas</h1>
          <p className={styles.subtitle}>Tus aplicaciones y sus actualizaciones</p>
        </div>
      </div>

      {systems.length === 0 ? (
        <ShineCard className={`glass ${styles.empty}`}>
          <p>No tienes sistemas asignados aún.</p>
        </ShineCard>
      ) : (
        <div className={styles.list}>
          {systems.map(system => {
            const sysDownloads = allDownloads.filter(d => d.systemId === system.id)
            return (
              <ShineCard key={system.id} className={`glass ${styles.card}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.projectIcon}>
                    <Package size={22} strokeWidth={1.5} />
                  </div>
                  <div className={styles.cardInfo}>
                    <h3>{system.name}</h3>
                    <p className={styles.desc}>{system.description}</p>
                    <div className={styles.meta}>
                      <span className={styles.version}>v{system.version}</span>
                      <span className={system.type === 'desktop' ? styles.badgeDesktop : styles.badgeOnline}>
                        {system.type === 'desktop'
                          ? <><Monitor size={13} strokeWidth={1.75} /> Escritorio</>
                          : <><Globe size={13} strokeWidth={1.75} /> Web</>}
                      </span>
                    </div>
                  </div>
                  <div className={styles.actionArea}>
                    {system.type === 'online' && system.externalUrl ? (
                      <a
                        href={system.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.openBtn}
                      >
                        Abrir Sistema <ArrowUpRight size={16} strokeWidth={2} />
                      </a>
                    ) : system.type === 'desktop' && system.externalUrl ? (
                      <a
                        href={system.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadBtn}
                      >
                        <Download size={16} strokeWidth={2} /> Descargar v{system.version}
                      </a>
                    ) : (
                      sysDownloads.length > 0 && (
                        <Link href={`/api/downloads/${sysDownloads[0].id}`} className={styles.downloadBtn}>
                          <Download size={16} strokeWidth={2} /> Descargar v{system.version}
                        </Link>
                      )
                    )}
                  </div>
                </div>

                {/* Historial de descargas (solo desktop) */}
                {system.type === 'desktop' && sysDownloads.length > 0 && (
                  <div className={styles.downloadHistory}>
                    <h4>Historial de versiones</h4>
                    {sysDownloads.map(d => (
                      <div key={d.id} className={styles.downloadItem}>
                        <div className={styles.dlInfo}>
                          <span className={styles.dlName}>{d.name}</span>
                          <span className={styles.dlMeta}>{d.fileSize}</span>
                        </div>
                        <span className={styles.dlDate}>{new Date(d.createdAt).toLocaleDateString('es-CO')}</span>
                        <Link href={`/api/downloads/${d.id}`} className={styles.dlBtn}>
                          Descargar
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </ShineCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
