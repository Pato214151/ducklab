import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/session'
import { getTicketById } from '@/lib/db'
import { getCurrentUser } from '@/lib/dal'
import TicketDetailClient from './TicketDetailClient'

export default async function TicketDetailPage({ params }) {
  const resolvedParams = await params
  const session = await requireAuth()
  const ticket = await getTicketById(Number(resolvedParams.id))
  if (!ticket || (ticket.clientId !== session.userId && session.role !== 'admin')) {
    notFound()
  }

  const user = await getCurrentUser()

  return <TicketDetailClient ticket={ticket} userId={session.userId} userName={user?.name} />
}
