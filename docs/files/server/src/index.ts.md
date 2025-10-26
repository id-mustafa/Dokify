---
path: server/src/index.ts
chunkCount: 1
entities:
  - body
dependenciesPreview:
  - import Fastify from 'fastify';
  - "import { customAlphabet } from 'nanoid';"
  - import jwt from 'jsonwebtoken';
  - "import { db } from './db.js';"
  - import 'dotenv/config';
  - "import { migrate } from './db.js';"
  - "import { registerAuthRoutes } from './auth.js';"
  - "import { registerDocsRoutes } from './docs.js';"
  - "import { registerOAuthRoutes } from './oauth.js';"
  - "import { requireApiKey, meterUsage } from './middleware.js'; 213"
version: 1
generated_at: "2025-10-26T03:11:26.603Z"
---
# Server Entry Point (`server/src/index.ts`)

This file serves as the main entry point for the Dokify API server, built using the Fastify framework. It orchestrates the initialization of the HTTP server, sets up essential configurations, and registers all necessary route handlers and WebSocket attachments.

## Purpose

The primary purpose of `index.ts` is to:

1.  **Initialize the Fastify HTTP server**: Set up the core Fastify application instance.
2.  **Configure CORS**: Enable Cross-Origin Resource Sharing for incoming requests.
3.  **Implement Device-based OAuth 2.0 flow**: Facilitate authentication for CLI clients by managing device records and user codes.
4.  **Manage In-Memory Device Records**: Utilize a `Map` to store and retrieve information about registered devices.
5.  **Establish JWT-based Token Generation**: Configure JSON Web Token (JWT) generation for secure API access.
6.  **Register Route Handlers**: Mount all API endpoints, including authentication (`auth`), documentation (`docs`), OAuth (`oauth`), agent-specific routes (`agent`), and WebSocket handling (`ws`).

## Key APIs and Concepts

*   **`Fastify`**: The core framework used to build the HTTP server. It provides a robust and performant way to handle routes, plugins, and middleware.
*   **`nanoid` (`customAlphabet`)**: A library used to generate unique, short IDs. In this context, it's used for generating device codes and user codes.
*   **`jsonwebtoken` (`jwt`)**: A library for creating and verifying JSON Web Tokens (JWTs), essential for securing API endpoints and managing user sessions.
*   **`DeviceRecord` (Type)**: A TypeScript type definition outlining the structure of an in-memory record for a registered device. This includes fields like `deviceCode`, `userCode`, `approved` status, and expiration times.
*   **`devices` (`Map<string, DeviceRecord>`)**: An in-memory data structure used to store `DeviceRecord` objects, keyed by their `deviceCode`. This allows for quick lookups and management of active devices.
*   **`migrate` (`./db.js`)**: A function imported from `./db.js` responsible for database migrations, ensuring the database schema is up-to-date before the server starts.
*   **Route Registration Functions**:
    *   `registerAuthRoutes`: Handles authentication-related endpoints.
    *   `registerDocsRoutes`: Manages documentation endpoints.
    *   `registerOAuthRoutes`: Implements the OAuth 2.0 flow for device authentication.
    *   `registerAgentRoutes`: Provides endpoints for agent-specific functionalities.
*   **Middleware Functions**:
    *   `requireApiKey`: A middleware to protect routes requiring an API key.
    *   `meterUsage`: A middleware to track API usage.
*   **`attachWebSocket` (`./ws.js`)**: A function to set up WebSocket connections, likely for real-time communication.

## Inputs and Outputs

This file primarily deals with setting up the server and its dependencies.

*   **Inputs**:
    *   **Environment Variables**: It reads various environment variables for configuration (e.g., `PORT`, `HOST`, `API_BASE`, `VERIFY_BASE`, `WEB_BASE`).
    *   **Database Migrations**: It triggers database migrations using the `migrate` function.
    *   **Route Handler Modules**: It imports and registers route handlers from other modules (`./auth.js`, `./docs.js`, etc.).
    *   **Middleware Modules**: It imports and registers middleware from `./middleware.js`.
    *   **WebSocket Module**: It imports and registers WebSocket handling from `./ws.js`.

*   **Outputs**:
    *   **HTTP Server**: A running Fastify HTTP server listening on a configured port.
    *   **API Endpoints**: The registration of various API routes that clients can interact with.
    *   **WebSocket Connections**: The establishment of WebSocket connections for real-time features.

## Invariants

*   The Fastify application instance is created with logging enabled (`logger: true`).
*   A specific alphabet is used for generating short, unique IDs with `nanoid`.
*   Environment variables are parsed and used for configuration, with sensible defaults provided.
*   Database migrations are expected to complete successfully before the server starts accepting requests.

## Error Handling

*   **Logging**: The Fastify app is configured with `logger: true`, which will automatically log server errors and request details.
*   **Implicit Error Handling**: Route handlers and middleware are responsible for their own error handling and returning appropriate HTTP status codes and error messages.
*   **CORS Errors**: While not explicitly detailed in the provided snippet, incorrect CORS configuration could lead to browser-side errors.
*   **JWT Errors**: Issues with JWT generation or verification would typically result in authentication errors.

## Dependencies

This file has several external and internal dependencies:

*   **External**:
    *   `fastify`: The web framework.
    *   `nanoid`: For generating unique IDs.
    *   `jsonwebtoken`: For JWT handling.
    *   `dotenv/config`: For loading environment variables from a `.env` file.

*   **Internal**:
    *   `./db.js`: For database operations, including migrations.
    *   `./auth.js`: For authentication routes.
    *   `./docs.js`: For documentation routes.
    *   `./oauth.js`: For OAuth 2.0 related routes.
    *   `./middleware.js`: For custom middleware like API key checking and usage metering.
    *   `./agent.js`: For agent-specific routes.
    *   `./ws.js`: For WebSocket attachment.

## Examples

While this file is the server's entry point and doesn't directly expose client-facing examples, its setup enables the following:

*   **CLI Authentication**: A CLI client can initiate an OAuth 2.0 flow by requesting a device code, which it then prompts the user to authorize on a web interface.
*   **API Access**: Once authenticated, clients can access protected API endpoints using JWTs or API keys.
*   **Real-time Updates**: Applications can establish WebSocket connections for immediate data synchronization or notifications.

## Pitfalls

*   **Environment Variable Misconfiguration**: Missing or incorrectly set environment variables can lead to the server failing to start or operate as expected.
*   **Database Migration Failures**: If database migrations fail, the server might start with an inconsistent or empty database, causing subsequent operations to error out.
*   **CORS Issues**: Improper CORS configuration can prevent frontend applications from successfully communicating with the API.
*   **JWT Secret Management**: The security of JWTs relies heavily on the secrecy of the JWT signing key. This should be managed securely via environment variables.
*   **In-Memory Data Volatility**: The `devices` `Map` stores data in memory. This means data will be lost upon server restart. For persistent device records, a database solution would be necessary.

## Related Files

*   `server/src/db.js`: Handles database connection and migrations.
*   `server/src/auth.js`: Contains the logic for authentication routes.
*   `server/src/docs.js`: Implements documentation-related API endpoints.
*   `server/src/oauth.js`: Manages the OAuth 2.0 device flow.
*   `server/src/middleware.js`: Defines shared middleware functions like API key validation and usage metering.
*   `server/src/agent.js`: Provides endpoints for agent functionalities.
*   `server/src/ws.js`: Sets up and manages WebSocket connections.
*   `.env` (or similar): The file from which environment variables are loaded.

---
Generated: 2025-10-26T03:11:32.665Z  •  Version: v1
