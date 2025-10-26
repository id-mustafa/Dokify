---
path: src/core/scan.ts
chunkCount: 1
entities:
  - loadIgnores
  - scanRepository
dependenciesPreview:
  - "import fg from 'fast-glob';"
  - "import path from 'node:path';"
  - "import fs from 'node:fs';"
version: 1
generated_at: "2025-10-26T03:11:38.946Z"
---
# `src/core/scan.ts` - Repository Scanning

This file provides functionality to scan a given repository directory, discover source files, and filter them based on various ignore patterns. It's designed to be efficient and respect common ignore file conventions.

## Purpose

The primary goal of `scan.ts` is to serve as a robust mechanism for identifying relevant files within a software project's directory structure. It aims to:

*   **Discover Source Files**: Locate files that are likely part of the project's source code.
*   **Respect Ignore Patterns**: Adhere to ignore rules defined in `.gitignore` and `.dokignore` files.
*   **Filter Common Artifacts**: Automatically exclude files and directories commonly associated with build outputs, dependencies, or cache, such as `node_modules`, `.git`, `dist`, and `.cache`.
*   **Provide Structured Output**: Return a clear and organized result containing the repository's root path and a list of the discovered files.

## Key APIs and Functions

### `ScanOptions` Type

```typescript
export type ScanOptions = {
    include?: string[];
    exclude?: string[];
};
```

This type defines optional configuration for the scanning process.

*   `include`: An array of glob patterns to explicitly include files.
*   `exclude`: An array of glob patterns to explicitly exclude files.

### `RepoScan` Type

```typescript
export type RepoScan = {
    root: string;
    files: string[];
};
```

This type represents the structured output of a repository scan.

*   `root`: The absolute path to the root of the scanned repository.
*   `files`: An array of relative paths to the discovered and filtered files within the repository.

### `DEFAULT_INCLUDE` and `DEFAULT_EXCLUDE`

These constants define default glob patterns used for inclusion and exclusion.

