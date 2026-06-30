-- JR Dev Platform — PostgreSQL Schema
-- Run: psql -d jrdev < schema.sql

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'client',
  plan VARCHAR(100),
  avatar TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS systems (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(20),
  type VARCHAR(20) NOT NULL DEFAULT 'desktop',
  description TEXT,
  file_name VARCHAR(255),
  file_size VARCHAR(50),
  version VARCHAR(50) NOT NULL DEFAULT '0.0.0',
  status VARCHAR(20) NOT NULL DEFAULT 'online',
  external_url TEXT,
  api_key VARCHAR(255),
  runbook TEXT,
  license_active BOOLEAN NOT NULL DEFAULT TRUE,
  git_repo TEXT,
  git_branch VARCHAR(100),
  last_commit_sha VARCHAR(100),
  last_commit_msg TEXT,
  last_commit_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS downloads (
  id SERIAL PRIMARY KEY,
  system_id INTEGER REFERENCES systems(id) ON DELETE SET NULL,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  description TEXT,
  file_name VARCHAR(255),
  file_size VARCHAR(50),
  version VARCHAR(50),
  changelog TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry (
  id SERIAL PRIMARY KEY,
  system_id INTEGER NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'online',
  version VARCHAR(50),
  last_heartbeat TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry_errors (
  id SERIAL PRIMARY KEY,
  telemetry_id INTEGER NOT NULL REFERENCES telemetry(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL DEFAULT 'error',
  message TEXT,
  stacktrace TEXT,
  logged_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  system_id INTEGER REFERENCES systems(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name VARCHAR(255),
  text TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(100),
  amount DECIMAL(12, 2),
  currency VARCHAR(10) NOT NULL DEFAULT 'COP',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  method VARCHAR(100),
  due_date DATE,
  paid_at TIMESTAMP,
  invoice VARCHAR(100),
  early_requested BOOLEAN NOT NULL DEFAULT FALSE,
  early_requested_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Respaldos en la nube de sistemas de escritorio (ej. Pocitos POS). El sistema
-- sube su BD local cuando hay internet; guardamos los últimos por seguridad.
CREATE TABLE IF NOT EXISTS system_backups (
  id SERIAL PRIMARY KEY,
  system_id INTEGER NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  client_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  file_name VARCHAR(255),
  size_bytes INTEGER,
  data BYTEA NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Registro de auditoría: acciones de admin (crear cliente/sistema, regenerar
-- API key, resolver errores, etc.) para trazabilidad.
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  actor_name VARCHAR(255),
  action VARCHAR(60) NOT NULL,
  target_type VARCHAR(40),
  target_id VARCHAR(60),
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_systems_client_id ON systems(client_id);
CREATE INDEX IF NOT EXISTS idx_systems_api_key ON systems(api_key);
CREATE INDEX IF NOT EXISTS idx_downloads_client_id ON downloads(client_id);
CREATE INDEX IF NOT EXISTS idx_downloads_system_id ON downloads(system_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_system_id ON telemetry(system_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_client_id ON telemetry(client_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_errors_telemetry_id ON telemetry_errors(telemetry_id);
CREATE INDEX IF NOT EXISTS idx_tickets_client_id ON tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_tickets_system_id ON tickets(system_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_backups_system_id ON system_backups(system_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
