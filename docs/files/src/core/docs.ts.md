---
path: src/core/docs.ts
chunkCount: 1
entities:
  - writeDocs
  - version
  - frontmatter
  - toYaml
  - escapeYaml
  - renderFileDoc
  - renderPackageJsonDoc
  - renderPackageLockDoc
  - sanitizeMarkdown
  - renderOverview
  - unique
dependenciesPreview:
  - "import fs from 'node:fs';"
  - "import path from 'node:path';"
  - "import { RepoScan } from './scan.js';"
  - "import { FileChunk } from './chunk.js';"
  - "import { ChunkSummary } from './summarize.js';"
  - "import { GeminiProvider } from '../llm/gemini.js';"
version: 1
generated_at: "2025-10-26T03:11:38.340Z"
---
# Documentation Generation (`src/core/docs.ts`)

This file provides the core functionality for generating and writing comprehensive technical documentation for a scanned repository. It synthesizes information from file chunks, optionally enhances it with AI, manages version tracking, and creates project overview and README files.

## Purpose

The primary goal of this module is to automate the creation of high-quality, human-readable documentation from code and its associated metadata. It processes repository scan results, summarizes individual files, and then renders these summaries into structured Markdown files. This process is designed to be extensible, with support for AI-powered enhancements and versioning to track documentation changes over time.

## Key APIs and Functions

### `writeDocs(params: WriteDocsParams): Promise<WriteDocsResult>`

This is the main entry point for the documentation generation process. It orchestrates the entire workflow, from organizing file summaries to writing the final documentation files.

**Parameters (`WriteDocsParams`):**

*   `projectRoot`: The absolute path to the root of the project being documented.
*   `docsDir`: The directory where the generated documentation will be written.
*   `scan`: The result of the repository scan, containing information about the project structure.
*   `chunks`: An array of `FileChunk` objects, representing the individual pieces of code or text extracted from files.
*   `summaries`: An array of `ChunkSummary` objects, which are AI-generated or synthesized summaries of the `FileChunk`s.
*   `gemini` (optional): An instance of `GeminiProvider` for AI-powered content enhancement.
*   `useGemini` (optional): A boolean flag to enable or disable AI enhancement. Defaults to `false`.
*   `fileSynthesisConcurrency` (optional): The maximum number of file syntheses to run concurrently.

**Returns (`WriteDocsResult`):**

*   `written`: The total number of documentation files successfully written.

### Internal Helper Functions (Synthesized):

While not directly exported, several internal functions are used to construct the documentation:

*   **`frontmatter(filePath: string, scan: RepoScan): string`**: Likely responsible for generating the YAML frontmatter for Markdown files, which could include metadata like the file path, last modified date, and potentially other relevant information derived from the `RepoScan` and file's history.
*   **`toYaml(obj: object): string`**: Converts a JavaScript object into a YAML string, essential for generating frontmatter.
*   **`escapeYaml(str: string): string`**: Escapes special characters within a string to ensure it's safely represented in YAML.
*   **`renderFileDoc(filePath: string, summaries: ChunkSummary[], gemini?: GeminiProvider, useGemini?: boolean): string`**: Generates the Markdown documentation for a single file, synthesizing information from its associated `ChunkSummary` objects. It may leverage the `gemini` provider if enabled.
*   **`renderPackageJsonDoc(projectRoot: string): string`**: Generates documentation for the `package.json` file, extracting relevant information.
*   **`renderPackageLockDoc(projectRoot: string): string`**: Generates documentation for the `package-lock.json` or `yarn.lock` file, detailing dependencies.
*   **`sanitizeMarkdown(markdown: string): string`**: Cleans and sanitizes Markdown content, ensuring it's safe for display and adheres to formatting standards.
*   **`renderOverview(scan: RepoScan, summaries: ChunkSummary[]): string`**: Creates a high-level overview document for the entire project, likely summarizing key files, directories, and overall structure based on the `RepoScan` and `ChunkSummary` data.
*   **`unique(arr: string[]): string[]`**: Likely a utility to get unique elements from an array of strings.

## Inputs and Outputs

### Inputs:

*   **`projectRoot`**: The source of truth for file paths and project context.
*   **`docsDir`**: The destination for all generated documentation.
*   **`scan`**: A detailed map of the repository's structure and file information.
*   **`chunks`**: Raw segments of code/text from files.
*   **`summaries`**: Synthesized or AI-generated textual representations of the `chunks`, providing the core content for documentation.
*   **`gemini` (optional)**: An AI model to potentially enrich summaries.

### Outputs:

The function writes several types of documentation files to the specified `docsDir`:

