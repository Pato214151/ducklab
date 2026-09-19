/**
 * Base de datos en un archivo JSON (data/db.json), para desarrollo y como
 * respaldo si Postgres no está disponible.
 *
 * Se lee y escribe el archivo completo en cada operación (readDb/writeDb).
 * La primera vez se crea con datos de ejemplo (defaultData). Implementa las
 * mismas funciones que db-pg.js para que db.js pueda intercambiarlas.
 */

import 'server-only'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// La ruta de la BD se puede sobreescribir con JRDEV_DB_FILE (lo usan los tests
// para no tocar nunca la base real en data/db.json).
const DB_PATH = process.env.JRDEV_DB_FILE || path.join(process.cwd(), 'data', 'db.json')
const DATA_DIR = path.dirname(DB_PATH)

// Contraseña del seed: usa la variable de entorno si la defines (≥8 chars);
// si no, genera una ALEATORIA fuerte para que NO se envíe un default conocido
// (antes era 'cliente123'/'admin123'). En prod se usa Postgres, no este seed.
function seedPassword(envKey) {
  const v = process.env[envKey]
  const plain = v && v.length >= 8 ? v : crypto.randomBytes(12).toString('base64url')
  return bcrypt.hashSync(plain, 10)
}

const defaultData = {
  users: [
    {
      id: 1,
      name: 'Carlos Méndez',
      email: 'carlos@empresa.com',
      password: seedPassword('SEED_CLIENT_PASSWORD'),
      role: 'client',
      plan: 'Profesional',
      avatar: null,
      createdAt: '2025-01-15T10:00:00Z',
    },
    {
      id: 2,
      name: 'María López',
      email: 'maria@negocio.co',
      password: seedPassword('SEED_CLIENT_PASSWORD'),
      role: 'client',
      plan: 'Básico',
      avatar: null,
      createdAt: '2025-03-20T08:30:00Z',
    },
    {
      id: 99,
      name: 'Admin Ducklab',
      email: 'admin@jrdev.co',
      password: seedPassword('SEED_ADMIN_PASSWORD'),
      role: 'admin',
      plan: null,
      avatar: null,
      createdAt: '2024-12-01T00:00:00Z',
    },
  ],
  systems: [
    {
      id: 1,
      clientId: 1,
      name: 'Pengos',
      icon: '🐧',
      type: 'desktop',
      description: 'Traductor de voz bilingüe en tiempo real para gamers.',
      fileName: 'pengos-v2.5.0.exe',
      fileSize: '64.2 MB',
      version: '2.5.0',
      status: 'online',
      externalUrl: null,
      gitRepo: 'https://github.com/jrdev/pengos',
      gitBranch: 'main',
      lastCommitSha: 'a1b2c3d4e5f6',
      lastCommitMsg: 'Fix: latencia en microfono reducida',
      lastCommitDate: '2026-06-01T14:00:00Z',
      createdAt: '2025-06-01T00:00:00Z',
    },
    {
      id: 2,
      clientId: 1,
      name: 'Raloz COL SAS',
      icon: '👔',
      type: 'online',
      description: 'Sistema integral de gestión para uniformes escolares.',
      fileName: null,
      fileSize: null,
      version: '1.3.0',
      status: 'online',
      externalUrl: 'https://raloz.jrdev.co',
      gitRepo: 'https://github.com/jrdev/raloz',
      gitBranch: 'main',
      lastCommitSha: 'b2c3d4e5f6a7',
      lastCommitMsg: 'Feat: modulo de inventario completo',
      lastCommitDate: '2026-05-28T16:00:00Z',
      createdAt: '2025-03-15T00:00:00Z',
    },
    {
      id: 3,
      clientId: 1,
      name: 'Pocitos Azufrados POS',
      icon: '🏊',
      type: 'online',
      description: 'Sistema POS para club y restaurante.',
      fileName: null,
      fileSize: null,
      version: '2.1.0',
      status: 'online',
      externalUrl: 'https://pocitos-azufrados.onrender.com',
      gitRepo: 'https://github.com/jrdev/pocitos-pos',
      gitBranch: 'main',
      lastCommitSha: 'c3d4e5f6a7b8',
      lastCommitMsg: 'Fix: visor de cocina tiempo real',
      lastCommitDate: '2026-05-20T10:00:00Z',
      createdAt: '2025-01-10T00:00:00Z',
    },
    {
      id: 4,
      clientId: 2,
      name: 'Sitio Web Corporativo',
      icon: '🌐',
      type: 'online',
      description: 'Sitio web profesional con blog y contacto.',
      fileName: null,
      fileSize: null,
      version: '1.0.0',
      status: 'online',
      externalUrl: 'https://marialopez.co',
      gitRepo: null,
      gitBranch: null,
      lastCommitSha: null,
      lastCommitMsg: null,
      lastCommitDate: null,
      createdAt: '2026-04-10T09:00:00Z',
    },
  ],
  downloads: [
    {
      id: 1,
      systemId: 1,
      clientId: 1,
      name: 'Pengos v2.5.0',
      description: 'Actualización con mejoras en latencia y nuevo modelo de IA.',
      fileName: 'pengos-v2.5.0.exe',
      fileSize: '64.2 MB',
      version: '2.5.0',
      changelog: '- Nueva interfaz de usuario\n- Reducción de latencia en 40%\n- Soporte para más juegos\n- Corrección de errores menores',
      createdAt: '2026-06-01T14:00:00Z',
    },
    {
      id: 2,
      systemId: 1,
      clientId: 1,
      name: 'Pengos v2.4.0',
      description: 'Versión estable con soporte para Valorant y Apex Legends.',
      fileName: 'pengos-v2.4.0.exe',
      fileSize: '61.8 MB',
      version: '2.4.0',
      changelog: '- Soporte para Valorant\n- Soporte para Apex Legends\n- Mejoras en el overlay\n- Optimizaciones de rendimiento',
      createdAt: '2026-05-15T10:00:00Z',
    },
  ],
  telemetry: [
    {
      id: 1,
      systemId: 1,
      clientId: 1,
      status: 'online',
      version: '2.5.0',
      lastHeartbeat: '2026-06-11T12:00:00Z',
      errors: [],
    },
    {
      id: 2,
      systemId: 2,
      clientId: 1,
      status: 'online',
      version: '1.3.0',
      lastHeartbeat: '2026-06-11T12:05:00Z',
      errors: [],
    },
    {
      id: 3,
      systemId: 3,
      clientId: 1,
      status: 'error',
      version: '2.1.0',
      lastHeartbeat: '2026-06-10T08:00:00Z',
      errors: [
        {
          id: 1,
          level: 'critical',
          message: 'Base de datos no responde',
          stacktrace: 'TimeoutError: Connection pool exhausted\n  at Pool.query (/app/db.js:42)\n  at OrderController.get (/app/controllers/order.js:15)',
          loggedAt: '2026-06-10T08:00:00Z',
          resolved: false,
        },
        {
          id: 2,
          level: 'warning',
          message: 'Alto uso de memoria: 1.8GB / 2GB',
          stacktrace: null,
          loggedAt: '2026-06-09T14:30:00Z',
          resolved: true,
        },
      ],
    },
    {
      id: 4,
      systemId: 4,
      clientId: 2,
      status: 'online',
      version: '1.0.0',
      lastHeartbeat: '2026-06-11T11:00:00Z',
      errors: [],
    },
  ],
  tickets: [
    {
      id: 1,
      clientId: 1,
      systemId: 1,
      subject: 'Error al iniciar Pengos',
      description: 'La aplicación se cierra inmediatamente después de abrirla.',
      status: 'open',
      priority: 'high',
      createdAt: '2026-06-10T08:30:00Z',
      updatedAt: '2026-06-10T08:30:00Z',
      messages: [
        {
          id: 1,
          userId: 1,
          userName: 'Carlos Méndez',
          text: 'La aplicación se cierra inmediatamente después de abrirla.',
          isStaff: false,
          createdAt: '2026-06-10T08:30:00Z',
        },
      ],
    },
    {
      id: 2,
      clientId: 1,
      systemId: null,
      subject: 'Solicitud: Exportar a PDF',
      description: 'Sería útil poder exportar reportes del dashboard a PDF.',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2026-06-05T14:00:00Z',
      updatedAt: '2026-06-08T10:00:00Z',
      messages: [
        {
          id: 1,
          userId: 1,
          userName: 'Carlos Méndez',
          text: 'Sería útil poder exportar los reportes del dashboard a PDF.',
          isStaff: false,
          createdAt: '2026-06-05T14:00:00Z',
        },
        {
          id: 2,
          userId: 99,
          userName: 'Admin Ducklab',
          text: 'Hola Carlos, gracias por la sugerencia. Ya la estamos evaluando.',
          isStaff: true,
          createdAt: '2026-06-08T10:00:00Z',
        },
      ],
    },
    {
      id: 3,
      clientId: 2,
      systemId: 4,
      subject: 'Formulario de contacto no envía correos',
      description: 'Los usuarios llenan el formulario pero nunca recibo las notificaciones.',
      status: 'resolved',
      priority: 'high',
      createdAt: '2026-06-01T11:00:00Z',
      updatedAt: '2026-06-03T09:00:00Z',
      messages: [
        {
          id: 1,
          userId: 2,
          userName: 'María López',
          text: 'El formulario de contacto no envía correos.',
          isStaff: false,
          createdAt: '2026-06-01T11:00:00Z',
        },
        {
          id: 2,
          userId: 99,
          userName: 'Admin Ducklab',
          text: 'El puerto SMTP estaba bloqueado. Ya quedó solucionado.',
          isStaff: true,
          createdAt: '2026-06-03T09:00:00Z',
      },
    ],
  },
  ],
  passwordResets: [],
  auditLog: [],
  systemBackups: [],
  payments: [
    {
      id: 1,
      clientId: 1,
      plan: 'Profesional',
      amount: 1800000,
      currency: 'COP',
      status: 'paid',
      method: 'Transferencia Bancolombia',
      dueDate: '2026-06-15',
      paidAt: '2026-06-14T09:00:00Z',
      invoice: 'FAC-2026-001',
    },
    {
      id: 2,
      clientId: 1,
      plan: 'Profesional',
      amount: 1800000,
      currency: 'COP',
      status: 'paid',
      method: 'Nequi',
      dueDate: '2026-05-15',
      paidAt: '2026-05-13T10:00:00Z',
      invoice: 'FAC-2026-002',
    },
    {
      id: 3,
      clientId: 2,
      plan: 'Básico',
      amount: 800000,
      currency: 'COP',
      status: 'paid',
      method: 'MercadoPago',
      dueDate: '2026-06-10',
      paidAt: '2026-06-09T08:00:00Z',
      invoice: 'FAC-2026-003',
    },
    {
      id: 4,
      clientId: 1,
      plan: 'Profesional',
      amount: 1800000,
      currency: 'COP',
      status: 'pending',
      method: null,
      dueDate: '2026-07-15',
      paidAt: null,
      invoice: null,
    },
  ],
}

