---
path: src/llm/anthropic.ts
chunkCount: 1
entities:
  - AnthropicProvider
  - json
  - purpose
dependenciesPreview:
  - "import { LLMProvider } from './provider.js';"
  - "import { FileChunk } from '../core/chunk.js';"
  - "import { ChunkSummary } from '../core/summarize.js';"
version: 1
generated_at: "2025-10-26T03:11:43.284Z"
---
# Anthropic LLM Provider (`src/llm/anthropic.ts`)

This file defines the `AnthropicProvider` class, which implements the `LLMProvider` interface. Its primary purpose is to interact with the Anthropic API to generate structured documentation summaries for code chunks.

## Purpose

The `AnthropicProvider` is designed to process individual `FileChunk` objects and extract key documentation-related information. It achieves this by sending a carefully crafted prompt to the Anthropic API, requesting the information in a strict JSON format. This allows for automated parsing and integration of documentation facts into a larger system.

## Key APIs and Classes

### `AnthropicProvider`

This is the main class provided by this file. It implements the `LLMProvider` interface, ensuring a consistent way to interact with different LLM providers.

*   **Constructor:**
    *   `constructor(params: { apiKey: string; model: string })`
        *   Initializes the provider with the necessary Anthropic API key and the specific Anthropic model to be used (e.g., "claude-3-opus-20240229").

*   **`summarizeChunk(chunk: FileChunk): Promise<Partial<ChunkSummary>>`**
    *   **Purpose:** This is the core method for generating documentation summaries. It takes a `FileChunk` object as input and returns a promise that resolves to a `Partial<ChunkSummary>` object containing the extracted documentation facts.
    *   **Input:**
        *   `chunk`: A `FileChunk` object representing a segment of code.
    *   **Output:** A `Promise` that resolves to a `Partial<ChunkSummary>` object. This object is expected to contain the following keys, populated with extracted information:
        *   `purpose`: A string describing the main goal of the code chunk.
        *   `entities`: An array of strings listing the main functions, classes, types, or other significant entities defined or used within the chunk.
        *   `inputs`: An array of strings detailing the key inputs, parameters, or state read by the code chunk.
        *   `outputs`: An array of strings describing the key outputs, return values, or state written by the code chunk.
        *   `dependencies`: An array of strings listing imported modules or external API calls made by the code chunk.
        *   `notes`: An array of strings containing important invariants, error handling considerations, or other relevant remarks.
    *   **Internal Process:**
        1.  Constructs a `systemPrompt` tailored for the Anthropic API, instructing it to act as a senior engineer and return *only* strict JSON with specific fields.
        2.  Formats the user prompt by embedding the `FileChunk`'s code content.
        3.  Sends a request to the Anthropic API (details of the API call itself are not shown in the provided excerpts but are implied).
        4.  Parses the JSON response from the API.
        5.  Includes fallback error handling mechanisms to gracefully manage potential issues during API interaction or response parsing.

### `AnthropicMessage` (Type)

A simple type definition representing a message in the Anthropic API conversation format, consisting of a `role` (user, assistant, or system) and `content`.

## Inputs and Outputs

### `summarizeChunk` Method

*   **Inputs:**
    *   `chunk`: An instance of `FileChunk`, containing the code content to be summarized.
*   **Outputs:**
    *   A `Promise<Partial<ChunkSummary>>`. The `Partial<ChunkSummary>` object contains extracted documentation facts:
        *   `purpose`: `string`
        *   `entities`: `string[]`
        *   `inputs`: `string[]`
        *   `outputs`: `string[]`
        *   `dependencies`: `string[]`
        *   `notes`: `string[]`

## Invariants

*   The `AnthropicProvider` expects a valid Anthropic API key to be provided during initialization.
*   The `summarizeChunk` method is designed to return *only* strict JSON. Any deviation from this format by the LLM is handled as an error.
*   The structure of the expected JSON output from the Anthropic API is predefined and must adhere to the specified fields (`purpose`, `entities`, `inputs`, `outputs`, `dependencies`, `notes`).

## Error Handling

The `AnthropicProvider` includes fallback error handling for scenarios such as:

*   Issues during the API call to Anthropic.
*   Errors in parsing the JSON response from the API.
*   Cases where the API might not return the expected JSON structure.

Specific details of the error handling implementation are not fully visible in the provided excerpts but are mentioned as a key feature.

## Dependencies

*   **Internal:**
    *   `./provider.js`: Defines the `LLMProvider` interface.
    *   `../core/chunk.js`: Defines the `FileChunk` type.
    *   `../core/summarize.js`: Defines the `ChunkSummary` type.
*   **External:**
    *   **Anthropic API:** The provider directly interacts with the Anthropic API. This implies a network dependency and the need for a valid API key.

## Examples

While a full executable example is not provided in the excerpts, the intended usage can be inferred:

```typescript
import { AnthropicProvider } from './llm/anthropic';
import { FileChunk } from './core/chunk';

const provider = new AnthropicProvider({
    apiKey: 'YOUR_ANTHROPIC_API_KEY',
    model: 'claude-3-opus-20240229',
});

const codeChunk: FileChunk = {
    content: `
function calculateSum(a: number, b: number): number {
    // Adds two numbers
    if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Inputs must be numbers');
    }
    return a + b;
}
`,
    // Other FileChunk properties...
};

async function generateDocumentation() {
    try {
        const summary = await provider.summarizeChunk(codeChunk);
        console.log(summary);
        // Expected output might look like:
        // {
        //   purpose: "Calculates the sum of two numbers, with input validation.",
        //   entities: ["calculateSum"],
        //   inputs: ["a: number", "b: number"],
        //   outputs: ["number"],
        //   dependencies: [],
        //   notes: ["Invariants: Inputs must be numbers.", "Error handling: Throws an error if inputs are not numbers."]
        // }
    } catch (error) {
        console.error("Failed to summarize chunk:", error);
    }
}

generateDocumentation();
```

## Pitfalls

*   **API Key Security:** The `apiKey` must be handled securely and should not be hardcoded directly into source files.
*   **API Costs and Rate Limits:** Repeated calls to the Anthropic API incur costs and are subject to rate limits. Usage should be managed accordingly.
*   **LLM Variability:** While structured output is requested, LLM responses can sometimes be inconsistent. The error handling should be robust enough to manage minor deviations or unexpected outputs.
*   **Prompt Engineering:** The effectiveness of the summary heavily relies on the quality and clarity of the `systemPrompt`. Any changes to the prompt may impact the accuracy and format of the output.
*   **Model Choice:** The choice of Anthropic model (`params.model`) can significantly affect the quality, speed, and cost of the summarization.

## Related Files

*   `src/llm/provider.ts`: Defines the abstract `LLMProvider` interface that `AnthropicProvider` implements.
*   `src/core/chunk.ts`: Defines the `FileChunk` type used as input for summarization.
*   `src/core/summarize.ts`: Defines the `ChunkSummary` type, which structures the output of the summarization process.

---
Generated: 2025-10-26T03:11:48.760Z  •  Version: v1
