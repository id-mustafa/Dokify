import Fastify from 'fastify';
import { customAlphabet } from 'nanoid';
import jwt from 'jsonwebtoken';
import { db } from './db.js';
import 'dotenv/config';
import { migrate } from './db.js';
import { initDatabase } from './database.js';
import { registerAuthRoutes } from './auth.js';
import { registerDocsRoutes } from './docs.js';
import { registerOAuthRoutes } from './oauth.js';
import { requireApiKey, meterUsage } from './middleware.js'; 213
import { registerAgentRoutes } from './agent.js';
import { attachWebSocket } from './ws.js';
import { claudeSummaries, geminiSynthesize, geminiReadme, mapFacts } from './llm.js';

const nano = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZx', 6);
const app = Fastify({ logger: true, bodyLimit: 50 * 1024 * 1024 });

type DeviceRecord = {
    deviceCode: string;
    userCode: string;
    approved: boolean;
    approvedUserId?: string;
    approvedApiKey?: string;
    expiresAt: number;
    interval: number;
};

const devices = new Map<string, DeviceRecord>();

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const BASE = process.env.API_BASE || `http://127.0.0.1:${PORT}`;
const VERIFY_BASE = process.env.VERIFY_BASE || BASE;
const WEB_BASE = process.env.WEB_BASE || VERIFY_BASE;

// CORS (simple)
app.addHook('onRequest', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Headers', 'content-type, authorization');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
        reply.code(204).send();
    }
});

app.post('/v1/oauth/device', async (req, reply) => {
    const body = (req.body as any) || {};
    if (!body.client_id) return reply.code(400).send({ error: 'invalid_request' });
    const deviceCode = 'dev-' + nano() + nano();
    const userCode = nano() + '-' + nano();
    const expires_in = 600;
    const interval = 2;
    devices.set(deviceCode, { deviceCode, userCode, approved: false, expiresAt: Date.now() + expires_in * 1000, interval });
    return {
        device_code: deviceCode,
        user_code: userCode,
        verification_uri: WEB_BASE + '/login',
        verification_uri_complete: WEB_BASE + '/login?device_code=' + encodeURIComponent(deviceCode),
        expires_in,
        interval
    };
});

app.post('/v1/oauth/token', async (req, reply) => {
    const body = (req.body as any) || {};
    if (body.grant_type !== 'urn:ietf:params:oauth:grant-type:device_code' || !body.device_code) {
        return reply.code(400).send({ error: 'invalid_request' });
    }
    const rec = devices.get(body.device_code as string);
    if (!rec) return reply.code(400).send({ error: 'expired_token' });
    if (Date.now() > rec.expiresAt) return reply.code(400).send({ error: 'expired_token' });
    if (!rec.approvedUserId) return reply.code(400).send({ error: 'authorization_pending', interval: rec.interval });
    const user = db.users.get(rec.approvedUserId);
    if (!user) return reply.code(400).send({ error: 'authorization_pending' });
    const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return { access_token: token, token_type: 'Bearer', expires_in: 3600, api_key: rec.approvedApiKey } as any;
});

app.post('/v1/verify', async (req, reply) => {
    const body = (req.body as any) || {};
    const userCode = body.user_code as string;
    const rec = Array.from(devices.values()).find((d) => d.userCode === userCode);
    if (!rec) return reply.code(400).send({ error: 'invalid_code' });
    rec.approved = true;
    return { ok: true };
});

app.get('/verify', async (req, reply) => {
    const q = req.query as any;
    const userCode = String(q.user_code || '');
    if (!userCode) {
        reply.type('text/plain');
        return reply.send('Missing user_code. Append ?user_code=XXXX-XXXX');
    }
    const rec = Array.from(devices.values()).find((d) => d.userCode === userCode);
    if (!rec) {
        reply.type('text/plain');
        return reply.code(400).send('Invalid or expired code');
    }
    rec.approved = true;
    reply.type('text/plain');
    return reply.send('Approved! You can close this tab.');
});

// LLM endpoints (server-side keys only)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
function requireAuth(req: any): string {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer ')) throw new Error('unauthorized');
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    return payload.sub as string;
}