/** Crea la carpeta data/ si no existe. */
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

/** Genera una API key nueva para un sistema (sk_live_…). */
function genApiKey() {
  return 'sk_live_' + crypto.randomBytes(24).toString('hex')
}

// Garantiza que cada sistema tenga su API key (para telemetría)
function backfillApiKeys(data) {
  let changed = false
  for (const s of (data.systems || [])) {
    if (!s.apiKey) {
      s.apiKey = genApiKey()
      changed = true
    }
  }
  return changed
}

/** Lee db.json (o lo crea con los datos de ejemplo). */
function readDb() {
  ensureDir()
  const exists = fs.existsSync(DB_PATH)
  let data
  if (!exists) {
    data = JSON.parse(JSON.stringify(defaultData))
  } else {
    try {
      data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    } catch {
      // JSON corrupto: preservar el archivo dañado antes de reemplazarlo con el
      // seed — así los datos reales son recuperables a mano y no se pierden en silencio.
      const backup = `${DB_PATH}.corrupt-${Date.now()}`
      try { fs.copyFileSync(DB_PATH, backup) } catch { /* el original ya no es legible */ }
      console.error(`[db-json] db.json corrupto; copia guardada en ${backup}, reiniciando con seed`)
      data = JSON.parse(JSON.stringify(defaultData))
    }
  }
  let changed = !exists
  if (backfillApiKeys(data)) changed = true
  if (changed) writeDb(data)
  return data
}

