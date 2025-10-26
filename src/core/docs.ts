import fs from 'node:fs';
import path from 'node:path';
import { RepoScan } from './scan.js';
import { FileChunk } from './chunk.js';
import { ChunkSummary } from './summarize.js';
import { GeminiProvider } from '../llm/gemini.js';

export type WriteDocsParams = {
    projectRoot: string;
    docsDir: string;
    scan: RepoScan;
    chunks: FileChunk[];
    summaries: ChunkSummary[];
    gemini?: GeminiProvider;
    useGemini?: boolean;
    fileSynthesisConcurrency?: number;
};

export type WriteDocsResult = {
    written: number;
};

export async function writeDocs(params: WriteDocsParams): Promise<WriteDocsResult> {
    const filesByPath = new Map<string, ChunkSummary[]>();
    for (const s of params.summaries) {
        const list = filesByPath.get(s.filePath) || [];
        list.push(s);
        filesByPath.set(s.filePath, list);
    }

    let written = 0;
    const filesDir = path.join(params.docsDir, 'files');
    if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });

    // Persisted versioning per file
    const versionsPath = path.join(params.projectRoot, '.dokify', 'versions.json');
    const versions: Record<string, number> = (() => {
        try { return JSON.parse(fs.readFileSync(versionsPath, 'utf-8')) as Record<string, number>; } catch { return {}; }
    })();

    const tasks = Array.from(filesByPath.entries()).map(([filePath, list]) => {
        list.sort((a, b) => a.index - b.index);
        return { filePath, list } as { filePath: string; list: ChunkSummary[] };
    });

    const fileConcurrency = Math.max(1, Math.min(16, params.fileSynthesisConcurrency ?? 4));
    const queue = tasks.slice();
    const workers: Promise<void>[] = [];

    for (let i = 0; i < fileConcurrency; i++) {
        workers.push((async () => {
            while (queue.length > 0) {
                const task = queue.shift();
                if (!task) break;
                const { filePath, list } = task;
                const rel = path.relative(params.projectRoot, filePath);
                const target = path.join(filesDir, rel.endsWith('.md') ? rel : rel + '.md');
                const targetDir = path.dirname(target);
                if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

                const entities = unique(list.flatMap((s) => s.entities)).slice(0, 100);
                const deps = unique(list.flatMap((s) => s.dependencies)).slice(0, 100);
                const version = (versions[rel] || 0) + 1;
                versions[rel] = version;
                const fm = frontmatter({
                    path: rel,
                    chunkCount: list.length,
                    entities,
                    dependenciesPreview: deps.slice(0, 10),
                    version,
                    generated_at: new Date().toISOString()
                });

                let body = renderFileDoc(rel, list, entities, deps);
                if (/(^|\/)package\.json$/i.test(rel)) {
                    body = renderPackageJsonDoc(path.join(params.projectRoot, rel), rel);
                } else if (/(^|\/)package-lock\.json$/i.test(rel)) {
                    body = renderPackageLockDoc(rel);
                } else if (params.useGemini && params.gemini) {
                    try {
                        const snippets = params.chunks
                            .filter((c) => c.filePath === filePath)
                            .map((c) => ({ index: c.index, startLine: c.startLine, endLine: c.endLine, text: c.content }));
                        const rich = await params.gemini.synthesizeFile(rel, list, snippets);
                        if (rich && rich.trim().length > 0) {
                            body = sanitizeMarkdown(rich);
                        }
                    } catch { }
                } else {
                    // Server-side synthesis fallback
                    try {
                        const server = process.env.DOKIFY_API_BASE || process.env.DOKIFY_API_URL || 'http://127.0.0.1:4000';
                        const snippets = params.chunks
                            .filter((c) => c.filePath === filePath)
                            .map((c) => ({ index: c.index, startLine: c.startLine, endLine: c.endLine, content: c.content }));
                        const res = await fetch(server.replace(/\/$/, '') + '/v1/ai/file-synthesis', {
                            method: 'POST', headers: { 'content-type': 'application/json' },
                            body: JSON.stringify({ filePath: rel, summaries: list, snippets })
                        });
                        if (res.ok) {
                            const json = await res.json() as any;
                            const rich = String(json?.markdown || '');
                            if (rich.trim()) body = sanitizeMarkdown(rich);
                        }
                    } catch { }
                }

                body += `\n\n---\nGenerated: ${new Date().toISOString()}  •  Version: v${version}\n`;
                fs.writeFileSync(target, fm + '\n' + body, 'utf-8');
                written += 1;
            }
        })());
    }
    await Promise.all(workers);

    // Write a simple overview
    const overviewDir = path.join(params.docsDir, 'overview');
    if (!fs.existsSync(overviewDir)) fs.mkdirSync(overviewDir, { recursive: true });
    const overviewMd = path.join(overviewDir, 'overview.md');
    fs.writeFileSync(overviewMd, renderOverview(params.scan), 'utf-8');

    // Write a synthesized README at repo root of docs
    if (params.useGemini && params.gemini) {
        try {
            const readme = await params.gemini.synthesizeReadme(params.summaries, { repoName: path.basename(params.projectRoot) });
            const readmePath = path.join(params.docsDir, 'README.md');
            fs.writeFileSync(readmePath, readme, 'utf-8');
        } catch { }
    }

    // Save versions
    try {
        const dir = path.dirname(versionsPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(versionsPath, JSON.stringify(versions, null, 2), 'utf-8');
    } catch { }
    return { written };
}

