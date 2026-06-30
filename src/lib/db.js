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

export async function getUserByEmail(email) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getUserByEmail(email)
  return jsonDb.getUserByEmail(email)
}

export async function getUserById(id) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getUserById(id)
  return jsonDb.getUserById(id)
}

export async function updateUserLastLogin(id) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.updateUserLastLogin) return pgModule.updateUserLastLogin(id)
  return jsonDb.updateUserLastLogin(id)
}

export async function getSystemsWithStatusByClient(clientId) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.getSystemsWithStatusByClient) return pgModule.getSystemsWithStatusByClient(clientId)
  return jsonDb.getSystemsWithStatusByClient(clientId)
}

export async function getSystemByApiKey(apiKey) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.getSystemByApiKey) return pgModule.getSystemByApiKey(apiKey)
  return jsonDb.getSystemByApiKey(apiKey)
}

export async function regenerateSystemApiKey(systemId) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.regenerateSystemApiKey) return pgModule.regenerateSystemApiKey(systemId)
  return jsonDb.regenerateSystemApiKey(systemId)
}

export async function updateSystemCommit(systemId, data) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.updateSystemCommit) return pgModule.updateSystemCommit(systemId, data)
  return jsonDb.updateSystemCommit(systemId, data)
}

export async function requestEarlyPayment(paymentId, clientId) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.requestEarlyPayment) return pgModule.requestEarlyPayment(paymentId, clientId)
  return jsonDb.requestEarlyPayment(paymentId, clientId)
}

export async function getDownloadsByClient(clientId) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getDownloadsByClient(clientId)
  return jsonDb.getDownloadsByClient(clientId)
}

export async function getDownloadById(id) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getDownloadById(id)
  return jsonDb.getDownloadById(id)
}

export async function getTicketsByClient(clientId) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getTicketsByClient(clientId)
  return jsonDb.getTicketsByClient(clientId)
}

export async function getTicketById(id) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getTicketById(id)
  return jsonDb.getTicketById(id)
}

export async function addMessageToTicket(ticketId, userId, userName, text, isStaff) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.addMessageToTicket(ticketId, userId, userName, text, isStaff)
  return jsonDb.addMessageToTicket(ticketId, userId, userName, text, isStaff)
}

export async function createTicket(clientId, subject, description, priority) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.createTicket(clientId, subject, description, priority)
  return jsonDb.createTicket(clientId, subject, description, priority)
}

export async function getPaymentsByClient(clientId) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getPaymentsByClient(clientId)
  return jsonDb.getPaymentsByClient(clientId)
}

export async function getAllClients() {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getAllClients()
  return jsonDb.getAllClients()
}

export async function getAdminEmails() {
  await pgPromise
  if (USE_PG && pgModule && pgModule.getAdminEmails) return pgModule.getAdminEmails()
  return jsonDb.getAdminEmails()
}

export async function createUser(data) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.createUser) return pgModule.createUser(data)
  return jsonDb.createUser(data)
}

export async function createSystem(data) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.createSystem) return pgModule.createSystem(data)
  return jsonDb.createSystem(data)
}

export async function createDownload(data) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.createDownload) return pgModule.createDownload(data)
  return jsonDb.createDownload(data)
}

export async function getStaleOnlineSystems() {
  await pgPromise
  if (USE_PG && pgModule && pgModule.getStaleOnlineSystems) return pgModule.getStaleOnlineSystems()
  return jsonDb.getStaleOnlineSystems()
}

export async function markSystemOffline(systemId) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.markSystemOffline) return pgModule.markSystemOffline(systemId)
  return jsonDb.markSystemOffline(systemId)
}

export async function getAllTickets() {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getAllTickets()
  return jsonDb.getAllTickets()
}

export async function updateTicketStatus(ticketId, status) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.updateTicketStatus(ticketId, status)
  return jsonDb.updateTicketStatus(ticketId, status)
}

export async function getAllSystems() {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getAllSystems()
  return jsonDb.getAllSystems()
}

export async function getSystemsByClient(clientId) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getSystemsByClient(clientId)
  return jsonDb.getSystemsByClient(clientId)
}

export async function getSystemById(id) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getSystemById(id)
  return jsonDb.getSystemById(id)
}

export async function updateSystem(id, updates) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.updateSystem(id, updates)
  return jsonDb.updateSystem(id, updates)
}

export async function getTelemetryBySystem(systemId) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getTelemetryBySystem(systemId)
  return jsonDb.getTelemetryBySystem(systemId)
}

export async function upsertTelemetry(systemId, clientId, data) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.upsertTelemetry(systemId, clientId, data)
  return jsonDb.upsertTelemetry(systemId, clientId, data)
}

export async function getAllTelemetry() {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getAllTelemetry()
  return jsonDb.getAllTelemetry()
}

export async function resolveError(systemId, errorId) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.resolveError(systemId, errorId)
  return jsonDb.resolveError(systemId, errorId)
}

export async function getAdminOverview() {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getAdminOverview()
  return jsonDb.getAdminOverview()
}

export async function updateSystemFromGit(systemId) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.updateSystemFromGit(systemId)
  return jsonDb.updateSystemFromGit(systemId)
}

export async function createPasswordReset(email) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.createPasswordReset(email)
  return jsonDb.createPasswordReset(email)
}

export async function getPasswordResetByToken(token) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getPasswordResetByToken(token)
  return jsonDb.getPasswordResetByToken(token)
}

export async function resetUserPassword(token, newPassword) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.resetUserPassword(token, newPassword)
  return jsonDb.resetUserPassword(token, newPassword)
}

export async function getPasswordResetsByEmail(email) {
  await pgPromise
  if (USE_PG && pgModule) return pgModule.getPasswordResetsByEmail(email)
  return jsonDb.getPasswordResetsByEmail(email)
}

/* ═══════════════════════════════════════════
   Re-export isPgConnected for convenience
   ═══════════════════════════════════════════ */

export async function isDbReady() {
  await pgPromise
  return USE_PG
}

export async function logAudit(entry) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.logAudit) return pgModule.logAudit(entry)
  return jsonDb.logAudit(entry)
}

export async function getAuditLog(limit = 100) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.getAuditLog) return pgModule.getAuditLog(limit)
  return jsonDb.getAuditLog(limit)
}

export async function saveSystemBackup(entry) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.saveSystemBackup) return pgModule.saveSystemBackup(entry)
  return jsonDb.saveSystemBackup(entry)
}

export async function getLatestBackupMeta(systemId) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.getLatestBackupMeta) return pgModule.getLatestBackupMeta(systemId)
  return jsonDb.getLatestBackupMeta(systemId)
}

export async function setSystemLicense(systemId, active) {
  await pgPromise
  if (USE_PG && pgModule && pgModule.setSystemLicense) return pgModule.setSystemLicense(systemId, active)
  return jsonDb.setSystemLicense(systemId, active)
}
