'use server'

import { revalidatePath } from 'next/cache'
import { TicketSchema, MessageSchema } from '@/lib/definitions'
import { requireAuth } from '@/lib/session'
import { getUserById, createTicket, addMessageToTicket, getTicketById } from '@/lib/db'

export async function createTicketAction(state, formData) {
  const session = await requireAuth()

  const validatedFields = TicketSchema.safeParse({
    subject: formData.get('subject'),
    description: formData.get('description'),
    priority: formData.get('priority'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: null,
      success: false,
    }
  }

  const { subject, description, priority } = validatedFields.data
  const user = await getUserById(session.userId)
  if (!user) return { errors: null, message: 'Usuario no encontrado', success: false }

  const ticket = await createTicket(session.userId, subject, description, priority)
  revalidatePath('/dashboard/tickets')
  return { errors: null, message: null, success: true, ticket }
}

export async function addMessageAction(ticketId, formData) {
  const session = await requireAuth()

  const validatedFields = MessageSchema.safeParse({
    text: formData.get('text'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: null,
      success: false,
    }
  }

  const { text } = validatedFields.data
  const user = await getUserById(session.userId)
  if (!user) return { errors: null, message: 'Usuario no encontrado', success: false }

  const ticket = await getTicketById(ticketId)
  if (!ticket || ticket.clientId !== session.userId) {
    return { errors: null, message: 'Ticket no encontrado', success: false }
  }

  const isStaff = user.role === 'admin'
  await addMessageToTicket(ticketId, session.userId, user.name, text, isStaff)
  revalidatePath(`/dashboard/tickets/${ticketId}`)
  return { errors: null, message: null, success: true }
}

export async function updateTicketStatusAction(ticketId, status) {
  const session = await requireAuth()
  const user = await getUserById(session.userId)
  if (user?.role !== 'admin') {
    return { success: false, message: 'No autorizado' }
  }

  const { updateTicketStatus } = await import('@/lib/db')
  await updateTicketStatus(ticketId, status)
  revalidatePath(`/dashboard/tickets/${ticketId}`)
  revalidatePath('/dashboard/tickets')
  return { success: true }
}
