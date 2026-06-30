import { z } from 'zod'

// Nota: .trim() va ANTES de las validaciones para que se recorte primero
// (así un email con espacios alrededor es válido y un texto de solo espacios se rechaza).
export const LoginSchema = z.object({
  email: z.string().trim().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const TicketSchema = z.object({
  subject: z.string().trim().min(3, 'El asunto debe tener al menos 3 caracteres').max(200, 'El asunto es muy largo'),
  description: z.string().trim().min(10, 'Describe el problema con al menos 10 caracteres').max(2000),
  priority: z.enum(['low', 'medium', 'high']),
})

export const MessageSchema = z.object({
  text: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(2000),
})

export const RequestResetSchema = z.object({
  email: z.string().trim().email('Correo electrónico inválido'),
})

// ── Admin: alta de clientes / sistemas / versiones ──
export const NewClientSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es muy corto').max(120),
  email: z.string().trim().email('Correo electrónico inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  plan: z.string().trim().max(60).optional(),
})

export const NewSystemSchema = z.object({
  clientId: z.coerce.number().int().positive('Selecciona un cliente'),
  name: z.string().trim().min(2, 'El nombre es muy corto').max(120),
  type: z.enum(['online', 'desktop']),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().max(8).optional(),
  externalUrl: z.string().trim().max(300).optional(),
  gitRepo: z.string().trim().max(300).optional(),
})

export const NewDownloadSchema = z.object({
  systemId: z.coerce.number().int().positive('Selecciona un sistema'),
  name: z.string().trim().min(2, 'El nombre es muy corto').max(160),
  version: z.string().trim().min(1, 'Versión requerida').max(40),
  fileName: z.string().trim().min(1, 'Nombre de archivo requerido').max(160),
  fileSize: z.string().trim().max(40).optional(),
  changelog: z.string().trim().max(2000).optional(),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirma la contraseña'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})
