---
path: src/api/types.ts
chunkCount: 1
entities:
dependenciesPreview:
version: 1
generated_at: "2025-10-26T03:11:31.927Z"
---
# `src/api/types.ts` - API Response Type Definitions

This file defines the TypeScript type exports for various API responses within the Dokify authentication flow. It specifies the expected structure and data types for responses related to device initialization, token exchange (both success and pending states), and user profile retrieval.

## Key Types

The primary purpose of this file is to provide clear and type-safe definitions for the data structures returned by specific API endpoints.

### `DeviceStartResponse`

This type represents the response received after initiating a device-based authentication flow. It contains information necessary for the user to verify their device.

-   **`device_code`** (`string`): A unique code for the device.
-   **`user_code`** (`string`): A human-readable code for the user to enter on another device.
-   **`verification_uri`** (`string`): The URI where the user should navigate to verify the device.
-   **`verification_uri_complete`** (`string`, optional): A complete verification URI, potentially including the `user_code`.
-   **`expires_in`** (`number`): The lifespan of the `device_code` and `user_code` in seconds.
-   **`interval`** (`number`, optional): The recommended interval in seconds for polling for token status.

### `TokenSuccessResponse`

This type defines the structure of a successful token response after the user has authorized the device.

-   **`access_token`** (`string`): The primary token used for authenticating API requests.
-   **`refresh_token`** (`string`, optional): A token used to obtain new `access_token`s without requiring re-authentication.
-   **`token_type`** (`'Bearer'`): The type of the token, which is always 'Bearer' for this API.
-   **`expires_in`** (`number`): The lifespan of the `access_token` in seconds.
-   **`scope`** (`string`, optional): The scopes granted with the `access_token`.

### `TokenPendingResponse`

This type represents the response when the token exchange is still pending authorization from the user.

-   **`error`** (`'authorization_pending' | 'slow_down' | 'expired_token' | 'access_denied' | 'invalid_request'`): The specific reason for the pending or failed token exchange.
    -   `authorization_pending`: The user has not yet completed the authorization step.
    -   `slow_down`: The polling rate is too high.
    -   `expired_token`: The device code has expired.
    -   `access_denied`: The user denied the authorization request.
    -   `invalid_request`: The request was malformed.
-   **`error_description`** (`string`, optional): A more detailed description of the error.
-   **`interval`** (`number`, optional): The recommended interval in seconds for the next polling request.

### `MeResponse`

This type represents the user's profile information, typically retrieved after successful authentication.

-   **`id`** (`string`): The unique identifier of the user.
-   **`email`** (`string`): The email address of the user.
-   **`name`** (`string`, optional): The name of the user.
-   **`org`** (`{ id: string; name: string }`, optional): An object containing the user's organization ID and name.

## Dependencies

This file has no external dependencies; it defines fundamental types used across the Dokify authentication API.

## Examples

### Device Initialization Response

```typescript
const deviceStartResponse: DeviceStartResponse = {
    device_code: "some_device_code",
    user_code: "ABCD-EFGH",
    verification_uri: "https://dokify.com/verify",
    verification_uri_complete: "https://dokify.com/verify?code=ABCD-EFGH",
    expires_in: 900, // 15 minutes
    interval: 5 // poll every 5 seconds
};
```

### Successful Token Response

```typescript
const tokenSuccessResponse: TokenSuccessResponse = {
    access_token: "eyJh...valid_token...",
    refresh_token: "eyJh...valid_refresh_token...",
    token_type: "Bearer",
    expires_in: 3600, // 1 hour
    scope: "read write"
};
```

### Pending Token Response

```typescript
const tokenPendingResponse: TokenPendingResponse = {
    error: "authorization_pending",
    error_description: "Please authorize this device on your computer.",
    interval: 5
};
```

### User Profile Response

```typescript
const meResponse: MeResponse = {
    id: "user-12345",
    email: "user@example.com",
    name: "Jane Doe",
    org: {
        id: "org-abcde",
        name: "Example Corp"
    }
};
```

## Pitfalls

*   **Optional Properties**: Pay close attention to optional properties (marked with `?`). Ensure your code handles cases where these might be `undefined`.
*   **Error Handling for Token Polling**: When polling for a token, the response can be either `TokenSuccessResponse` or `TokenPendingResponse`. Your logic must differentiate between these and handle the `error` field appropriately in `TokenPendingResponse`.
*   **Token Expiry**: Implement logic to handle token expiry. The `expires_in` fields indicate when tokens become invalid, and mechanisms like using `refresh_token` should be in place.

## Related Files

This file is a core part of the Dokify authentication API client. It is likely used in conjunction with files that:

*   Make HTTP requests to the authentication endpoints (e.g., `src/api/client.ts`).
*   Manage the authentication flow logic (e.g., `src/auth/index.ts`).
*   Store and retrieve authentication tokens (e.g., `src/storage/tokenStorage.ts`).

---
Generated: 2025-10-26T03:11:36.273Z  •  Version: v1
