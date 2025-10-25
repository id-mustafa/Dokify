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
import { uploadDocs } from '../core/upload.js';

export function registerGenerateCommand(program: Command): void {
    program
        .command('generate')
        .description('Generate documentation for the current repository')
        .option('--local-only', 'Do not call external AI or upload; generate locally only', false)
        .option('--concurrency <n>', 'Concurrency for AI calls', (v) => parseInt(v, 10))
        .option('--include <glob...>', 'Include only these globs')
        .option('--exclude <glob...>', 'Exclude these globs')
        .action(async (opts: { localOnly?: boolean; concurrency?: number; include?: string[]; exclude?: string[] }) => {
            const config = loadConfig();
            const projectRoot = process.cwd();
            const docsDir = path.join(projectRoot, 'docs');
            if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

            const spinner = ora('Scanning repository').start();
            try {
                const scan = await scanRepository(projectRoot, {
                    include: opts.include,
                    exclude: opts.exclude
                });
                spinner.succeed(`Found ${scan.files.length} source files`);

                const spinner2 = ora('Chunking files').start();
                const chunks = await chunkFiles(scan);
                spinner2.succeed(`Created ${chunks.length} chunks`);

                const spinner3 = ora(opts.localOnly ? 'Summarizing (local fallback)' : 'Summarizing with AI').start();
                const summaries = await summarizeChunks(chunks, {
                    localOnly: opts.localOnly ?? config.localOnly,
                    concurrency: opts.concurrency ?? config.concurrency
                });
                spinner3.succeed(`Summarized ${summaries.length} chunks`);

                const spinner4 = ora('Writing docs').start();
                const fileDocs = await writeDocs({ projectRoot, docsDir, scan, chunks, summaries });
                spinner4.succeed(`Wrote ${fileDocs.written} docs`);

                const spinner5 = ora('Building graph and viewer').start();
                const graph = await buildGraph(scan);
                await writeViewer({ docsDir, graph });
                spinner5.succeed('Viewer ready');

                if (!(opts.localOnly ?? config.localOnly)) {
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

