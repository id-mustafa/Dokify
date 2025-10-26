import { FastifyReply, FastifyRequest } from 'fastify';
import { db } from './db.js';

export type MeterParams = { inputTokens?: number; outputTokens?: number; usd?: number };

export function requireApiKey(req: FastifyRequest, reply: FastifyReply) {
    const key = (req.headers['x-api-key'] as string) || '';
    if (!key) {
        reply.code(401).send({ error: 'missing_api_key' });
        return false;
    }
    const record = Array.from(db.apiKeys.values()).find((k) => k.key === key);
    if (!record) {
        reply.code(401).send({ error: 'invalid_api_key' });
        return false;
    }
    (req as any).apiKey = record;
    return true;
}

export function meterUsage(req: FastifyRequest, _reply: FastifyReply, params: MeterParams = {}) {
    const record = (req as any).apiKey as { id: string } | undefined;
    if (!record) return;
    const key = db.apiUsageByKey.get(record.id) || { key_id: record.id, total_requests: 0, total_input_tokens: 0, total_output_tokens: 0, total_usd: 0, last_used_at: null };
    key.total_requests += 1;
    key.total_input_tokens += params.inputTokens || 0;
    key.total_output_tokens += params.outputTokens || 0;
    key.total_usd += params.usd || 0;
    key.last_used_at = Date.now();
    db.apiUsageByKey.set(record.id, key);
    const keyRecord = db.apiKeys.get(record.id);
    if (keyRecord) {
        keyRecord.last_used_at = key.last_used_at;
        keyRecord.usage_count = key.total_requests;
    }
}


