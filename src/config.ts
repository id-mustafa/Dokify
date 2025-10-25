import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export type DokifyConfig = {
    apiBaseUrl: string | null;
    token: string | null;
    defaultModels: {
        haiku: string;
        gemini: string;
    };
    concurrency: number;
    localOnly: boolean;
};

function computeConfigDir(): string {
    const envDir = process.env.DOKIFY_CONFIG_DIR;
    if (envDir) return envDir;
    const homeDir = path.join(os.homedir(), '.dokify');
    try {
        if (!fs.existsSync(homeDir)) fs.mkdirSync(homeDir, { recursive: true });
        // test write access
        const probe = path.join(homeDir, '.probe');
        fs.writeFileSync(probe, 'ok');
        fs.rmSync(probe);
        return homeDir;
    } catch {
        const local = path.join(process.cwd(), '.dokify');
        try {
            if (!fs.existsSync(local)) fs.mkdirSync(local, { recursive: true });
            return local;
        } catch {
            return process.cwd();
        }
    }
}

const CONFIG_DIR = computeConfigDir();
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: DokifyConfig = {
    apiBaseUrl: null,
    token: null,
    defaultModels: {
        haiku: 'claude-3-5-haiku-latest',
        gemini: 'gemini-1.5-pro-latest'
    },
    concurrency: Math.max(4, os.cpus().length - 1),
    localOnly: false
};

export function ensureConfigDir(): void {
    try {
        if (!fs.existsSync(CONFIG_DIR)) {
            fs.mkdirSync(CONFIG_DIR, { recursive: true });
        }
    } catch {
        // ignore; load/save will handle gracefully
    }
}

export function loadConfig(): DokifyConfig {
    ensureConfigDir();
    if (!fs.existsSync(CONFIG_PATH)) {
        try {
            saveConfig(DEFAULT_CONFIG);
        } catch {
            // ignore write failures; return defaults
        }
        return { ...DEFAULT_CONFIG };
    }
    try {
        const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<DokifyConfig>;
        return { ...DEFAULT_CONFIG, ...parsed, defaultModels: { ...DEFAULT_CONFIG.defaultModels, ...(parsed.defaultModels || {}) } };
    } catch {
        return { ...DEFAULT_CONFIG };
    }
}

export function saveConfig(config: DokifyConfig): void {
    ensureConfigDir();
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(CONFIG_PATH, content, 'utf-8');
}

export function getConfigPath(): string {
    return CONFIG_PATH;
}

