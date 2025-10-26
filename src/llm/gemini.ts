import { LLMProvider } from './provider.js';
import { ChunkSummary } from '../core/summarize.js';
import path from 'node:path';
import { fetch } from 'undici';

export class GeminiProvider {
    private readonly apiKey: string;
    private readonly model: string;

    constructor(params: { apiKey: string; model: string }) {
        this.apiKey = params.apiKey;
        this.model = params.model;
    }

    async synthesizeProject(summaries: ChunkSummary[]): Promise<string> {
        // Placeholder for Gemini project synthesis
        const fileCount = new Set(summaries.map((s) => s.filePath)).size;
        return `Project synthesis for ${fileCount} files using ${this.model}.`;
    }

    async synthesizeFile(filePath: string, summaries: ChunkSummary[], snippets?: { index: number; startLine: number; endLine: number; text: string }[]): Promise<string> {
        const header = `# ${filePath}`;
        const sys = 'You are generating human-grade technical documentation for a single source file.';
        const facts = summaries.map((s) => `- Purpose: ${s.purpose || ''}\n  Entities: ${s.entities?.join(', ') || ''}\n  Deps: ${s.dependencies?.slice(0, 10).join(', ') || ''}`).join('\n');
        const codeBlocks = (snippets || [])
            .slice(0, 20)
            .map(sn => {
                const trimmed = sn.text.length > 1200 ? sn.text.slice(0, 1200) + '\n/* ...truncated... */' : sn.text;
                return `Chunk ${sn.index + 1} (lines ${sn.startLine}-${sn.endLine}):\n\n\`\`\`\n${trimmed}\n\`\`\``;
            })
            .join('\n\n');
        const user = `Create thorough, readable Markdown documentation for the file using the chunk facts and selected code excerpts.\nFocus on: purpose, key APIs/classes/functions, inputs/outputs, invariants, error handling, dependencies, examples, pitfalls, and related files.\nSynthesize across chunks; do not just list them.\n\nFile: ${filePath}\n\nFacts by chunk:\n${facts}\n\nSelected code excerpts (use to connect the dots, do not restate all code):\n${codeBlocks}`;
        try {
            if (!this.apiKey) throw new Error('no_key');
            const body = {
                contents: [{ role: 'user', parts: [{ text: `${sys}\n\n${user}` }] }],
            };
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`, {
                method: 'POST', headers: {
                    'x-goog-api-key': this.apiKey,
                    'content-type': 'application/json'
                }, body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`gemini ${res.status}`);
            const json = await res.json() as any;
            const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return text && text.trim().length > 0 ? text : `${header}\n\nDocumentation unavailable.`;
        } catch (error) {
            console.error(error);
            return `${header}\n\nDocumentation unavailable.`;
        }
    }

    async synthesizeReadme(allSummaries: ChunkSummary[], options: { repoName: string }): Promise<string> {
        const sys = 'You are generating a comprehensive README for a repository for developers new to the codebase.';
        const user = `Repo: ${options.repoName}\nCreate a README with: quick start (new machine), environment (dev/prod), running tests/build, scripts, architecture overview, major modules, and contribution notes.\nFacts you can use from file summaries:\n${allSummaries.slice(0, 300).map(s => `- ${path.relative(process.cwd(), s.filePath)}: ${s.purpose || ''}`).join('\n')}\n`;
        try {
            if (!this.apiKey) throw new Error('no_key');
            const body = { contents: [{ role: 'user', parts: [{ text: `${sys}\n\n${user}` }] }] };
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`, {
                method: 'POST', headers: {
                    'x-goog-api-key': this.apiKey,
                    'content-type': 'application/json'
                }, body: JSON.stringify(body)
            });
            if (!res.ok) throw new Error(`gemini ${res.status}`);
            const json = await res.json() as any;
            const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return text && text.trim().length > 0 ? text : '# README\n\nSetup instructions unavailable.';
        } catch {
            return `# ${options.repoName}\n\n## Quick start\n- npm install\n- dok login\n- dok generate\n\n## Environment\n- DEV: local server at https://dokify-api.onrender.com:4000\n- PROD: configure API_BASE and JWT_SECRET\n\n## Architecture\nAuto-generated.`;
        }
    }
}


