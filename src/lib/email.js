/**
 * Correos transaccionales con Resend: recuperación de contraseña y alertas
 * de error crítico (una técnica al admin y otra tranquilizadora al cliente).
 * Sin RESEND_API_KEY no envía nada, solo lo escribe en consola.
 */

import 'server-only'

const SHELL = (inner) =>
  `<div style="font-family:Segoe UI,Arial,sans-serif;background:#0a0a0a;color:#fff;padding:32px;border-radius:12px;max-width:520px;margin:auto">${inner}</div>`

const BTN = (href, text) =>
  `<a href="${href}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 24px;border-radius:9999px;font-weight:600">${text}</a>`

/**
 * Envío genérico vía Resend. Si no hay RESEND_API_KEY, NO falla:
 * registra en consola y sigue (modo desarrollo).
 */
async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean)
  if (recipients.length === 0) return { sent: false }

  if (!apiKey) {
    console.log(`[Email] (sin RESEND_API_KEY) Para ${recipients.join(', ')}: ${subject}`)
    return { sent: false }
  }

  const from = process.env.EMAIL_FROM || 'Ducklab <onboarding@resend.dev>'
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: recipients, subject, html }),
    })
    return { sent: res.ok }
  } catch (e) {
    console.error('[Email] Error enviando:', e)
    return { sent: false }
  }
}

/** Envía el enlace para restablecer la contraseña (válido 1 hora). */
export async function sendPasswordResetEmail(to, resetLink) {
  return sendEmail({
    to,
    subject: 'Restablece tu contraseña · Ducklab',
    html: SHELL(`
      <h2 style="margin:0 0 8px">Restablece tu contraseña</h2>
      <p style="color:#a1a1aa">Recibimos una solicitud para restablecer tu contraseña. El enlace caduca en 1 hora:</p>
      <p style="margin:24px 0">${BTN(resetLink, 'Restablecer contraseña')}</p>
      <p style="color:#71717a;font-size:13px">Si no fuiste tú, ignora este correo: tu cuenta sigue segura.</p>
    `),
  })
}

/**
 * Alerta cuando un sistema reporta un error crítico (o se cae).
 * Manda dos correos distintos: técnico al admin, tranquilizador al cliente.
 */
export async function sendCriticalErrorAlerts({ system, error, adminEmails = [], clientEmail = null, portalUrl = '' }) {
  const name = system?.name || 'Sistema'
  const msg = error?.message || 'Error crítico'
  const link = portalUrl ? `${portalUrl}/dashboard/admin/systems/${system?.id}` : ''

  const tasks = []

  // Resend, sin dominio verificado, rechaza el envío COMPLETO si hay algún
  // destinatario que no sea el correo de la cuenta. Por eso, si ALERT_EMAIL está
  // definido, enviamos SOLO ahí (evita incluir admin@jrdev.co y que se rechace todo).
  // Cuando verifiques un dominio, quita ALERT_EMAIL y usará los correos de admins.
  const adminRecipients = process.env.ALERT_EMAIL
    ? [process.env.ALERT_EMAIL]
    : [...new Set(adminEmails.filter(Boolean))]

  if (adminRecipients.length) {
    tasks.push(sendEmail({
      to: adminRecipients,
      subject: `🔴 ${name}: error crítico`,
      html: SHELL(`
        <h2 style="margin:0 0 8px;color:#f87171">🔴 Error crítico en ${name}</h2>
        <p style="color:#e5e7eb">${msg}</p>
        ${link ? `<p style="margin:24px 0">${BTN(link, 'Ver y resolver')}</p>` : ''}
        <p style="color:#71717a;font-size:13px">Te avisamos apenas tu sistema lo reportó — antes de que el cliente llame.</p>
      `),
    }))
  }

  if (clientEmail) {
    tasks.push(sendEmail({
      to: clientEmail,
      subject: `Detectamos un problema en ${name}`,
      html: SHELL(`
        <h2 style="margin:0 0 8px">Estamos en eso 🛠️</h2>
        <p style="color:#e5e7eb">Detectamos un problema en <strong>${name}</strong> y nuestro equipo ya está trabajando para resolverlo.</p>
        <p style="color:#a1a1aa">No necesitas hacer nada. Te avisaremos cuando quede solucionado.</p>
        <p style="color:#71717a;font-size:13px">— El equipo de Ducklab</p>
      `),
    }))
  }

  await Promise.allSettled(tasks)
}
