---
path: src/llm/provider.ts
chunkCount: 1
entities:
dependenciesPreview:
  - "import { FileChunk } from '../core/chunk.js';"
  - "import { ChunkSummary } from '../core/summarize.js';"
version: 1
generated_at: "2025-10-26T03:11:43.950Z"
---
# `src/llm/provider.ts`

This file defines the `LLMProvider` interface, which acts as a contract for various language model implementations used in the project. Its primary purpose is to standardize how individual file chunks are summarized and, optionally, how project-level summaries are synthesized from multiple chunk summaries.

## Key APIs/Classes/Functions

*   **`LLMProvider` Interface**: This is the core component of this file. It outlines the methods that any concrete LLM implementation must provide to be compatible with the project's summarization pipeline.

    *   **`summarizeChunk(chunk: FileChunk): Promise<Partial<ChunkSummary>>`**: This is a mandatory method for all `LLMProvider` implementations.
        *   **Purpose**: To process a single `FileChunk` and generate a summary for it.
        *   **Input**:
            *   `chunk`: An instance of `FileChunk` representing a piece of code or text from a file.
        *   **Output**: A `Promise` that resolves to a `Partial<ChunkSummary>`. This partial summary typically includes the generated text summary of the chunk.
    *   **`synthesizeProject?(summaries: ChunkSummary[]): Promise<string>`**: This is an optional method. Implementations may choose to provide this for generating a higher-level, project-wide summary.
        *   **Purpose**: To take an array of individual `ChunkSummary` objects and synthesize a cohesive project-level summary.
        *   **Input**:
            *   `summaries`: An array of `ChunkSummary` objects, where each object represents the summary of an individual file chunk.
        *   **Output**: A `Promise` that resolves to a `string`, representing the synthesized project summary.

## Dependencies

This file has the following dependencies:

*   `../core/chunk.js`: Provides the `FileChunk` type, which represents a segment of a file to be summarized.
*   `../core/summarize.js`: Provides the `ChunkSummary` type, which defines the structure for storing chunk summaries.

## Examples

While this file only defines the interface, a hypothetical implementation might look like this:

```typescript
// Example implementation (not part of src/llm/provider.ts)
import { LLMProvider } from './provider.js';
import { FileChunk } from '../core/chunk.js';
import { ChunkSummary } from '../core/summarize.js';
import OpenAI from 'openai'; // Assuming an OpenAI client

class MyOpenAIProvider implements LLMProvider {
    private openai: OpenAI;

    constructor() {
        // Initialize your LLM client here
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async summarizeChunk(chunk: FileChunk): Promise<Partial<ChunkSummary>> {
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant that summarizes code." },
                { role: "user", content: `Summarize the following code:\n\n${chunk.content}` }
            ],
            max_tokens: 150,
        });
        return { text: response.choices[0].message.content || "" };
    }

    // Optional: Implement project synthesis if needed
    async synthesizeProject(summaries: ChunkSummary[]): Promise<string> {
        const combinedSummaries = summaries.map(s => s.text).join("\n\n");
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant that synthesizes project summaries." },
                { role: "user", content: `Synthesize a project summary from the following chunk summaries:\n\n${combinedSummaries}` }
            ],
            max_tokens: 500,
        });
        return response.choices[0].message.content || "";
    }
}

// Usage:
// const provider: LLMProvider = new MyOpenAIProvider();
// const chunk: FileChunk = { content: "console.log('hello');", filePath: "index.ts", startLine: 1, endLine: 1 };
// provider.summarizeChunk(chunk).then(summary => console.log(summary.text));
```

## Pitfalls

*   **Optional `synthesizeProject`**: Developers must be aware that the `synthesizeProject` method is optional. If an `LLMProvider` does not implement it, calling it will result in an error. Consumers of the `LLMProvider` interface should check for its existence before calling it, or be prepared to handle the case where it's not defined.
*   **Error Handling within Implementations**: While this interface defines the contract, the actual error handling for LLM API calls, rate limits, network issues, etc., must be implemented within concrete `LLMProvider` classes. Users of these providers should implement robust error handling around their calls to `summarizeChunk` and `synthesizeProject`.
*   **`Partial<ChunkSummary>`**: The `summarizeChunk` method returns a `Partial<ChunkSummary>`. This means that implementations might not populate all fields of a `ChunkSummary`. Consumers should only rely on the fields that are expected to be populated, such as `text`.

## Related Files

*   `../core/chunk.ts`: Defines the structure of `FileChunk`.
*   `../core/summarize.ts`: Defines the structure of `ChunkSummary`.
*   Other files within `src/llm/` would contain concrete implementations of the `LLMProvider` interface (e.g., `openai.ts`, `anthropic.ts`).

---
Generated: 2025-10-26T03:11:47.866Z  •  Version: v1
