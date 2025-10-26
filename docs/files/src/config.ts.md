---
path: src/config.ts
chunkCount: 1
entities:
  - computeConfigDir
  - ensureConfigDir
  - loadConfig
  - saveConfig
  - getConfigPath
dependenciesPreview:
  - "import fs from 'node:fs';"
  - "import path from 'node:path';"
  - "import os from 'node:os';"
version: 1
generated_at: "2025-10-26T03:11:36.274Z"
---
# Dokify Configuration Management (`src/config.ts`)

This file provides robust mechanisms for managing the configuration of the Dokify application. It handles API credentials, default AI model selections, concurrency limits, and Bring Your Own Key (BYOK) API keys. The module offers utilities to load, save, and reliably locate configuration files, employing fallback strategies to determine the configuration directory.

## Purpose

The primary purpose of `src/config.ts` is to centralize and standardize how Dokify accesses and persists its settings. This includes:

*   **API Credentials:** Storing API base URLs and authentication tokens.
*   **Default AI Models:** Specifying preferred models for tasks like "haiku" and "gemini".
*   **Concurrency Control:** Defining the maximum number of concurrent operations.
*   **BYOK (Bring Your Own Key):** Managing user-provided API keys for services like Anthropic and Google.
*   **Configuration File Management:** Providing functions to locate, create, load, and save the configuration file.

## Key APIs and Functions

### `DokifyConfig` Type

This type defines the structure of the Dokify configuration object.

```typescript
export type DokifyConfig = {
    apiBaseUrl: string | null; // The base URL for API requests.
    token: string | null;        // Authentication token for API access.
    defaultModels: {
        haiku: string;           // Default AI model for haiku generation.
        gemini: string;          // Default AI model for Gemini-related tasks.
    };
    concurrency: number;         // Maximum number of concurrent operations.
    localOnly: boolean;          // Flag to indicate if operations should be restricted to local execution.
    byok?: {                     // Optional object for BYOK API keys.
        anthropic?: string | null; // User-provided Anthropic API key.
        google?: string | null;    // User-provided Google API key.
    };
};
```

### `computeConfigDir()`

This function determines the appropriate directory for storing the Dokify configuration. It follows a layered fallback strategy:

1.  **Environment Variable:** Checks if the `DOKIFY_CONFIG_DIR` environment variable is set. If so, it uses that directory.
2.  **Home Directory:** If the environment variable is not set, it attempts to use a `.dokify` subdirectory within the user's home directory (`~/.dokify`). It verifies write access by attempting to create and then remove a probe file.
3.  **Current Working Directory:** As a final fallback, it looks for a `.dokify` subdirectory in the current working directory (`process.cwd()/.dokify`).
4.  **Root of Current Directory:** If all previous attempts fail (e.g., due to permission issues), it defaults to the current working directory itself.

### `ensureConfigDir()`

This function ensures that the configuration directory (determined by `computeConfigDir()`) exists. If it doesn't, it creates the directory recursively.

### `loadConfig()`

This function reads the Dokify configuration from the `config.json` file. It uses the `CONFIG_PATH` (derived from `CONFIG_DIR`) to locate the file. If the file does not exist, it returns a default configuration object.

### `saveConfig(config: DokifyConfig)`

This function writes the provided `DokifyConfig` object to the `config.json` file. It ensures the configuration directory exists before attempting to save the file.

### `getConfigPath()`

This function returns the absolute path to the Dokify configuration file (`config.json`).

## Inputs and Outputs

*   **`computeConfigDir()`**:
    *   **Inputs**: None (relies on environment variables and OS information).
    *   **Outputs**: A `string` representing the absolute path to the configuration directory.
*   **`ensureConfigDir()`**:
    *   **Inputs**: None (operates on the globally determined `CONFIG_DIR`).
    *   **Outputs**: None. Creates the directory if it doesn't exist.
