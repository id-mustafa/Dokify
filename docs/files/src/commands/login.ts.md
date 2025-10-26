---
path: src/commands/login.ts
chunkCount: 1
entities:
  - registerLoginCommand
dependenciesPreview:
  - "import { Command } from 'commander';"
  - import chalk from 'chalk';
  - "import { loadConfig, saveConfig } from '../config.js';"
  - import 'dotenv/config';
  - "import { DokifyApiClient } from '../api/client.js';"
  - "import open from 'node:child_process';"
version: 1
generated_at: "2025-10-26T03:11:34.453Z"
---
# `src/commands/login.ts` - Dokify CLI Login Command

This file defines the `login` command for the Dokify CLI. Its primary purpose is to authenticate users with the Dokify API, enabling subsequent CLI operations. It supports two authentication methods: direct token provision and an interactive device flow OAuth process. The command also handles auto-detection of local Dokify API instances and persists configuration, including API endpoints and authentication tokens, for future use.

## Key APIs and Functions

### `registerLoginCommand(program: Command): void`

This is the main exported function from this file. It takes a `commander` `Command` object as input and registers the `login` subcommand to it.

*   **Purpose:** To define and attach the `login` command to the CLI's main program instance.
*   **Parameters:**
    *   `program`: An instance of `commander.Command` representing the root of the CLI command tree.
*   **Returns:** `void`. The function modifies the `program` object by adding the `login` command.

### `DokifyApiClient`

This class (imported from `../api/client.js`) is responsible for interacting with the Dokify API. The `login` command utilizes it to perform authentication-related API calls.

### `loadConfig()` and `saveConfig(config: Config)`

These functions (imported from `../config.js`) manage the persistence of CLI configuration. The `login` command uses them to:
*   Load existing configuration (e.g., previously saved API URL or token).
*   Save updated configuration after a successful login or API URL change.

## Authentication Methods

The `login` command supports two primary ways to authenticate:

1.  **Direct Token Provision (`--token` option):**
    *   Users can provide their authentication token directly using the `--token` flag.
    *   This token is then stored in the CLI's configuration for future use.

2.  **Device Flow OAuth (Implicit):**
    *   If no token is provided, the CLI initiates an OAuth device flow.
    *   This typically involves:
        *   Displaying a user code to the terminal.
        *   Prompting the user to visit a specific URL in their browser.
        *   Waiting for the user to authorize the application via the browser.
        *   Once authorized, the CLI obtains and stores an access token.

## Configuration and API Endpoint Handling

### API Base URL Auto-Detection and Override

*   The command attempts to automatically determine the Dokify API base URL in the following order of precedence:
    1.  `process.env.API_BASE_URL`
    2.  `process.env.DOKIFY_API_BASE`
    3.  `process.env.DOKIFY_API_URL`
    4.  Defaults to `http://127.0.0.1:4000` if none of the environment variables are set.
*   **`--api <url>` option:** Allows users to explicitly override the detected API base URL for the current command execution. If provided, this new URL is also saved to the configuration, becoming the default for subsequent commands.

### Persistent Configuration

*   The authentication token and the API base URL are persisted between CLI invocations using `loadConfig` and `saveConfig`. This means once logged in or an API URL is set, the CLI remembers these settings.

## Inputs and Outputs

### Inputs

*   **`program: Command`:** The commander program instance to which the `login` command is registered.
*   **`opts.token` (optional string):** A direct authentication token provided via the `--token` flag.
*   **`opts.api` (optional string):** An API base URL override provided via the `--api` flag.
*   **Environment Variables:**
    *   `process.env.API_BASE_URL`
    *   `process.env.DOKIFY_API_BASE`
    *   `process.env.DOKIFY_API_URL`
*   **Configuration File (`~/.dokify/config.json`):** Loaded by `loadConfig()` to retrieve previous settings.

### Outputs

*   **Console Logs:** Informative messages to the user, such as:
    *   Success messages for setting the API base URL or successful authentication.
    *   Instructions for the device flow OAuth process.
    *   Error messages.
*   **Configuration File Update:** `saveConfig()` writes the updated API base URL and/or token to the configuration file.

## Invariants

*   After `saveConfig(config)` is called, the `config.apiBaseUrl` and `config.token` properties (if updated) will reflect the new values in the persistent configuration.
*   The `API_BASE_URL` variable is guaranteed to hold a string, either from environment variables or a default value.

## Error Handling

While the provided excerpt doesn't explicitly show detailed error handling for API calls or invalid tokens, a robust implementation would include:

*   **API Call Failures:** Catching and reporting errors during communication with the Dokify API (e.g., network issues, invalid credentials).
*   **Invalid Token Format:** Potentially validating the format of a directly provided token.
*   **User Cancellation:** Handling scenarios where the user aborts the device flow.
*   **Configuration Loading/Saving Issues:** Gracefully handling problems with reading or writing the configuration file.

## Dependencies

*   `commander`: For defining CLI commands and options.
*   `chalk`: For styling console output (e.g., colored messages).
*   `../config.js`: For loading and saving CLI configuration.
*   `dotenv/config`: For loading environment variables from a `.env` file.
*   `../api/client.js`: For interacting with the Dokify API.
*   `node:child_process` (imported as `open`): Likely used to open the browser for the OAuth device flow.

## Examples

**1. Logging in with a direct token and setting a default API:**

```bash
dokify login --token YOUR_AUTH_TOKEN --api http://my.dokify.server:5000
```

This command logs the user in using `YOUR_AUTH_TOKEN` and sets `http://my.dokify.server:5000` as the default API base URL for future commands.

**2. Initiating interactive device flow login:**

```bash
dokify login
```

This command will print a user code and a URL to the console, prompting the user to complete the authentication in their web browser.

**3. Overriding API URL for a single command (after initial login):**

```bash
dokify --api http://staging.dokify.server:5000 status
```

If `dokify login` was previously used, this command would authenticate against `http://staging.dokify.server:5000` without permanently changing the default API URL.

## Pitfalls

*   **Environment Variable Precedence:** Developers and users should be aware of the order in which environment variables are checked for the API base URL to avoid unexpected behavior.
*   **Token Security:** Directly passing tokens via command-line arguments can be insecure if the command history is exposed. Using environment variables or the interactive flow might be preferred in sensitive environments.
*   **Configuration File Location:** Ensure the user running the CLI has the necessary permissions to read and write to the configuration file's directory (typically `~/.dokify/`).
*   **Browser Not Opening:** If `node:child_process` fails to open the default browser for the OAuth flow, users will need to manually copy and paste the provided URL.

## Related Files

*   `src/config.ts`: Contains the logic for loading and saving CLI configuration.
*   `src/api/client.ts`: Implements the `DokifyApiClient` for API communication.
*   `src/index.ts`: Likely the main entry point for the CLI, where `registerLoginCommand` would be called.

---
Generated: 2025-10-26T03:11:40.679Z  •  Version: v1
