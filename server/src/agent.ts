import { FastifyInstance } from 'fastify';
import { db } from './db.js';
import { database } from './database.js';
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function requireAuth(req: any): string {
    const auth = req.headers['authorization'] || '';
    if (!auth.startsWith('Bearer ')) throw new Error('unauthorized');
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as any;
    return payload.sub as string;
}

async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    if (!apiKey) throw new Error('GOOGLE_API_KEY not configured');

    const model = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: {
            'x-goog-api-key': apiKey,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        })
    });

    if (!res.ok) {
        const error = await res.text();
        throw new Error(`Gemini API error: ${res.status} - ${error}`);
    }

    const json = await res.json() as any;
    const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!text) throw new Error('No response from Gemini');

    return text.trim();
}

export function registerAgentRoutes(app: FastifyInstance) {
    // Get chats for a project
    app.get('/v1/chats', async (req, reply) => {
        let userId: string;
        try {
            userId = requireAuth(req);
        } catch {
            return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { projectId } = req.query as any;
        if (!projectId) return reply.code(400).send({ error: 'Project ID is required' });

        try {
            const chats = await database.getChatsByUser(userId, projectId);
            return { chats };
        } catch (error: any) {
            console.error('Get chats error:', error);
            return reply.code(500).send({ error: 'Failed to load chats' });
        }
    });

    // Create a new chat
    app.post('/v1/chats', async (req, reply) => {
        let userId: string;
        try {
            userId = requireAuth(req);
        } catch {
            return reply.code(401).send({ error: 'Unauthorized' });
        }

        const body = (req.body as any) || {};
        const projectId = String(body.projectId || '');
        const title = String(body.title || 'New Chat');

        if (!projectId) return reply.code(400).send({ error: 'Project ID is required' });

        try {
            const chat = await database.createChat({
                id: 'chat_' + nano(),
                user_id: userId,
                project_id: projectId,
                title
            });
            return { chat };
        } catch (error: any) {
            console.error('Create chat error:', error);
            return reply.code(500).send({ error: 'Failed to create chat' });
        }
    });

    // Get messages for a chat
    app.get('/v1/chats/:chatId/messages', async (req, reply) => {
        let userId: string;
        try {
            userId = requireAuth(req);
        } catch {
            return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { chatId } = req.params as any;

        try {
            const chat = await database.getChat(chatId);
            if (!chat) return reply.code(404).send({ error: 'Chat not found' });
            if (chat.user_id !== userId) return reply.code(403).send({ error: 'Access denied' });

            const messages = await database.getMessagesByChat(chatId);
            return { messages };
        } catch (error: any) {
            console.error('Get messages error:', error);
            return reply.code(500).send({ error: 'Failed to load messages' });
        }
    });

    // Delete a chat
    app.delete('/v1/chats/:chatId', async (req, reply) => {
        let userId: string;
        try {
            userId = requireAuth(req);
        } catch {
            return reply.code(401).send({ error: 'Unauthorized' });
        }

        const { chatId } = req.params as any;

        try {
            const chat = await database.getChat(chatId);
            if (!chat) return reply.code(404).send({ error: 'Chat not found' });
            if (chat.user_id !== userId) return reply.code(403).send({ error: 'Access denied' });

            await database.deleteChat(chatId);
            return { success: true };
        } catch (error: any) {
            console.error('Delete chat error:', error);
            return reply.code(500).send({ error: 'Failed to delete chat' });
        }
    });

    // Ask a question (with chat support)
    app.post('/v1/agent/ask', async (req, reply) => {
        // Authenticate user via JWT
        let userId: string;
        try {
            userId = requireAuth(req);
        } catch {
            return reply.code(401).send({ error: 'Unauthorized. Please log in.' });
        }

        const body = (req.body as any) || {};
        const question = String(body.question || '');
        const projectId = String(body.projectId || '');
        let chatId = String(body.chatId || '');

        if (!question) return reply.code(400).send({ error: 'Question is required' });
        if (!projectId) return reply.code(400).send({ error: 'Project ID is required' });

        // Find project and verify ownership
        const project = db.projects.get(projectId);
        if (!project) return reply.code(404).send({ error: 'Project not found' });
        if (project.owner_user_id !== userId) {
            return reply.code(403).send({ error: 'You do not have access to this project' });
        }

        try {
            // Create chat if not provided
            if (!chatId) {
                const chat = await database.createChat({
                    id: 'chat_' + nano(),
                    user_id: userId,
                    project_id: projectId,
                    title: question.substring(0, 50) + (question.length > 50 ? '...' : '')
                });
                chatId = chat.id;
            } else {
                // Verify chat ownership
                const chat = await database.getChat(chatId);
                if (!chat) return reply.code(404).send({ error: 'Chat not found' });
                if (chat.user_id !== userId) return reply.code(403).send({ error: 'Access denied' });
            }

            // Save user message
            await database.createMessage({
                id: 'msg_' + nano(),
                chat_id: chatId,
                role: 'user',
                content: question
            });

            // Get project documentation from database
            const projectDocs = await database.getDocsByProject(projectId);

            if (projectDocs.length === 0) {
                const answer = 'This project has no documentation yet. Please run `dok generate` in your project directory to generate documentation first.';

                // Save assistant message
                await database.createMessage({
                    id: 'msg_' + nano(),
                    chat_id: chatId,
                    role: 'assistant',
                    content: answer
                });

                return { answer, chatId };
            }

            // Get chat history for context
            const messages = await database.getMessagesByChat(chatId);
            const conversationHistory = messages
                .slice(-10) // Last 10 messages
                .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
                .join('\n\n');

            // Build context from documentation (limit to avoid token overflow)
            const maxDocs = 20;
            const relevantDocs = projectDocs
                .filter(d => d.path.endsWith('.md') && !d.path.includes('graph.json') && !d.path.includes('index.html'))
                .slice(0, maxDocs);

            const context = relevantDocs
                .map(doc => `File: ${doc.path}\n\n${doc.content.substring(0, 2000)}\n\n---\n`)
                .join('\n');

            // Build prompt for Gemini
            const prompt = `You are DokAgent, an AI assistant that helps developers understand their codebase.

You have access to the following documentation for the project "${project.name}":

${context}

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}Current question: ${question}

Please provide a clear, helpful answer based on the documentation and conversation context. If the documentation doesn't contain enough information to answer the question, say so and suggest what additional information might be needed.`;

            // Call Gemini
            const response = await callGemini(prompt);

            // Save assistant message
            await database.createMessage({
                id: 'msg_' + nano(),
                chat_id: chatId,
                role: 'assistant',
                content: response
            });

            return { answer: response, chatId };
        } catch (error: any) {
            console.error('DokAgent error:', error);
            return reply.code(500).send({
                error: 'Failed to generate response',
                message: error.message || 'Unknown error'
            });
        }
    });
}


