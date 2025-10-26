---
path: src/cli.ts
chunkCount: 1
entities:
  - main
dependenciesPreview:
  - "import { Command } from 'commander';"
  - import chalk from 'chalk';
  - "import { registerLoginCommand } from './commands/login.js';"
  - "import { registerGenerateCommand } from './commands/generate.js';"
  - "import { registerKeysCommand } from './commands/keys.js';"
  - "import { registerWhoAmICommand } from './commands/whoami.js';"
  - "import { registerLogoutCommand } from './commands/logout.js';"
  - import 'dotenv/config';
version: 1
generated_at: "2025-10-26T03:11:32.589Z"
---
# Dokify CLI Entry Point (`src/cli.ts`)

This file serves as the primary entry point for the Dokify command-line interface (CLI) application. It leverages the `commander.js` library to define and manage various subcommands, enabling users to interact with the Dokify services.

## Purpose

The main objective of `src/cli.ts` is to:

*   **Bootstrap the CLI:** Initialize the `commander.js` application.
*   **Define Core Commands:** Register all available subcommands (e.g., `login`, `generate`, `keys`, `whoami`, `logout`).
*   **Configure Environment:** Load environment variables using `dotenv/config` to ensure necessary configurations are available.
*   **Provide Centralized Error Handling:** Implement a robust error handling mechanism to catch and display errors gracefully with colored output using `chalk`.
*   **Set Application Metadata:** Define the name, description, and version of the Dokify CLI.

## Key APIs and Functions

*   **`program = new Command()`:** This line initializes a new `Command` instance from `commander.js`. This instance will be used to define the main CLI program and its subcommands.
*   **`program.name('dok')`:** Sets the name of the CLI application to "dok". This will be displayed in help messages and when the application is invoked.
*   **`program.description('Dokify CLI - generate and upload documentation for your codebase')`:** Provides a concise description of the CLI's functionality.
*   **`program.version('0.1.0')`:** Sets the current version of the Dokify CLI.
*   **`register<CommandName>Command(program)`:** This pattern is used to register each specific subcommand. For example:
    *   `registerLoginCommand(program)`: Registers the `login` subcommand.
    *   `registerGenerateCommand(program)`: Registers the `generate` subcommand.
    *   `registerKeysCommand(program)`: Registers the `keys` subcommand.
    *   `registerWhoAmICommand(program)`: Registers the `whoami` command.
    *   `registerLogoutCommand(program)`: Registers the `logout` command.
*   **`async function main()`:** This asynchronous function encapsulates the core logic for parsing command-line arguments and handling potential errors.
*   **`await program.parseAsync(process.argv)`:** This is the crucial line that tells `commander.js` to parse the command-line arguments provided in `process.argv` and execute the corresponding command. `parseAsync` is used because some commands might be asynchronous.
*   **`catch (error)` block:** This block handles any errors that occur during command parsing or execution. It formats the error message using `chalk.red` for visibility and exits the process with a non-zero status code (1) to indicate an error.

## Inputs and Outputs

*   **Input:** The primary input to this file is `process.argv`, which is an array containing the command-line arguments passed to the Node.js process. This includes the command name, any flags, and arguments for subcommands.
*   **Output:**
    *   **Standard Output (`stdout`):** For successful command executions, output will be directed to `stdout`. This could be messages confirming an action, generated documentation, or user information.
    *   **Standard Error (`stderr`):** In case of errors, a formatted error message (e.g., "Error: [error message]") will be printed to `stderr` using `chalk.red`.
    *   **Process Exit Code:** The process will exit with `0` on successful execution and `1` on error.

## Invariants

*   The Dokify CLI will always attempt to parse command-line arguments using `commander.js`.
*   Environment variables are loaded using `dotenv/config` at the beginning of execution.
*   All registered subcommands are expected to be implemented in separate files within the `./commands/` directory.
*   Error messages are consistently formatted with `chalk.red`.

## Error Handling

Error handling is centralized within the `main` function's `try...catch` block:

1.  **Attempt Execution:** The `program.parseAsync(process.argv)` call is wrapped in a `try` block.
2.  **Catch Errors:** If any error occurs during parsing or command execution (e.g., invalid command, internal logic error in a subcommand), the `catch` block is triggered.
3.  **Format Message:** The `error` object is checked. If it's an `Error` instance, its `message` property is used. Otherwise, the error is converted to a string.
4.  **Log to `stderr`:** The formatted error message is printed to the console using `console.error` and colored red with `chalk.red`.
5.  **Exit with Failure:** `process.exit(1)` is called to terminate the process and signal that an error occurred.

## Dependencies

This file has the following direct dependencies:

*   **`commander`:** For building the command-line interface.
*   **`chalk`:** For adding color to console output, particularly for error messages.
*   **`dotenv/config`:** To load environment variables from a `.env` file.
*   **Local Modules (Commands):**
    *   `./commands/login.js`
    *   `./commands/generate.js`
    *   `./commands/keys.js`
    *   `./commands/whoami.js`
    *   `./commands/logout.js`

## Examples

To interact with the Dokify CLI, you would typically run commands like this from your terminal:

*   **Display help:**
    ```bash
    npx dok --help
    ```
*   **Generate documentation:**
    ```bash
    npx dok generate --src ./src --output ./docs
    ```
*   **Log in:**
    ```bash
    npx dok login
    ```
*   **Check current user:**
    ```bash
    npx dok whoami
    ```

## Pitfalls

*   **Missing `.env` file:** If environment variables are required for certain commands (e.g., API keys for authentication) and a `.env` file is not present or not correctly configured, those commands may fail. The `dotenv/config` import will not throw an error if `.env` is missing, but subsequent code relying on those variables will likely encounter issues.
*   **Incorrect command usage:** Providing incorrect arguments or flags to subcommands will result in errors reported by `commander.js` or the specific subcommand's validation.
*   **Node.js version:** Ensure you are using a compatible Node.js version that supports the features used in this file and its dependencies (e.g., ES Modules). The `#!/usr/bin/env node` shebang suggests it's intended to be executable directly.

## Related Files

*   **`./commands/login.js`**: Implements the `login` subcommand.
*   **`./commands/generate.js`**: Implements the `generate` subcommand.
*   **`./commands/keys.js`**: Implements the `keys` subcommand.
*   **`./commands/whoami.js`**: Implements the `whoami` subcommand.
*   **`./commands/logout.js`**: Implements the `logout` subcommand.
*   **`.env`**: A file (not managed by source control) that would contain environment-specific configuration variables.

---
Generated: 2025-10-26T03:11:37.395Z  •  Version: v1
