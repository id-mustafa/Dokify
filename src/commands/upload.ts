import path from 'node:path';
import fs from 'node:fs';
import ora from 'ora';
import { Command } from 'commander';
import { uploadDocs } from '../core/upload.js';
import { loadConfig } from '../config.js';

export function registerUploadCommand(program: Command) {
    program
        .command('upload')
        .description('Upload existing documentation to Dokify')
        .option('--help', 'Display help for upload command')
        .action(async (options) => {
            if (options.help) {
                console.log(`
dok upload

Upload the existing ./docs folder to Dokify without regenerating documentation.

Usage:
  dok upload

Requirements:
  - You must be logged in (run 'dok login' first)
  - The ./docs folder must exist (run 'dok generate' first)

Examples:
  dok upload              Upload existing documentation
`);
                return;
            }
            await uploadCommand();
        });
}

async function uploadCommand() {
    const config = loadConfig();

    // Check authentication first
    if (!config.token && !config.apiKey) {
        console.error('❌ Not authenticated. Please run `dok login` or set an API key with `dok key --set <KEY>`.');
        process.exit(1);
    }

    if (!config.apiBaseUrl) {
        console.error('❌ No API URL configured. Please set DOKIFY_API_BASE or run `dok login`.');
        process.exit(1);
    }

    const cwd = process.cwd();
    const docsDir = path.join(cwd, 'docs');

    // Check if docs folder exists
    if (!fs.existsSync(docsDir)) {
        console.error('❌ No docs folder found. Run `dok generate` first to create documentation.');
        process.exit(1);
    }

    // Check if docs folder has files
    const files = fs.readdirSync(docsDir, { recursive: true, withFileTypes: true });
    const docFiles = files.filter(f => f.isFile());

    if (docFiles.length === 0) {
        console.error('❌ Docs folder is empty. Run `dok generate` first to create documentation.');
        process.exit(1);
    }

    const spinner = ora('Uploading documentation...').start();

    try {
        // Upload the docs (uploadDocs handles project name internally)
        await uploadDocs({ docsDir });

        spinner.succeed('Upload complete');
        console.log('\n✓ Documentation uploaded successfully');

        // Convert API URL to Web URL (dokify-api -> dokify, port 4000 -> 5173)
        const webUrl = config.apiBaseUrl
            .replace(/\/v1$/, '')
            .replace('dokify-api.onrender.com', 'dokify.onrender.com')
            .replace('127.0.0.1:4000', '127.0.0.1:5173')
            .replace('localhost:4000', 'localhost:5173');

        console.log(`  View at: ${webUrl}/projects\n`);
    } catch (error: any) {
        spinner.fail('Upload failed');
        console.error('\n❌ Error:', error.message || 'Unknown error');
        process.exit(1);
    }
}

