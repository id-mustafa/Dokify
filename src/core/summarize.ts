import { FileChunk } from './chunk.js';
import os from 'node:os';
import { loadConfig } from '../config.js';
import { CacheStore } from './cache.js';
// Client no longer directly calls LLMs; summaries fetched from server

export type ChunkSummary = {
    filePath: string;
    index: number;
    total: number;
    entities: string[];
    purpose: string;
    inputs: string[];
    outputs: string[];
    dependencies: string[];
    notes: string[];
};

export type SummarizeOptions = {
    localOnly?: boolean;
    concurrency?: number;
    noCache?: boolean;
};

export async function summarizeChunks(chunks: FileChunk[], options: SummarizeOptions): Promise<ChunkSummary[]> {
    const concurrency = Math.max(1, options.concurrency ?? Math.max(4, os.cpus().length - 1));
    const queue = chunks.slice();
    const results: ChunkSummary[] = [];
    const workers: Promise<void>[] = [];
    const cache = new CacheStore(process.cwd());

    const anthropic = options.localOnly ? null : null; // move AI to server

    for (let i = 0; i < concurrency; i++) {
        workers.push(
            (async () => {
                while (queue.length > 0) {
                    const chunk = queue.shift();
                    if (!chunk) break;
                    const cacheKey = cache.keyFor({ filePath: chunk.filePath, index: chunk.index, total: chunk.total, contentHash: hashStr(chunk.content), model: anthropic ? 'anthropic-haiku' : 'local' });
                    if (!options.noCache) {
                        const cached = cache.read<ChunkSummary>(cacheKey);
                        if (cached) { results.push(cached); continue; }
                    }

                    let summary = await summarizeSingle(chunk, options);
                    if (!options.localOnly) {
                        try {
                            // Fetch server-side chunk summary (requires auth)
                            const cfg = loadConfig();
                            const server = (cfg.apiBaseUrl || process.env.DOKIFY_API_BASE || process.env.DOKIFY_API_URL || 'http://127.0.0.1:4000').replace(/\/$/, '');
                            const res = await fetch(server.replace(/\/$/, '') + '/v1/ai/chunk-summaries', {
                                method: 'POST',
                                headers: {
                                    'content-type': 'application/json',
                                    ...(cfg.token ? { authorization: `Bearer ${cfg.token}` } : {})
                                },
                                body: JSON.stringify({ chunks: [{ index: chunk.index, startLine: chunk.startLine, endLine: chunk.endLine, content: chunk.content }] })
                            });
                            if (res.ok) {
                                const json = await res.json() as any;
                                const partial = json?.summaries?.[0] || {};
                                summary = { ...summary, ...partial } as ChunkSummary;
                            }
                        } catch { }
                    }
                    if (!options.noCache) cache.write(cacheKey, summary);
                    results.push(summary);
                }
            })()
        );
    }
    await Promise.all(workers);
    // Keep order stable by file, index
    results.sort((a, b) => (a.filePath === b.filePath ? a.index - b.index : a.filePath.localeCompare(b.filePath)));
    return results;
}

async function summarizeSingle(chunk: FileChunk, options: SummarizeOptions): Promise<ChunkSummary> {
    // MVP local heuristic fallback: extract function/class names and import lines
    const entities: string[] = [];
    const inputs: string[] = [];
    const outputs: string[] = [];
    const dependencies: string[] = [];
    const notes: string[] = [];

    const lines = chunk.content.split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (/^import\s+/.test(trimmed) || /^from\s+.+\s+import\s+/.test(trimmed)) dependencies.push(trimmed);
        const fn = trimmed.match(/function\s+([a-zA-Z0-9_]+)/) || trimmed.match(/const\s+([a-zA-Z0-9_]+)\s*=\s*\(/);
        if (fn) entities.push(fn[1]);
        const cls = trimmed.match(/class\s+([A-Za-z0-9_]+)/);
        if (cls) entities.push(cls[1]);
    }

    const purpose = `Auto summary for ${pathBase(chunk.filePath)} chunk ${chunk.index + 1}/${chunk.total}`;

    return {
        filePath: chunk.filePath,
        index: chunk.index,
        total: chunk.total,
        entities: Array.from(new Set(entities)).slice(0, 20),
        purpose,
        inputs,
        outputs,
        dependencies: Array.from(new Set(dependencies)).slice(0, 20),
        notes
    };
}

function pathBase(p: string): string {
    const parts = p.split(/[/\\]/);
    return parts[parts.length - 1] || p;
}

function hashStr(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; }
    return String(h >>> 0);
}

