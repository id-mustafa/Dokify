import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export class CacheStore {
    private readonly dir: string;

    constructor(rootDir: string) {
        this.dir = path.join(rootDir, '.dokify', 'cache');
        try { fs.mkdirSync(this.dir, { recursive: true }); } catch { /* ignore */ }
    }

    keyFor(input: unknown): string {
        const h = crypto.createHash('sha256');
        h.update(JSON.stringify(input));
        return h.digest('hex').slice(0, 32);
    }

    read<T>(key: string): T | null {
        const fp = path.join(this.dir, key + '.json');
        try {
            if (!fs.existsSync(fp)) return null;
            const raw = fs.readFileSync(fp, 'utf-8');
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    write<T>(key: string, value: T): void {
        const fp = path.join(this.dir, key + '.json');
        try {
            fs.writeFileSync(fp, JSON.stringify(value, null, 2), 'utf-8');
        } catch { /* ignore */ }
    }
}


