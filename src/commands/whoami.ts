import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig } from '../config.js';
import { DokifyApiClient } from '../api/client.js';

export function registerWhoAmICommand(program: Command): void {
    program
        .command('whoami')
        .description('Show the authenticated Dokify user')
        .action(async () => {
            const cfg = loadConfig();
            if (!cfg.token) {
                console.log(chalk.yellow('Not logged in. Run: dok login'));
                return;
            }
            const api = new DokifyApiClient({ token: cfg.token, baseUrl: cfg.apiBaseUrl || undefined });
            try {
                const me = await api.me();
                console.log(`${me.email}${me.name ? ' (' + me.name + ')' : ''}${me.org ? ' @ ' + me.org.name : ''}`);
            } catch (e) {
                console.log(chalk.red('Failed to fetch profile. Try logging in again.'));
            }
        });
}


