import { FastifyInstance } from 'fastify';
import { database } from './database.js';
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

async function requireAuth(req: any): Promise<string> {
    // Try Bearer token (JWT) first
    const auth = req.headers['authorization'] || '';
    if (auth.startsWith('Bearer ')) {
        try {
            const token = auth.slice(7);
            const payload = jwt.verify(token, JWT_SECRET) as any;
            return payload.sub as string;
        } catch {
            // Not a valid JWT, might be an API key
        }
    }

    // Try API key in Authorization header (Bearer format)
    if (auth.startsWith('Bearer ')) {
        const apiKey = auth.slice(7);
        const record = await database.getApiKey(apiKey);
        if (record) {
            return record.user_id;
        }
    }

    // Try x-api-key header
    const apiKey = (req.headers['x-api-key'] as string) || '';
    if (apiKey) {
        const record = await database.getApiKey(apiKey);
        if (record) {
            return record.user_id;
        }
    }

    throw new Error('unauthorized');
}

export function registerDocsRoutes(app: FastifyInstance) {
    app.get('/v1/projects', async (req, reply) => {
        let userId: string;
        try { userId = await requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const projects = await database.getProjectsByUser(userId);
        const rows = projects.map((p: any) => ({ id: p.id, name: p.name, slug: p.slug }));
        return { projects: rows };
    });

    app.post('/v1/projects', async (req, reply) => {
        let userId: string;
        try { userId = await requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const body = (req.body as any) || {};
        const name = String(body.name || 'Project');
        const slug = String(body.slug || 'proj-' + nano());
        const id = 'prj_' + nano();
        await database.createProject({ id, owner_user_id: userId, name, slug });
        return { id, name, slug };
    });

    app.delete('/v1/projects/:projectId', async (req, reply) => {
        let userId: string;
        try { userId = await requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const { projectId } = req.params as any;
        const project = await database.getProject(projectId);
        if (!project || project.owner_user_id !== userId) return reply.code(404).send({ error: 'project_not_found' });
        await database.deleteProject(projectId);
        try { (app as any).ws?.broadcast('', { type: 'project-deleted', projectId }); } catch { }
        return { ok: true };
    });

    app.post('/v1/projects/:projectId/docs', async (req, reply) => {
        let userId: string;
        try { userId = await requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const { projectId } = req.params as any;
        const project = await database.getProject(projectId);
        if (!project || project.owner_user_id !== userId) return reply.code(404).send({ error: 'project_not_found' });

        const body = (req.body as any) || {};
        const files = Array.isArray(body.files) ? body.files : [];

        for (const f of files) {
            await database.upsertDoc({
                id: 'doc_' + nano(),
                project_id: projectId,
                path: String(f.path),
                content: String(f.content)
            });
        }

        // Broadcast live update over websocket if available
        try { (app as any).ws?.broadcast(projectId, { type: 'docs-updated', projectId, count: files.length }); } catch { }
        return { ok: true, count: files.length };
    });

    app.get('/v1/projects/:projectId/docs', async (req, reply) => {
        let userId: string;
        try { userId = await requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const { projectId } = req.params as any;
        const project = await database.getProject(projectId);
        if (!project || project.owner_user_id !== userId) return reply.code(404).send({ error: 'project_not_found' });

        const docs = await database.getDocsByProject(projectId);
        const rows = docs
            .filter((d: any) => d.path.toLowerCase().endsWith('.md'))
            .sort((a: any, b: any) => a.path.localeCompare(b.path))
            .map((d: any) => ({ path: d.path, content: d.content, updated_at: d.updated_at }));
        return { files: rows };
    });

    app.get('/v1/projects/:projectId/docs-tree', async (req, reply) => {
        let userId: string;
        try { userId = await requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const { projectId } = req.params as any;
        const project = await database.getProject(projectId);
        if (!project || project.owner_user_id !== userId) return reply.code(404).send({ error: 'project_not_found' });

        const docs = await database.getDocsByProject(projectId);
        const rows = docs.map((d: any) => d.path);

        function insert(node: any, parts: string[], full: string) {
            if (parts.length === 0) return;
            const [head, ...rest] = parts;
            node.children = node.children || [];
            let child = node.children.find((c: any) => c.name === head);
            if (!child) {
                child = { name: head, path: rest.length === 0 ? full : undefined, children: [] };
                node.children.push(child);
            }
            insert(child, rest, full);
        }
        const root: any = { name: '', children: [] };
        for (const p of rows) insert(root, p.split('/'), p);
        return { tree: root.children };
    });
}


