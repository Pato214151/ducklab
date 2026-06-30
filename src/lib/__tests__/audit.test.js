import { describe, it, expect, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { logAudit, getAuditLog } from '@/lib/db-json'

describe('audit log (db-json)', () => {
  it('registra una acción y la devuelve', () => {
    logAudit({ actorId: 7, actorName: 'Admin Test', action: 'client.create', targetType: 'client', targetId: 42, details: 'Creó cliente "X"' })
    const log = getAuditLog(50)
    const entry = log.find((e) => e.action === 'client.create' && e.targetId === '42')
    expect(entry).toBeTruthy()
    expect(entry.actorName).toBe('Admin Test')
    expect(entry.targetId).toBe('42') // se guarda como string
  })

  it('devuelve lo más reciente primero', () => {
    logAudit({ action: 'system.create', details: 'viejo' })
    logAudit({ action: 'apikey.regenerate', details: 'nuevo' })
    const log = getAuditLog(50)
    const idxNuevo = log.findIndex((e) => e.action === 'apikey.regenerate')
    const idxViejo = log.findIndex((e) => e.action === 'system.create')
    expect(idxNuevo).toBeLessThan(idxViejo)
  })

  it('respeta el límite', () => {
    for (let i = 0; i < 6; i++) logAudit({ action: 'download.publish' })
    expect(getAuditLog(3).length).toBe(3)
  })

  it('tolera campos opcionales vacíos', () => {
    expect(() => logAudit({ action: 'runbook.update' })).not.toThrow()
    const e = getAuditLog(1)[0]
    expect(e.action).toBe('runbook.update')
    expect(e.actorId).toBeNull()
  })
})
