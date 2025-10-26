import { FastifyInstance } from 'fastify';
import { db } from './db.js';
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function requireAuth(req: any) {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer ')) throw new Error('unauthorized');
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    return payload.sub as string;
}

export function registerDocsRoutes(app: FastifyInstance) {
    app.get('/v1/projects', async (req, reply) => {
        let userId: string;
        try { userId = requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const rows = Array.from(db.projects.values()).filter((p) => p.owner_user_id === userId).sort((a, b) => a.created_at - b.created_at).map((p) => ({ id: p.id, name: p.name, slug: p.slug }));
        return { projects: rows };
    });

    app.post('/v1/projects', async (req, reply) => {
        let userId: string;
        try { userId = requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const body = (req.body as any) || {};
        const name = String(body.name || 'Project');
        const slug = String(body.slug || 'proj-' + nano());
        const id = 'prj_' + nano();
        db.projects.set(id, { id, owner_user_id: userId, name, slug, created_at: Date.now() });
        return { id, name, slug };
    });

    app.post('/v1/projects/:projectId/docs', async (req, reply) => {
        let userId: string;
        try { userId = requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const { projectId } = req.params as any;
        const project = db.projects.get(projectId) as any;
        if (!project || project.owner_user_id !== userId) return reply.code(404).send({ error: 'project_not_found' });
        if (!project) return reply.code(404).send({ error: 'project_not_found' });
        const body = (req.body as any) || {};
        const files = Array.isArray(body.files) ? body.files : [];
        for (const f of files) {
            const key = projectId + '::' + String(f.path);
            db.docs.set(key, { id: 'doc_' + nano(), project_id: projectId, path: String(f.path), content: String(f.content), updated_at: Date.now() });
        }
        // Broadcast live update over websocket if available
        try { (app as any).ws?.broadcast(projectId, { type: 'docs-updated', projectId, count: files.length }); } catch { }
        return { ok: true, count: files.length };
    });

    app.get('/v1/projects/:projectId/docs', async (req, reply) => {
        let userId: string;
        try { userId = requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const { projectId } = req.params as any;
        const project = db.projects.get(projectId) as any;
        if (!project || project.owner_user_id !== userId) return reply.code(404).send({ error: 'project_not_found' });
        const rows = Array.from(db.docs.values())
            .filter((d) => d.project_id === projectId)
            .filter((d) => d.path.toLowerCase().endsWith('.md'))
            .sort((a, b) => a.path.localeCompare(b.path))
            .map((d) => ({ path: d.path, content: d.content, updated_at: d.updated_at }));
        return { files: rows };
    });

    app.get('/v1/projects/:projectId/docs-tree', async (req, reply) => {
        let userId: string;
        try { userId = requireAuth(req); } catch { return reply.code(401).send({ error: 'unauthorized' }); }
        const { projectId } = req.params as any;
        const project = db.projects.get(projectId) as any;
        if (!project || project.owner_user_id !== userId) return reply.code(404).send({ error: 'project_not_found' });
        const rows = Array.from(db.docs.values()).filter((d) => d.project_id === projectId).map((d) => d.path);
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


