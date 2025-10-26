---
path: src/core/upload.ts
chunkCount: 1
entities:
  - uploadDocs
  - listJson
  - created
  - walk
dependenciesPreview:
  - "import path from 'node:path';"
  - "import fs from 'node:fs';"
  - "import { loadConfig } from '../config.js';"
version: 1
generated_at: "2025-10-26T03:11:41.214Z"
---
# `src/core/upload.ts` - Documentation Upload Module

This module handles the process of uploading documentation files from a local directory to a remote API-based project management service. It automates the creation of projects on the service if they don't exist, and then uploads all files found within the specified documentation directory.

## Purpose

The primary goal of this module is to streamline the deployment of documentation. It abstracts away the complexities of:

1.  **Authentication**: Using a Bearer token to secure API interactions.
2.  **Project Management**: Ensuring the target project exists on the remote service, creating it if necessary.
3.  **File Discovery**: Recursively finding all relevant documentation files within a specified local directory.
4.  **API Interaction**: Sending collected files to the remote API for storage and management.

## Key APIs and Functions

### `uploadDocs(params: { docsDir: string }): Promise<void>`

This is the main entry point for initiating the documentation upload process.

*   **Purpose**: Orchestrates the entire upload workflow, from configuration loading to file sending.
*   **Inputs**:
    *   `params.docsDir`: A string representing the path to the local directory containing the documentation files to be uploaded. This path is relative to the current working directory.
*   **Outputs**:
    *   A `Promise<void>` that resolves when the upload process is complete or if it's skipped due to missing configuration. It throws an error if any critical step fails.
*   **Internal Logic**:
    1.  Loads configuration using `loadConfig()`.
    2.  Checks for the presence of `apiBaseUrl` and `token` in the configuration. If either is missing, it logs a message and exits gracefully.
    3.  Constructs the project slug based on the current working directory's name.
    4.  **Project Existence Check/Creation**:
        *   It fetches a list of existing projects from the API.
        *   It attempts to find a project matching the generated slug.
        *   If no matching project is found, it initiates a project creation request.
    5.  **File Collection**: It recursively walks through the `docsDir` using an internal `walk` mechanism (details not fully shown in excerpts, but implied).
    6.  **File Upload**: For each discovered file, it reads its content and prepares it for upload. The exact upload mechanism for individual files is not detailed in the provided excerpts but is implied to be part of the overall workflow.

## Invariants

*   **Configuration**: The `loadConfig()` function is expected to provide valid `apiBaseUrl` and `token` for the upload to proceed.
*   **Project Slug**: The generated project slug is derived from the current working directory's name, ensuring a predictable mapping between local projects and remote projects.
*   **File Content**: Documentation files are expected to be readable string content.

## Error Handling

The `uploadDocs` function includes basic error handling:

*   **Missing Configuration**: If `apiBaseUrl` or `token` are not found in the configuration, the upload is skipped with a console message.
*   **API Request Failures**: Errors during API calls (e.g., listing projects, creating projects) are caught and re-thrown as `Error` objects with descriptive messages indicating the failed operation and the HTTP status code.

## Dependencies

This module has the following dependencies:

*   `node:path`: For path manipulation, specifically `path.basename`.
*   `node:fs`: For file system operations, implied by the need to read file content and potentially walk directories.
*   `../config.js`: A local module responsible for loading application configuration.

## Examples

While a full runnable example is not provided in the excerpts, the intended usage would look something like this:

```typescript
// Assuming you have a .env or config.json file with apiBaseUrl and token
// and a 'docs' directory in your project root.

import { uploadDocs } from './src/core/upload.js';

async function runUpload() {
  try {
    await uploadDocs({ docsDir: 'docs' });
    console.log('Documentation uploaded successfully!');
  } catch (error) {
    console.error('Error uploading documentation:', error);
  }
}

runUpload();
```

## Pitfalls

*   **Missing `apiBaseUrl` or `token`**: The upload will silently be skipped if these crucial configuration values are not set, which might lead to an incorrect assumption that the upload succeeded.
*   **Project Name Conflicts**: If multiple local projects share the same base name (and thus the same generated slug), the system might attempt to create a project that already exists or target the wrong project. The slug generation logic attempts to mitigate this with lowercasing and hyphenation, but unique project names are still advisable.
*   **File Encoding**: The current excerpts do not specify the file encoding used when reading file content. If documentation files use non-standard encodings, this could lead to corrupted uploads.
*   **Network Issues**: As with any network-dependent operation, network connectivity problems or API downtime can cause the upload to fail. The error handling provides basic feedback for these scenarios.

## Related Files

*   `../config.js`: This file is a direct dependency and is responsible for providing the necessary API credentials and base URL. The `loadConfig` function within it is essential for `uploadDocs` to operate.

---
Generated: 2025-10-26T03:11:45.842Z  •  Version: v1
