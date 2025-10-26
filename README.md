---
path: README.md
chunkCount: 1
entities:
dependenciesPreview:
version: 6
generated_at: "2025-10-26T04:40:11.579Z"
---
# Dokify CLI

This document provides technical documentation for the Dokify CLI tool, designed to automate the generation and uploading of documentation for your codebase.

## Purpose

The primary purpose of the Dokify CLI is to streamline the process of creating and distributing technical documentation. It achieves this by:

1.  **Generating Documentation:** Analyzing your codebase to produce markdown files for individual source files, an overview document, and a visual representation of your project's structure.
2.  **Facilitating Upload (Future):** While currently stubbed, the CLI is designed to facilitate uploading generated documentation to a central service.

## Installation

To install and build the Dokify CLI, follow these steps:

```bash
npm install
npm run build
```

## Usage

The Dokify CLI offers several commands for interacting with the service and generating documentation.

### Authentication

You can authenticate with the Dokify service in two primary ways:

1.  **Device Flow Login:** This is the interactive method, which opens your web browser to complete the authentication process and securely stores the resulting token locally.

    ```bash
    dok login
    ```

2.  **API Keys:** Alternatively, you can register or log in via the web application and then retrieve API keys from your account. These keys can be set directly in the CLI.

    ```bash
    dok keys set --api-key=YOUR_GENERATED_KEY
    ```

### Configuring the API Base URL

The CLI allows for persistence of the developer server's base URL and provides a mechanism for overriding it via environment variables.

*   **Persistent Configuration:** Once set using the `--api` flag, future `dok login` commands will automatically use this URL.

    ```bash
    dok login --api http://127.0.0.1:4000
    ```

*   **Environment Variable Override:** For CI environments or persistent sessions, you can set the `DOKIFY_API_BASE` environment variable.

    ```bash
    export DOKIFY_API_BASE=http://127.0.0.1:4000
    dok login
    ```

### Generating Documentation

The CLI can generate documentation locally without making external calls or uploading the results. This is useful for previewing or for use in isolated environments.

```bash
node dist/cli.js generate --local-only
```

### Generated Output

When documentation is generated (and before upload), the CLI creates a `docs/` folder containing:

*   `files/`: Markdown files, where each file corresponds to a source file in your project.
*   `overview/overview.md`: A markdown file providing a high-level summary of the project.
*   `index.html`: A simple HTML viewer to browse the generated documentation.
*   `graph.json`: A JSON file containing the nodes and edges representing the project's structure, likely for visualization purposes.

## Configuration Storage

The Dokify CLI stores its configuration in `~/.dokify/config.json` when user permissions allow. As a fallback, it will use a local `.dokify/` folder if the global configuration is not accessible.

## Upload Functionality

**Note:** The upload functionality is currently stubbed. It will log the intent to upload unless the `apiBas` (likely `apiBase` or similar) is explicitly configured or set. This means that for now, uploads will not actually occur.

## Dependencies

The Dokify CLI relies on `npm` for package management and build processes. Specific runtime dependencies are managed through `npm install`.

## Pitfalls and Considerations

*   **Stubbed Upload:** Be aware that the upload feature is not yet implemented and will only log the intention to upload.
*   **Configuration Location:** Understand where your configuration is being stored (global `~/.dokify/config.json` vs. local `.dokify/`).
*   **API Key Security:** Handle your API keys with care, as they grant access to your Dokify account.

## Related Files

*   **`package.json`:** (Implicitly, as it's an `npm` project) This file would define project metadata, scripts, and dependencies.
*   **`src/cli.js`:** (Implied by `node dist/cli.js`) This is likely the entry point for the CLI application, containing the core logic for commands like `login`, `keys`, and `generate`.
*   **`~/.dokify/config.json` or `.dokify/`:** These directories/files store the CLI's persistent configuration.

---
Generated: 2025-10-26T04:40:15.401Z  •  Version: v6
