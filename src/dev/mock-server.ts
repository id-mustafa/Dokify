import http from 'node:http';
import url from 'node:url';

type DeviceRecord = {
    deviceCode: string;
    userCode: string;
    approved: boolean;
    expiresAt: number;
    interval: number;
};

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '127.0.0.1';
const BASE = `http://${HOST}:${PORT}`;
const VERIFY_BASE = process.env.VERIFY_BASE || BASE; // point to web app if set

const devices = new Map<string, DeviceRecord>();

function json(res: http.ServerResponse, status: number, body: unknown) {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
}

function notFound(res: http.ServerResponse) {
    json(res, 404, { error: 'not_found' });
}

function parseBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve) => {
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
            const raw = Buffer.concat(chunks).toString('utf-8');
            try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
        });
    });
}

const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url || '', true);
    const path = parsed.pathname || '/';

    // CORS for convenience in browser testing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if (req.method === 'POST' && path === '/v1/oauth/device') {
        const body = await parseBody(req);
        if (!body || !body.client_id) return json(res, 400, { error: 'invalid_request' });
        const deviceCode = 'dev-' + Math.random().toString(36).slice(2, 10);
        const userCode = Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        const expires_in = 600;
        const interval = 2;
        devices.set(deviceCode, { deviceCode, userCode, approved: false, expiresAt: Date.now() + expires_in * 1000, interval });
        return json(res, 200, {
            device_code: deviceCode,
            user_code: userCode,
            verification_uri: VERIFY_BASE + '/verify',
            verification_uri_complete: VERIFY_BASE + '/verify?user_code=' + encodeURIComponent(userCode),
            expires_in,
            interval
        });
    }

    if (req.method === 'GET' && path === '/verify') {
        const userCode = (parsed.query['user_code'] as string) || '';
        let message = 'Enter your user_code as ?user_code=XXXX-XXXX to approve.';
        if (userCode) {
            const rec = Array.from(devices.values()).find((d) => d.userCode === userCode);
            if (rec) {
                rec.approved = true;
                message = 'Approved! You can close this tab.';
            } else {
                message = 'Invalid code';
            }
        }
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.end(message);
        return;
    }

    if (req.method === 'POST' && path === '/v1/oauth/token') {
        const body = await parseBody(req);
        if (!body || body.grant_type !== 'urn:ietf:params:oauth:grant-type:device_code' || !body.device_code) {
            return json(res, 400, { error: 'invalid_request' });
        }
        const rec = devices.get(body.device_code as string);
        if (!rec) return json(res, 400, { error: 'expired_token' });
        if (Date.now() > rec.expiresAt) return json(res, 400, { error: 'expired_token' });
        if (!rec.approved) return json(res, 400, { error: 'authorization_pending', interval: rec.interval });
        return json(res, 200, {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            token_type: 'Bearer',
            expires_in: 3600
        });
    }

    if (req.method === 'GET' && path === '/v1/me') {
        const auth = req.headers['authorization'] || '';
        if (!auth.startsWith('Bearer ')) return json(res, 401, { error: 'unauthorized' });
        return json(res, 200, { id: 'user_123', email: 'dev@example.com', name: 'Dev User', org: { id: 'org_123', name: 'Dokify Dev' } });
    }

    notFound(res);
});

server.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Mock Dokify API listening at ${BASE}`);
});


