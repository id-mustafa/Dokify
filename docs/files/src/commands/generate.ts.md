---
path: src/commands/generate.ts
chunkCount: 1
entities:
  - registerGenerateCommand
  - gemini
dependenciesPreview:
  - "import { Command } from 'commander';"
  - import ora from 'ora';
  - import chalk from 'chalk';
  - "import path from 'node:path';"
  - "import fs from 'node:fs';"
  - "import { loadConfig } from '../config.js';"
  - "import { scanRepository } from '../core/scan.js';"
  - "import { chunkFiles } from '../core/chunk.js';"
  - "import { summarizeChunks } from '../core/summarize.js';"
  - "import { writeDocs } from '../core/docs.js';"
version: 1
generated_at: "2025-10-26T03:11:32.666Z"
---
# `generate.ts` - Dokify Documentation Generation Command

This file defines and registers the main `generate` command for the Dokify CLI. This command orchestrates the entire documentation generation pipeline, transforming raw repository code into structured, AI-powered documentation.

## Purpose

The `generate` command is the core functionality of Dokify. It initiates a multi-step process to:

1.  **Scan the repository:** Identify and gather relevant files.
2.  **Chunk files:** Divide large files into smaller, manageable segments for AI processing.
3.  **Summarize with AI:** Use a language model (like Gemini or Anthropic) to generate summaries and explanations for each chunk. This step can be configured to use local or remote models and API keys.
4.  **Write Markdown docs:** Convert the AI-generated content into human-readable Markdown files.
5.  **Build a dependency graph:** Analyze code to understand relationships between different parts of the project.
6.  **Synthesize project architecture:** Create an overview of the project's structure and design.
7.  **Upload results:** Optionally send the generated documentation to the Dokify backend for storage and retrieval.

The process is designed to be robust, providing visual feedback and configuration options for various aspects of the generation.

## Key APIs and Functions

### `registerGenerateCommand(program: Command)`

This is the primary exported function. It takes a `commander.Command` instance as input and adds the `generate` subcommand to it. This function sets up the command-line interface for `generate`, including its description, options, and the main execution logic.

## Command-Line Interface and Options

The `generate` command exposes several options to control its behavior:

*   `--local-only`: If set, the command will only perform local generation steps (scanning, chunking, summarizing, writing docs, building graph) and will *not* invoke external AI models or upload results to the Dokify backend. This is useful for testing or for generating documentation that will be handled manually.
*   `--use-local-keys`: When enabled, the command will attempt to use locally configured API keys (Bring Your Own Key - BYOK) for AI providers instead of relying on the Dokify backend for key management.
*   `--anthropic-key <key>`: Allows you to directly provide an Anthropic API key for the current generation run, overriding any other configured key.
*   `--google-key <key>`: Allows you to directly provide a Google (Gemini) API key for the current generation run, overriding any other configured key.
*   `--concurrency <n>`: Specifies the number of concurrent AI calls that can be made. This helps to optimize the summarization process by leveraging parallel processing.

## Execution Flow

When the `generate` command is invoked, the following sequence of operations typically occurs:

1.  **Configuration Loading:** The `loadConfig()` function is called to retrieve Dokify's configuration settings.
2.  **Repository Scanning:** `scanRepository()` is executed to discover files within the current project.
3.  **File Chunking:** `chunkFiles()` divides the identified files into smaller pieces.
4.  **AI Summarization:** `summarizeChunks()` processes these chunks, using AI models (like `GeminiProvider` or Anthropic) to generate summaries and explanations. The choice of AI provider and the use of local/remote keys are determined by the command's options and configuration.
5.  **Documentation Writing:** `writeDocs()` takes the AI-generated content and formats it into Markdown files.
6.  **Dependency Graph Building:** `buildGraph()` analyzes the codebase to construct a dependency graph.
7.  **Viewer Generation:** `writeViewer()` creates files for visualizing the dependency graph.
8.  **Result Upload (Conditional):** If `--local-only` is not specified, `uploadDocs()` will transmit the generated documentation to the Dokify backend.

