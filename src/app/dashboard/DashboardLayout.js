'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Monitor, Download, LifeBuoy, CreditCard, Settings, Wrench, ScrollText, X, PanelLeftClose, PanelLeftOpen, LogOut, Menu } from 'lucide-react'
import DuckMark from '@/components/DuckMark'
import styles from './DashboardLayout.module.css'

const commonNav = [
  { href: '/dashboard', label: 'Inicio', Icon: LayoutDashboard },
  { href: '/dashboard/sistemas', label: 'Mis Sistemas', Icon: Monitor },
  { href: '/dashboard/downloads', label: 'Descargas', Icon: Download },
  { href: '/dashboard/tickets', label: 'Soporte', Icon: LifeBuoy },
  { href: '/dashboard/payments', label: 'Pagos', Icon: CreditCard },
]

const adminNav = [
  { href: '/dashboard/admin', label: 'Panel Admin', Icon: Settings },
  { href: '/dashboard/admin/gestion', label: 'Gestión', Icon: Wrench },
  { href: '/dashboard/admin/auditoria', label: 'Auditoría', Icon: ScrollText },
]

export default function DashboardLayout({ children, user }) {
  const navItems = [...commonNav, ...(user?.role === 'admin' ? adminNav : [])]
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false) // off-canvas en móvil
  const [collapsed, setCollapsed] = useState(false)      // riel de iconos en escritorio

  // Recordar la preferencia de colapso entre sesiones.
  useEffect(() => {
    if (typeof window === 'undefined') return
    setCollapsed(localStorage.getItem('ducklab.sidebar') === 'collapsed')
  }, [])

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev
      try { localStorage.setItem('ducklab.sidebar', next ? 'collapsed' : 'open') } catch {}
      return next
    })
  }

  const handleLogout = async () => {
    if (!window.confirm('¿Seguro que quieres cerrar sesión?')) return
    const { logout } = await import('@/lib/actions/auth')
    logout()
  }

  return (
    <div className={`${styles.layout} ${collapsed ? styles.layoutCollapsed : ''}`}>
      {/* Overlay (móvil) */}
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''} ${collapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo} title="Ducklab">
            <span className={styles.logoBadge}>
              <DuckMark className="h-5 w-5 text-white" />
            </span>
            <span className={styles.logoText}>Duck<span className={styles.logoAccent}>lab</span></span>
          </Link>
          {/* Colapsar (escritorio) */}
          <button className={styles.collapseBtn} onClick={toggleCollapse} aria-label={collapsed ? 'Expandir panel' : 'Ocultar panel'} title={collapsed ? 'Expandir panel' : 'Ocultar panel'}>
            {collapsed ? <PanelLeftOpen className="h-5 w-5" strokeWidth={1.5} /> : <PanelLeftClose className="h-5 w-5" strokeWidth={1.5} />}
          </button>
          {/* Cerrar (móvil) */}
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={() => setSidebarOpen(false)}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>
                  <item.Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{user?.name?.charAt(0) || 'U'}</div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.name || 'Usuario'}</p>
              <p className={styles.userPlan}>{user?.plan || (user?.role === 'admin' ? 'Administrador' : 'Cliente')}</p>
            </div>
          </div>
          <form action={handleLogout}>
            <button type="submit" className={styles.logoutBtn} title="Cerrar sesión">
              <LogOut className="h-4 w-4" strokeWidth={1.75} />
              <span className={styles.navLabel}>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Contenido */}
      <div className={styles.main}>
        {/* Barra superior (móvil) */}
        <header className={styles.topBar}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          </button>
          <Link href="/" className={styles.mobileLogo}>
            <span className={styles.logoBadge}>
              <DuckMark className="h-5 w-5 text-white" />
            </span> Duck<span className={styles.logoAccent}>lab</span>
          </Link>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}
