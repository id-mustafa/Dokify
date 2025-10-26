---
path: src/api/client.ts
chunkCount: 1
entities:
  - DokifyApiClient
dependenciesPreview:
  - "import { loadConfig } from '../config.js';"
  - "import { DeviceStartResponse, TokenPendingResponse, TokenSuccessResponse, MeResponse } from './types.js';"
version: 1
generated_at: "2025-10-26T03:11:30.658Z"
---
# Dokify API Client (`src/api/client.ts`)

This file defines the `DokifyApiClient` class, which serves as the primary interface for interacting with the Dokify API. It handles authentication, specifically the OAuth device flow, and allows for making authenticated requests to retrieve user profile information.

## Purpose

The `DokifyApiClient` is designed to facilitate seamless communication with the Dokify API. Its core responsibilities include:

*   **Authentication:** Implementing the OAuth device flow to obtain authentication tokens.
*   **Authenticated Requests:** Making requests to protected API endpoints, such as retrieving user profile data, after successful authentication.

## Key APIs/Classes/Functions

### `DokifyApiClient` Class

This is the main class for interacting with the Dokify API.

#### Constructor

```typescript
constructor(params?: { baseUrl?: string; clientId?: string; token?: string | null })
```

*   **Purpose:** Initializes a new instance of the `DokifyApiClient`. It prioritizes configuration from provided `params`, then environment variables (`DOKIFY_API_BASE`, `DOKIFY_API_URL`), then configuration loaded from `../config.js`, and finally defaults to `https://api.dokify.com` for the `baseUrl`. The `clientId` defaults to `dokify-cli`. The `token` can be provided directly, loaded from configuration, or initialized as `null`.
*   **Inputs:**
    *   `params.baseUrl` (optional string): A custom base URL for the API.
    *   `params.clientId` (optional string): A custom client ID for authentication.
    *   `params.token` (optional string | null): An initial authentication token.
    *   `process.env.DOKIFY_API_BASE` (environment variable): An alternative base URL for the API.
    *   `process.env.DOKIFY_API_URL` (environment variable): Another alternative base URL for the API.
    *   Configuration loaded from `../config.js` (e.g., `cfg.apiBaseUrl`, `cfg.token`).
*   **Outputs:** An initialized `DokifyApiClient` instance.
*   **Invariants:** The `baseUrl`, `clientId`, and `token` properties are set upon instantiation based on the provided parameters, environment variables, or default values.

#### `setToken(token: string | null)`

*   **Purpose:** Allows dynamic updating of the authentication token for the client. This is useful if the token is refreshed or obtained through a different mechanism after the client has been initialized.
*   **Inputs:** `token` (string | null): The new authentication token to set.
*   **Outputs:** None. Modifies the internal `token` state of the `DokifyApiClient` instance.

#### `startDeviceFlow(): Promise<DeviceStartResponse>`

*   **Purpose:** Initiates the OAuth device flow. This method is the first step in authenticating a user via the device flow, typically used in command-line interfaces or environments where a web browser isn't readily available.
*   **Inputs:** None directly, but uses the `baseUrl` and `clientId` of the `DokifyApiClient` instance.
*   **Outputs:** A `Promise` that resolves to a `DeviceStartResponse` object. This response typically contains a `device_code` and a `user_code` that the user needs to enter on a verification URL.
*   **Error Handling:** Throws an `Error` if the API request fails, including the HTTP status code in the error message.

## Dependencies

*   `../config.js`: This module is imported to load configuration settings, including `apiBaseUrl` and `token`, which are used to initialize the `DokifyApiClient`.
*   `./types.js`: This module exports type definitions for the responses from the API, such as `DeviceStartResponse`, `TokenPendingResponse`, `TokenSuccessResponse`, and `MeResponse`.

## Examples

*(Note: Actual example usage would involve making a fetch request and handling the response. The following illustrates the conceptual flow.)*

```typescript
import { DokifyApiClient } from './api/client';

async function authenticateAndFetchProfile() {
    const client = new DokifyApiClient({ clientId: 'my-app-client' });

    try {
        // 1. Start the device flow
        const deviceStart = await client.startDeviceFlow();
        console.log(`Please go to ${deviceStart.verification_url} and enter code: ${deviceStart.user_code}`);

        // 2. Poll for token
        let tokenResponse;
        while (true) {
            await new Promise(resolve => setTimeout(resolve, deviceStart.interval * 1000)); // Wait for the specified interval
            tokenResponse = await client.pollToken(deviceStart.device_code);

            if (tokenResponse.token_type === 'Bearer') { // Check if the token is successfully obtained
                client.setToken(tokenResponse.access_token);
                console.log('Authentication successful!');
                break;
            } else if (tokenResponse.error === 'authorization_pending') {
                console.log('Waiting for authorization...');
            } else {
                throw new Error(`Token polling failed: ${tokenResponse.error}`);
            }
        }

        // 3. Fetch user profile
        const userProfile = await client.getMe();
        console.log('User Profile:', userProfile);

    } catch (error) {
        console.error('An error occurred:', error);
    }
}

// To run this example:
// authenticateAndFetchProfile();
```

## Pitfalls and Considerations

*   **Configuration Loading:** The `DokifyApiClient` relies on `loadConfig()` from `../config.js`. Ensure this configuration file is correctly set up and accessible.
*   **Environment Variables:** Be mindful of the order of precedence for `baseUrl` and `clientId`. Environment variables can override constructor parameters, which might lead to unexpected behavior if not managed carefully.
*   **Token Management:** The `token` can be `null`. Any API calls requiring authentication will fail if a valid token is not set. The `setToken` method is crucial for managing the token's lifecycle.
*   **Error Handling:** The provided code includes basic error handling for API requests (`!res.ok`). Robust applications should implement more comprehensive error handling strategies to manage network issues, API errors, and invalid responses.
*   **Device Flow Polling:** The `startDeviceFlow` method is only the first step. A subsequent polling mechanism (e.g., a `pollToken` method, not shown in the excerpt) is required to retrieve the actual access token. The example illustrates this polling pattern.
*   **Security:** When dealing with API tokens, ensure they are handled securely and not exposed in client-side code or insecure environments.

## Related Files

*   `src/config.ts`: This file is responsible for loading configuration settings that the `DokifyApiClient` utilizes.
*   `src/api/types.ts`: This file defines the TypeScript types for the various API responses, ensuring type safety when working with the `DokifyApiClient`.

---
Generated: 2025-10-26T03:11:36.173Z  •  Version: v1
