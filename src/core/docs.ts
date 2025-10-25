import fs from 'node:fs';
import path from 'node:path';
import { RepoScan } from './scan.js';
import { FileChunk } from './chunk.js';
import { ChunkSummary } from './summarize.js';

export type WriteDocsParams = {
    projectRoot: string;
    docsDir: string;
    scan: RepoScan;
    chunks: FileChunk[];
    summaries: ChunkSummary[];
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

    for (const [filePath, list] of filesByPath.entries()) {
        list.sort((a, b) => a.index - b.index);
        const rel = path.relative(params.projectRoot, filePath);
        const target = path.join(filesDir, rel + '.md');
        const targetDir = path.dirname(target);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const entities = unique(list.flatMap((s) => s.entities)).slice(0, 100);
        const deps = unique(list.flatMap((s) => s.dependencies)).slice(0, 100);
        const fm = frontmatter({
            path: rel,
            chunkCount: list.length,
            entities,
            dependenciesPreview: deps.slice(0, 10)
        });
        const body = renderFileDoc(rel, list, entities, deps);
        fs.writeFileSync(target, fm + '\n' + body, 'utf-8');
        written += 1;
    }

    // Write a simple overview
    const overviewDir = path.join(params.docsDir, 'overview');
    if (!fs.existsSync(overviewDir)) fs.mkdirSync(overviewDir, { recursive: true });
    const overviewMd = path.join(overviewDir, 'overview.md');
    fs.writeFileSync(overviewMd, renderOverview(params.scan), 'utf-8');

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


