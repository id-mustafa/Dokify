import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Client } = pkg;

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const databaseUrl = process.env.DATABASE_URL || ''; // Optional: for migrations

if (!supabaseUrl || !supabaseKey) {
    console.warn('SUPABASE_URL or SUPABASE_KEY not set. Please add to server/.env');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database interface
export const database = {
    // Users
    async getUser(id: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();
        return error ? null : data;
    },

    async getUserByEmail(email: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        return error ? null : data;
    },

    async getUserByProvider(provider: string, providerId: string) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('provider', provider)
            .eq('provider_id', providerId)
            .single();
        return error ? null : data;
    },

    async createUser(user: { id: string; email: string; password_hash: string; name?: string; provider?: string; provider_id?: string }) {
        const now = Date.now();
        const { data, error } = await supabase
            .from('users')
            .insert({
                id: user.id,
                email: user.email,
                password_hash: user.password_hash,
                name: user.name || null,
                provider: user.provider || 'local',
                provider_id: user.provider_id || null,
                created_at: now,
                updated_at: now
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Projects
    async getProject(id: string) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();
        return error ? null : data;
    },

    async getProjectsByUser(userId: string) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('owner_user_id', userId)
            .order('created_at', { ascending: false });
        return error ? [] : data;
    },

    async createProject(project: { id: string; owner_user_id: string; name: string; slug: string }) {
        const now = Date.now();
        const { data, error } = await supabase
            .from('projects')
            .insert({
                id: project.id,
                owner_user_id: project.owner_user_id,
                name: project.name,
                slug: project.slug,
                created_at: now,
                updated_at: now
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteProject(id: string) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Docs
    async getDoc(id: string) {
        const { data, error } = await supabase
            .from('docs')
            .select('*')
            .eq('id', id)
            .single();
        return error ? null : data;
    },

    async getDocsByProject(projectId: string) {
        const { data, error } = await supabase
            .from('docs')
            .select('*')
            .eq('project_id', projectId);
        return error ? [] : data;
    },

    async upsertDoc(doc: { id: string; project_id: string; path: string; content: string }) {
        const now = Date.now();
        const { data, error } = await supabase
            .from('docs')
            .upsert({
                id: doc.id,
                project_id: doc.project_id,
                path: doc.path,
                content: doc.content,
                updated_at: now
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteDocs(projectId: string) {
        const { error } = await supabase
            .from('docs')
            .delete()
            .eq('project_id', projectId);
        if (error) throw error;
    },

    // API Keys
    async getApiKey(key: string) {
        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('key', key)
            .is('revoked_at', null)
            .single();
        return error ? null : data;
    },

    async getApiKeysByUser(userId: string) {
        const { data, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', userId)
            .is('revoked_at', null)
            .order('created_at', { ascending: false });
        return error ? [] : data;
    },

    async createApiKey(apiKey: { id: string; user_id: string; key: string; name?: string }) {
        const now = Date.now();
        const { data, error } = await supabase
            .from('api_keys')
            .insert({
                id: apiKey.id,
                user_id: apiKey.user_id,
                key: apiKey.key,
                name: apiKey.name || null,
                created_at: now
            })
            .select()
            .single();

        if (error) throw error;

        // Initialize usage
        await supabase.from('api_usage').insert({
            id: apiKey.id + '_usage',
            key_id: apiKey.id,
            total_requests: 0,
            total_input_tokens: 0,
            total_output_tokens: 0,
            total_usd: 0
        });

        return data;
    },

    async revokeApiKey(id: string) {
        const now = Date.now();
        const { error } = await supabase
            .from('api_keys')
            .update({ revoked_at: now })
            .eq('id', id);
        if (error) throw error;
    },

    async updateApiKeyUsage(keyId: string, usage: { inputTokens?: number; outputTokens?: number; usd?: number }) {
        const now = Date.now();

        // Update usage table
        const { error: usageError } = await supabase.rpc('increment_api_usage', {
            p_key_id: keyId,
            p_input_tokens: usage.inputTokens || 0,
            p_output_tokens: usage.outputTokens || 0,
            p_usd: usage.usd || 0,
            p_timestamp: now
        });

        // If RPC doesn't exist, fall back to manual update
        if (usageError) {
            const { data: currentUsage } = await supabase
                .from('api_usage')
                .select('*')
                .eq('key_id', keyId)
                .single();

            if (currentUsage) {
                await supabase
                    .from('api_usage')
                    .update({
                        total_requests: currentUsage.total_requests + 1,
                        total_input_tokens: currentUsage.total_input_tokens + (usage.inputTokens || 0),
                        total_output_tokens: currentUsage.total_output_tokens + (usage.outputTokens || 0),
                        total_usd: parseFloat(currentUsage.total_usd) + (usage.usd || 0),
                        last_used_at: now
                    })
                    .eq('key_id', keyId);
            }
        }

        // Update key's last_used_at and usage_count
        const { data: key } = await supabase
            .from('api_keys')
            .select('usage_count')
            .eq('id', keyId)
            .single();

        if (key) {
            await supabase
                .from('api_keys')
                .update({
                    usage_count: key.usage_count + 1,
                    last_used_at: now
                })
                .eq('id', keyId);
        }
    },

    async getApiUsage(keyId: string) {
        const { data, error } = await supabase
            .from('api_usage')
            .select('*')
            .eq('key_id', keyId)
            .single();
        return error ? null : data;
    },

    // Chats
    async getChat(id: string) {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('id', id)
            .single();
        return error ? null : data;
    },

    async getChatsByUser(userId: string, projectId?: string) {
        let query = supabase
            .from('chats')
            .select('*')
            .eq('user_id', userId);

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        const { data, error } = await query.order('updated_at', { ascending: false });
        return error ? [] : data;
    },

    async createChat(chat: { id: string; user_id: string; project_id: string; title: string }) {
        const now = Date.now();
        const { data, error } = await supabase
            .from('chats')
            .insert({
                id: chat.id,
                user_id: chat.user_id,
                project_id: chat.project_id,
                title: chat.title,
                created_at: now,
                updated_at: now
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateChat(id: string, updates: { title?: string }) {
        const now = Date.now();
        const { data, error } = await supabase
            .from('chats')
            .update({
                ...(updates.title && { title: updates.title }),
                updated_at: now
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteChat(id: string) {
        const { error } = await supabase
            .from('chats')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Messages
    async getMessagesByChat(chatId: string) {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true });
        return error ? [] : data;
    },

    async createMessage(message: { id: string; chat_id: string; role: 'user' | 'assistant'; content: string }) {
        const now = Date.now();
        const { data, error } = await supabase
            .from('messages')
            .insert({
                id: message.id,
                chat_id: message.chat_id,
                role: message.role,
                content: message.content,
                created_at: now
            })
            .select()
            .single();

        if (error) throw error;

        // Update chat's updated_at
        await supabase
            .from('chats')
            .update({ updated_at: now })
            .eq('id', message.chat_id);

        return data;
    }
};

// Initialize database (test connection and create tables)
export async function initDatabase() {
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('SUPABASE_URL and SUPABASE_KEY are required');
    }

    try {
        console.log('Initializing database...');

        // Create tables if they don't exist
        await createTables();

        // Test connection
        const { error } = await supabase.from('users').select('count').limit(1);
        if (error) {
            console.warn('Warning: Could not query users table:', error.message);
            // Try to create tables again if initial query failed
            await createTables();
        }

        console.log('Database initialized successfully');
        return true;
    } catch (error: any) {
        console.error('Database initialization failed:', error.message || error);
        throw error;
    }
}

// Create all required tables
async function createTables() {
    const schema = `
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

        -- Chats table
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

        -- Messages table
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            created_at BIGINT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(chat_id, created_at);
    `;

    // If DATABASE_URL is not provided, skip auto-migration
    if (!databaseUrl) {
        console.log('DATABASE_URL not set. Skipping auto-migration.');
        console.log('   Please run schema.sql in Supabase SQL Editor if tables don\'t exist.');
        return;
    }

    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();
        console.log('Running schema migrations...');

        // Execute the entire schema as one transaction
        await client.query(schema);
        console.log('Schema migrations completed');
    } catch (error: any) {
        console.log('Auto-migration failed:', error.message);
        console.log('   Please run schema.sql in Supabase SQL Editor manually.');
    } finally {
        await client.end();
    }
}
