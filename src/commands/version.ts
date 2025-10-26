import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';

function findPackageJson(startDir: string): string | null {
    let dir = startDir;
    for (let i = 0; i < 6; i++) {
        const fp = path.join(dir, 'package.json');
        if (fs.existsSync(fp)) return fp;
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
    }
    return null;
}

export function registerVersionCommand(program: Command): void {
    program
        .command('version')
        .description('Show Dokify CLI version')
        .action(() => {
            const pkgPath = findPackageJson(process.cwd()) || findPackageJson(path.dirname(new URL(import.meta.url).pathname)) || null;
            try {
                const fp = pkgPath ?? path.join(process.cwd(), 'package.json');
                const raw = fs.readFileSync(fp, 'utf-8');
                const pkg = JSON.parse(raw) as { version?: string };
                // Fallback to commander .version() if needed
                const v = pkg.version || 'unknown';
                console.log(v);
            } catch {
                console.log('unknown');
            }
        })
        .helpOption('-h, --help', 'Show help for dok version');
}


