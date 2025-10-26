import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs';
import { loadConfig } from '../config.js';
import { scanRepository } from '../core/scan.js';
import { chunkFiles } from '../core/chunk.js';
import { summarizeChunks } from '../core/summarize.js';
import { writeDocs } from '../core/docs.js';
import { buildGraph, writeViewer } from '../core/graph.js';
import { GeminiProvider } from '../llm/gemini.js';
import { uploadDocs } from '../core/upload.js';
import dotenv from 'dotenv';

export function registerGenerateCommand(program: Command): void {
    program
        .command('generate')
        .description('Generate documentation for the current repository')
        .option('--no-ai', 'Generate baseline docs without AI', false)
        .option('--no-cache', 'Do not use cache', false)
        .option('--local-only', 'Generate with AI but do not upload', false)
        .option('--concurrency <n>', 'Concurrency for AI calls', (v) => parseInt(v, 10))
        .helpOption('-h, --help', 'Show help for dok generate')
        .addHelpText('after', `\nExamples:\n  dok generate\n  dok generate --no-ai\n  dok generate --local-only\n  dok generate --concurrency 16\n`)
        .action(async (opts: { noAi?: boolean; localOnly?: boolean; concurrency?: number; noCache?: boolean }) => {
            const config = loadConfig();
            const projectRoot = process.cwd();
            const docsDir = path.join(projectRoot, 'docs');
            // Load env from root and server/.env as fallback
            dotenv.config();
            dotenv.config({ path: path.join(projectRoot, 'server/.env') });
            // Clean docs directory to avoid nested docs from previous runs
            if (fs.existsSync(docsDir)) {
                try { fs.rmSync(docsDir, { recursive: true, force: true }); } catch { }
            }
            fs.mkdirSync(docsDir, { recursive: true });

            const spinner = ora('Scanning repository').start();
            try {
                const scan = await scanRepository(projectRoot);
                spinner.succeed(`Found ${scan.files.length} source files`);

                const spinner2 = ora('Chunking files').start();
                const chunks = await chunkFiles(scan);
                spinner2.succeed(`Created ${chunks.length} chunks`);

                const spinner3 = ora(opts.localOnly ? 'Summarizing (local fallback)' : 'Summarizing with AI').start();
                const noAI = !!opts.noAi;
                const summaries = await summarizeChunks(chunks, {
                    localOnly: noAI || !(process.env.ANTHROPIC_API_KEY),
                    concurrency: opts.concurrency ?? config.concurrency,
                    noCache: !!opts.noCache
                });
                spinner3.succeed(`Summarized ${summaries.length} chunks`);

                const spinner4 = ora('Writing docs').start();
                const geminiModel = process.env.GOOGLE_MODEL || process.env.GEMINI_MODEL || config.defaultModels.gemini;
                const gemini = (!(opts.localOnly ?? false) && !noAI && (process.env.GOOGLE_API_KEY))
                    ? new GeminiProvider({ apiKey: process.env.GOOGLE_API_KEY || '', model: geminiModel })
                    : undefined;
                const fileDocs = await writeDocs({ projectRoot, docsDir, scan, chunks, summaries, gemini, useGemini: !!gemini, fileSynthesisConcurrency: Math.max(2, Math.min(8, (opts.concurrency ?? config.concurrency) >> 1)) });
                spinner4.succeed(`Wrote ${fileDocs.written} docs`);

                const spinner5 = ora('Building graph and viewer').start();
                const graph = await buildGraph(scan);
                await writeViewer({ docsDir, graph });
                spinner5.succeed('Viewer ready');

                // Optional project synthesis with Gemini when not local-only
                if (!noAI && !(opts.localOnly ?? false)) {
                    const spinnerSynth = ora('Synthesizing project overview').start();
                    let overview = '';
                    try {
                        const server = process.env.DOKIFY_API_BASE || process.env.DOKIFY_API_URL || 'http://127.0.0.1:4000';
                        const res = await fetch(server.replace(/\/$/, '') + '/v1/ai/project-readme', {
                            method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ summaries, repoName: path.basename(projectRoot) })
                        });
                        if (res.ok) {
                            const json = await res.json() as any;
                            overview = String(json?.markdown || '');
                        }
                    } catch { }
                    if (!overview) overview = 'Auto-generated.';
                    const overviewPath = path.join(docsDir, 'overview', 'architecture.md');
                    fs.mkdirSync(path.dirname(overviewPath), { recursive: true });
                    fs.writeFileSync(overviewPath, `# Architecture\n\n${overview}\n`, 'utf-8');
                    spinnerSynth.succeed('Project synthesis complete');
                }

                if (!(opts.localOnly ?? false)) {
                    const spinner6 = ora('Uploading docs to Dokify').start();
                    await uploadDocs({ docsDir });
                    spinner6.succeed('Upload complete');
                } else {
                    console.log(chalk.yellow('Skipped upload (local-only mode)'));
                }

                console.log(chalk.green('✓ Documentation generated in ./docs'));
            } catch (error) {
                spinner.fail('Generation failed');
                const message = error instanceof Error ? error.message : String(error);
                console.error(chalk.red(message));
                process.exit(1);
            }
        });
}

