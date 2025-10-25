import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../config.js';

export async function uploadDocs(params: { docsDir: string }): Promise<void> {
    const config = loadConfig();
    if (!config.apiBaseUrl || !config.token) {
        // Stub: just log info for MVP
        console.log('No API base URL or token set. Skipping upload.');
        return;
    }
    // TODO: Implement real upload as zip with manifest
    const count = countFiles(params.docsDir);
    console.log(`Prepared to upload ${count} files to ${config.apiBaseUrl}`);
}

function countFiles(dir: string): number {
    let n = 0;
    for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        const st = fs.statSync(full);
        if (st.isDirectory()) n += countFiles(full);
        else n += 1;
    }
    return n;
}

