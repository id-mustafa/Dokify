#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { registerLoginCommand } from './commands/login.js';
import { registerGenerateCommand } from './commands/generate.js';
import { registerUploadCommand } from './commands/upload.js';
import { registerKeysCommand } from './commands/keys.js';
import { registerWhoAmICommand } from './commands/whoami.js';
import { registerLogoutCommand } from './commands/logout.js';
import { registerVersionCommand } from './commands/version.js';
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const program = new Command();

program
    .name('dok')
    .description('Dokify CLI - generate and upload documentation for your codebase')
    .version(readPkgVersion() || '0.1.0');

registerLoginCommand(program);
registerGenerateCommand(program);
registerUploadCommand(program);
registerKeysCommand(program);
registerWhoAmICommand(program);
registerLogoutCommand(program);
registerVersionCommand(program);

async function main() {
    try {
        await program.parseAsync(process.argv);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`Error: ${message}`));
        process.exit(1);
    }
}

main();

function readPkgVersion(): string | null {
    try {
        // Try relative to this file first
        const here = path.dirname(new URL(import.meta.url).pathname);
        const localPkg = path.join(here, '..', 'package.json');
        if (fs.existsSync(localPkg)) {
            const raw = fs.readFileSync(localPkg, 'utf-8');
            return (JSON.parse(raw) as any).version || null;
        }
    } catch { }
    try {
        // Fallback: search upwards from cwd
        let dir = process.cwd();
        for (let i = 0; i < 6; i++) {
            const fp = path.join(dir, 'package.json');
            if (fs.existsSync(fp)) {
                const raw = fs.readFileSync(fp, 'utf-8');
                return (JSON.parse(raw) as any).version || null;
            }
            const parent = path.dirname(dir);
            if (parent === dir) break;
            dir = parent;
        }
    } catch { }
    return null;
}

