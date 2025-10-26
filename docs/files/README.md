---
path: README.md
chunkCount: 1
entities:
dependenciesPreview:
version: 1
generated_at: "2025-10-26T03:11:26.597Z"
---
# Dokify CLI Documentation

This document provides comprehensive technical documentation for the Dokify CLI, a command-line interface tool designed to automate the generation and uploading of documentation from your codebases.

## Purpose

The Dokify CLI streamlines the documentation workflow by enabling users to easily generate documentation from their source code and upload it to a central repository. It supports various authentication methods, provides clear instructions for installation and usage, and details the configuration and output of the documentation generation process.

## Installation

To install the Dokify CLI, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Build the Project:**
    ```bash
    npm run build
    ```

## Usage

The Dokify CLI offers several functionalities, including authentication and documentation generation.

### Authentication

Dokify CLI supports two primary methods for authentication:

1.  **Device Flow Login:**
    This interactive method opens your web browser to complete the login process and securely stores your authentication token.

    ```bash
    dok login
    ```

2.  **API Keys:**
    Alternatively, you can generate an API key from the Dokify web application (Account -> API Keys) and use it to authenticate the CLI.

    ```bash
    dok keys set --api-key=YOUR_GENERATED_KEY
    ```
    This command stores your API key for future use.

### Configuring the API Base URL

The Dokify CLI allows you to specify a custom API base URL for the dev server. This configuration can be persistent or overridden using environment variables.

*   **Persistent Configuration:** Once set using the `--api` flag during `dok login`, this URL will be used for subsequent `dok login` commands.

    ```bash
    dok login --api http://127.0.0.1:4000
    ```

*   **Environment Variable Override:** For CI/CD environments or specific sessions, you can set the `DOKIFY_API_BASE` environment variable.

    ```bash
    export DOKIFY_API_BASE=http://127.0.0.1:4000
    dok login
    ```

### Documentation Generation

The primary function of the CLI is to generate documentation from your codebase.

*   **Local Generation (No Upload):** To generate documentation locally without any external calls or uploads, use the `--local-only` flag.

    ```bash
    node dist/cli.js generate --local-only
    ```

## Output of Documentation Generation

When documentation is generated, the CLI creates a `docs/` directory containing the following:

*   `files/`: Markdown files, each representing a file from your codebase.
*   `overview/overview.md`: An overview of the project.
*   `index.html`: A simple HTML viewer for the generated documentation.
*   `graph.json`: A JSON file containing nodes and edges representing the project's structure.

## Configuration

The Dokify CLI's configuration is stored in `~/.dokify/config.json` by default. If this file is not accessible or permitted, it falls back to a local `.dokify/` folder.

## Invariants

*   Upon successful `dok login`, an authentication token is stored for subsequent API interactions.
*   The `docs/` directory is created or updated during the `generate` command.

## Error Handling

While specific error handling details are not explicitly detailed in the provided excerpts, common error scenarios would likely include:

*   **Authentication failures:** Invalid API keys or issues during the device flow.
*   **Network errors:** Problems connecting to the Dokify API.
*   **File system errors:** Issues with reading source code or writing output files.

Users should expect informative error messages to guide them in resolving issues.

## Dependencies

The primary dependencies for the Dokify CLI, as indicated by the installation steps, are managed by npm. Specific runtime dependencies are not detailed in the provided excerpts.

## Examples

*   **Basic Login:**
    ```bash
    dok login
    ```
*   **Login with a specific API base URL:**
    ```bash
    dok login --api http://127.0.0.1:4000
    ```
*   **Setting an API key:**
    ```bash
    dok keys set --api-key=my_secret_api_key_12345
    ```
*   **Generating documentation locally:**
    ```bash
    node dist/cli.js generate --local-only
    ```

## Pitfalls

*   **Stubbed Upload:** The current implementation of the upload functionality is stubbed. It logs the intent to upload but does not perform the actual upload unless further development is integrated.
*   **Configuration Location:** Be aware of where your configuration is being stored (`~/.dokify/config.json` or `.dokify/`) as this can affect persistence and sharing.

## Related Files

*   `README.md`: This file itself, providing essential documentation.
*   `dist/cli.js`: The main entry point for the CLI application.
*   `~/.dokify/config.json` or `.dokify/`: Configuration files for the CLI.

---
Generated: 2025-10-26T03:11:30.657Z  •  Version: v1
