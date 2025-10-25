import fs from 'node:fs';
import path from 'node:path';
import { RepoScan } from './scan.js';

export type FileChunk = {
    filePath: string;
    index: number;
    total: number;
    startLine: number;
    endLine: number;
    content: string;
};

// Simple line-based chunking with overlap; AST-aware can come later.
const MAX_LINES = 300;
const OVERLAP_LINES = 20;

export async function chunkFiles(scan: RepoScan): Promise<FileChunk[]> {
    const chunks: FileChunk[] = [];
    for (const file of scan.files) {
        const ext = path.extname(file).toLowerCase();
        if (shouldSkip(ext, file)) continue;
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split(/\r?\n/);
        if (lines.length === 0) continue;
        if (lines.length <= MAX_LINES) {
            chunks.push({ filePath: file, index: 0, total: 1, startLine: 1, endLine: lines.length, content });
            continue;
        }
        let start = 0;
        let idx = 0;
        while (start < lines.length) {
            const end = Math.min(start + MAX_LINES, lines.length);
            const chunkLines = lines.slice(start, end);
            chunks.push({
                filePath: file,
                index: idx,
                total: -1, // fill later
                startLine: start + 1,
                endLine: end,
                content: chunkLines.join('\n')
            });
            if (end === lines.length) break;
            start = end - OVERLAP_LINES;
            idx += 1;
        }
        // Fix totals
        const fileChunks = chunks.filter((c) => c.filePath === file);
        for (let i = 0; i < fileChunks.length; i++) fileChunks[i].total = fileChunks.length;
    }
    return chunks;
}

function shouldSkip(ext: string, filePath: string): boolean {
    const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.pdf', '.svg', '.mp3', '.mp4']);
    if (binaryExts.has(ext)) return true;
    const large = fs.statSync(filePath).size > 2 * 1024 * 1024; // 2MB
    if (large) return true;
    return false;
}