function frontmatter(obj: Record<string, unknown>): string {
    const yaml = toYaml(obj);
    return `---\n${yaml}---`;
}

function toYaml(obj: Record<string, unknown>): string {
    const lines: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
        if (Array.isArray(v)) {
            lines.push(`${k}:`);
            for (const item of v) lines.push(`  - ${escapeYaml(String(item))}`);
        } else if (typeof v === 'object' && v !== null) {
            lines.push(`${k}:`);
            for (const [k2, v2] of Object.entries(v)) lines.push(`  ${k2}: ${escapeYaml(String(v2))}`);
        } else {
            lines.push(`${k}: ${escapeYaml(String(v))}`);
        }
    }
    return lines.join('\n') + '\n';
}

function escapeYaml(v: string): string {
    if (/[:\-\[\]\{\}\n#]/.test(v)) return JSON.stringify(v);
    return v;
}

function renderFileDoc(relPath: string, list: ChunkSummary[], entities: string[], deps: string[]): string {
    const heading = `# ${relPath}`;
    const sections: string[] = [];
    sections.push('## Overview');
    sections.push(`Auto-generated summary from ${list.length} chunk(s).`);

    if (entities.length) {
        sections.push('## Key Entities');
        sections.push(entities.map((e) => `- ${e}`).join('\n'));
    }
    if (deps.length) {
        sections.push('## Dependencies (preview)');
        sections.push(deps.slice(0, 20).map((d) => `- ${d}`).join('\n'));
    }

    sections.push('## Chunk Notes');
    for (const s of list) {
        sections.push(`### Chunk ${s.index + 1}/${s.total}`);
        if (s.purpose) sections.push(`- Purpose: ${s.purpose}`);
        if (s.entities.length) sections.push(`- Entities: ${s.entities.slice(0, 10).join(', ')}`);
    }

    return [heading, '', ...sections].join('\n');
}

function renderPackageJsonDoc(absPath: string, rel: string): string {
    try {
        const raw = fs.readFileSync(absPath, 'utf-8');
        const pkg = JSON.parse(raw);
        const lines: string[] = [];
        lines.push(`# ${rel}`);
        lines.push('');
        if (pkg.name || pkg.version) {
            lines.push('## Package');
            if (pkg.name) lines.push(`- name: ${pkg.name}`);
            if (pkg.version) lines.push(`- version: ${pkg.version}`);
            lines.push('');
        }
        if (pkg.scripts && typeof pkg.scripts === 'object') {
            lines.push('## Scripts');
            for (const [k, v] of Object.entries(pkg.scripts)) lines.push(`- ${k}: ${String(v)}`);
            lines.push('');
        }
        const depSections = [
            ['Dependencies', pkg.dependencies],
            ['Dev Dependencies', pkg.devDependencies],
            ['Peer Dependencies', pkg.peerDependencies]
        ] as const;
        for (const [title, obj] of depSections) {
            if (obj && typeof obj === 'object') {
                lines.push(`## ${title}`);
                for (const [k, v] of Object.entries(obj)) lines.push(`- ${k}: ${String(v)}`);
                lines.push('');
            }
        }
        return lines.join('\n');
    } catch {
        return `# ${rel}\n\nCould not parse package.json.`;
    }
}

function renderPackageLockDoc(rel: string): string {
    return `# ${rel}\n\nThis is a lockfile and not intended for human reading. It pins exact versions for reproducible installs.`;
}

function sanitizeMarkdown(md: string): string {
    let out = md.trim();
    // Strip fenced md/markdown blocks
    out = out.replace(/^```(?:md|markdown)\s*\n([\s\S]*?)\n```$/im, '$1');
    return out;
}

function renderOverview(scan: RepoScan): string {
    const lines: string[] = [];
    lines.push('# Project Overview');
    lines.push('Auto-generated project overview.');
    lines.push('');
    lines.push('## File Count');
    lines.push(String(scan.files.length));
    lines.push('');
    lines.push('## Files');
    for (const f of scan.files) {
        const rel = path.relative(scan.root, f);
        lines.push(`- ${rel}`);
    }
    return lines.join('\n') + '\n';
}

function unique<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }


