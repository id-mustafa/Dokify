import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../config.js';
import 'dotenv/config';
import { DokifyApiClient } from '../api/client.js';
import open from 'node:child_process';

export function registerLoginCommand(program: Command): void {
    const API_BASE_URL = process.env.API_BASE_URL || process.env.DOKIFY_API_BASE || process.env.DOKIFY_API_URL || 'https://dokify-api.onrender.com:4000';
    program
        .command('login')
        .description('Authenticate the Dokify CLI')
        .helpOption('-h, --help', 'Show help for dok login')
        .action(async () => {
            const config = loadConfig();
            // Auto-detect local dev API if none configured or provided via env
            try {
                if (!config.apiBaseUrl && !process.env.DOKIFY_API_BASE && !process.env.DOKIFY_API_URL) {
                    const devUrl = API_BASE_URL;
                    const ctl = new AbortController();
                    const t = setTimeout(() => ctl.abort(), 500);
                    const res = await fetch(devUrl + '/verify', { signal: ctl.signal }).catch(() => null);
                    clearTimeout(t);
                    if (res && res.ok) {
                        config.apiBaseUrl = devUrl;
                        saveConfig(config);
                        console.log(chalk.green(`✓ Detected Dokify API at ${devUrl}`));
                    }
                }
            } catch { }

            const api = new DokifyApiClient({ baseUrl: config.apiBaseUrl || undefined, token: null });
            try {
                const start = await api.startDeviceFlow();
                const url = start.verification_uri_complete || start.verification_uri;
                console.log(chalk.green('Open this URL to authenticate:'));
                console.log(chalk.cyan(`  ${url}`));
                console.log(`Or enter the code: ${chalk.bold(start.user_code)}`);

                // Best-effort open in browser (platform dependent); ignore failures
                try {
                    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
                    require('node:child_process').spawn(cmd, [url], { stdio: 'ignore', detached: true }).unref();
                } catch { }

                const interval = Math.max(2, start.interval || 2);
                const deadline = Date.now() + start.expires_in * 1000;
                while (Date.now() < deadline) {
                    await new Promise((r) => setTimeout(r, interval * 1000));
                    const resp = await api.pollDeviceToken(start.device_code);
                    if ('access_token' in resp) {
                        config.token = resp.access_token;
                        saveConfig(config);
                        console.log(chalk.green('✓ Login successful'));
                        return;
                    }
                    if (resp.error === 'slow_down') {
                        // increase interval modestly
                        (start as any).interval = interval + 2;
                    } else if (resp.error === 'expired_token' || resp.error === 'access_denied') {
                        throw new Error(resp.error);
                    }
                }
                throw new Error('Device code expired');
            } catch (e) {
                const msg = e instanceof Error ? e.message : String(e);
                console.log(chalk.red(`Login failed: ${msg}`));
                console.log('Alternatively, obtain a token and run:');
                console.log(chalk.cyan('  dok login --token <YOUR_TOKEN>'));
            }
        });
}

