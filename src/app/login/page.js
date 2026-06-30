import Link from 'next/link';
import { Lock, Zap, BarChart3 } from 'lucide-react';
import LoginForm from './LoginForm';
import DuckMark from '@/components/DuckMark';
import styles from './page.module.css';

export const dynamic = 'force-dynamic'

export default function Login() {
  return (
    <main className={styles.loginContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brand} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className={styles.logo} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <DuckMark className="h-6 w-6 text-white" />
            </span>
            <span>Duck<span style={{ color: '#db1f2e' }}>lab</span></span>
          </div>
          <h1 className={styles.tagline}>Tu portal de desarrollo</h1>
          <p className={styles.description}>
            Accede a tus proyectos, descarga actualizaciones, revisa tus pagos y comunícate con soporte directamente.
          </p>
          
          <div className={styles.features}>
            <div className={styles.featurePill} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock className="h-4 w-4" strokeWidth={1.5} /> Seguro
            </div>
            <div className={styles.featurePill} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap className="h-4 w-4" strokeWidth={1.5} /> Rápido
            </div>
            <div className={styles.featurePill} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart3 className="h-4 w-4" strokeWidth={1.5} /> Reportes
            </div>
          </div>
        </div>
        
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
      </div>
      
      <div className={styles.rightPanel}>
        <Link href="/" className={styles.backLink}>← Volver al inicio</Link>
        
        <div className={`glass ${styles.loginCard}`}>
          <h2>Bienvenido de vuelta</h2>
          <p className={styles.subtitle}>Accede a tu portal de cliente</p>
          
          <LoginForm />
          
          <div className={styles.divider}>
            <span>o</span>
          </div>
          
          <Link href="/contacto" className={`btn-secondary ${styles.secondaryBtn}`}>
            Solicitar acceso
          </Link>
        </div>
      </div>
    </main>
  );
}
