import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.js'],
    setupFiles: ['./src/__mocks__/vitest-setup.js'],
    // PGlite (Postgres en memoria) tarda >10s en arrancar en frío; sin esto
    // los tests de pg/migraciones fallan por timeout del beforeAll.
    hookTimeout: 60000,
  },
})
