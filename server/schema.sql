-- Dokify Database Schema for Supabase

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    provider TEXT DEFAULT 'local',
    provider_id TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Docs table
CREATE TABLE IF NOT EXISTS docs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_docs_project ON docs(project_id);
CREATE INDEX IF NOT EXISTS idx_docs_path ON docs(project_id, path);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key TEXT UNIQUE NOT NULL,
    name TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at BIGINT NOT NULL,
    last_used_at BIGINT,
    revoked_at BIGINT
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(key) WHERE revoked_at IS NULL;

-- API Usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
    id TEXT PRIMARY KEY,
    key_id TEXT NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    total_requests INTEGER DEFAULT 0,
    total_input_tokens INTEGER DEFAULT 0,
    total_output_tokens INTEGER DEFAULT 0,
    total_usd DECIMAL(10, 6) DEFAULT 0,
    last_used_at BIGINT
);

CREATE INDEX IF NOT EXISTS idx_api_usage_key ON api_usage(key_id);

-- Chats table (NEW)
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chats_user ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_project ON chats(project_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_project ON chats(user_id, project_id);

-- Messages table (NEW)
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(chat_id, created_at);

-- Device codes for OAuth (in-memory alternative for now)
-- We'll keep this in memory since it's temporary data