1.  **File-specific documentation**: Markdown files, typically located in a `files` subdirectory within `docsDir`, each detailing a single source file.
2.  **Project Overview**: A Markdown file (e.g., `overview.md`) providing a high-level summary of the project.
3.  **README file**: A `README.md` file for the project, acting as the main entry point for users.
4.  **Package-related documentation**: Markdown files for `package.json` and lock files (e.g., `package-lock.json`).

## Invariants and Assumptions

*   The `projectRoot` is a valid and accessible directory.
*   The `docsDir` is a valid and accessible directory, or can be created.
*   The `scan` object accurately reflects the repository's state at the time of scanning.
*   `summaries` are provided for relevant `chunks`.
*   If `useGemini` is `true`, a functional `GeminiProvider` must be supplied.
*   The module assumes a standard Node.js project structure for identifying `package.json` and lock files.

## Error Handling

The provided snippet shows basic error handling for reading versioning data:

*   A `try...catch` block is used when attempting to read and parse the `versions.json` file. If an error occurs (e.g., file not found, invalid JSON), it defaults to an empty object `{}` for versions, effectively treating it as a fresh documentation run without previous version data.

More comprehensive error handling would be expected for:

*   File system operations (writing files, creating directories).
*   AI provider interactions (network errors, API limits, invalid responses).
*   Invalid input parameters.

## Dependencies

This module relies on several core Node.js modules and internal utilities:

*   **`node:fs`**: For file system operations (reading, writing, creating directories).
*   **`node:path`**: For handling and constructing file paths.
*   **`./scan.js`**: The `RepoScan` type, representing the output of the repository scanning process.
*   **`./chunk.js`**: The `FileChunk` type, representing raw file content segments.
*   **`./summarize.js`**: The `ChunkSummary` type, representing synthesized or AI-generated summaries of file chunks.
*   **`../llm/gemini.js`**: The `GeminiProvider` class, used for optional AI-powered summarization and enhancement.

## Examples

While no direct usage examples are provided in the excerpt, a typical workflow would look like this:

```typescript
import { scanRepository } from './scan'; // Assuming scanRepository is exported from scan.ts
import { summarizeChunks } from './summarize'; // Assuming summarizeChunks is exported from summarize.ts
import { writeDocs } from './docs';
import { GeminiProvider } from '../llm/gemini'; // Assuming GeminiProvider is exported from gemini.ts

async function generateProjectDocs(projectPath: string, outputDir: string) {
    const scanResult = await scanRepository(projectPath);
    const fileChunks = // ... logic to get FileChunk objects from scanResult ...
    const chunkSummaries = await summarizeChunks(fileChunks); // Or use AI
    
    // Optional: Initialize AI provider
    const gemini = new GeminiProvider('YOUR_GEMINI_API_KEY');

    const result = await writeDocs({
        projectRoot: projectPath,
        docsDir: outputDir,
        scan: scanResult,
        chunks: fileChunks,
        summaries: chunkSummaries,
        gemini: gemini,
        useGemini: true, // Enable AI enhancement
        fileSynthesisConcurrency: 4 // Limit concurrent file processing
    });

    console.log(`Successfully wrote ${result.written} documentation files.`);
}

// Example usage:
// generateProjectDocs('/path/to/your/project', './docs');
```

## Pitfalls and Considerations

*   **AI Cost and Latency**: Enabling `useGemini` can significantly increase processing time and potentially incur costs, depending on the Gemini API pricing.
*   **Markdown Quality**: The quality of the generated Markdown is heavily dependent on the quality of the input `ChunkSummary` objects. Poor summaries will lead to poor documentation.
*   **Versioning Logic**: The excerpt hints at versioning. The full implementation of how versions are tracked, compared, and utilized for documentation updates is crucial for effective documentation maintenance. If not handled correctly, it could lead to outdated or inconsistent documentation.
*   **Concurrency Management**: The `fileSynthesisConcurrency` parameter is important for performance on large projects. Incorrectly setting this value could lead to resource exhaustion or slow generation times.
*   **Scope of Documentation**: The current implementation focuses on file-level and project overview documentation. Complex inter-file relationships or architectural diagrams might require additional logic not detailed here.
*   **File Type Support**: The documentation generation likely targets specific file types. Handling of binary files, configuration files, or other non-source code assets might be limited.

## Related Files

*   **`src/core/scan.ts`**: Provides the `RepoScan` type and likely the functionality to scan the repository for files and structure.
*   **`src/core/chunk.ts`**: Defines the `FileChunk` type, representing segments of code.
*   **`src/core/summarize.ts`**: Handles the summarization of `FileChunk`s, producing `ChunkSummary` objects, and potentially integrates with AI.
*   **`src/llm/gemini.ts`**: Contains the `GeminiProvider` class, responsible for interacting with the Gemini AI API for content enhancement.

---
Generated: 2025-10-26T03:11:45.879Z  •  Version: v1
