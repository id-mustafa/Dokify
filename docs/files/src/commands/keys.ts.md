---
path: src/commands/keys.ts
chunkCount: 1
entities:
  - registerKeysCommand
  - mask
dependenciesPreview:
  - "import { Command } from 'commander';"
  - import chalk from 'chalk';
  - "import { loadConfig, saveConfig } from '../config.js';"
version: 1
generated_at: "2025-10-26T03:11:33.496Z"
---
# Dokify Keys Management (`src/commands/keys.ts`)

This file defines the command-line interface (CLI) for managing local API keys within the Dokify application. It allows users to configure and view their Anthropic and Google (Gemini) API keys, often referred to as "Bring Your Own Keys" (BYOK).

## Purpose

The primary purpose of this file is to integrate key management functionalities into the Dokify CLI. It provides a dedicated `keys` command with subcommands to:

*   **`set`**: Store Anthropic and Google API keys locally in the Dokify configuration file.
*   **`show`**: Display the status of configured keys, showing masked values for security.
*   **`unset`**: Remove locally stored API keys.

The system prioritizes locally stored keys from the configuration file. If local keys are not found, it falls back to checking environment variables (`ANTHROPIC_API_KEY` and `GOOGLE_API_KEY`).

## Key APIs and Functions

*   **`registerKeysCommand(program: Command)`**: This is the main function exported by this file. It takes a `commander.Command` instance as input and registers the `keys` command and its subcommands (`set`, `show`, `unset`) to it.
*   **`mask(key: string | undefined)`**: Although the implementation is not fully shown in the provided excerpt, this function is crucial for security. It's responsible for masking sensitive API key strings when displaying them. For example, it might replace most of the key's characters with asterisks, revealing only a small portion for identification.

## Commands and Subcommands

### `keys`

This is the root command for managing API keys.

#### `keys set`

**Description**: Sets or updates your local Anthropic and/or Google API keys.

**Inputs**:

*   `--anthropic <KEY>`: The Anthropic API key to store.
*   `--google <KEY>`: The Google (Gemini) API key to store.

**Behavior**:

1.  Loads the current Dokify configuration using `loadConfig()`.
2.  Initializes the `byok` (Bring Your Own Keys) section in the configuration if it doesn't exist.
3.  If an `--anthropic` option is provided, it updates `cfg.byok.anthropic`.
4.  If a `--google` option is provided, it updates `cfg.byok.google`.
5.  Saves the modified configuration back to the config file using `saveConfig(cfg)`.
6.  Logs a success message to the console using `chalk.green`.

#### `keys show`

**Description**: Displays the status of configured API keys, showing masked values.

**Inputs**: None.

**Behavior**:

1.  Loads the current Dokify configuration using `loadConfig()`.
2.  Determines the Anthropic API key by checking `cfg.byok.anthropic` first, and then falling back to `process.env.ANTHROPIC_API_KEY`. This value is then passed to the `mask` function.
3.  Determines the Google API key similarly, checking `cfg.byok.google` and then `process.env.GOOGLE_API_KEY`, and passing it to the `mask` function.
4.  Outputs the masked keys to the console.

#### `keys unset`

**Description**: Removes locally stored API keys.

**Inputs**:

*   `--anthropic`: If present, unsets the local Anthropic API key.
*   `--google`: If present, unsets the local Google API key.

**Behavior**:

1.  Loads the current Dokify configuration.
2.  If `--anthropic` is provided, it deletes the `anthropic` property from `cfg.byok`.
3.  If `--google` is provided, it deletes the `google` property from `cfg.byok`.
4.  Saves the updated configuration.
5.  Logs a success message.

## Invariants

*   When `keys set` is executed, the `cfg.byok` object in the configuration will always be initialized if it wasn't already.
*   The `keys show` command always attempts to retrieve keys from the local configuration first before falling back to environment variables.
*   The `mask` function is used for any API key displayed by `keys show`, ensuring sensitive information is not directly exposed.

## Error Handling

The provided excerpt does not explicitly detail error handling mechanisms within the `keys` commands themselves. However, it relies on:

*   **`commander`**: For parsing command-line arguments and options. Errors related to incorrect command usage or missing arguments would be handled by `commander`.
*   **`loadConfig` and `saveConfig`**: These functions (defined in `../config.js`) are expected to handle potential file system errors (e.g., permission issues, file corruption) during configuration loading or saving. Any errors from these functions would likely propagate up and be displayed to the user.

## Dependencies

This file has the following external dependencies:

*   **`commander`**: A popular Node.js library for building command-line interfaces.
*   **`chalk`**: A library for adding color and styling to terminal output, enhancing readability.
*   **`../config.js`**: This local module is responsible for the persistence of the Dokify configuration. It provides `loadConfig` and `saveConfig` functions.

## Examples

### Setting API Keys

```bash
# Set both Anthropic and Google API keys
dokify keys set --anthropic sk-ant-xxxxxxxxxxxx --google sk-goo-yyyyyyyyyyyy

# Set only the Anthropic API key
dokify keys set --anthropic sk-ant-xxxxxxxxxxxx

# Set only the Google API key
dokify keys set --google sk-goo-yyyyyyyyyyyy
```

### Showing API Key Status

```bash
# Display masked status of all configured keys (local or environment)
dokify keys show
```

Expected output might look like:

```
Anthropic Key: ***xxxxxxxxx
Google Key:    ***yyyyyyyyy
```

### Unsetting API Keys

```bash
# Remove locally stored Anthropic API key
dokify keys unset --anthropic

# Remove locally stored Google API key
dokify keys unset --google

# Remove both locally stored keys
dokify keys unset --anthropic --google
```

## Pitfalls

*   **Accidental Exposure**: While `keys show` masks keys, users should still be cautious about sharing terminal output containing masked keys, as a portion is visible.
*   **Configuration File Location**: The behavior of `loadConfig` and `saveConfig` depends on where Dokify stores its configuration. If the configuration file is in an unexpected location or has restrictive permissions, key management might fail.
*   **Environment Variable Overrides**: If a user has environment variables set for their API keys, and they do not explicitly use `keys set` to override them locally, the `keys show` command will display information derived from those environment variables. This might be confusing if the user expects to see only locally set keys.

## Related Files

*   **`../config.js`**: This file is crucial as it handles the actual loading and saving of the Dokify configuration, including the `byok` section where API keys are stored.
*   **`src/index.ts` (Likely)**: This file would be responsible for setting up the main `commander` program instance and calling `registerKeysCommand` to integrate these key management functionalities into the overall CLI.

---
Generated: 2025-10-26T03:11:38.720Z  •  Version: v1
