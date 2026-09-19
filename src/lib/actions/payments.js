/** Server Action de pagos: el cliente pide pagar una cuota antes de tiempo. */

'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/session'
import { requestEarlyPayment } from '@/lib/db'

/** Marca la cuota como "pago anticipado solicitado". */
export async function requestEarlyPaymentAction(formData) {
  const session = await requireAuth()
  const paymentId = Number(formData.get('paymentId'))
  await requestEarlyPayment(paymentId, session.userId)
  revalidatePath('/dashboard/payments')
}