*   `DEFAULT_INCLUDE`: Initially set to `['**/*']`, meaning all files are considered by default.
*   `DEFAULT_EXCLUDE`: A comprehensive list of patterns for directories and files that are typically not relevant for source code analysis or documentation generation. This includes:
    *   `**/node_modules/**`
    *   `**/.git/**`
    *   `**/.next/**`
    *   `**/dist/**`
    *   `**/build/**`
    *   `**/.cache/**`
    *   `**/.turbo/**`
    *   `**/.venv/**`
    *   `**/.dokify/**`
    *   `**/docs/**` (Note: This might be counter-intuitive for a documentation tool, but it's often excluded to avoid scanning generated documentation itself.)
    *   `**/*.min.*`
    *   `**/*.map`

### `loadIgnores(root: string): string[]`

This function reads ignore patterns from `.gitignore` and `.dokignore` files located at the specified `root` directory.

*   **Purpose**: To parse and consolidate ignore rules from standard ignore files.
*   **Inputs**:
    *   `root`: The string path to the repository directory.
*   **Outputs**:
    *   An array of string glob patterns derived from the ignore files. Lines starting with `#` (comments) and empty lines are ignored. Directory patterns ending with `/` are converted to `directory/**`.
*   **Dependencies**:
    *   `path.join`: For constructing file paths.
    *   `fs.existsSync`: To check if ignore files exist.
    *   `fs.readFileSync`: To read the content of ignore files.

### `scanRepository(root: string, options: ScanOptions = {}): Promise<RepoScan>`

This is the main function that orchestrates the repository scanning process.

*   **Purpose**: To perform a comprehensive scan of a repository, apply ignore rules, and return a structured list of files.
*   **Inputs**:
    *   `root`: The string path to the repository directory to scan.
    *   `options`: An optional `ScanOptions` object to customize include/exclude patterns.
*   **Outputs**:
    *   A `Promise` that resolves to a `RepoScan` object containing the repository root and a list of discovered files.
*   **Dependencies**:
    *   `fast-glob` (`fg`): Used for efficient glob pattern matching to find files.
    *   `loadIgnores`: To fetch ignore patterns from `.gitignore` and `.dokignore`.
*   **Process**:
    1.  Calls `loadIgnores` to get ignore patterns from the repository.
    2.  Combines the default exclude patterns with user-provided `options.exclude` and patterns from ignore files.
    3.  Combines the default include pattern with user-provided `options.include`.
    4.  Uses `fast-glob` to find all files matching the include patterns and not matching the exclude patterns.
    5.  Returns the `root` and the resulting `files` array.

## Inputs and Outputs

The primary input is the `root` directory path. The `ScanOptions` object allows for further customization. The output is a `RepoScan` object.

## Invariants

*   The `root` path provided to `scanRepository` is expected to be a valid directory.
*   Ignore patterns are processed and converted into a format compatible with `fast-glob`.
*   The returned `files` are relative to the `root` directory.

## Error Handling

While not explicitly detailed in the provided excerpts, potential error conditions might include:

*   **Invalid `root` path**: If the provided `root` is not a valid directory or is inaccessible.
*   **Permission errors**: If the scanner lacks read permissions for files or directories.
*   **Malformed ignore files**: Although `loadIgnores` attempts to handle basic formatting, severely malformed files could lead to unexpected behavior.

The `scanRepository` function returns a `Promise`, so asynchronous error handling (e.g., using `try...catch` blocks when calling `scanRepository`) is recommended.

## Dependencies

The core functionality relies on:

*   **`fast-glob`**: For efficient and powerful file path matching using glob patterns.
*   **`node:path`**: For path manipulation (e.g., joining paths).
*   **`node:fs`**: For file system operations (reading ignore files).

## Examples

```typescript
import { scanRepository, ScanOptions, RepoScan } from './scan';
import path from 'node:path';

async function main() {
    const repoRoot = path.resolve('./my-project'); // Replace with your project path

    // Basic scan
    try {
        const scanResult: RepoScan = await scanRepository(repoRoot);
        console.log('Discovered files:', scanResult.files);
        console.log('Repository root:', scanResult.root);
    } catch (error) {
        console.error('Error during repository scan:', error);
    }

    // Scan with custom options
    const customOptions: ScanOptions = {
        include: ['src/**/*.ts', 'tests/**/*.spec.ts'],
        exclude: ['**/__tests__/**']
    };

    try {
        const customScanResult: RepoScan = await scanRepository(repoRoot, customOptions);
        console.log('Discovered files (custom options):', customScanResult.files);
    } catch (error) {
        console.error('Error during custom repository scan:', error);
    }
}

main();
```

## Pitfalls

*   **Conflicting Ignore Rules**: Be mindful of how rules in `.gitignore` and `.dokignore` might interact, and how custom `options.include` and `options.exclude` can override or add to these. `fast-glob` generally handles these in a predictable order.
*   **Inclusion of Generated Docs**: The default exclusion of `**/docs/**` is deliberate to prevent scanning output documentation. If you intend to scan documentation source files (e.g., `.md` files in a `docs` directory), you might need to adjust the `exclude` patterns.
*   **Absolute vs. Relative Paths**: The `files` array in `RepoScan` contains paths relative to the `root`. Ensure you handle path resolution correctly if you need to work with absolute paths.
*   **Performance with Large Repositories**: While `fast-glob` is efficient, scanning extremely large repositories might still take considerable time.

## Related Files

*   **`src/core/index.ts`**: Likely exports the `scanRepository` function, making it accessible to other parts of the application.
*   **`.gitignore` and `.dokignore`**: These are crucial external files that directly influence the output of the scanner.
*   **`fast-glob` package**: The external dependency responsible for the core glob matching logic.

---
Generated: 2025-10-26T03:11:45.260Z  •  Version: v1
