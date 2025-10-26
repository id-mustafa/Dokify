import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../config.js';

type UploadFile = { path: string; content: string };

export async function uploadDocs(params: { docsDir: string }): Promise<void> {
    const config = loadConfig();
    if (!config.apiBaseUrl || !config.token) {
        console.log('No API base URL or token set. Skipping upload.');
        return;
    }
    const api = config.apiBaseUrl.replace(/\/$/, '');
    const projectName = path.basename(process.cwd());
    const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'project';

    // Ensure project exists (find or create)
    const headers = { 'content-type': 'application/json', authorization: `Bearer ${config.token}` } as Record<string, string>;
    const listRes = await fetch(`${api}/v1/projects`, { headers });
    if (!listRes.ok) throw new Error(`Failed to list projects: ${listRes.status}`);
    const listJson = (await listRes.json()) as { projects: { id: string; name: string; slug: string }[] };
    let project = listJson.projects.find((p) => p.slug === slug) || null;
    let projectId: string;
    if (!project) {
        const createRes = await fetch(`${api}/v1/projects`, { method: 'POST', headers, body: JSON.stringify({ name: projectName, slug }) });
        if (!createRes.ok) throw new Error(`Failed to create project: ${createRes.status}`);
        const created = (await createRes.json()) as { id: string };
        projectId = created.id;
    } else {
        projectId = project.id;
    }

    // Collect files from docs directory
    const files: UploadFile[] = [];
    const base = params.docsDir;
    walk(base, (fp) => {
        const rel = path.relative(base, fp).replace(/\\/g, '/');
        const content = fs.readFileSync(fp, 'utf-8');
        files.push({ path: rel, content });
    });

    // Upload
    const upRes = await fetch(`${api}/v1/projects/${projectId}/docs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ files })
    });
    if (!upRes.ok) throw new Error(`Failed to upload docs: ${upRes.status}`);
}

function walk(dir: string, onFile: (fp: string) => void) {
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const st = fs.statSync(full);
        if (st.isDirectory()) walk(full, onFile);
        else onFile(full);
    }
}

