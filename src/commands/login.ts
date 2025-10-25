import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../config.js';

export function registerLoginCommand(program: Command): void {
    program
        .command('login')
        .description('Authenticate the Dokify CLI')
        .option('--token <token>', 'Provide an access token directly')
        .option('--api <url>', 'Override Dokify API base URL')
        .action(async (opts: { token?: string; api?: string }) => {
            const config = loadConfig();
            if (opts.api) {
                config.apiBaseUrl = opts.api;
            }
            if (opts.token) {
                config.token = opts.token;
                saveConfig(config);
                console.log(chalk.green('✓ Saved token to Dokify config'));
                return;
            }
            console.log(chalk.yellow('No token provided.'));
            console.log('You can obtain a token from your Dokify account and run:');
            console.log(chalk.cyan('  dok login --token <YOUR_TOKEN>'));
            console.log('Or set the API base URL during login:');
            console.log(chalk.cyan('  dok login --api https://api.dokify.com --token <YOUR_TOKEN>'));
        });
}

