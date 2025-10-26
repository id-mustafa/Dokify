---
path: src/commands/logout.ts
chunkCount: 1
entities:
  - registerLogoutCommand
dependenciesPreview:
  - "import { Command } from 'commander';"
  - import chalk from 'chalk';
  - "import { loadConfig, saveConfig } from '../config.js';"
version: 1
generated_at: "2025-10-26T03:11:34.784Z"
---
# `src/commands/logout.ts`

This file defines and registers a `logout` command for the Dokify CLI. The primary purpose of this command is to allow users to remove their locally stored authentication tokens, effectively logging them out of the CLI.

## Purpose

The `logout` command is designed to invalidate any existing local authentication tokens. It achieves this by:

1.  Loading the current Dokify configuration.
2.  Setting the authentication token within the configuration to `null`.
3.  Saving the modified configuration back to its storage location.
4.  Providing user feedback by displaying a success message indicating that the local token has been removed.

## Key APIs and Functions

The main function exported from this file is:

*   `registerLogoutCommand(program: Command): void`
    *   **Purpose**: This function is responsible for adding the `logout` command to the main `commander` program instance.
    *   **Inputs**:
        *   `program`: An instance of `commander.Command`, representing the CLI application's program object.
    *   **Outputs**: `void`. This function modifies the `program` object in place by adding the new command.
    *   **Invariants**: Assumes that a valid `commander.Command` object is provided.
    *   **Dependencies**:
        *   `commander`: Used for defining CLI commands.
        *   `chalk`: Used for styling output messages.
        *   `../config.js` (specifically `loadConfig` and `saveConfig`): Used for reading and writing the Dokify configuration file.

The `logout` command itself, when executed, performs the following internal operations:

1.  Calls `loadConfig()` to retrieve the current configuration.
2.  Modifies the loaded configuration by setting `cfg.token = null`.
3.  Calls `saveConfig(cfg)` to persist the changes.
4.  Uses `console.log(chalk.green('✓ Logged out (local token removed)'))` to inform the user of successful logout.

## Inputs and Outputs

*   **Command Inputs**: When the user executes the `logout` command, there are no explicit command-line arguments or options required.
*   **Command Outputs**:
    *   `void`: The `registerLogoutCommand` function itself returns nothing.
    *   `console.log output`: Upon successful execution, a green confirmation message `✓ Logged out (local token removed)` is printed to the console.
    *   `modified config file`: The local Dokify configuration file is updated by removing the authentication token.

## Invariants

*   The `loadConfig` function is expected to return a configuration object that has a `token` property.
*   The `saveConfig` function is expected to correctly write the provided configuration object back to storage.
*   The `chalk.green` function is assumed to be available and functional for coloring output.

## Error Handling

The provided code excerpt does not explicitly show error handling for potential issues such as:

*   Failure to load the configuration file.
*   Failure to save the configuration file.

In a production-ready scenario, these operations would ideally be wrapped in `try...catch` blocks to inform the user of any persistent errors.

## Dependencies

*   **`commander`**: Essential for defining and managing the CLI command structure.
*   **`chalk`**: Used for providing visually appealing colored output to the user.
*   **`../config.js`**: This local module is critical and provides the `loadConfig` and `saveConfig` functions, which are responsible for the persistence of Dokify's configuration, including authentication tokens.

## Examples

To use the `logout` command, you would typically run it from your terminal:

```bash
dokify logout
```

If successful, you will see:

```
✓ Logged out (local token removed)
```

## Pitfalls

*   **Configuration File Issues**: If the configuration file is corrupted or inaccessible, `loadConfig` or `saveConfig` might fail, leading to an incomplete or erroneous logout.
*   **No User Feedback on Failure**: As noted in error handling, the current implementation doesn't explicitly handle or report errors during file operations, which could leave the user unsure if the logout was truly successful.

## Related Files

*   **`../config.js`**: This file is a direct dependency and contains the logic for loading and saving the Dokify configuration, which is essential for the `logout` command's operation.
*   **`commander`**: The core library used to build the CLI application and register commands like `logout`.

---
Generated: 2025-10-26T03:11:38.339Z  •  Version: v1
