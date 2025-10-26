import { loadConfig } from '../config.js';
import { DeviceStartResponse, TokenPendingResponse, TokenSuccessResponse, MeResponse } from './types.js';

export class DokifyApiClient {
    private readonly baseUrl: string;
    private readonly clientId: string;
    private token: string | null;

    constructor(params?: { baseUrl?: string; clientId?: string; token?: string | null }) {
        const cfg = loadConfig();
        const envBase = process.env.DOKIFY_API_BASE || process.env.DOKIFY_API_URL;
        this.baseUrl = params?.baseUrl || envBase || cfg.apiBaseUrl || 'https://dokify-api.onrender.com/v1';
        this.clientId = params?.clientId || 'dokify-cli';
        this.token = params?.token ?? cfg.token ?? null;
    }

    setToken(token: string | null) { this.token = token; }

    async startDeviceFlow(): Promise<DeviceStartResponse> {
        const res = await fetch(this.baseUrl + '/oauth/device', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ client_id: this.clientId })
        });
        if (!res.ok) throw new Error(`Device start failed: ${res.status}`);
        return (await res.json()) as DeviceStartResponse;
    }

    async pollDeviceToken(deviceCode: string): Promise<TokenSuccessResponse | TokenPendingResponse> {
        const res = await fetch(this.baseUrl + '/oauth/token', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                device_code: deviceCode,
                client_id: this.clientId
            })
        });
        const json = await res.json();
        if (res.ok) return json as TokenSuccessResponse;
        return json as TokenPendingResponse;
    }

    async me(): Promise<MeResponse> {
        if (!this.token) throw new Error('Not authenticated');
        const res = await fetch(this.baseUrl + '/me', {
            headers: { authorization: `Bearer ${this.token}` }
        });
        if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
        return (await res.json()) as MeResponse;
    }
}


