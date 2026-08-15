import 'server-only'
import * as jsonDb from './db-json'

let pgModule = null
let USE_PG = false

const pgPromise = (async () => {
  if (!process.env.DATABASE_URL) return
  try {
    pgModule = await import('./db-pg')
    const { getPool } = await import('./db-pool')
    await getPool()
    USE_PG = true
    console.log('[DB] Using PostgreSQL backend')
  } catch {
    console.log('[DB] PostgreSQL unavailable, using JSON fallback')
  }
})()

// Todas las funciones siguen el mismo contrato: esperar la conexión, usar
// Postgres si está disponible e implementa la función, y si no caer a JSON.
// Generarlas desde un solo helper evita 40+ copias del mismo cuerpo (y el bug
// clásico de olvidar el `await pgPromise` al añadir una función nueva).
function backend(name) {
  return async (...args) => {
    await pgPromise
    if (USE_PG && pgModule && typeof pgModule[name] === 'function') {
      return pgModule[name](...args)
    }
    return jsonDb[name](...args)
  }
}

/* ─────────── USERS ─────────── */
export const getUserByEmail = backend('getUserByEmail')
export const getUserById = backend('getUserById')
export const updateUserLastLogin = backend('updateUserLastLogin')
export const createUser = backend('createUser')
export const getAllClients = backend('getAllClients')
export const getAdminEmails = backend('getAdminEmails')

/* ─────────── SYSTEMS ─────────── */
export const getAllSystems = backend('getAllSystems')
export const getSystemsByClient = backend('getSystemsByClient')
export const getSystemById = backend('getSystemById')
export const getSystemByApiKey = backend('getSystemByApiKey')
export const getSystemsWithStatusByClient = backend('getSystemsWithStatusByClient')
export const createSystem = backend('createSystem')
export const updateSystem = backend('updateSystem')
export const updateSystemCommit = backend('updateSystemCommit')
export const updateSystemFromGit = backend('updateSystemFromGit')
export const regenerateSystemApiKey = backend('regenerateSystemApiKey')
export const getStaleOnlineSystems = backend('getStaleOnlineSystems')
export const markSystemOffline = backend('markSystemOffline')
export const setSystemLicense = backend('setSystemLicense')

/* ─────────── DOWNLOADS ─────────── */
export const getDownloadsByClient = backend('getDownloadsByClient')
export const getDownloadById = backend('getDownloadById')
export const createDownload = backend('createDownload')

/* ─────────── TICKETS ─────────── */
export const getTicketsByClient = backend('getTicketsByClient')
export const getTicketById = backend('getTicketById')
export const getAllTickets = backend('getAllTickets')
export const createTicket = backend('createTicket')
export const addMessageToTicket = backend('addMessageToTicket')
export const updateTicketStatus = backend('updateTicketStatus')

/* ─────────── PAYMENTS ─────────── */
export const getPaymentsByClient = backend('getPaymentsByClient')
export const requestEarlyPayment = backend('requestEarlyPayment')

/* ─────────── TELEMETRY ─────────── */
export const getTelemetryBySystem = backend('getTelemetryBySystem')
export const getAllTelemetry = backend('getAllTelemetry')
export const upsertTelemetry = backend('upsertTelemetry')
export const resolveError = backend('resolveError')
export const getAdminOverview = backend('getAdminOverview')

/* ─────────── PASSWORD RESET ─────────── */
export const createPasswordReset = backend('createPasswordReset')
export const getPasswordResetByToken = backend('getPasswordResetByToken')
export const resetUserPassword = backend('resetUserPassword')
export const getPasswordResetsByEmail = backend('getPasswordResetsByEmail')

/* ─────────── AUDIT / BACKUPS ─────────── */
export const logAudit = backend('logAudit')
export const getAuditLog = backend('getAuditLog')
export const saveSystemBackup = backend('saveSystemBackup')
export const getLatestBackupMeta = backend('getLatestBackupMeta')

export async function isDbReady() {
  await pgPromise
  return USE_PG
}
