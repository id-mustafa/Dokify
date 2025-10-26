---
path: "src/dev/mock-server.ts"
chunkCount: 1
entities:
  - json
  - notFound
  - parseBody
  - userCode
dependenciesPreview:
  - "import http from 'node:http';"
  - "import url from 'node:url';"
version: 1
generated_at: "2025-10-26T03:11:42.470Z"
---
# Mock OAuth2 Device Flow Server (`src/dev/mock-server.ts`)

## Purpose

This module implements a mock OAuth2 device flow server designed for development and testing purposes. It simulates a backend API that supports the device authorization, token exchange, and user profile retrieval stages of the OAuth2 device flow. This allows developers to test browser-based applications that rely on OAuth2 device flow without needing a live backend. The server mimics a Dokify API backend, providing the necessary endpoints for a seamless development experience.

## Key APIs and Functions

The core functionality is provided by the `http.createServer` function, which handles incoming HTTP requests. Several helper functions are defined to manage the server's logic:

*   **`json(res, status, body)`**: A utility function to send a JSON response with a specified HTTP status code. It sets the `content-type` header to `application/json` and stringifies the provided `body`.
*   **`notFound(res)`**: A convenience function to send a standard 404 Not Found JSON response with an `error: 'not_found'` payload.
*   **`parseBody(req)`**: An asynchronous function that parses the request body. It handles JSON parsing and returns a Promise that resolves with the parsed body. If the body is empty or invalid JSON, it resolves with an empty object.
*   **`http.createServer`**: The main server instance. It listens for incoming requests and routes them to appropriate handlers based on the request method and URL.

## Inputs and Outputs

The mock server is configured via environment variables:

*   **`process.env.PORT`**: The port the server will listen on. Defaults to `4000`.
*   **`process.env.HOST`**: The host the server will bind to. Defaults to `127.0.0.1`.
*   **`process.env.VERIFY_BASE`**: An optional URL that the verification links will point to. If not set, it defaults to the server's own base URL (`http://${HOST}:${PORT}`). This is useful for directing users to a specific web application for verification.

The server's primary outputs are HTTP responses to client requests, typically in JSON format, indicating success, errors, or data.

## Invariants

*   **Device Storage**: The server maintains an in-memory `Map` called `devices` to store `DeviceRecord` objects. Each record represents an active device authorization request.
*   **Device Expiration**: `DeviceRecord` objects contain an `expiresAt` timestamp, implying that expired devices will eventually be considered invalid (though explicit cleanup logic is not detailed in the provided excerpts).
*   **`DeviceRecord` Structure**: Each `DeviceRecord` must contain `deviceCode`, `userCode`, `approved` (boolean), `expiresAt` (number, likely a Unix timestamp), and `interval` (number, likely in seconds).

## Error Handling

*   **Not Found**: Requests to undefined endpoints or resources will result in a 404 Not Found response using the `notFound` helper function.
*   **Invalid JSON**: The `parseBody` function includes a `try-catch` block to gracefully handle invalid JSON in request bodies, resolving with an empty object in such cases.
*   **General Request Errors**: While not explicitly detailed in the excerpts, standard HTTP server error handling would apply.

## Dependencies

This module relies on Node.js built-in modules:

*   **`node:http`**: For creating and managing the HTTP server.
*   **`node:url`**: For parsing request URLs.

## Examples

The primary use case is to run this server locally during development. A typical workflow would involve:

1.  **Starting the server**:
    ```bash
    PORT=4000 HOST=127.0.0.1 ts-node src/dev/mock-server.ts
    ```
    Or with a custom verification URL:
    ```bash
    VERIFY_BASE="http://localhost:3000/auth/verify" PORT=4000 ts-node src/dev/mock-server.ts
    ```

2.  **Client initiates device authorization**: Your application would make a `POST` request to the server's `/device/code` endpoint. The server would respond with a `device_code`, `user_code`, `verification_uri`, `expires_in`, and `interval`.

3.  **User verification**: The user is instructed to visit the `verification_uri` (e.g., `http://127.0.0.1:4000/verify?user_code=XXXX-XXXX`) or a custom URL provided by `VERIFY_BASE`. On this verification page (which you would typically build separately), they might approve the login.

4.  **Client polls for token**: Your application repeatedly makes `POST` requests to the server's `/oauth2/token` endpoint, providing the `device_code`. The server will respond with `authorization_pending` until the device is approved.

5.  **Token granted**: Once approved, the server will respond with an `access_token` and other relevant OAuth2 token exchange details.

6.  **User profile retrieval**: Your application can then make a `GET` request to `/user/profile` (assuming such an endpoint is implemented) to get mock user data.

## Pitfalls

*   **In-Memory Storage**: The `devices` map is in-memory. Any server restarts will clear all active device authorizations. This is acceptable for development but not for production.
*   **Limited Functionality**: This is a *mock* server. It simulates specific OAuth2 device flow endpoints but doesn't implement the full OAuth2 specification or any complex authentication logic.
*   **Security**: This mock server is not designed for secure environments and should only be used during local development.
*   **No Real User Interaction**: The `approved` status for a device needs to be manually toggled or handled by a separate verification UI that communicates back to this mock server (e.g., via another endpoint not shown in these excerpts).

## Related Files

While not directly related in terms of code, the purpose of this file suggests it would be used in conjunction with:

*   **Client-side OAuth2 flow logic**: The code in your frontend or backend application that initiates the device flow, handles polling, and manages tokens.
*   **Verification UI/Page**: A separate web page or component that the user interacts with to approve or deny the device authorization request. This page would need to communicate the user's decision back to the mock server.

---
Generated: 2025-10-26T03:11:47.770Z  •  Version: v1
