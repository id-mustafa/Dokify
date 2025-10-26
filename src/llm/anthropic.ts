import { LLMProvider } from './provider.js';
import { FileChunk } from '../core/chunk.js';
import { ChunkSummary } from '../core/summarize.js';

type AnthropicMessage = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

export class AnthropicProvider implements LLMProvider {
    private readonly apiKey: string;
    private readonly model: string;

    constructor(params: { apiKey: string; model: string }) {
        this.apiKey = params.apiKey;
        this.model = params.model;
    }

    async summarizeChunk(chunk: FileChunk): Promise<Partial<ChunkSummary>> {
        const systemPrompt = `You are a senior engineer extracting structured documentation facts from a small code chunk.
Return ONLY strict JSON with these fields:
{
  "purpose": string,                      // one clear paragraph
  "entities": string[],                   // functions/classes/types defined or used
  "inputs": string[],                     // key inputs/params/read state
  "outputs": string[],                    // key outputs/returns/written state
  "dependencies": string[],               // imported modules or external calls
  "notes": string[]                       // invariants, error handling, caveats
}`;
        const userPrompt = `File: ${chunk.filePath}
Chunk: ${chunk.index + 1}/${chunk.total}
Lines ${chunk.startLine}-${chunk.endLine}

Code:
${chunk.content}

Return ONLY JSON. No prose.`;

        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 200,
                    system: systemPrompt,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: userPrompt }
                            ]
                        }
                    ]
                })
            });
            if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
            const json = (await res.json()) as any;
            let text: string = json?.content?.[0]?.text || '';
            // Some models return fenced JSON in content[0].text
            if (typeof text === 'string' && text.includes('```')) {
                const fence = text.match(/```json\s*([\s\S]*?)\s*```/i) || text.match(/```\s*([\s\S]*?)\s*```/i);
                if (fence && fence[1]) text = fence[1];
            }
            try {
                const parsed = JSON.parse(text);
                const purpose = String(parsed?.purpose || '').trim();
                const entities = Array.isArray(parsed?.entities) ? parsed.entities.map((x: any) => String(x)).slice(0, 50) : [];
                const inputs = Array.isArray(parsed?.inputs) ? parsed.inputs.map((x: any) => String(x)).slice(0, 50) : [];
                const outputs = Array.isArray(parsed?.outputs) ? parsed.outputs.map((x: any) => String(x)).slice(0, 50) : [];
                const dependencies = Array.isArray(parsed?.dependencies) ? parsed.dependencies.map((x: any) => String(x)).slice(0, 100) : [];
                const notes = Array.isArray(parsed?.notes) ? parsed.notes.map((x: any) => String(x)).slice(0, 50) : [];
                return { purpose, entities, inputs, outputs, dependencies, notes } as Partial<ChunkSummary>;
            } catch {
                const purpose = (text || '').trim().replace(/[\n\r]+/g, ' ').slice(0, 500);
                return { purpose };
            }
        } catch {
            return { purpose: `Auto summary for ${chunk.filePath} chunk ${chunk.index + 1}/${chunk.total}` } as Partial<ChunkSummary>;
        }
    }
}