/** Guarda el objeto completo en db.json. */
function writeDb(data) {
  ensureDir()
  // Escritura atómica: tmp + rename. Si el proceso muere a mitad de escritura,
  // el db.json anterior queda intacto (nunca un archivo a medias).
  const tmp = `${DB_PATH}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf-8')
  fs.renameSync(tmp, DB_PATH)
}

// ID numérico único y siempre creciente, robusto ante colisiones de Date.now().
let _idSeq = 0
/** Siguiente id libre (global). */
function nextId() {
  return Date.now() * 1000 + (_idSeq++ % 1000)
}

// ID secuencial (1, 2, 3…) para registros creados por el admin.
function nextSeqId(arr) {
  return (arr || []).reduce((max, x) => Math.max(max, x.id || 0), 0) + 1
}

const VALID_PRIORITIES = ['low', 'medium', 'high']

// Dead man's switch: si un sistema no manda latido en 5 min, se considera offline,
// aunque su último estado guardado fuera 'online' (el proceso pudo morir del todo).
const HEARTBEAT_STALE_MS = 5 * 60 * 1000
/** Estado real de un sistema: si no manda latido hace más de 5 min, está offline. */
function liveStatus(t) {
  if (!t) return 'offline'
  if (!t.lastHeartbeat || (Date.now() - new Date(t.lastHeartbeat).getTime()) > HEARTBEAT_STALE_MS) return 'offline'
  return t.status || 'offline'
}

export function getUserByEmail(email) {
  const db = readDb()
  return (db.users || []).find(u => u.email === email) || null
}

export function getUserById(id) {
  const db = readDb()
  return (db.users || []).find(u => u.id === id) || null
}

export function updateUserLastLogin(id) {
  const db = readDb()
  const user = (db.users || []).find(u => u.id === id)
  if (!user) return null
  user.lastLogin = new Date().toISOString()
  writeDb(db)
  return user
}

export function createUser({ name, email, password, role = 'client', plan = null }) {
  const db = readDb()
  db.users = db.users || []
  if (db.users.some(u => u.email === email)) return { error: 'email_exists' }
  const user = {
    id: nextSeqId(db.users),
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role,
    plan,
    avatar: null,
    createdAt: new Date().toISOString(),
  }
  db.users.push(user)
  writeDb(db)
  const { password: _pw, ...safe } = user
  return safe
}

export function getDownloadsByClient(clientId) {
  const db = readDb()
  return (db.downloads || []).filter(d => d.clientId === clientId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getDownloadById(id) {
  const db = readDb()
  return (db.downloads || []).find(d => d.id === id) || null
}

export function createDownload({ systemId, name, fileName, fileSize = '', version, description = '', changelog = '' }) {
  const db = readDb()
  const system = (db.systems || []).find(s => s.id === systemId)
  if (!system) return { error: 'system_not_found' }
  db.downloads = db.downloads || []
  const download = {
    id: nextSeqId(db.downloads),
    systemId,
    clientId: system.clientId,
    name,
    description,
    fileName,
    fileSize,
    version,
    changelog,
    createdAt: new Date().toISOString(),
  }
  db.downloads.push(download)
  // Publicar una versión actualiza el sistema a esa versión.
  system.version = version
  system.fileName = fileName
  if (fileSize) system.fileSize = fileSize
  writeDb(db)
  return download
}

export function getTicketsByClient(clientId) {
  const db = readDb()
  return (db.tickets || []).filter(t => t.clientId === clientId).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export function getTicketById(id) {
  const db = readDb()
  return (db.tickets || []).find(t => t.id === id) || null
}

export function addMessageToTicket(ticketId, userId, userName, text, isStaff) {
  const db = readDb()
  const ticket = (db.tickets || []).find(t => t.id === ticketId)
  if (!ticket) return null
  const newMsg = {
    id: nextId(),
    userId,
    userName,
    text,
    isStaff,
    createdAt: new Date().toISOString(),
  }
  ticket.messages.push(newMsg)
  ticket.updatedAt = new Date().toISOString()
  writeDb(db)
  return newMsg
}

export function createTicket(clientId, subject, description, priority) {
  const db = readDb()
  const newTicket = {
    id: nextId(),
    clientId,
    subject,
    description,
    status: 'open',
    priority: VALID_PRIORITIES.includes(priority) ? priority : 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: nextId(),
        userId: clientId,
        userName: (db.users || []).find(u => u.id === clientId)?.name || 'Usuario',
        text: description,
        isStaff: false,
        createdAt: new Date().toISOString(),
      },
    ],
  }
  db.tickets = db.tickets || []
  db.tickets.push(newTicket)
  writeDb(db)
  return newTicket
}

export function getPaymentsByClient(clientId) {
  const db = readDb()
  return (db.payments || []).filter(p => p.clientId === clientId).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
}

export function requestEarlyPayment(paymentId, clientId) {
  const db = readDb()
  const payment = (db.payments || []).find(p => p.id === paymentId && p.clientId === clientId)
  if (!payment) return null
  if (payment.status === 'paid') return null // no tiene sentido adelantar una factura ya pagada
  payment.earlyRequested = true
  payment.earlyRequestedAt = new Date().toISOString()
  writeDb(db)
  return payment
}

export function getAllClients() {
  const db = readDb()
  return (db.users || []).filter(u => u.role === 'client')
}

export function getAdminEmails() {
  const db = readDb()
  return (db.users || []).filter(u => u.role === 'admin' && u.email).map(u => u.email)
}

// Sistemas cuyo latido venció pero aún no están marcados offline (para el dead man's switch).
export function getStaleOnlineSystems() {
  const db = readDb()
  const systems = db.systems || []
  return (db.telemetry || [])
    .filter(t => t.status !== 'offline' && liveStatus(t) === 'offline')
    .map(t => {
      const s = systems.find(x => x.id === t.systemId)
      return s ? { ...s, lastHeartbeat: t.lastHeartbeat } : null
    })
    .filter(Boolean)
}

export function markSystemOffline(systemId) {
  const db = readDb()
  const t = (db.telemetry || []).find(x => x.systemId === systemId)
  if (!t) return null
  t.status = 'offline'
  writeDb(db)
  return t
}

export function getAllTickets() {
  const db = readDb()
  return (db.tickets || []).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
}

export function updateTicketStatus(ticketId, status) {
  const db = readDb()
  const ticket = (db.tickets || []).find(t => t.id === ticketId)
  if (!ticket) return null
  ticket.status = status
  ticket.updatedAt = new Date().toISOString()
  writeDb(db)
  return ticket
}

/* ═══════════════════════════════════════════
   SISTEMAS
   ═══════════════════════════════════════════ */

export function getAllSystems() {
  const db = readDb()
  return db.systems || []
}

export function getSystemsByClient(clientId) {
  const db = readDb()
  return (db.systems || []).filter(s => s.clientId === clientId)
}

export function getSystemById(id) {
  const db = readDb()
  return (db.systems || []).find(s => s.id === id) || null
}

export function getSystemByApiKey(apiKey) {
  if (!apiKey) return null
  const db = readDb()
  return (db.systems || []).find(s => s.apiKey === apiKey) || null
}

export function regenerateSystemApiKey(systemId) {
  const db = readDb()
  const system = (db.systems || []).find(s => s.id === systemId)
  if (!system) return null
  system.apiKey = genApiKey()
  writeDb(db)
  return system
}

export function updateSystemCommit(systemId, { sha, message, date }) {
  const db = readDb()
  const system = (db.systems || []).find(s => s.id === systemId)
  if (!system) return null
  if (sha) system.lastCommitSha = sha
  if (message) system.lastCommitMsg = message
  // Respeta un date explícito (incluido null); solo usa "ahora" si no se pasó nada.
  system.lastCommitDate = date !== undefined ? date : new Date().toISOString()
  writeDb(db)
  return system
}

export function getSystemsWithStatusByClient(clientId) {
  const db = readDb()
  const telemetry = db.telemetry || []
  return (db.systems || [])
    .filter(s => s.clientId === clientId)
    .map(s => {
      const t = telemetry.find(tl => tl.systemId === s.id)
      return {
        ...s,
        status: liveStatus(t),
        lastHeartbeat: t?.lastHeartbeat || null,
        errorCount: (t?.errors || []).filter(e => !e.resolved).length,
      }
    })
}

export function updateSystem(id, updates) {
  const db = readDb()
  const idx = (db.systems || []).findIndex(s => s.id === id)
  if (idx === -1) return null
  db.systems[idx] = { ...db.systems[idx], ...updates }
  writeDb(db)
  return db.systems[idx]
}

export function createSystem({ clientId, name, icon = '📦', type = 'online', description = '', externalUrl = null, gitRepo = null, gitBranch = null, version = '1.0.0' }) {
  const db = readDb()
  db.systems = db.systems || []
  const system = {
    id: nextSeqId(db.systems),
    clientId,
    name,
    icon,
    type,
    description,
    fileName: null,
    fileSize: null,
    version,
    status: 'online',
    externalUrl,
    apiKey: genApiKey(),
    runbook: null,
    gitRepo,
    gitBranch: gitBranch || (gitRepo ? 'main' : null),
    lastCommitSha: null,
    lastCommitMsg: null,
    lastCommitDate: null,
    createdAt: new Date().toISOString(),
  }
  db.systems.push(system)
  writeDb(db)
  return system
}

/* ═══════════════════════════════════════════
   TELEMETRÍA (heartbeat + errores)
   ═══════════════════════════════════════════ */

export function getTelemetryBySystem(systemId) {
  const db = readDb()
  return (db.telemetry || []).find(t => t.systemId === systemId) || null
}

/** Guarda el último latido/estado de un sistema y, si trae error, lo agrega a su lista. */
export function upsertTelemetry(systemId, clientId, data) {
  const db = readDb()
  let entry = (db.telemetry || []).find(t => t.systemId === systemId)
  if (entry) {
    Object.assign(entry, {
      status: data.status || entry.status,
      version: data.version || entry.version,
      lastHeartbeat: new Date().toISOString(),
    })
    if (data.error) {
      entry.errors = entry.errors || []
      entry.errors.push({
        id: nextId(),
        level: data.error.level || 'error',
        message: data.error.message,
        stacktrace: data.error.stacktrace || null,
        loggedAt: new Date().toISOString(),
        resolved: false,
      })
    }
  } else {
    db.telemetry = db.telemetry || []
    db.telemetry.push({
      id: Date.now(),
      systemId,
      clientId,
      status: data.status || 'online',
      version: data.version || '0.0.0',
      lastHeartbeat: new Date().toISOString(),
      errors: data.error ? [{
        id: nextId(),
        level: data.error.level || 'error',
        message: data.error.message,
        stacktrace: data.error.stacktrace || null,
        loggedAt: new Date().toISOString(),
        resolved: false,
      }] : [],
    })
  }
  writeDb(db)
  return entry || db.telemetry[db.telemetry.length - 1]
}

export function getAllTelemetry() {
  const db = readDb()
  return db.telemetry || []
}

export function resolveError(systemId, errorId) {
  const db = readDb()
  const telemetry = (db.telemetry || []).find(t => t.systemId === systemId)
  if (!telemetry) return null
  const error = (telemetry.errors || []).find(e => e.id === errorId)
  if (!error) return null
  error.resolved = true
  writeDb(db)
  return error
}

/* ═══════════════════════════════════════════
   ADMIN — Dashboard global
   ═══════════════════════════════════════════ */

/** Resumen para el panel admin: clientes, sistemas por estado, errores y tickets. */
export function getAdminOverview() {
  const db = readDb()
  const clients = (db.users || []).filter(u => u.role === 'client')
  const systems = db.systems || []
  const telemetry = db.telemetry || []
  const tickets = db.tickets || []

  const systemsOnline = systems.filter(s => {
    const t = telemetry.find(tl => tl.systemId === s.id)
    return liveStatus(t) === 'online'
  }).length

  const systemsError = systems.filter(s => {
    const t = telemetry.find(tl => tl.systemId === s.id)
    return liveStatus(t) === 'error'
  }).length

  const openTickets = tickets.filter(t => t.status !== 'resolved').length
  const pendingTickets = tickets
    .filter(t => t.status !== 'resolved')
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map(t => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      updatedAt: t.updatedAt,
      clientName: (db.users || []).find(u => u.id === t.clientId)?.name || 'Desconocido',
    }))
  const recentErrors = telemetry.flatMap(t =>
    (t.errors || []).filter(e => !e.resolved).map(e => ({
      ...e,
      systemId: t.systemId,
      clientId: t.clientId,
    }))
  ).sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))

  return {
    totalClients: clients.length,
    totalSystems: systems.length,
    systemsOnline,
    systemsError,
    openTickets,
    pendingTickets,
    recentErrors: recentErrors.slice(0, 20),
    systems: systems.map(s => {
      const t = telemetry.find(tl => tl.systemId === s.id)
      const client = (db.users || []).find(u => u.id === s.clientId)
      const errorCount = (t?.errors || []).filter(e => !e.resolved).length
      // No exponer la apiKey de telemetría en el overview (over-fetching).
      const { apiKey, ...safe } = s
      return {
        ...safe,
        clientName: client?.name || 'Desconocido',
        status: liveStatus(t),
        lastHeartbeat: t?.lastHeartbeat || null,
        errorCount,
        ticketCount: tickets.filter(tk => tk.systemId === s.id && tk.status !== 'resolved').length,
      }
    }),
  }
}

/** Fallback simulado cuando no se puede leer el repo de GitHub. */
export function updateSystemFromGit(systemId) {
  const db = readDb()
  const system = (db.systems || []).find(s => s.id === systemId)
  if (!system) return null

  // Simula fetch desde GitHub
  const now = new Date().toISOString()
  system.lastCommitDate = now
  system.lastCommitMsg = 'Actualización automática vía webhook'
  system.lastCommitSha = Math.random().toString(16).substring(2, 14)

  writeDb(db)
  return system
}

/* ═══════════════════════════════════════════
   PASSWORD RESET
   ═══════════════════════════════════════════ */

export function createPasswordReset(email) {
  const db = readDb()
  const user = (db.users || []).find(u => u.email === email)
  if (!user) return null

  // Token criptográficamente seguro (NO Math.random, que es predecible).
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hora

  db.passwordResets = db.passwordResets || []
  db.passwordResets.push({ token, email, used: false, expiresAt, createdAt: new Date().toISOString() })
  writeDb(db)
  return token
}

export function getPasswordResetByToken(token) {
  const db = readDb()
  const reset = (db.passwordResets || []).find(r => r.token === token)
  if (!reset) return null
  if (reset.used) return null
  if (new Date(reset.expiresAt) < new Date()) return null
  return reset
}

export function resetUserPassword(token, newPassword) {
  const db = readDb()
  const reset = db.passwordResets.find(r => r.token === token)
  if (!reset || reset.used) return null

  const user = (db.users || []).find(u => u.email === reset.email)
  if (!user) return null

  user.password = bcrypt.hashSync(newPassword, 10)
  reset.used = true
  writeDb(db)
  return user
}

export function getPasswordResetsByEmail(email) {
  const db = readDb()
  return (db.passwordResets || []).filter(r => r.email === email)
}

/* ─────────── AUDIT LOG ─────────── */

export function logAudit({ actorId = null, actorName = null, action, targetType = null, targetId = null, details = null }) {
  const db = readDb()
  db.auditLog = db.auditLog || []
  db.auditLog.push({
    id: nextSeqId(db.auditLog),
    actorId,
    actorName,
    action,
    targetType,
    targetId: targetId != null ? String(targetId) : null,
    details,
    createdAt: new Date().toISOString(),
  })
  writeDb(db)
}

export function getAuditLog(limit = 100) {
  const db = readDb()
  return (db.auditLog || [])
    .slice()
    .sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)) || (b.id - a.id))
    .slice(0, limit)
}

/* ─────────── BACKUPS EN LA NUBE ─────────── */

export function saveSystemBackup({ systemId, clientId = null, fileName = 'backup.db', data }) {
  const db = readDb()
  db.systemBackups = db.systemBackups || []
  db.systemBackups.push({
    id: nextSeqId(db.systemBackups),
    systemId,
    clientId,
    fileName,
    sizeBytes: data.length,
    data: Buffer.isBuffer(data) ? data.toString('base64') : String(data),
    createdAt: new Date().toISOString(),
  })
  // Conserva solo los 2 más recientes por sistema.
  const mine = db.systemBackups.filter(b => b.systemId === systemId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const keep = new Set(mine.slice(0, 2).map(b => b.id))
  db.systemBackups = db.systemBackups.filter(b => b.systemId !== systemId || keep.has(b.id))
  writeDb(db)
}

export function getLatestBackupMeta(systemId) {
  const db = readDb()
  const mine = (db.systemBackups || [])
    .filter(b => b.systemId === systemId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (!mine[0]) return null
  const { data, ...meta } = mine[0]
  return meta
}

/* ─────────── LICENCIA ─────────── */

export function setSystemLicense(systemId, active) {
  const db = readDb()
  const s = (db.systems || []).find(x => x.id === systemId)
  if (!s) return null
  s.licenseActive = !!active
  writeDb(db)
  return s
}
