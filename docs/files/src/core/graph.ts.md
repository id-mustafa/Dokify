---
path: src/core/graph.ts
chunkCount: 1
entities:
  - buildGraph
  - writeViewer
  - htmlViewer
  - init
dependenciesPreview:
  - "import fs from 'node:fs';"
  - "import path from 'node:path';"
  - "import { RepoScan } from './scan.js';"
version: 1
generated_at: "2025-10-26T03:11:38.721Z"
---
# `src/core/graph.ts`

This file is responsible for building a dependency graph from a repository scan and generating an interactive HTML viewer for documentation.

## Purpose

The primary goal of this module is to create a visual representation of the file structure and their dependencies within a project. This graph is then used to power an interactive HTML documentation viewer, allowing users to easily navigate and understand the relationships between different parts of the codebase.

## Key APIs / Classes / Functions

### `Graph` Type

This type defines the structure of the dependency graph. It consists of:

*   `nodes`: An array of objects, where each object represents a file in the repository. Each node has an `id` property, which is the relative path of the file from the repository root.
*   `edges`: An array of objects, where each object represents a dependency between two files. Each edge has `source` and `target` properties, indicating the file initiating the dependency and the file being depended upon, respectively.

### `buildGraph(scan: RepoScan): Promise<Graph>`

This asynchronous function takes a `RepoScan` object as input and constructs a `Graph` object.

*   **Inputs**:
    *   `scan`: A `RepoScan` object, which is assumed to contain information about the files in the repository.
*   **Outputs**:
    *   A `Promise` that resolves to a `Graph` object.
*   **Behavior**:
    *   It extracts the file paths from the `scan.files` array.
    *   For each file, it creates a node with its `id` set to the file's path relative to the repository root (`scan.root`).
    *   **Currently, the `edges` array is always empty in the Minimum Viable Product (MVP) phase.** This is because parsing imports across different programming languages to establish actual dependencies is a complex task not yet implemented.

### `writeViewer(params: { docsDir: string; graph: Graph }): Promise<void>`

This asynchronous function generates and writes the necessary files for the interactive HTML viewer.

*   **Inputs**:
    *   `params`: An object containing:
        *   `docsDir`: The directory where the documentation files (including the viewer) should be written.
        *   `graph`: The `Graph` object to be used by the viewer.
*   **Outputs**:
    *   A `Promise` that resolves when the viewer files have been successfully written.
*   **Behavior**:
    *   It defines the paths for the `index.html` and `graph.json` files within the specified `docsDir`.
    *   It serializes the provided `graph` object into a JSON string and writes it to `graph.json`.
    *   It generates the HTML content for the viewer by calling the `htmlViewer()` function and writes it to `index.html`.

### `htmlViewer(): string`

This function generates the static HTML content for the interactive documentation viewer.

*   **Outputs**:
    *   A `string` containing the complete HTML markup for the viewer.
*   **Behavior**:
    *   It constructs a basic HTML5 document structure.
    *   Includes essential meta tags for character set and viewport configuration.
    *   Sets the title of the document to "Dokify Docs".
    *   Includes inline CSS for basic styling of the page, setting a system-UI font and using flexbox for layout. The CSS is truncated in the provided excerpt.
    *   **The actual interactive elements, sidebar for file listings, and iframe for content viewing are not fully described in the provided excerpt but are implied by the `purpose` and the name of the function.**

### `init()` (Implied by entities but not in excerpt)

While not explicitly shown in the provided excerpts, the presence of `init` in the entities suggests a function responsible for initializing or setting up the graph building and viewer generation process.

## Inputs and Outputs Summary

*   **Primary Input**: `RepoScan` object (for `buildGraph`).
*   **Primary Output**: `Graph` object (from `buildGraph`), HTML viewer files (`index.html`, `graph.json`) (from `writeViewer`).

## Invariants

*   The `id` of each node in the `Graph` represents a file path relative to the repository's root directory.
*   In the MVP, the `edges` array in the `Graph` will always be empty.

## Error Handling

Error handling is not explicitly detailed in the provided excerpts. However, typical errors could arise from:

*   File system operations (e.g., writing to `docsDir` if permissions are insufficient or the directory doesn't exist).
*   Issues with the input `RepoScan` object if it's malformed or incomplete.

## Dependencies

*   `node:fs`: Used for file system operations, specifically writing files (`fs.writeFileSync`).
*   `node:path`: Used for path manipulation, such as joining directory and file names (`path.join`) and getting relative paths (`path.relative`).
*   `./scan.js`: Imports the `RepoScan` type, which is a crucial input for `buildGraph`.

## Examples

While no direct code examples are provided, a typical workflow would involve:

1.  **Scanning the repository**: Obtain a `RepoScan` object.
2.  **Building the graph**: Call `buildGraph(repoScan)` to get the `Graph` data.
3.  **Writing the viewer**: Call `writeViewer({ docsDir: './docs', graph: myGraph })` to generate the HTML documentation.

## Pitfalls

*   **MVP Dependency Limitation**: The lack of actual dependency edges in the MVP means the generated graph will not visually represent code dependencies. This is a significant limitation for understanding code relationships.
*   **HTML Viewer Interactivity**: The provided HTML structure for `htmlViewer` is basic. The actual implementation of the interactive sidebar and iframe functionality would require additional JavaScript code, which is not included in these excerpts.

## Related Files

*   `src/core/scan.ts`: This file is essential as it defines the `RepoScan` type, which is the primary input for building the dependency graph. The process of scanning the repository to generate this `RepoScan` object would likely happen in a related module.

---
Generated: 2025-10-26T03:11:43.949Z  •  Version: v1
