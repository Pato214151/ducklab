'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/session'
import { NewClientSchema, NewSystemSchema, NewDownloadSchema } from '@/lib/definitions'
import { createUser, createSystem, createDownload } from '@/lib/db'
import { recordAudit } from '@/lib/audit'

const PATH = '/dashboard/admin/gestion'

export async function createClientAction(state, formData) {
  const session = await requireAdmin()
  const v = NewClientSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    plan: formData.get('plan') || undefined,
  })
  if (!v.success) return { errors: v.error.flatten().fieldErrors, success: false }

  const res = await createUser({ ...v.data, role: 'client' })
  if (res?.error === 'email_exists') {
    return { errors: { email: ['Ya existe un usuario con ese correo'] }, success: false }
  }
  await recordAudit(session, 'client.create', {
    targetType: 'client', targetId: res.id, details: `Creó cliente "${res.name}" <${v.data.email}>`,
  })
  revalidatePath(PATH)
  return { success: true, message: `Cliente "${res.name}" creado correctamente.` }
}

export async function createSystemAction(state, formData) {
  const session = await requireAdmin()
  const v = NewSystemSchema.safeParse({
    clientId: formData.get('clientId'),
    name: formData.get('name'),
    type: formData.get('type'),
    description: formData.get('description') || undefined,
    icon: formData.get('icon') || undefined,
    externalUrl: formData.get('externalUrl') || undefined,
    gitRepo: formData.get('gitRepo') || undefined,
  })
  if (!v.success) return { errors: v.error.flatten().fieldErrors, success: false }

  const sys = await createSystem(v.data)
  await recordAudit(session, 'system.create', {
    targetType: 'system', targetId: sys.id, details: `Creó sistema "${sys.name}" (${v.data.type})`,
  })
  revalidatePath(PATH)
  return { success: true, message: `Sistema "${sys.name}" creado. API key generada.` }
}

export async function createDownloadAction(state, formData) {
  const session = await requireAdmin()
  const v = NewDownloadSchema.safeParse({
    systemId: formData.get('systemId'),
    name: formData.get('name'),
    version: formData.get('version'),
    fileName: formData.get('fileName'),
    fileSize: formData.get('fileSize') || undefined,
    changelog: formData.get('changelog') || undefined,
  })
  if (!v.success) return { errors: v.error.flatten().fieldErrors, success: false }

  const dl = await createDownload(v.data)
  if (dl?.error === 'system_not_found') {
    return { errors: { systemId: ['Sistema no encontrado'] }, success: false }
  }
  await recordAudit(session, 'download.publish', {
    targetType: 'system', targetId: v.data.systemId, details: `Publicó versión ${v.data.version} (${v.data.fileName})`,
  })
  revalidatePath(PATH)
  return { success: true, message: `Versión ${v.data.version} publicada. El sistema quedó actualizado.` }
}
