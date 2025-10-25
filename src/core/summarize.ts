import { FileChunk } from './chunk.js';
import os from 'node:os';

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
};

export async function summarizeChunks(chunks: FileChunk[], options: SummarizeOptions): Promise<ChunkSummary[]> {
    const concurrency = Math.max(1, options.concurrency ?? Math.max(4, os.cpus().length - 1));
    const queue = chunks.slice();
    const results: ChunkSummary[] = [];
    const workers: Promise<void>[] = [];

    for (let i = 0; i < concurrency; i++) {
        workers.push(
            (async () => {
                while (queue.length > 0) {
                    const chunk = queue.shift();
                    if (!chunk) break;
                    const summary = await summarizeSingle(chunk, options);
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

