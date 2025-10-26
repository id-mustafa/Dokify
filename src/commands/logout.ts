import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../config.js';

export function registerLogoutCommand(program: Command): void {
    program
        .command('logout')
        .description('Remove local Dokify authentication tokens')
        .action(() => {
            const cfg = loadConfig();
            cfg.token = null;
            saveConfig(cfg);
            console.log(chalk.green('✓ Logged out (local token removed)'));
        });
}


