import { requireAuth } from '@/lib/session'
import { getSystemsByClient, getDownloadsByClient } from '@/lib/db'
import SystemsClient from './SystemsClient'

export default async function DownloadsPage() {
  const session = await requireAuth()
  const systems = await getSystemsByClient(session.userId)
  const downloads = await getDownloadsByClient(session.userId)

  return <SystemsClient systems={systems} allDownloads={downloads} />
}