app.post('/v1/ai/chunk-summaries', async (req, reply) => {
    let userId: string;
    try { userId = requireAuth(req as any); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
    const body = (req.body as any) || {};
    const chunks = Array.isArray(body.chunks) ? body.chunks : [];
    const out = await claudeSummaries(chunks);
    return { summaries: out };
});

app.post('/v1/ai/file-synthesis', async (req, reply) => {
    let userId: string;
    try { userId = requireAuth(req as any); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
    const body = (req.body as any) || {};
    const filePath = String(body.filePath || 'file');
    const summaries = Array.isArray(body.summaries) ? body.summaries : [];
    const snippets = Array.isArray(body.snippets) ? body.snippets : [];
    const text = await geminiSynthesize(filePath, mapFacts(summaries), snippets);
    return { markdown: text };
});

app.post('/v1/ai/project-readme', async (req, reply) => {
    let userId: string;
    try { userId = requireAuth(req as any); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
    const body = (req.body as any) || {};
    const summaries = Array.isArray(body.summaries) ? body.summaries : [];
    const repoName = String(body.repoName || 'Project');
    const text = await geminiReadme(summaries, repoName);
    return { markdown: text };
});

// Serve visualization assets (limited to known filenames)
app.get('/v1/projects/:projectId/assets/:name', async (req, reply) => {
    let userId: string;
    try { userId = requireAuth(req as any); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
    const { projectId, name } = req.params as any;
    const project = db.projects.get(projectId) as any;
    if (!project || project.owner_user_id !== userId) return reply.code(404).send({ error: 'project_not_found' });
    const allowed = new Set(['graph.json', 'index.html']);
    if (!allowed.has(String(name))) return reply.code(404).send({ error: 'not_found' });
    const nameStr = String(name);
    // Try exact key first
    const exactKey = projectId + '::' + nameStr;
    let doc = db.docs.get(exactKey) as any;
    // Fallback: find any doc with this file name suffix (e.g., nested paths)
    if (!doc) {
        for (const [k, v] of db.docs.entries()) {
            if (!k.startsWith(projectId + '::')) continue;
            const p = (v as any).path as string;
            if (p && (p === nameStr || p.endsWith('/' + nameStr))) { doc = v; break; }
        }
    }
    if (!doc) return reply.code(404).send({ error: 'not_found' });
    if (name === 'graph.json') {
        reply.header('content-type', 'application/json');
        return reply.send(doc.content);
    } else {
        reply.header('content-type', 'text/html; charset=utf-8');
        return reply.send(doc.content);
    }
});

// Web approval endpoint: user must be authenticated; links device_code to user
app.post('/v1/oauth/approve', async (req, reply) => {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer ')) return reply.code(401).send({ error: 'unauthorized' });
    try {
        const payload = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'dev-secret') as any;
        const userId = payload.sub as string;
        const body = (req.body as any) || {};
        const deviceCode = String(body.device_code || '');
        if (!deviceCode) return reply.code(400).send({ error: 'invalid_request' });
        const rec = devices.get(deviceCode);
        if (!rec) return reply.code(400).send({ error: 'expired_token' });
        rec.approved = true;
        rec.approvedUserId = userId;
        // Create an API key for this user and stash it on the device record for CLI pickup
        const keyId = 'key_' + nano();
        const keyVal = 'dok_' + nano() + nano();
        db.apiKeys.set(keyId, { id: keyId, user_id: userId, key: keyVal, label: 'device', created_at: Date.now(), last_used_at: null, usage_count: 0 });
        rec.approvedApiKey = keyVal;
        return { ok: true };
    } catch {
        return reply.code(401).send({ error: 'unauthorized' });
    }
});

// /v1/me is handled by auth routes

// Example metered endpoint (placeholder LLM call)
app.post('/v1/llm/example', async (req, reply) => {
    if (!requireApiKey(req, reply)) return;
    // ... perform work ...
    meterUsage(req, reply, { inputTokens: 500, outputTokens: 100, usd: 0.001 });
    return { ok: true };
});

const httpServer = app.server;
const ws = attachWebSocket(httpServer);
app.decorate('ws', ws);

// Boot
(async () => {
    try {
        // Initialize database first
        await initDatabase();
        console.log('Database initialized');

        // Run in-memory migrations for device codes (temporary data)
        migrate();

        // Register routes
        registerAuthRoutes(app);
        registerDocsRoutes(app);
        registerOAuthRoutes(app);
        registerAgentRoutes(app);

        // Start server
        await app.listen({ port: PORT, host: HOST });
        console.log(`Server listening on ${HOST}:${PORT}`);
    } catch (err) {
        app.log.error(err);
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();


