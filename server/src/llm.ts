type ChunkIn = { index: number; startLine: number; endLine: number; content: string };

export async function claudeSummaries(chunks: ChunkIn[], model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest') {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    const out: { purpose: string; entities: string[]; inputs: string[]; outputs: string[]; dependencies: string[]; notes: string[] }[] = [];
    for (const c of chunks) {
        if (!apiKey) {
            out.push({ purpose: `Auto summary chunk ${c.index + 1}`, entities: [], inputs: [], outputs: [], dependencies: [], notes: [] });
            continue;
        }
        const system = `You are extracting structured documentation facts. Respond ONLY JSON with keys: purpose, entities, inputs, outputs, dependencies, notes.`;
        const user = `Lines ${c.startLine}-${c.endLine}\n\n${c.content}\n\nReturn ONLY JSON.`;
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({ model, max_tokens: 200, system, messages: [{ role: 'user', content: [{ type: 'text', text: user }] }] })
            });
            if (!res.ok) throw new Error(String(res.status));
            const json = await res.json() as any;
            let text: string = json?.content?.[0]?.text || '';
            const fence = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/i);
            if (fence && fence[1]) text = fence[1];
            const parsed = JSON.parse(text);
            out.push({
                purpose: String(parsed?.purpose || ''),
                entities: (parsed?.entities || []).map((x: any) => String(x)),
                inputs: (parsed?.inputs || []).map((x: any) => String(x)),
                outputs: (parsed?.outputs || []).map((x: any) => String(x)),
                dependencies: (parsed?.dependencies || []).map((x: any) => String(x)),
                notes: (parsed?.notes || []).map((x: any) => String(x)),
            });
        } catch {
            out.push({ purpose: `Auto summary chunk ${c.index + 1}`, entities: [], inputs: [], outputs: [], dependencies: [], notes: [] });
        }
    }
    return out;
}

export async function geminiSynthesize(filePath: string, facts: ReturnType<typeof mapFacts> extends infer T ? any[] : any[], snippets: ChunkIn[], model = process.env.GOOGLE_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-flash') {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    const header = `# ${filePath}`;
    const factLines = facts.map((s: any) => `- Purpose: ${s.purpose || ''}\n  Entities: ${(s.entities || []).join(', ')}`).join('\n');
    const code = snippets.slice(0, 10).map((sn, i) => `Chunk ${sn.index + 1} (lines ${sn.startLine}-${sn.endLine}):\n\n\`\`\`\n${sn.content.slice(0, 1000)}\n\`\`\``).join('\n\n');
    if (!apiKey) return `${header}\n\nDocumentation unavailable.`;
    const sys = 'You are generating human-grade technical documentation for a single source file.';
    const user = `Create thorough, readable Markdown using these facts and excerpts.\nFile: ${filePath}\n\nFacts:\n${factLines}\n\nExcerpts:\n${code}`;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST', headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${sys}\n\n${user}` }] }] })
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json() as any;
        const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text && text.trim() ? text.trim() : `${header}\n\nDocumentation unavailable.`;
    } catch {
        return `${header}\n\nDocumentation unavailable.`;
    }
}

export function mapFacts(summaries: any[]) {
    return summaries.map(s => ({
        purpose: s.purpose || '',
        entities: s.entities || [],
        inputs: s.inputs || [],
        outputs: s.outputs || [],
        dependencies: s.dependencies || [],
        notes: s.notes || []
    }));
}

export async function geminiReadme(allSummaries: any[], repoName: string, model = process.env.GOOGLE_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-flash') {
    const apiKey = process.env.GOOGLE_API_KEY || '';
    if (!apiKey) return `# ${repoName}\n\n## Quick start\n- dok login\n- dok generate`;
    const facts = allSummaries.slice(0, 300).map((s) => `- ${s.filePath || ''}: ${s.purpose || ''}`).join('\n');
    const sys = 'You are generating a comprehensive README for a repository for developers new to the codebase.';
    const user = `Repo: ${repoName}\nCreate a README with: quick start (new machine), environment (dev/prod), running tests/build, scripts, architecture overview, major modules, and contribution notes.\nFacts you can use:\n${facts}`;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST', headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: `${sys}\n\n${user}` }] }] })
        });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json() as any;
        const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text && text.trim() ? text.trim() : `# ${repoName}\n\nSetup instructions unavailable.`;
    } catch {
        return `# ${repoName}\n\nSetup instructions unavailable.`;
    }
}


