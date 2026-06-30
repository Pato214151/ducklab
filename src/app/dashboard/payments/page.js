import { requireAuth } from '@/lib/session'
import { getPaymentsByClient } from '@/lib/db'
import { requestEarlyPaymentAction } from '@/lib/actions/payments'
import { ShineCard } from '@/components/ui/shine-card'
import { Check } from 'lucide-react'
import styles from './page.module.css'

export default async function PaymentsPage() {
  const session = await requireAuth()
  const payments = await getPaymentsByClient(session.userId)

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pagos</h1>
          <p className={styles.subtitle}>Historial de facturación</p>
        </div>
        <div className={styles.totalBadge}>
          Total pagado: <strong>${totalPaid.toLocaleString('es-CO')} COP</strong>
        </div>
      </div>

      {payments.length === 0 ? (
        <ShineCard className={`glass ${styles.empty}`}>
          <p>No hay pagos registrados.</p>
        </ShineCard>
      ) : (
        <div className={styles.list}>
          {payments.map(payment => (
            <ShineCard key={payment.id} className={`glass ${styles.card}`}>
              <div className={styles.cardLeft}>
                <h3>{payment.plan}</h3>
                <p className={styles.amount}>${(payment.amount || 0).toLocaleString('es-CO')} COP</p>
                <span className={payment.status === 'paid' ? styles.paid : styles.pending}>
                  {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
              <div className={styles.cardRight}>
                <p className={styles.dueDate}>
                  {payment.status === 'paid' ? 'Pagado el' : 'Vence el'}: {new Date(payment.dueDate).toLocaleDateString('es-CO')}
                </p>
                {payment.method && <p className={styles.method}>{payment.method}</p>}
                {payment.invoice && <p className={styles.invoice}>Factura: {payment.invoice}</p>}
                {payment.status === 'pending' && (
                  payment.earlyRequested ? (
                    <span className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-400">
                      <Check size={14} strokeWidth={2.5} /> Adelanto solicitado
                    </span>
                  ) : (
                    <form action={requestEarlyPaymentAction}>
                      <input type="hidden" name="paymentId" value={payment.id} />
                      <button type="submit" className="mt-2 inline-flex items-center justify-center rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500">
                        Adelantar pago
                      </button>
                    </form>
                  )
                )}
              </div>
            </ShineCard>
          ))}
        </div>
      )}
    </div>
  )
}
