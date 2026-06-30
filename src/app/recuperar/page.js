import Link from 'next/link'
import ForgetForm from './ForgetForm'
import styles from './page.module.css'

export default function RecuperarPage() {
  return (
    <main className={styles.container}>
      <div className={`glass ${styles.card}`}>
        <Link href="/login" className={styles.backLink}>← Volver al login</Link>
        <h1 className={styles.title}>Recuperar contraseña</h1>
        <p className={styles.subtitle}>
          Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
        </p>
        <ForgetForm />
      </div>
    </main>
  )
}
