import { FastifyInstance } from 'fastify';
import { database } from './database.js';
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const WEB_BASE = process.env.WEB_BASE || process.env.VERIFY_BASE || 'https://dokify.onrender.com:5173';

export function registerOAuthRoutes(app: FastifyInstance) {
    // GitHub OAuth
    app.get('/v1/oauth/github/start', async (req, reply) => {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const redirectUri = (process.env.GITHUB_REDIRECT_URI || `${process.env.API_BASE || 'https://dokify-api.onrender.com'}/v1/oauth/github/callback`).toString();
        const state = nano();
        const redirect = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId || '')}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${state}`;
        reply.redirect(redirect);
    });

    app.get('/v1/oauth/github/callback', async (req, reply) => {
        try {
            const params = req.query as any;
            if (!params.code) return reply.code(400).send({ error: 'invalid_request' });
            const clientId = process.env.GITHUB_CLIENT_ID || '';
            const clientSecret = process.env.GITHUB_CLIENT_SECRET || '';
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'accept': 'application/json' },
                body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code: params.code })
            });
            const tokenJson: any = await tokenRes.json();
            const accessToken = tokenJson.access_token;
            if (!accessToken) throw new Error('no_token');
            const userRes = await fetch('https://api.github.com/user', { headers: { authorization: `Bearer ${accessToken}`, 'user-agent': 'dokify' } });
            const userJson: any = await userRes.json();
            const emailsRes = await fetch('https://api.github.com/user/emails', { headers: { authorization: `Bearer ${accessToken}`, 'user-agent': 'dokify' } });
            const emails: any[] = await emailsRes.json();
            const primary = emails.find((e) => e.primary && e.verified) || emails[0];
            const email: string = primary?.email || `${userJson.login}@users.noreply.github.com`;
            const id = await upsertUser(email);
            const token = jwt.sign({ sub: id, email }, JWT_SECRET, { expiresIn: '7d' });
            reply.redirect(`${WEB_BASE}/login#token=${encodeURIComponent(token)}`);
        } catch (e) {
            reply.redirect(`${WEB_BASE}/login?error=oauth_github_failed`);
        }
    });

    // Google OAuth
    app.get('/v1/oauth/google/start', async (req, reply) => {
        const clientId = process.env.GOOGLE_CLIENT_ID || '';
        const redirectUri = (process.env.GOOGLE_REDIRECT_URI || `${process.env.API_BASE || 'https://dokify-api.onrender.com:4000'}/v1/oauth/google/callback`).toString();
        const scope = encodeURIComponent('openid email profile');
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&access_type=online&prompt=consent`;
        reply.redirect(authUrl);
    });

    app.get('/v1/oauth/google/callback', async (req, reply) => {
        try {
            const params = req.query as any;
            if (!params.code) return reply.code(400).send({ error: 'invalid_request' });
            const clientId = process.env.GOOGLE_CLIENT_ID || '';
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
            const redirectUri = (process.env.GOOGLE_REDIRECT_URI || `${process.env.API_BASE || 'https://dokify-api.onrender.com:4000'}/v1/oauth/google/callback`).toString();
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code: params.code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                }) as any
            });
            const tokenJson: any = await tokenRes.json();
            const idToken = tokenJson.id_token;
            if (!idToken) throw new Error('no_id_token');
            // Decode minimal email from id_token (skip full verification for MVP)
            const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf-8')) as any;
            const email: string = payload.email || `user-${nano()}@google.local`;
            const id = await upsertUser(email);
            const token = jwt.sign({ sub: id, email }, JWT_SECRET, { expiresIn: '7d' });
            reply.redirect(`${WEB_BASE}/login#token=${encodeURIComponent(token)}`);
        } catch (e) {
            reply.redirect(`${WEB_BASE}/login?error=oauth_google_failed`);
        }
    });
}

async function upsertUser(email: string): Promise<string> {
    const existing = await database.getUserByEmail(email);
    if (existing) return existing.id;
    const id = 'usr_' + nano();
    await database.createUser({
        id,
        email,
        password_hash: '', // OAuth users don't have passwords initially
        provider: 'oauth'
    });
    return id;
}


