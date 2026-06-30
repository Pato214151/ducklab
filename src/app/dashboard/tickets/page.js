import { requireAuth } from '@/lib/session'
import { getTicketsByClient } from '@/lib/db'
import TicketsClient from './TicketsClient'

export default async function TicketsPage() {
  const session = await requireAuth()
  const tickets = await getTicketsByClient(session.userId)

  return <TicketsClient tickets={tickets} />
}
