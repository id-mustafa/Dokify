import { FastifyInstance } from 'fastify';
import { requireApiKey, meterUsage } from './middleware.js';

export function registerAgentRoutes(app: FastifyInstance) {
    app.post('/v1/agent/ask', async (req, reply) => {
        if (!requireApiKey(req, reply)) return;
        const body = (req.body as any) || {};
        const question = String(body.question || '');
        if (!question) return reply.code(400).send({ error: 'invalid_request' });
        // Placeholder response; here you'd call Claude/Gemini and meter tokens
        meterUsage(req, reply, { inputTokens: 200, outputTokens: 100, usd: 0.001 });
        return { answer: 'Thanks for your question. The agent will be wired to LLMs next.' };
    });
}


