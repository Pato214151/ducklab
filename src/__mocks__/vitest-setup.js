import { vi } from 'vitest'
import os from 'os'
import path from 'path'

// Aísla la BD de los tests: nunca tocar data/db.json real.
process.env.JRDEV_DB_FILE = path.join(os.tmpdir(), `jrdev-test-db-${process.pid}.json`)

vi.mock('server-only', () => ({}))