Visual feedback during this process is provided using `ora` for spinners and `chalk` for colored text, making the user experience more informative.

## Dependencies

The `generate` command relies on several internal modules and external libraries:

**Internal Modules:**

*   `../config.js` (`loadConfig`): For loading project configuration.
*   `../core/scan.js` (`scanRepository`): For scanning the project's file structure.
*   `../core/chunk.js` (`chunkFiles`): For segmenting files.
*   `../core/summarize.js` (`summarizeChunks`): For AI-powered summarization.
*   `../core/docs.js` (`writeDocs`): For generating Markdown documentation.
*   `../core/graph.js` (`buildGraph`, `writeViewer`): For dependency graph creation.
*   `../core/upload.js` (`uploadDocs`): For uploading results.
*   `../llm/gemini.js` (`GeminiProvider`): A specific AI provider implementation. (Note: While `GeminiProvider` is imported, the summarization logic can likely abstract over different providers.)

**External Libraries:**

*   `commander`: For building command-line interfaces.
*   `ora`: For displaying loading spinners.
*   `chalk`: For colorful terminal output.
*   `node:path`: Node.js built-in module for path manipulation.
*   `node:fs`: Node.js built-in module for file system operations.
*   `dotenv`: For loading environment variables (likely for API keys).

## Error Handling

While the specific error handling logic within each core module is not detailed in the provided facts, it's implied that the `generate` command, as the orchestrator, would need to handle potential errors from its sub-operations. This could include:

*   File system errors during scanning or writing.
*   Network errors during AI API calls or uploads.
*   Configuration errors.
*   Errors from the AI provider itself (e.g., invalid API keys, rate limiting).

The use of `ora` spinners suggests that errors would likely be reported to the user via `chalk` warnings or explicit error messages when a spinner fails.

## Invariants

*   The command operates on the current working directory as the root of the repository unless otherwise specified by future configurations or options (not present in this excerpt).
*   Configuration values, once loaded, are expected to be valid for the duration of the generation process.
*   The output of each stage is expected to be compatible with the input of the subsequent stage.

## Examples

To generate documentation for the current repository, including AI summarization and uploading to Dokify:

```bash
dokify generate
```

To generate documentation locally only, without calling AI or uploading:

```bash
dokify generate --local-only
```

To generate documentation using a specific Google API key:

```bash
dokify generate --google-key YOUR_GOOGLE_API_KEY
```

## Pitfalls

*   **API Key Management:** Ensure API keys for AI providers are securely managed, especially when not using the `--local-only` flag or when handling sensitive keys. The `--use-local-keys` and direct key override options require careful consideration of where these keys are stored and how they are accessed.
*   **Concurrency Limits:** Setting the `--concurrency` too high without considering the capabilities of the AI provider or the machine's resources could lead to errors or reduced performance.
*   **Large Repositories:** For very large repositories, the scanning, chunking, and especially the AI summarization steps can be time-consuming and resource-intensive. The `--local-only` option is crucial for development and testing phases.
*   **AI Model Costs:** Extensive use of remote AI models can incur costs. Local-only generation or careful configuration of AI usage is important for cost management.

## Related Files

*   `../config.ts`: Responsible for loading and managing Dokify's configuration.
*   `../core/scan.ts`: Handles the initial repository scanning.
*   `../core/chunk.ts`: Implements file chunking logic.
*   `../core/summarize.ts`: Contains the core summarization process, likely abstracting over different AI providers.
*   `../core/docs.ts`: Manages the creation of Markdown documentation files.
*   `../core/graph.ts`: Deals with building and visualizing the project's dependency graph.
*   `../core/upload.ts`: Handles the transmission of generated documents to the Dokify backend.
*   `../llm/gemini.ts`: A specific implementation for interacting with the Gemini AI model. Other LLM provider files would likely exist here as well.

---
Generated: 2025-10-26T03:11:38.945Z  •  Version: v1
