---
path: src/commands/whoami.ts
chunkCount: 1
entities:
  - registerWhoAmICommand
dependenciesPreview:
  - "import { Command } from 'commander';"
  - import chalk from 'chalk';
  - "import { loadConfig } from '../config.js';"
  - "import { DokifyApiClient } from '../api/client.js';"
version: 1
generated_at: "2025-10-26T03:11:36.174Z"
---
# `whoami` Command

This document details the `whoami` command, a utility within the Dokify CLI that allows users to retrieve and display their authenticated profile information.

## Purpose

The primary purpose of the `whoami` command is to provide users with a quick and easy way to see who they are currently logged in as within the Dokify system. It displays essential profile details such as the user's email address, their name, and the organization they are associated with.

The command orchestrates the following steps:
1.  **Loads Configuration:** It begins by loading the user's Dokify configuration, which is expected to contain authentication tokens and API base URLs.
2.  **Validates Authentication:** It checks for the presence of an authentication token. If no token is found, it informs the user that they are not logged in and suggests the `dok login` command.
3.  **Initializes API Client:** If a token is present, it instantiates the `DokifyApiClient` using the loaded token and API base URL.
4.  **Fetches User Details:** It then calls the `me()` method of the `DokifyApiClient` to retrieve the authenticated user's profile data from the Dokify API.
5.  **Displays Output:** Finally, it formats and displays the retrieved user information (email, name, and organization) to the console. In case of any errors during the API call, it displays an informative error message.

## Key APIs and Functions

*   **`registerWhoAmICommand(program: Command)`**: This is the main function exported by the module. It takes a `commander.Command` instance as input and registers the `whoami` subcommand to it. This function is responsible for setting up the command's name, description, and its associated action.
*   **`commander.Command`**: This is a core class from the `commander` library, used for building command-line interfaces. The `registerWhoAmICommand` function utilizes it to define the `whoami` subcommand.
*   **`loadConfig()`**: This function (imported from `../config.js`) is responsible for loading the Dokify CLI's configuration. This configuration is expected to contain essential details like the authentication `token` and `apiBaseUrl`.
*   **`DokifyApiClient`**: This class (imported from `../api/client.js`) is the client for interacting with the Dokify API. It's instantiated with the user's authentication token and is used to make the `me()` API call.
*   **`api.me()`**: This method on the `DokifyApiClient` instance makes an API request to fetch the current authenticated user's profile information.

## Inputs and Outputs

*   **Inputs:**
    *   `program: Command`: An instance of `commander.Command` to which the `whoami` command will be attached.
    *   Configuration loaded by `loadConfig()`:
        *   `cfg.token`: The authentication token for the Dokify API. This is a crucial input for authenticating the API request.
        *   `cfg.apiBaseUrl`: The base URL for the Dokify API. If not provided, a default might be used by the `DokifyApiClient`.
*   **Outputs:**
    *   **Success:** A formatted string displayed on the console, showing the user's email, name (if available), and organization (if available). For example: `user@example.com (John Doe @ My Company)`.
    *   **Not Logged In:** A yellow message: `Not logged in. Run: dok login`.
    *   **API Error:** A red message: `Failed to fetch profile. Try logging in again.`.

## Invariants

*   The `whoami` command requires a valid authentication token to be present in the configuration.
*   The `DokifyApiClient` will be initialized with a token if one is found.
*   The output is formatted to be human-readable.

## Error Handling

The `whoami` command implements the following error handling mechanisms:

*   **Missing Authentication Token:** If `loadConfig()` returns a configuration object without a `token`, the command will not proceed with the API call. Instead, it will print a user-friendly message advising them to log in using `dok login` and then exit gracefully.
*   **API Fetching Errors:** If an error occurs during the `api.me()` call (e.g., network issues, API server errors, invalid token), the `catch` block will execute. It prints a red-colored error message indicating that the profile fetching failed and suggests re-logging in.

## Dependencies

*   **`commander`**: Used for building the command-line interface and defining subcommands.
*   **`chalk`**: Used for styling console output (e.g., yellow for warnings, red for errors).
*   **`../config.js`**: Provides the `loadConfig` function to retrieve CLI configuration.
*   **`../api/client.js`**: Provides the `DokifyApiClient` class for interacting with the Dokify API.

## Examples

**1. Displaying authenticated user information:**

```bash
dok whoami

**Expected Output (if logged in as John Doe from My Company):**

```
user@example.com (John Doe @ My Company)
```

**2. Displaying authenticated user information (name not set):**

```bash
dok whoami
```

**Expected Output (if logged in as Jane Smith, no organization):**

```
jane.smith@example.com
```

**3. Running when not logged in:**

```bash
dok whoami
```

**Expected Output:**

```
(yellow) Not logged in. Run: dok login
```

## Pitfalls

*   **Outdated Token:** If the authentication token stored in the configuration is expired or revoked, the `api.me()` call will likely fail, resulting in the "Failed to fetch profile" error message. Users should run `dok login` again in such cases.
*   **Network Connectivity:** The command relies on network connectivity to reach the Dokify API. If the user is offline or experiencing network issues, the API call will fail.
*   **API Base URL Configuration:** While the `DokifyApiClient` can default to an `apiBaseUrl`, explicit configuration might be necessary if the user is connecting to a custom Dokify API endpoint. If `cfg.apiBaseUrl` is missing and a custom URL is expected, the API client might not function correctly.

## Related Files

*   **`src/config.ts`**: This file likely contains the implementation for `loadConfig`, which is essential for retrieving the `token` and `apiBaseUrl`.
*   **`src/api/client.ts`**: This file contains the `DokifyApiClient` class and its `me()` method, which is directly responsible for fetching user data from the API.
*   **`src/cli.ts`**: This file is likely where the `registerWhoAmICommand` function is imported and called to register the `whoami` command with the main program instance.
```

---
Generated: 2025-10-26T03:11:41.213Z  •  Version: v1
