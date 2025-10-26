import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../config.js';

export function registerKeysCommand(program: Command): void {
    const cmd = program.command('key').description('Manage Dokify API key');
    cmd.helpOption('-h, --help', 'Show help for dok key');
    cmd.addHelpText('after', `\nExamples:\n  dok key --show\n  dok key --set dok_XXXXXXXXXXXXXXXX\n  dok key --unset\n`);

    cmd
        .option('--show', 'Show the stored Dokify API key')
        .option('--set <KEY>', 'Set the Dokify API key to use')
        .option('--unset', 'Unset the stored Dokify API key')
        .action((opts: { show?: boolean; set?: string; unset?: boolean }) => {
            const cfg = loadConfig();
            if (opts.show) {
                const masked = mask(cfg.apiKey || null);
                console.log(masked ? masked : chalk.gray('<null>'));
                return;
            }
            if (typeof opts.set === 'string') {
                cfg.apiKey = opts.set;
                saveConfig(cfg);
                console.log(chalk.green('✓ Dokify API key set'));
                return;
            }
            if (opts.unset) {
                cfg.apiKey = null;
                saveConfig(cfg);
                console.log(chalk.green('✓ Dokify API key unset'));
                return;
            }
            console.log('Usage: dok key --show | --set <KEY> | --unset');
        });
}

function mask(s?: string | null): string | null {
    if (!s) return null;
    const tail = s.slice(-4);
    return '••••-••••-••••-' + tail;
}


