import { FastifyInstance } from 'fastify';
import { db } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function registerAuthRoutes(app: FastifyInstance) {
    app.post('/v1/auth/register', async (req, reply) => {
        const body = (req.body as any) || {};
        const email = String(body.email || '').toLowerCase();
        const name = body.name ? String(body.name) : undefined;
        const password = String(body.password || '');
        if (!email || !password) return reply.code(400).send({ error: 'invalid_request' });
        const existing = Array.from(db.users.values()).find((u) => u.email === email);
        if (existing) {
            // If the user exists but has no password (OAuth-only), set a password now
            if (!existing.password_hash) {
                existing.password_hash = bcrypt.hashSync(password, 10);
                if (name) existing.name = name;
                const token = jwt.sign({ sub: existing.id, email }, JWT_SECRET, { expiresIn: '7d' });
                return { access_token: token, token_type: 'Bearer' };
            }
            return reply.code(409).send({ error: 'email_in_use' });
        }
        const id = 'usr_' + nano();
        const hash = bcrypt.hashSync(password, 10);
        db.users.set(id, { id, email, name, password_hash: hash, created_at: Date.now() });
        const token = jwt.sign({ sub: id, email }, JWT_SECRET, { expiresIn: '7d' });
        return { access_token: token, token_type: 'Bearer' };
    });

    app.post('/v1/auth/login', async (req, reply) => {
        const body = (req.body as any) || {};
        const email = String(body.email || '').toLowerCase();
        const password = String(body.password || '');
        const user = Array.from(db.users.values()).find((u) => u.email === email) as any;
        if (!user) return reply.code(401).send({ error: 'invalid_credentials' });
        const ok = bcrypt.compareSync(password, user.password_hash);
        if (!ok) return reply.code(401).send({ error: 'invalid_credentials' });
        const token = jwt.sign({ sub: user.id, email }, JWT_SECRET, { expiresIn: '7d' });
        return { access_token: token, token_type: 'Bearer' };
    });

    app.get('/v1/me', async (req, reply) => {
        const auth = req.headers['authorization'] || '';
        if (!auth.startsWith('Bearer ')) return reply.code(401).send({ error: 'unauthorized' });
        try {
            const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
            const user = db.users.get(payload.sub as string) as any;
            if (!user) return reply.code(401).send({ error: 'unauthorized' });
            return { id: user.id, email: user.email, name: user.name };
        } catch {
            return reply.code(401).send({ error: 'unauthorized' });
        }
    });

    // API Keys: create, list, revoke
    app.post('/v1/api-keys', async (req, reply) => {
        const auth = req.headers['authorization'] || '';
        if (!auth.startsWith('Bearer ')) return reply.code(401).send({ error: 'unauthorized' });
        const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
        const userId = payload.sub as string;
        const body = (req.body as any) || {};
        const label = String(body.label || 'default');
        const id = 'key_' + nano();
        const key = 'dok_' + nano() + nano();
        db.apiKeys.set(id, { id, user_id: userId, key, label, created_at: Date.now(), last_used_at: null, usage_count: 0 });
        return { id, key, label, created_at: Date.now() };
    });

    app.get('/v1/api-keys', async (req, reply) => {
        const auth = req.headers['authorization'] || '';
        if (!auth.startsWith('Bearer ')) return reply.code(401).send({ error: 'unauthorized' });
        const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
        const userId = payload.sub as string;
        const keys = Array.from(db.apiKeys.values()).filter((k) => k.user_id === userId).map((k) => ({ id: k.id, label: k.label, created_at: k.created_at, last_used_at: k.last_used_at, usage_count: k.usage_count }));
        return { keys };
    });

    app.delete('/v1/api-keys/:id', async (req, reply) => {
        const auth = req.headers['authorization'] || '';
        if (!auth.startsWith('Bearer ')) return reply.code(401).send({ error: 'unauthorized' });
        const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
        const userId = payload.sub as string;
        const { id } = req.params as any;
        const key = db.apiKeys.get(id);
        if (!key || key.user_id !== userId) return reply.code(404).send({ error: 'not_found' });
        db.apiKeys.delete(id);
        return { ok: true };
    });
}