*   **`loadConfig()`**:
    *   **Inputs**: None.
    *   **Outputs**: A `DokifyConfig` object. Returns a default configuration if the file is not found.
*   **`saveConfig(config: DokifyConfig)`**:
    *   **Inputs**: A `DokifyConfig` object to be saved.
    *   **Outputs**: None. Writes the configuration to `config.json`.
*   **`getConfigPath()`**:
    *   **Inputs**: None.
    *   **Outputs**: A `string` representing the absolute path to the `config.json` file.

## Invariants

*   The `CONFIG_DIR` is determined once and used consistently throughout the application's runtime.
*   The configuration file is always named `config.json`.
*   If `loadConfig` is called and `config.json` does not exist, a predefined default configuration will be returned.
*   `saveConfig` will always attempt to create the configuration directory if it's missing.

## Error Handling

*   **`computeConfigDir()`**: Includes `try...catch` blocks to gracefully handle potential errors during directory creation or write access probing. It falls back to less privileged locations if errors occur.
*   **`loadConfig()`**: The `fs.existsSync` check and the initial `fs.readFileSync` within a `try...catch` block handle cases where the configuration file might be missing or unreadable.
*   **`saveConfig()`**: Relies on `fs.mkdirSync` and `fs.writeFileSync`. Errors during these operations (e.g., permission denied) would likely throw exceptions that the caller would need to handle.

## Dependencies

The module relies on Node.js built-in modules:

*   `node:fs`: For file system operations (reading, writing, creating directories, checking existence).
*   `node:path`: For path manipulation (joining directory names, creating absolute paths).
*   `node:os`: For operating system-specific information, particularly `os.homedir()`.

## Examples

### Loading Configuration

```typescript
import { loadConfig, DokifyConfig } from './config';

const config: DokifyConfig = loadConfig();
console.log('Loaded configuration:', config);
console.log('Default haiku model:', config.defaultModels.haiku);
```

### Saving Configuration

```typescript
import { saveConfig, DokifyConfig } from './config';

const newConfig: DokifyConfig = {
    apiBaseUrl: 'https://api.example.com',
    token: 'my-secret-token',
    defaultModels: {
        haiku: 'claude-3-haiku-20240307',
        gemini: 'gemini-1.5-pro-latest',
    },
    concurrency: 5,
    localOnly: false,
    byok: {
        anthropic: 'sk-ant-xyz',
    }
};

saveConfig(newConfig);
console.log('Configuration saved successfully.');
```

### Getting Configuration Path

```typescript
import { getConfigPath } from './config';

const configFilePath = getConfigPath();
console.log('Dokify configuration will be stored at:', configFilePath);
```

## Pitfalls

*   **Permissions:** If the application lacks write permissions in the user's home directory or the current working directory, `computeConfigDir` will fall back to less ideal locations, potentially causing issues or unexpected behavior.
*   **Conflicting Configurations:** If multiple processes or users are running Dokify and attempting to write to the same configuration directory (e.g., when `DOKIFY_CONFIG_DIR` is not set and the fallback lands on the same path), race conditions or data corruption could occur.
*   **Missing `config.json`:** If `saveConfig` has not been called before `loadConfig` in an environment where the configuration file is expected, the application will operate with default settings, which might not be desired.
*   **Environment Variable Overrides:** Developers should be aware that setting `DOKIFY_CONFIG_DIR` can significantly alter where the configuration is read from and written to, potentially bypassing intended default locations.

## Related Files

*   **`src/index.ts` (or main application entry point):** This file would likely import and use functions from `src/config.ts` to load the initial configuration upon application startup.
*   **`src/api.ts` (or other service modules):** These modules would consume the loaded configuration, using values like `apiBaseUrl`, `token`, and `byok` keys for their operations.
*   **CLI commands (if applicable):** Command-line interfaces for Dokify might include commands to initialize, view, or modify the configuration, interacting with the `loadConfig` and `saveConfig` functions.

---
Generated: 2025-10-26T03:11:42.468Z  •  Version: v1
