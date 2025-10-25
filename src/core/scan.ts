import fg from 'fast-glob';
import path from 'node:path';
import fs from 'node:fs';
import ignore from 'ignore';

export type ScanOptions = {
    include?: string[];
    exclude?: string[];
};

export type RepoScan = {
    root: string;
    files: string[];
};

const DEFAULT_INCLUDE = ['**/*'];
const DEFAULT_EXCLUDE = [
    '**/node_modules/**',
    '**/.git/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/.cache/**',
    '**/.turbo/**',
    '**/.venv/**',
    '**/*.min.*',
    '**/*.map'
];

function loadIgnores(root: string): string[] {
    const ig = ignore();
    const paths = ['.gitignore', '.dokifyignore'];
    const lines: string[] = [];
    for (const p of paths) {
        const fp = path.join(root, p);
        if (fs.existsSync(fp)) {
            const content = fs.readFileSync(fp, 'utf-8');
            ig.add(content);
            lines.push(...content.split(/\r?\n/));
        }
    }
    // Convert to globs for fast-glob
    const globs = lines
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith('#'))
        .map((l) => (l.endsWith('/') ? `${l}**` : l));
    return globs;
}

export async function scanRepository(root: string, options: ScanOptions = {}): Promise<RepoScan> {
    const ignoreGlobs = [...DEFAULT_EXCLUDE, ...loadIgnores(root), ...(options.exclude || [])];
    const includeGlobs = options.include && options.include.length > 0 ? options.include : DEFAULT_INCLUDE;
    const entries = await fg(includeGlobs, {
        cwd: root,
        dot: false,
        absolute: true,
        ignore: ignoreGlobs
    });
    const files = entries.filter((e) => fs.statSync(e).isFile());
    return { root, files };
}

