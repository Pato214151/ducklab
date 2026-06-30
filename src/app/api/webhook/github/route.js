import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAllSystems, updateSystemCommit } from '@/lib/db'

/**
 * Webhook de GitHub: cada push actualiza el último commit del sistema.
 * Si GITHUB_WEBHOOK_SECRET está configurado, se verifica la firma
 * (x-hub-signature-256) para que nadie pueda falsear updates.
 *
 * En GitHub: Settings → Webhooks → Payload URL = https://tu-portal/api/webhook/github
 *            Content type = application/json · Secret = el mismo GITHUB_WEBHOOK_SECRET
 */
export async function POST(request) {
  const raw = await request.text()
  const secret = process.env.GITHUB_WEBHOOK_SECRET

  // Fail-closed: sin secreto configurado NO se procesa nada (antes se aceptaba
  // sin firma, lo que permitía falsear updates). Configura GITHUB_WEBHOOK_SECRET
  // en el servidor y el mismo valor en el webhook de GitHub.
  if (!secret) {
    return NextResponse.json({ error: 'Webhook no configurado' }, { status: 503 })
  }

  // Verificación de firma HMAC (x-hub-signature-256), a tiempo constante.
  const signature = request.headers.get('x-hub-signature-256') || ''
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
  }

  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const event = request.headers.get('x-github-event')
  if (event === 'ping') {
    return NextResponse.json({ ok: true, pong: true })
  }

  const repo = body.repository?.full_name
  if (!repo) {
    return NextResponse.json({ error: 'Sin info de repositorio' }, { status: 400 })
  }

  const gitUrl = `https://github.com/${repo}`
  const systems = await getAllSystems()
  const system = systems.find(s => s.gitRepo === gitUrl || s.gitRepo === `${gitUrl}.git`)
  if (!system) {
    return NextResponse.json({ error: 'Ningún sistema vinculado a este repo' }, { status: 404 })
  }

  const commit = body.head_commit
  const updated = await updateSystemCommit(system.id, {
    sha: commit?.id ? commit.id.slice(0, 12) : null,
    message: commit?.message || null,
    date: commit?.timestamp || null,
  })

  return NextResponse.json({ success: true, system: updated?.name })
}
