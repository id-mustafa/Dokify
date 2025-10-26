---
path: src/core/chunk.ts
chunkCount: 1
entities:
  - chunkFiles
  - shouldSkip
dependenciesPreview:
  - "import fs from 'node:fs';"
  - "import path from 'node:path';"
  - "import { RepoScan } from './scan.js';"
version: 1
generated_at: "2025-10-26T03:11:37.396Z"
---
# `chunk.ts` - File Chunking for Repository Analysis

This file provides functionality to divide source files from a repository scan into smaller, manageable "chunks". These chunks are designed to preserve context across file boundaries by including overlapping lines. This is particularly useful for processing large files with language models or other tools that have context window limitations.

## Purpose

The primary purpose of `chunk.ts` is to take a collection of files identified by a `RepoScan` and segment them into `FileChunk` objects. This process involves:

1.  **Filtering:** Files are filtered based on their extension and size to exclude irrelevant or excessively large files that might strain processing capabilities.
2.  **Segmentation:** Remaining files are split into chunks, where each chunk aims to contain a maximum of `MAX_LINES` (300 lines).
3.  **Overlap:** To ensure continuity and context between adjacent chunks of the same file, an `OVERLAP_LINES` (20 lines) region is maintained. This means the end of one chunk will overlap with the beginning of the next.

This approach allows for a more granular analysis of codebases without losing the flow of logic that might span across chunk boundaries.

## Key APIs and Functions

### `FileChunk` Type

This type defines the structure of a single chunk of a file:

```typescript
export type FileChunk = {
    filePath: string;     // The absolute path to the original file.
    index: number;        // The zero-based index of this chunk within its originating file.
    total: number;        // The total number of chunks for this originating file.
    startLine: number;    // The 1-based starting line number of this chunk in the original file.
    endLine: number;      // The 1-based ending line number of this chunk in the original file.
    content: string;      // The actual text content of this chunk.
};
```

### `chunkFiles(scan: RepoScan): Promise<FileChunk[]>`

This is the main function for generating file chunks.

*   **Purpose:** Iterates through files found in a `RepoScan`, filters them, and segments them into `FileChunk` objects.
*   **Inputs:**
    *   `scan: RepoScan`: An object representing the results of a repository scan, containing a list of file paths.
*   **Outputs:**
    *   `Promise<FileChunk[]>`: A promise that resolves to an array of `FileChunk` objects, representing all the processed chunks from the scanned files.
*   **Internal Logic:**
    *   It iterates over `scan.files`.
    *   For each file, it determines the file extension and checks if it should be skipped using `shouldSkip`.
    *   If the file is not skipped, its content is read.
    *   The content is split into lines.
    *   Files with 0 lines are skipped.
    *   Files with `MAX_LINES` or fewer lines are treated as a single chunk.
    *   For larger files, a `while` loop iterates to create multiple chunks, calculating `start` and `end` line indices for each.
    *   The `Math.min` function ensures that the `end` line does not exceed the total number of lines in the file.
    *   The `lines.slice(start, end)` extracts the content for the current chunk.
    *   A `FileChunk` object is created and added to the `chunks` array.

### `shouldSkip(ext: string, filePath: string): boolean`

This is an internal helper function (likely defined elsewhere or implicitly handled within `chunkFiles`) used to determine if a file should be processed.

*   **Purpose:** Filters out files based on their extension and potentially other criteria (though the excerpt only shows extension handling).
*   **Inputs:**
    *   `ext: string`: The lowercase file extension (e.g., `.js`, `.ts`).
    *   `filePath: string`: The path to the file.
*   **Outputs:**
    *   `boolean`: `true` if the file should be skipped, `false` otherwise.
*   **Note:** The excerpt only hints at this function. A full implementation would detail the specific extensions and criteria used for skipping.

## Invariants

*   `MAX_LINES` is a constant defining the maximum number of lines a single chunk can contain (300).
*   `OVERLAP_LINES` is a constant defining the number of lines that should overlap between consecutive chunks of the same file (20).
*   `startLine` and `endLine` in `FileChunk` are 1-based line numbers.
*   The `index` of a chunk is 0-based relative to its originating file.
*   The `total` number of chunks for a file indicates how many segments it was divided into.

## Error Handling

The provided excerpt does not explicitly show detailed error handling. However, potential points of failure include:

*   **File Reading:** `fs.readFileSync` could throw an error if the file is not accessible, does not exist, or if there are permission issues. In a production environment, this would ideally be wrapped in a `try...catch` block.
*   **Large Files:** While the chunking mechanism handles large files by splitting them, extremely large files might still cause memory issues during reading or processing.

## Dependencies

*   `node:fs`: Used for reading file content (`fs.readFileSync`).
*   `node:path`: Used for extracting file extensions (`path.extname`).
*   `./scan.js`: Imports the `RepoScan` type, which is the input to `chunkFiles`.

## Examples

Consider a file named `example.js` with 500 lines.

1.  **First Chunk:**
    *   `filePath`: `/path/to/repository/example.js`
    *   `index`: 0
    *   `total`: Will be calculated based on how many chunks are needed.
    *   `startLine`: 1
    *   `endLine`: 300
    *   `content`: Lines 1 through 300 of `example.js`.

2.  **Second Chunk:**
    *   `filePath`: `/path/to/repository/example.js`
    *   `index`: 1
    *   `total`: Will be calculated.
    *   `startLine`: 281 (300 - 20 + 1, accounting for overlap)
    *   `endLine`: 500 (or `300 + MAX_LINES` if the file were longer)
    *   `content`: Lines 281 through 500 of `example.js`.

This ensures that lines 281-300 from the first chunk are also present at the beginning of the second chunk, preserving context.

## Pitfalls

*   **Line Endings:** The code uses `content.split(/\r?\n/)` to handle both Windows (`\r\n`) and Unix (`\n`) line endings. However, inconsistent line endings within a file could still lead to unexpected behavior if not normalized prior to this step.
*   **Binary Files:** The function reads files as UTF-8 strings. Attempting to chunk binary files (images, executables, etc.) will result in garbled or incorrect content. Proper filtering in `shouldSkip` is crucial.
*   **Performance with Many Small Files:** If a repository contains an extremely large number of very small files, the overhead of creating and managing many `FileChunk` objects might become a performance consideration.
*   **AST Awareness:** The comment `// Simple line-based chunking with overlap; AST-aware can come later.` highlights a significant limitation. This chunking method is unaware of code structure (functions, classes, blocks). Chunks might cut off code mid-statement or mid-definition, making them less useful for certain types of static analysis that rely on complete syntactic units.

## Related Files

*   `./scan.js`: This file defines the `RepoScan` type and likely contains the logic for performing the initial scan of the repository to identify files. The output of `scan.js` is the input for `chunk.ts`.

---
Generated: 2025-10-26T03:11:43.720Z  •  Version: v1
