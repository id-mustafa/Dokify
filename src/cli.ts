#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { registerLoginCommand } from './commands/login.js';
import { registerGenerateCommand } from './commands/generate.js';

const program = new Command();

program
    .name('dok')
    .description('Dokify CLI - generate and upload documentation for your codebase')
    .version('0.1.0');

registerLoginCommand(program);
registerGenerateCommand(program);

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

