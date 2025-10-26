---
path: server/src/auth.ts
chunkCount: 1
entities:
  - registerAuthRoutes
  - body
dependenciesPreview:
  - "import { FastifyInstance } from 'fastify';"
  - "import { db } from './db.js';"
  - import bcrypt from 'bcryptjs';
  - import jwt from 'jsonwebtoken';
  - "import { customAlphabet } from 'nanoid';"
version: 1
generated_at: "2025-10-26T03:11:26.602Z"
---
# Authentication Module (`server/src/auth.ts`)

This file provides a comprehensive set of authentication routes for a Fastify application. It handles user registration and login using JSON Web Tokens (JWT) for stateless authentication, password hashing with bcrypt, and API key management.

## Purpose

The primary purpose of this module is to secure the application by managing user identities and access. It offers the following functionalities:

*   **User Registration**: Allows new users to create accounts.
*   **User Login**: Enables existing users to authenticate and obtain JWTs.
*   **Current User Retrieval**: Provides an endpoint to fetch details of the currently authenticated user.
*   **API Key Management**:
    *   **Creation**: Generates unique API keys for programmatic access.
    *   **Listing**: Retrieves all existing API keys for the authenticated user.
    *   **Revocation**: Allows users to disable or delete their API keys.

## Key APIs and Functions

### `registerAuthRoutes(app: FastifyInstance)`

This is the main function exported by this module. It registers all the authentication-related routes onto the provided Fastify `app` instance.

**Inputs**:
*   `app`: An instance of `FastifyInstance`.

**Routes Registered**:

*   `POST /v1/auth/register`: Handles new user registration.
*   `POST /v1/auth/login`: Handles user login and JWT generation.
*   `GET /v1/me`: Retrieves the details of the currently authenticated user.
*   `POST /v1/api-keys`: Creates a new API key.
*   `GET /v1/api-keys`: Lists all API keys associated with the authenticated user.
*   `DELETE /v1/api-keys/:id`: Revokes a specific API key by its ID.

### Internal Logic Details

The module utilizes the following technologies and logic:

*   **Password Hashing**: `bcryptjs` is used to securely hash user passwords before storing them. The hashing uses a salt of 10 rounds.
*   **JWT Authentication**: `jsonwebtoken` is used to create and verify stateless authentication tokens. The `JWT_SECRET` environment variable is used to sign these tokens, falling back to `'dev-secret'` if not provided.
*   **API Key Generation**: `nanoid` (specifically `customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 16)`) is used to generate unique, 16-character alphanumeric API keys.
*   **Data Storage**: It assumes an in-memory `db` object is available (presumably imported from `./db.js`) for storing user and API key data.

## Inputs and Outputs

### `POST /v1/auth/register`

*   **Input**:
    *   Request Body (JSON):
        ```json
        {
          "email": "user@example.com",
          "password": "securepassword123",
          "name": "John Doe" // Optional
        }
        ```
*   **Output**:
    *   Success (200 OK): A JWT token if registration is successful.
        ```json
        {
          "token": "your.jwt.token"
        }
        ```
    *   Error (400 Bad Request): If `email` or `password` are missing.
        ```json
        {
          "error": "invalid_request"
        }
        ```
    *   Error (409 Conflict): If a user with the provided email already exists.
        ```json
        {
          "error": "conflict"
        }
        ```

### `POST /v1/auth/login`

*   **Input**:
    *   Request Body (JSON):
        ```json
        {
          "email": "user@example.com",
          "password": "securepassword123"
        }
        ```
*   **Output**:
    *   Success (200 OK): A JWT token upon successful authentication.
        ```json
        {
          "token": "your.jwt.token"
        }
        ```
    *   Error (400 Bad Request): If `email` or `password` are missing.
        ```json
        {
          "error": "invalid_request"
        }
        ```
    *   Error (401 Unauthorized): If the email or password does not match.
        ```json
        {
          "error": "unauthorized"
        }
        ```

### `GET /v1/me`

*   **Input**:
    *   Authentication: Requires a valid JWT token in the `Authorization` header (e.g., `Bearer your.jwt.token`).
*   **Output**:
    *   Success (200 OK): User details.
        ```json
        {
          "id": "user-id",
          "email": "user@example.com",
          "name": "John Doe"
        }
        ```
    *   Error (401 Unauthorized): If no valid token is provided or the token is expired/invalid.

### `POST /v1/api-keys`

*   **Input**:
    *   Authentication: Requires a valid JWT token in the `Authorization` header.
    *   Request Body (JSON):
        ```json
        {
          "name": "My App Integration" // Optional name for the API key
        }
        ```
*   **Output**:
    *   Success (201 Created): The newly generated API key.
        ```json
        {
          "id": "api-key-id",
          "key": "generated_api_key_string",
          "name": "My App Integration"
        }
        ```

### `GET /v1/api-keys`

*   **Input**:
    *   Authentication: Requires a valid JWT token in the `Authorization` header.
