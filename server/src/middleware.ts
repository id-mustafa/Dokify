import { FastifyReply, FastifyRequest } from 'fastify';
import { database } from './database.js';

export type MeterParams = { inputTokens?: number; outputTokens?: number; usd?: number };

export async function requireApiKey(req: FastifyRequest, reply: FastifyReply) {
    const key = (req.headers['x-api-key'] as string) || '';
    if (!key) {
        reply.code(401).send({ error: 'missing_api_key' });
        return false;
    }
    const record = await database.getApiKey(key);
    if (!record) {
        reply.code(401).send({ error: 'invalid_api_key' });
        return false;
    }
    (req as any).apiKey = record;
    return true;
}

export async function meterUsage(req: FastifyRequest, _reply: FastifyReply, params: MeterParams = {}) {
    const record = (req as any).apiKey as { id: string } | undefined;
    if (!record) return;

    await database.updateApiKeyUsage(record.id, {
        inputTokens: params.inputTokens || 0,
        outputTokens: params.outputTokens || 0,
        usd: params.usd || 0
    });
}


