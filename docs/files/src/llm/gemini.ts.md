---
path: src/llm/gemini.ts
chunkCount: 1
entities:
  - GeminiProvider
  - codeBlocks
dependenciesPreview:
  - "import { LLMProvider } from './provider.js';"
  - "import { ChunkSummary } from '../core/summarize.js';"
  - "import path from 'node:path';"
  - "import { fetch } from 'undici';"
version: 1
generated_at: "2025-10-26T03:11:43.721Z"
---
# Gemini LLM Provider

This document provides technical documentation for the `GeminiProvider` class, which leverages Google's Gemini API to generate human-readable technical documentation.

## Purpose

The `GeminiProvider` class is designed to synthesize comprehensive technical documentation for software projects. It can generate documentation for entire projects, individual files, or specific README files. The core functionality involves constructing structured prompts using code summaries and snippets, then sending these prompts to the Gemini generative API. The provider includes robust error handling and fallbacks to ensure reliable documentation generation.

## Key APIs/Classes/Functions

### `GeminiProvider` Class

The central class for interacting with the Gemini API for documentation synthesis.

**Constructor:**

*   `constructor(params: { apiKey: string; model: string })`: Initializes the `GeminiProvider` with your Gemini API key and the specific Gemini model you wish to use (e.g., `'gemini-pro'`).

**Methods:**

*   `async synthesizeProject(summaries: ChunkSummary[]): Promise<string>`:
    *   **Purpose:** Generates documentation for an entire project.
    *   **Inputs:**
        *   `summaries`: An array of `ChunkSummary` objects, where each object represents a summary of a code chunk or file within the project.
    *   **Outputs:** A `Promise` that resolves to a string containing the synthesized project documentation.
    *   **Note:** This method currently acts as a placeholder, returning a string indicating the number of files processed and the model used. The actual implementation for project synthesis is expected to be more complex.

*   `async synthesizeFile(filePath: string, summaries: ChunkSummary[], snippets?: { index: number; startLine: number; endLine: number; text: string }[]): Promise<string>`:
    *   **Purpose:** Generates documentation for a single source file.
    *   **Inputs:**
        *   `filePath`: The path to the file for which documentation is being generated.
        *   `summaries`: An array of `ChunkSummary` objects pertaining to the provided `filePath`.
        *   `snippets` (optional): An array of code snippets from the file, each with its index, start and end line numbers, and the actual text content. This allows for more granular context to be provided to the LLM.
    *   **Outputs:** A `Promise` that resolves to a string containing the synthesized documentation for the specified file.
    *   **Internal Logic:** Constructs a structured prompt by including:
        *   A file path header (e.g., `# src/llm/gemini.ts`).
        *   A system instruction defining the AI's role (e.g., 'You are generating human-grade technical documentation for a single source file.').
        *   A formatted list of facts extracted from the `ChunkSummary` objects (purpose, entities, and top 10 dependencies).

## Inputs/Outputs

The `GeminiProvider` primarily deals with `ChunkSummary` objects as input and generates human-readable strings as output.

*   **`ChunkSummary` Structure (inferred from usage):**
    *   `purpose`: A string describing the purpose of a code chunk or file.
    *   `entities`: An array of strings listing the key entities (e.g., classes, functions) within the chunk.
    *   `dependencies`: An array of strings listing the dependencies of the chunk.
    *   `filePath`: The path of the file the summary belongs to.

*   **Outputs:** The primary output of the `synthesizeProject` and `synthesizeFile` methods is a `Promise<string>`, which resolves to the generated documentation.

## Invariants

*   The `GeminiProvider` instance is initialized with a valid API key and a specified Gemini model.
*   The `synthesizeFile` method always includes the file path as a header in the generated documentation.
*   The system prompt for `synthesizeFile` consistently defines the AI's role as a technical documentation generator.

## Error Handling

While specific error handling mechanisms are not detailed in the provided excerpts, the class is designed with "proper error handling and fallbacks." This suggests that it will likely:

*   Handle potential network errors when calling the Gemini API.
*   Manage API-specific errors (e.g., invalid API key, rate limiting).
*   Provide fallback mechanisms or informative error messages if documentation generation fails.

## Dependencies

The `GeminiProvider` class has the following direct dependencies:

*   `./provider.js`: Likely contains the `LLMProvider` abstract class or interface that `GeminiProvider` implements.
*   `../core/summarize.js`: Provides the `ChunkSummary` type, which is used to structure input data.
*   `node:path`: Used for path manipulation, likely to construct file paths within prompts.
*   `undici`: A modern HTTP client, used for making network requests to the Gemini API.

## Examples

**Synthesizing documentation for a single file:**

```typescript
import { GeminiProvider } from './llm/gemini.js';
import { ChunkSummary } from './core/summarize.js'; // Assuming ChunkSummary is defined elsewhere

const gemini = new GeminiProvider({ apiKey: 'YOUR_GEMINI_API_KEY', model: 'gemini-pro' });

const fileSummaries: ChunkSummary[] = [
    {
        purpose: 'Initializes the GeminiProvider with API key and model.',
        entities: ['GeminiProvider', 'constructor'],
        dependencies: ['./provider.js', '../core/summarize.js'],
        filePath: 'src/llm/gemini.ts'
    },
    // ... other summaries for the file
];

const filePath = 'src/llm/gemini.ts';

try {
    const documentation = await gemini.synthesizeFile(filePath, fileSummaries);
    console.log(documentation);
} catch (error) {
    console.error('Error generating documentation:', error);
}
```

**Synthesizing documentation for a project (placeholder):**

```typescript
import { GeminiProvider } from './llm/gemini.js';
import { ChunkSummary } from './core/summarize.js';

const gemini = new GeminiProvider({ apiKey: 'YOUR_GEMINI_API_KEY', model: 'gemini-pro' });

const projectSummaries: ChunkSummary[] = [
    // ... summaries for all files in the project
];

try {
    const projectDocs = await gemini.synthesizeProject(projectSummaries);
    console.log(projectDocs); // Will output a placeholder message
} catch (error) {
    console.error('Error generating project documentation:', error);
}
```

## Pitfalls

*   **API Key Security:** Ensure your Gemini API key is handled securely and not exposed in client-side code or public repositories.
*   **Model Cost and Usage:** Be aware of the costs associated with using the Gemini API and monitor your usage. Different models may have different pricing.
*   **Prompt Engineering:** The quality of the generated documentation heavily depends on the quality and structure of the input `ChunkSummary` and `snippets`. Crafting effective summaries and selecting relevant snippets is crucial.
*   **Placeholder Implementation:** The `synthesizeProject` method is currently a placeholder. Its full implementation will likely require more complex logic for aggregating and structuring information from multiple files.
*   **Dependency Truncation:** The `synthesizeFile` method currently only includes the first 10 dependencies in the prompt. For projects with many dependencies, this might lead to incomplete information being passed to the LLM.

## Related Files

*   `src/llm/provider.ts`: Likely defines the `LLMProvider` interface or abstract class that `GeminiProvider` extends or implements.
*   `src/core/summarize.ts`: Defines the `ChunkSummary` type and likely contains logic for generating these summaries from code.
*   Other LLM provider implementations (e.g., for OpenAI, Anthropic) if they exist in the project.

---
Generated: 2025-10-26T03:11:49.751Z  •  Version: v1
