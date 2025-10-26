# Dokify

Dokify is a powerful CLI tool and accompanying web application designed to automate the generation and uploading of your codebase's documentation. It leverages advanced AI models to understand your code, synthesize comprehensive documentation, and present it in a user-friendly format.

This README will guide you through setting up, running, and contributing to the Dokify project.

## Table of Contents

*   [Quick Start (New Machine)](#quick-start-new-machine)
*   [Environment (Dev/Prod)](#environment-devprod)
*   [Running Tests / Build](#running-tests--build)
*   [Scripts](#scripts)
*   [Architecture Overview](#architecture-overview)
*   [Major Modules](#major-modules)
*   [Contribution Notes](#contribution-notes)

## Quick Start (New Machine)

This section guides you through setting up Dokify on a fresh development machine.

**Prerequisites:**

*   **Node.js:** Dokify requires Node.js version **18.17.0** or higher.
    *   You can download it from [nodejs.org](https://nodejs.org/).
    *   Ensure you have `npm` installed, which comes bundled with Node.js.

**Setup Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd dokify
    ```

2.  **Install Dependencies:**
    This command installs all the necessary Node.js packages for both the CLI and the server.
    ```bash
    npm install
    ```

3.  **Set up Environment Variables (for Development):**
    Dokify uses environment variables for configuration. You'll need to create a `.env` file in the root of the project.

    ```bash
    # Create a .env file in the root of the project
    cp .env.example .env
    ```

    Open the `.env` file and configure the following (at minimum for local development):

    *   **For the Server:**
        *   `JWT_SECRET`: A strong secret for signing JWT tokens. Generate one using a tool like `openssl rand -base64 32`.
        *   `WEB_BASE`: The base URL of your web application (e.g., `http://localhost:5173`).
        *   `NODE_ENV`: Set to `development` for local development.

    *   **For the CLI:**
        *   `DOKIFY_API_BASE` (Optional, for connecting to a specific API instance): Defaults to `http://localhost:4000` if not set.
        *   `DOKIFY_API_URL` (Optional, for connecting to a specific API instance): Defaults to `http://localhost:4000` if not set.

    *   **AI Provider Configuration (Optional, for enhanced summarization):**
        If you intend to use AI for code summarization, you'll need to provide API keys for your chosen providers:
        *   `ANTHROPIC_API_KEY`: Your Anthropic API key.
        *   `GOOGLE_API_KEY`: Your Google (Gemini) API key.

4.  **Build the Project:**
    This command compiles the TypeScript code into JavaScript, preparing the CLI and server for execution.
    ```bash
    npm run build
    ```

5.  **Start the Dokify Server:**
    The Dokify API server provides backend services for the CLI and web application.
    ```bash
    npm run start:server
    ```
    By default, the server runs on `http://localhost:4000`.

6.  **Run the Dokify CLI:**
    Once the server is running, you can interact with the CLI. For example, to log in:
    ```bash
    npx dok login --api http://localhost:4000
    ```
    Follow the prompts to authenticate.

## Environment (Dev/Prod)

Dokify supports distinct environments for development and production.

### Development Environment

*   **Node.js Version:** >= 18.17.0
*   **Configuration:** Primarily managed via `.env` files. A `.env.example` is provided for reference.
*   **Database:** An in-memory store (`server/src/db.ts`) is used for simplicity in development. Data is ephemeral.
*   **API Base URL:** For the CLI and Web UI, you'll typically point to your local development server (e.g., `http://localhost:4000`).
*   **Build Tools:** `vite` is used for the web application build.
*   **Development Server:** `nodemon` or similar might be used for auto-reloading during development (though `npm run dev` scripts are preferred).

### Production Environment

*   **Node.js Version:** Ensure compatibility with the latest LTS version.
*   **Configuration:** Environment variables are crucial for production. Consider using a configuration management system or external secrets manager.
*   **Database:** The in-memory store is **not suitable for production**. You will need to integrate a persistent database solution.
*   **API Base URL:** Will point to your deployed Dokify API server.
*   **Build Tools:** Production builds are optimized for performance and size.
*   **Deployment:** Requires a production-ready server environment (e.g., Docker, cloud platforms).

## Running Tests / Build

Dokify includes comprehensive scripts for testing and building the project.

### Building the Project

To build the TypeScript code into JavaScript for both the CLI and the server:

```bash
npm run build
```

This command executes the `build` script defined in the root `package.json`, which orchestrates the build processes for both the CLI (`src/`) and the server (`server/`). The compiled output will be placed in the `dist/` directory.

### Running Tests

Dokify utilizes a testing framework (likely Jest or Vitest, though not explicitly detailed in the provided summaries) for unit and integration tests.

To run all tests:

```bash
npm run test
```

This command will execute the tests defined in the project. You can also run specific test files or suites using test runner-specific commands if available.

## Scripts

The root `package.json` and `server/package.json` define various scripts for development and operational tasks.

**Root `package.json` Scripts:**

*   `build`: Compiles both the CLI and server code.
*   `dev`: Starts the development server and watches for changes (likely for the web app).
*   `test`: Runs the test suite.
*   `start:server`: Starts the Dokify API server.
*   `dok`: A convenience script to run the Dokify CLI.

**`server/package.json` Scripts:**

*   `dev`: Starts the development server with hot-reloading (using `ts-node` and `nodemon`).
*   `build`: Compiles the TypeScript server code to JavaScript.
*   `start`: Runs the compiled JavaScript server in production mode.

**Example CLI Commands:**

*   `npx dok login [--token <token>] [--api <api-url>]`: Logs in to Dokify using device flow or a provided token.
*   `npx dok generate`: Generates documentation for the current repository.
*   `npx dok keys set --provider <provider> --key <key>`: Sets BYOK API keys for AI providers.
*   `npx dok keys show`: Displays the status of configured API keys.
*   `npx dok keys unset --provider <provider>`: Unsets BYOK API keys.
*   `npx dok whoami`: Displays the authenticated user's information.
*   `npx dok logout`: Logs out the current user.

## Architecture Overview

Dokify follows a client-server architecture with a CLI tool, a backend API, and a web frontend.

*   **Dokify CLI (`src/`)**: This is the primary command-line interface for interacting with Dokify. It handles user authentication, repository scanning, documentation generation, and uploading. It relies on the Dokify API for certain operations.
*   **Dokify API Server (`server/`)**: A Node.js backend built with Fastify. It serves as the central hub for:
    *   User authentication (JWT, OAuth).
    *   API key management.
    *   Documentation project and file management.
    *   Handling AI requests (if configured).
    *   WebSocket communication for real-time updates.
    *   Rate limiting and usage metering.
*   **Dokify Web UI (`web/`)**: A React-based Single Page Application (SPA) that provides a visual interface for managing projects, viewing documentation, and managing account settings. It communicates with the Dokify API.

**Key Architectural Patterns:**

*   **Command-Line Interface (CLI)**: Commander.js is used for structuring the CLI.
*   **RESTful API**: Fastify is used to build the backend API.
*   **Microservices (Conceptual)**: While not strictly microservices, the CLI, Server, and Web UI can be considered distinct components with defined interfaces.
*   **OAuth 2.0**: Used for user authentication, particularly for the CLI's device flow and the web UI's provider logins.
*   **JWT (JSON Web Tokens)**: Used for stateless, token-based authentication between the client and server.
*   **WebSocket**: For real-time communication, such as project updates in the web UI.
*   **AI Integration**: Dokify can leverage LLMs (Anthropic, Gemini) for enhanced code summarization and documentation generation.

## Major Modules

Here's a breakdown of the key modules and their responsibilities:

### CLI Modules (`src/`)

*   **`cli.ts`**: Entry point for the CLI, setting up Commander.js and registering subcommands.
*   **`commands/`**: Contains individual command implementations:
    *   `login.ts`: Handles user authentication via device flow or token.
    *   `generate.ts`: Orchestrates the documentation generation pipeline.
    *   `keys.ts`: Manages BYOK API keys for AI providers.
    *   `whoami.ts`: Displays authenticated user information.
    *   `logout.ts`: Clears local authentication tokens.
*   **`api/`**:
    *   `client.ts`: Provides an HTTP client for interacting with the Dokify API.
    *   `types.ts`: Defines TypeScript types for API responses.
*   **`core/`**: Contains the core logic for documentation generation:
    *   `scan.ts`: Scans repositories, respecting `.gitignore` and `.dokignore`.
    *   `chunk.ts`: Splits files into manageable chunks with overlap.
    *   `summarize.ts`: Summarizes code chunks, with optional AI enhancement.
    *   `docs.ts`: Generates markdown documentation from summaries.
    *   `graph.ts`: Builds a dependency graph and generates a viewer.
    *   `upload.ts`: Uploads generated documentation to the API.
    *   `cache.ts`: Implements a file-based caching layer.
*   **`llm/`**: Integrations with different Language Model providers:
    *   `provider.ts`: Defines the `LLMProvider` interface.
    *   `anthropic.ts`: Implements the `LLMProvider` for Anthropic.
    *   `gemini.ts`: Implements the `LLMProvider` for Google Gemini.
*   **`config.ts`**: Manages Dokify application configuration, including API credentials and AI settings.

### Server Modules (`server/`)

*   **`server/src/`**:
    *   **`index.ts`**: Main entry point for the Fastify server, setting up routes and middleware.
    *   **`auth.ts`**: Handles user registration, login, and API key management with JWT and bcrypt.
    *   **`docs.ts`**: Manages CRUD operations for documentation projects and files.
    *   **`oauth.ts`**: Integrates with GitHub and Google OAuth for authentication.
    *   **`agent.ts`**: Handles agent-related routes, including API key validation and usage metering.
    *   **`middleware.ts`**: Contains middleware for API key authentication and usage metering.
    *   **`db.ts`**: Provides a lightweight in-memory data store for MVP.
    *   **`ws.ts`**: Implements WebSocket server for real-time communication.
    *   **`constants.ts`**: Defines constants used across the server.

### Web UI Modules (`web/`)

*   **`web/src/`**:
    *   **`main.tsx`**: Application entry point, setting up React, MantineProvider, and routing.
    *   **`AppRouter.tsx`**: Configures client-side routing using React Router.
    *   **`layouts/`**: Contains layout components like `AppLayout.tsx`.
    *   **`pages/`**: Individual page components:
        *   `App.tsx`: Landing page.
        *   `Login.tsx`: User authentication page.
        *   `Projects.tsx`: Displays and creates projects.
        *   `ProjectDocs.tsx`: Views project documentation.
        *   `Usage.tsx`: Displays platform usage information.
        *   `Account.tsx`: User account management and API key management.
        *   `Verify.tsx`: Handles device verification.
    *   **`lib/`**:
        *   `api.ts`: Provides API client utilities for the web app.
    *   **`routes/`**: Route protection components like `Protected.tsx`.
    *   **`theme.css`**: Defines the dark theme for the web application.

## Contribution Notes

We welcome contributions to Dokify! Here are some guidelines to help you get started:

1.  **Code Style:**
    *   Dokify uses TypeScript for type safety and strong code organization.
    *   Code formatting is handled by Prettier. Run `npm run format` to ensure consistency.
    *   Adhere to standard JavaScript/TypeScript best practices.

2.  **Branching Strategy:**
    *   For new features or bug fixes, create a new branch from the `main` (or `develop`) branch.
    *   Use descriptive branch names (e.g., `feature/add-new-feature`, `bugfix/fix-login-issue`).

3.  **Pull Requests (PRs):**
    *   When submitting a PR, ensure it's well-documented and addresses a specific issue or feature.
    *   Provide a clear description of your changes, including the problem solved and how you solved it.
    *   All PRs will be reviewed by maintainers.

4.  **Testing:**
    *   All new code should be accompanied by relevant unit or integration tests.
    *   Ensure all existing tests pass before submitting a PR.

5.  **Reporting Issues:**
    *   If you find a bug, please open an issue on the GitHub repository.
    *   Provide a detailed description of the bug, including steps to reproduce it, expected behavior, and actual behavior.
    *   Include relevant environment details (OS, Node.js version, Dokify version).

6.  **Feature Requests:**
    *   If you have a feature idea, feel free to open an issue to discuss it before implementing it. This helps ensure alignment with the project's goals.

7.  **Dependencies:**
    *   When adding new dependencies, carefully consider their necessity, licenses, and potential impact on the project.
    *   Always run `npm install` after adding or updating dependencies.

We look forward to your contributions!