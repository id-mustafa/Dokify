---
path: server/src/oauth.ts
chunkCount: 1
entities:
  - registerOAuthRoutes
  - redirectUri
  - upsertUser
dependenciesPreview:
  - "import { FastifyInstance } from 'fastify';"
  - "import { db } from './db.js';"
  - import jwt from 'jsonwebtoken';
  - "import { customAlphabet } from 'nanoid';"
version: 1
generated_at: "2025-10-26T03:11:26.603Z"
---
# OAuth Authentication Server (`server/src/oauth.ts`)

## Purpose

This file implements the server-side logic for handling OAuth 2.0 authentication flows for GitHub and Google. Its primary responsibilities include:

1.  **Registering OAuth Routes:** It exposes API endpoints using the Fastify framework to initiate and handle callbacks for the OAuth processes.
2.  **Provider Redirection:** It redirects users to the respective OAuth provider's login/authorization page.
3.  **Code Exchange:** Upon successful authorization from the provider, it exchanges the received authorization code for access tokens.
4.  **User Information Extraction:** It retrieves the user's email address from the provider.
5.  **User Management:** It upserts (creates or updates) user records in the database based on the information obtained from the OAuth provider.
6.  **Session Management:** It generates and returns JSON Web Tokens (JWTs) to establish authenticated user sessions.

## Key APIs and Functions

### `registerOAuthRoutes(app: FastifyInstance)`

This is the main function exported by the module. It takes a Fastify instance as an argument and registers the necessary OAuth-related routes.

*   **GitHub OAuth Flow:**
    *   `/v1/oauth/github/start`: Initiates the GitHub OAuth flow by redirecting the user to GitHub's authorization server.
    *   `/v1/oauth/github/callback`: Handles the callback from GitHub after the user has authorized the application. It exchanges the authorization code for an access token, retrieves the user's email, upserts the user in the database, and returns a JWT.
*   **Google OAuth Flow:** (While the purpose mentions Google, the provided code excerpt focuses solely on GitHub. The implementation for Google would follow a similar pattern but with Google's specific endpoints and parameters.)

### `redirectUri` (Helper Variable/Logic)

This represents the URI on the server that the OAuth provider will redirect the user back to after authorization. It's dynamically constructed, prioritizing environment variables for configuration.

### `upsertUser` (Database Operation)

This function (presumably defined in `./db.js`) is responsible for either creating a new user record in the database or updating an existing one if a user with the given email already exists.

## Inputs and Outputs

The OAuth routes process various inputs and produce different outputs:

*   **Inputs:**
    *   **`req.query.code`**: The authorization code received from the OAuth provider after successful user authentication and authorization.
    *   **Environment Variables**: Critical configuration values are read from `process.env`, including:
        *   `GITHUB_CLIENT_ID`: The client ID for the GitHub OAuth application.
        *   `GITHUB_REDIRECT_URI`: The configured redirect URI for GitHub.
        *   `API_BASE`: The base URL of the API server, used to construct default redirect URIs.
        *   `JWT_SECRET`: The secret key used for signing JWTs.
        *   `WEB_BASE` / `VERIFY_BASE`: Base URLs for the web application, used for redirects.

*   **Outputs:**
    *   **HTTP Redirects**: The `/start` routes redirect the user's browser to the OAuth provider's authorization server.
    *   **JSON Responses**: The `/callback` routes, upon successful completion, return a JSON object containing:
        *   A JWT token for authentication.
    *   **Error Responses**: In case of issues during the OAuth flow (e.g., missing code, invalid credentials, database errors), the API returns appropriate HTTP status codes and error messages.

## Invariants

*   **State Parameter**: The `state` parameter is generated using `nano()` and sent to the OAuth provider. This parameter is crucial for preventing Cross-Site Request Forgery (CSRF) attacks. The server should verify that the `state` parameter returned in the callback matches the one initially sent.
*   **JWT Signing**: JWTs are signed using a secret (`JWT_SECRET`) that should be kept secure and consistent.

## Error Handling

The code includes basic error handling within the `/callback` routes:

*   **Missing Authorization Code**: If `params.code` is not present in the request query, a `400 Bad Request` error is returned, indicating an invalid request.
*   **General Exceptions**: A `try...catch` block is used to capture any unexpected errors during the OAuth callback processing. In the event of an error, a `500 Internal Server Error` is sent back to the client. More specific error handling might be implemented for different stages of the OAuth flow (e.g., token exchange failure, user lookup failure).

## Dependencies

This module relies on the following external libraries and internal modules:

*   **`fastify`**: A web framework for Node.js, used for defining API routes and handling HTTP requests/responses.
*   **`jsonwebtoken`**: A library for creating and verifying JSON Web Tokens (JWTs), used for session management.
*   **`nanoid`**: A library for generating unique IDs, used here to create the `state` parameter for OAuth.
*   **`./db.js`**: An internal module responsible for database operations, specifically the `upsertUser` function.

## Examples

### Initiating GitHub Login

A client application would make a GET request to `/v1/oauth/github/start`. The server would respond with an HTTP 302 redirect to a URL like:

```
https://github.com/login/oauth/authorize?client_id=YOUR_GITHUB_CLIENT_ID&redirect_uri=YOUR_GITHUB_REDIRECT_URI&scope=user:email&state=a1b2c3d4e5f67890
```

### Successful GitHub Callback

After the user logs into GitHub and authorizes the app, GitHub redirects them back to the configured `GITHUB_REDIRECT_URI` with a `code` and `state` parameter. A successful callback from the server might look like this (internal processing):

1.  Server receives `GET /v1/oauth/github/callback?code=AUTHORIZATION_CODE&state=a1b2c3d4e5f67890`.
2.  Server exchanges the `code` with GitHub for an access token.
3.  Server uses the access token to fetch the user's email from GitHub.
4.  Server calls `upsertUser` with the user's email.
5.  Server generates a JWT.
6.  Server responds with a JSON object:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2NzgwNTQ0MDB9.SIGNATURE"
    }
    ```

## Pitfalls and Considerations

*   **Environment Variable Configuration**: The OAuth flow heavily relies on environment variables. Missing or incorrectly configured variables (`GITHUB_CLIENT_ID`, `GITHUB_REDIRECT_URI`, `JWT_SECRET`, `API_BASE`, `WEB_BASE`) will lead to functional issues.
*   **Security of `JWT_SECRET`**: The `JWT_SECRET` is crucial for the security of the generated tokens. It must be kept confidential and sufficiently complex. Using a default like `'dev-secret'` in production is a significant security risk.
*   **State Parameter Verification**: The provided excerpt doesn't explicitly show the verification of the `state` parameter in the callback. This is a critical security step that should be implemented to prevent CSRF.
*   **Error Granularity**: The current error handling returns generic 400 or 500 errors. For a production system, more specific error messages and logging would be beneficial to diagnose issues.
*   **Provider-Specific Details**: The implementation is tailored for GitHub. Adding support for Google or other providers would require understanding and implementing their specific OAuth parameters, endpoints, and token exchange mechanisms.
*   **User Data Privacy**: Ensure compliance with data privacy regulations when handling user data obtained through OAuth.

## Related Files

*   **`server/src/db.js`**: This file is a crucial dependency, as it contains the `upsertUser` function responsible for database interactions.
*   **Environment Variable Configuration Files**: Any files or scripts responsible for loading environment variables (e.g., `.env`, `dotenv` configuration) are implicitly related.

---
Generated: 2025-10-26T03:11:33.495Z  •  Version: v1