*   **Output**:
    *   Success (200 OK): A list of API keys associated with the user.
        ```json
        [
          {
            "id": "api-key-id-1",
            "name": "App 1",
            "createdAt": "2023-10-27T10:00:00.000Z"
          },
          {
            "id": "api-key-id-2",
            "name": "App 2",
            "createdAt": "2023-10-27T10:05:00.000Z"
          }
        ]
        ```

### `DELETE /v1/api-keys/:id`

*   **Input**:
    *   Authentication: Requires a valid JWT token in the `Authorization` header.
    *   URL Parameter:
        *   `:id`: The ID of the API key to revoke.
*   **Output**:
    *   Success (204 No Content): If the API key was successfully revoked.
    *   Error (404 Not Found): If the API key with the given ID does not exist or does not belong to the authenticated user.
        ```json
        {
          "error": "not_found"
        }
        ```

## Invariants

*   User passwords are never stored in plaintext; they are always hashed using bcrypt.
*   JWT tokens are signed with a secret key (`JWT_SECRET`) to ensure their integrity.
*   API keys are unique and generated with a specific alphanumeric character set and length.
*   API key revocation permanently removes the key and its associated permissions.

## Error Handling

The module employs basic error handling, returning specific HTTP status codes and error messages:

*   **400 Bad Request**: For malformed requests (e.g., missing required fields like `email` or `password`).
*   **401 Unauthorized**: For authentication failures (e.g., incorrect credentials, invalid or expired JWT).
*   **404 Not Found**: For operations on non-existent resources (e.g., trying to revoke a non-existent API key).
*   **409 Conflict**: For registration attempts where the email address is already in use.

## Dependencies

*   **`fastify`**: The web framework used for building the API.
*   **`./db.js`**: Assumed to provide an interface (`db`) for data persistence (likely an in-memory store for demonstration).
*   **`bcryptjs`**: For secure password hashing.
*   **`jsonwebtoken`**: For generating and verifying JWTs.
*   **`nanoid`**: For generating unique identifiers, specifically for API keys.

## Examples

### User Registration and Login Flow

1.  **Register a new user**:
    ```bash
    curl -X POST \
      http://localhost:3000/v1/auth/register \
      -H 'Content-Type: application/json' \
      -d '{
        "email": "testuser@example.com",
        "password": "password123",
        "name": "Test User"
      }'
    ```
    *Expected Response:* A JSON object containing a JWT token.

2.  **Login with the registered user**:
    ```bash
    curl -X POST \
      http://localhost:3000/v1/auth/login \
      -H 'Content-Type: application/json' \
      -d '{
        "email": "testuser@example.com",
        "password": "password123"
      }'
    ```
    *Expected Response:* A JSON object containing a JWT token.

3.  **Access a protected route (e.g., `/v1/me`) using the token**:
    ```bash
    curl -X GET \
      http://localhost:3000/v1/me \
      -H 'Authorization: Bearer <your_jwt_token_here>'
    ```
    *Expected Response:* User details.

### API Key Management

1.  **Create an API key**:
    ```bash
    curl -X POST \
      http://localhost:3000/v1/api-keys \
      -H 'Authorization: Bearer <your_jwt_token_here>' \
      -H 'Content-Type: application/json' \
      -d '{
        "name": "My Service Integration"
      }'
    ```
    *Expected Response:* JSON object with the new API key details.

2.  **List existing API keys**:
    ```bash
    curl -X GET \
      http://localhost:3000/v1/api-keys \
      -H 'Authorization: Bearer <your_jwt_token_here>'
    ```
    *Expected Response:* An array of API key objects.

3.  **Revoke an API key**:
    ```bash
    curl -X DELETE \
      http://localhost:3000/v1/api-keys/<api_key_id_to_revoke> \
      -H 'Authorization: Bearer <your_jwt_token_here>'
    ```
    *Expected Response:* 204 No Content on success.

## Pitfalls

*   **`JWT_SECRET` Exposure**: If `JWT_SECRET` is not properly configured or is exposed, it can lead to security vulnerabilities, allowing attackers to forge JWTs. It should be stored in environment variables and kept confidential.
*   **In-Memory Database**: The current implementation uses an in-memory `db`. This is suitable for development and testing but is not persistent and will lose all data upon server restart. For production, a proper database solution (e.g., PostgreSQL, MongoDB) should be integrated.
*   **Error Response Verbosity**: While error messages are provided, they could potentially reveal too much information to an attacker in certain scenarios. More generic error messages might be preferable in production.
*   **Rate Limiting**: The authentication endpoints are not explicitly rate-limited in this code. In a production environment, implementing rate limiting is crucial to prevent brute-force attacks on login and registration.
*   **Password Policy**: The code does not enforce any password complexity requirements during registration.

## Related Files

*   **`server/src/db.ts`**: This file is a critical dependency as it is assumed to provide the `db` object for user and API key data storage. The actual implementation of data persistence lies within this file.
*   **`server/src/server.ts` (or similar)**: This file would be responsible for importing and calling `registerAuthRoutes` to integrate the authentication functionality into the main Fastify application.

---
Generated: 2025-10-26T03:11:34.453Z  •  Version: v1
