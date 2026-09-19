/** Layout del dashboard (servidor): exige sesión y pasa el usuario al layout visual. */

import { redirect } from 'next/navigation'
import { verifySession, getCurrentUser } from '@/lib/dal'
import DashboardLayout from './DashboardLayout'

export default async function DashboardRootLayout({ children }) {
  const session = await verifySession()
  if (!session) redirect('/login')

  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return <DashboardLayout user={user}>{children}</DashboardLayout>
}
