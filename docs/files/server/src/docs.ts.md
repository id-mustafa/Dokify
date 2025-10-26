---
path: server/src/docs.ts
chunkCount: 1
entities:
  - requireAuth
  - registerDocsRoutes
  - body
  - insert
dependenciesPreview:
  - "import { FastifyInstance } from 'fastify';"
  - "import { db } from './db.js';"
  - import jwt from 'jsonwebtoken';
  - "import { customAlphabet } from 'nanoid';"
version: 1
generated_at: "2025-10-26T03:11:26.603Z"
---
# Documentation Server API: `/v1/docs.ts`

This file defines the API endpoints for managing documentation projects and their associated files within the Fastify server. It handles authentication, CRUD operations for projects and documents, and provides functionality for generating hierarchical directory structures.

## Core Functionality

The primary function exposed by this module is `registerDocsRoutes`, which registers a set of HTTP routes on a given Fastify instance. These routes enable users to interact with the documentation system.

## Authentication

All endpoints requiring user authorization utilize a `requireAuth` helper function. This function:

*   **Extracts Credentials**: Retrieves the JWT Bearer token from the `Authorization` header of incoming requests.
*   **Verifies Token**: Uses the `jsonwebtoken` library to verify the token against a predefined `JWT_SECRET`.
*   **Identifies User**: Extracts the user's subject (`sub`) from the verified token's payload.
*   **Handles Unauthorized Access**: Throws an error if the authorization header is missing or malformed, leading to a `401 Unauthorized` response from the API.

The `JWT_SECRET` is read from the environment variable `JWT_SECRET` or defaults to `'dev-secret'` for development environments.

## Key APIs and Endpoints

The following routes are registered by `registerDocsRoutes`:

### Projects

*   **`GET /v1/projects`**:
    *   **Purpose**: Lists all documentation projects owned by the authenticated user.
    *   **Inputs**:
        *   `Authorization`: Bearer token (JWT) for authentication.
    *   **Outputs**:
        *   `projects`: An array of objects, each containing `id`, `name`, and `slug` for a project.
    *   **Invariants**: Only returns projects belonging to the authenticated user. Projects are sorted by creation timestamp in ascending order.
    *   **Error Handling**: Returns `401 Unauthorized` if the user is not authenticated.
    *   **Dependencies**: Relies on `db.projects` (a `Map` likely storing project data) and `requireAuth`.

*   **`POST /v1/projects`**:
    *   **Purpose**: Creates a new documentation project.
    *   **Inputs**:
        *   `Authorization`: Bearer token (JWT) for authentication.
        *   **Request Body**: An object containing:
            *   `name`: The name of the new project.
            *   `slug`: A URL-friendly identifier for the project.
    *   **Outputs**:
        *   A success message or the details of the created project.
    *   **Invariants**: A unique ID is generated for the new project using `nanoid` (`nano`). The `owner_user_id` is set to the authenticated user's ID.
    *   **Error Handling**: Returns `401 Unauthorized` if the user is not authenticated.
    *   **Dependencies**: Relies on `db.projects`, `requireAuth`, `jsonwebtoken` (for verification of token payload), and `nanoid` (for ID generation).

### Documents

(Further details on document-related endpoints would be provided in subsequent chunks.)

## Dependencies

This module has the following external dependencies:

*   `fastify`: For building the HTTP server and defining routes.
*   `jsonwebtoken`: For authentication using JWTs.
*   `nanoid`: For generating unique identifiers for projects and documents.
*   `./db.js`: An assumed module that provides access to the application's database (likely an in-memory store based on the `Map` usage).

## Examples

*(Examples would be provided here once more code excerpts are available to illustrate usage.)*

## Pitfalls

*   **JWT Security**: The security of the API heavily relies on the `JWT_SECRET`. It's crucial to ensure this secret is kept confidential and is sufficiently strong, especially in production environments.
*   **Database Schema**: The behavior of `db.projects` and its assumed structure (e.g., `owner_user_id`, `created_at`, `id`, `name`, `slug`) is inferred. Any deviation in the actual `db.js` implementation could lead to unexpected results.
*   **Error Propagation**: While `requireAuth` throws an error, the `registerDocsRoutes` function catches it and returns a `401` reply. It's important to ensure all error paths are handled gracefully.

## Related Files

*   `./db.js`: This file is a direct dependency, providing the data store for projects and documents.
*   `./auth.ts` (or similar): May contain more comprehensive authentication logic or middleware.

---
Generated: 2025-10-26T03:11:30.562Z  •  Version: v1
