'use server'

import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/session'
import { requestEarlyPayment } from '@/lib/db'

export async function requestEarlyPaymentAction(formData) {
  const session = await requireAuth()
  const paymentId = Number(formData.get('paymentId'))
  await requestEarlyPayment(paymentId, session.userId)
  revalidatePath('/dashboard/payments')
}
