---
path: src/core/summarize.ts
chunkCount: 1
entities:
  - summarizeChunks
  - summarizeSingle
  - names
  - pathBase
  - hashStr
dependenciesPreview:
  - "import { FileChunk } from './chunk.js';"
  - "import os from 'node:os';"
  - "import { CacheStore } from './cache.js';"
  - "import { AnthropicProvider } from '../llm/anthropic.js';"
version: 1
generated_at: "2025-10-26T03:11:40.680Z"
---
# Code Summarization (`src/core/summarize.ts`)

This file provides functionality to automatically generate technical documentation summaries for code chunks. It employs a combination of local heuristic parsing and optional enhancement via the Anthropic Large Language Model (LLM) to extract key information such as the purpose, entities, inputs, outputs, dependencies, and notes. The system is designed to process multiple chunks concurrently with caching to optimize performance and avoid redundant analyses.

## Key APIs/Classes/Functions

### `summarizeChunks(chunks: FileChunk[], options: SummarizeOptions): Promise<ChunkSummary[]>`

This is the primary function for summarizing a collection of code chunks.

*   **Purpose**: Orchestrates the summarization process for an array of `FileChunk` objects. It manages concurrency, caching, and the integration of LLM analysis when available and configured.
*   **Inputs**:
    *   `chunks`: An array of `FileChunk` objects, where each `FileChunk` represents a piece of code to be summarized.
    *   `options`: An object of type `SummarizeOptions` to configure the summarization behavior.
*   **Outputs**: A `Promise` that resolves to an array of `ChunkSummary` objects, each containing the summarized documentation for a corresponding input chunk.
*   **Concurrency**: The function determines an optimal concurrency level based on the number of CPU cores available, defaulting to a sensible number if not specified in `options.concurrency`.
*   **Caching**: It utilizes a `CacheStore` to store and retrieve previously generated summaries, significantly speeding up repeated analyses of the same code.
*   **LLM Integration**: If an `ANTHROPIC_API_KEY` is present in the environment and `localOnly` is not set to `true` in the options, an `AnthropicProvider` is initialized to enhance summaries with LLM capabilities.

### `summarizeSingle(chunk: FileChunk, options: SummarizeOptions): Promise<ChunkSummary>`

This function focuses on summarizing a single code chunk. It is likely called internally by `summarizeChunks` for each chunk.

*   **Purpose**: Performs the detailed analysis and summarization of an individual `FileChunk`.
*   **Inputs**:
    *   `chunk`: The `FileChunk` object to be summarized.
    *   `options`: `SummarizeOptions` to control the summarization process, including whether to use LLM enhancement.
*   **Outputs**: A `Promise` that resolves to a `ChunkSummary` object for the given chunk.
*   **Internal Logic**: This function would contain the core logic for parsing the code chunk, extracting structural information, and potentially interacting with the LLM provider.

## Types

### `ChunkSummary`

This type defines the structure of the summarized documentation for a single code chunk.

```typescript
export type ChunkSummary = {
    filePath: string;      // The path to the file from which the chunk was extracted.
    index: number;         // The index of this chunk within the original file.
    total: number;         // The total number of chunks in the original file.
    entities: string[];    // A list of key entities (classes, functions, variables) identified in the chunk.
    purpose: string;       // A concise description of the chunk's purpose.
    inputs: string[];      // A description of the inputs the chunk expects.
    outputs: string[];     // A description of the outputs the chunk produces.
    dependencies: string[];// A list of external dependencies or internal modules the chunk relies on.
    notes: string[];       // Any additional relevant notes or observations about the code.
};
```

### `SummarizeOptions`

This type defines the configuration options available for the summarization process.

```typescript
export type SummarizeOptions = {
    localOnly?: boolean;   // If true, LLM enhancement will be skipped even if an API key is available.
    concurrency?: number;  // An optional explicit setting for the number of concurrent workers.
};
```

## Dependencies

*   `./chunk.js`: Defines the `FileChunk` type, which represents a segment of a file with its content and metadata.
*   `node:os`: Used to determine the number of CPU cores for optimizing concurrency.
*   `./cache.js`: Provides the `CacheStore` class for caching previously generated summaries.
*   `../llm/anthropic.js`: Provides the `AnthropicProvider` class for interacting with the Anthropic LLM API.

## Invariants and Error Handling

*   **Concurrency Limit**: The `concurrency` is always at least 1, preventing zero or negative concurrency.
*   **LLM API Key**: The `AnthropicProvider` is only instantiated if `localOnly` is `false` and `process.env.ANTHROPIC_API_KEY` is defined, ensuring LLM features are only used when explicitly intended and configured.
*   **Cache Initialization**: The `CacheStore` is initialized with `process.cwd()`, indicating that the cache will be managed relative to the current working directory.
*   **Error Handling (Implied)**: While not explicitly detailed in the provided excerpts, robust error handling would be expected for network requests to the LLM API, file system operations related to caching, and potential parsing errors within the code chunks themselves. This would likely involve `try...catch` blocks and appropriate error reporting.

## Examples

```typescript
import { summarizeChunks, SummarizeOptions } from './core/summarize.js';
import { FileChunk } from './core/chunk.js';

// Assume 'myChunks' is an array of FileChunk objects
const myChunks: FileChunk[] = [
    // ... populate with FileChunk objects ...
];

const defaultOptions: SummarizeOptions = {};
const summarizedDocs = await summarizeChunks(myChunks, defaultOptions);
console.log(summarizedDocs);

const localOnlyOptions: SummarizeOptions = { localOnly: true };
const summarizedDocsLocal = await summarizeChunks(myChunks, localOnlyOptions);
console.log(summarizedDocsLocal);

const customConcurrencyOptions: SummarizeOptions = { concurrency: 8 };
const summarizedDocsConcurrent = await summarizeChunks(myChunks, customConcurrencyOptions);
console.log(summarizedDocsConcurrent);
```

## Pitfalls

*   **LLM Dependency**: If LLM enhancement is desired but the `ANTHROPIC_API_KEY` is not set or `localOnly` is `true`, the summaries will rely solely on local heuristic parsing, which may be less comprehensive.
*   **Cache Invalidation**: The current implementation does not explicitly detail cache invalidation strategies. Stale cached summaries could be returned if the underlying code changes without the cache being updated.
*   **Heuristic Parsing Limitations**: Local heuristic parsing might not always correctly identify complex code structures or infer nuanced purposes, especially in highly abstract or domain-specific code.
*   **LLM Cost and Rate Limits**: When using the Anthropic LLM, API costs and rate limits should be considered. The `concurrency` setting directly impacts the number of LLM calls that can be made in parallel.

## Related Files

*   `src/core/chunk.ts`: Defines the `FileChunk` data structure.
*   `src/core/cache.ts`: Implements the `CacheStore` for caching summaries.
*   `src/llm/anthropic.ts`: Provides the `AnthropicProvider` for LLM interactions.
*   `src/core/parse.ts` (implied): Likely contains the local heuristic parsing logic used when LLM enhancement is not active or as a pre-processing step.

---
Generated: 2025-10-26T03:11:46.426Z  •  Version: v1
