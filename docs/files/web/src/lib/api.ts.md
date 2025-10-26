---
path: web/src/lib/api.ts
chunkCount: 1
entities:
  - API
  - getToken
  - setToken
  - clearToken
  - api
dependenciesPreview:
version: 1
generated_at: "2025-10-26T03:11:47.771Z"
---
# API Client Utilities (`web/src/lib/api.ts`)

This file provides essential utilities for interacting with the Dokify backend API from the web application. It handles API base URL configuration, token management for authentication, and a robust fetch wrapper to simplify making authenticated requests.

## Purpose

The primary goal of this module is to abstract away the complexities of API communication. It ensures that all outgoing requests are properly authenticated with a Bearer token stored in `localStorage`, and it provides a consistent way to handle API responses, including error management.

## Key APIs/Classes/Functions

### Token Management

*   **`getToken(): string | null`**: Retrieves the authentication token from `localStorage`. Returns the token string if found, otherwise `null`.
*   **`setToken(token: string)`**: Stores a given authentication token in `localStorage` under the key `dokify_token`.
*   **`clearToken()`**: Removes the authentication token from `localStorage`. This is typically called upon user logout.

### API Fetch Wrapper

*   **`api(path: string, init: RequestInit = {})`**: This is the core function for making API requests.
    *   **Purpose**: It constructs the full API endpoint URL, automatically appends the authentication Bearer token (if available) to the request headers, and handles basic response validation.
    *   **Inputs**:
        *   `path (string)`: The API endpoint path (e.g., `/users`, `/items/:id`).
        *   `init (RequestInit)`: An optional object containing standard `fetch` options like `method`, `body`, and `headers`. Any custom headers provided here will be merged with the default ones.
    *   **Outputs**:
        *   `Promise<any>`: A Promise that resolves with the JSON response from the API.
        *   `Promise<Error>`: Throws an error if the API request fails (i.e., `res.ok` is false). The error message will contain the HTTP status code.

## Configuration

The API base URL is dynamically configured. It first attempts to read the `VITE_DOKIFY_API_BASE` environment variable. If this variable is not set, it defaults to `http://127.0.0.1:4000`. This allows for easy switching between development and production API endpoints.

## Invariants

*   The `API` base URL is established at module load time.
*   When an authentication token exists in `localStorage`, it is always included in the `Authorization: Bearer <token>` header for `api` requests.
*   All successful API responses are expected to be JSON and will be parsed accordingly.

## Error Handling

The `api` function includes basic error handling:
*   If the `fetch` request itself fails (e.g., network error), a standard JavaScript `Error` will be thrown.
*   If the server responds with a non-successful HTTP status code (i.e., `!res.ok`), an `Error` is thrown, including the status code in the error message. More specific error handling for different status codes (e.g., 401, 404) would typically be handled by the caller of the `api` function.

## Dependencies

*   **`localStorage`**: Used for storing and retrieving authentication tokens.
*   **`fetch`**: The native browser API used for making HTTP requests.
*   **`import.meta.env.VITE_DOKIFY_API_BASE`**: An environment variable used to configure the API base URL. This implies that a build tool like Vite is being used.

## Examples

### Retrieving Data

```typescript
import { api } from './api';

async function fetchUserData() {
    try {
        const user = await api('/users/me');
        console.log('User data:', user);
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }
}
```

### Creating Data

```typescript
import { api } from './api';

async function createUser(userData: any) {
    try {
        const newUser = await api('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        console.log('New user created:', newUser);
    } catch (error) {
        console.error('Failed to create user:', error);
    }
}
```

### Handling Authentication Token

```typescript
import { setToken, getToken, clearToken } from './api';

// After successful login
const authToken = 'your-received-token';
setToken(authToken);

// In another part of the app
const currentToken = getToken();
if (currentToken) {
    console.log('User is logged in.');
}

// Upon logout
clearToken();
```

## Pitfalls

*   **No Automatic JSON Parsing on Error**: The `api` function only calls `res.json()` on successful responses (`res.ok`). If an API returns an error with a JSON body, the caller will need to manually handle parsing that error response if the error message itself is not sufficient.
*   **Client-Side Token Storage**: Storing authentication tokens in `localStorage` is common but has security implications. It's vulnerable to Cross-Site Scripting (XSS) attacks. For higher security requirements, consider using HTTP-only cookies.
*   **Limited Error Detail**: The current error handling only throws the HTTP status code. For more detailed error debugging, the API could be modified to return more specific error messages from the server, and the `api` function could be enhanced to capture and propagate them.

## Related Files

*   **`src/App.tsx` / Other UI Components**: These files will likely import and use the `api` function to fetch data and send updates to the backend.
*   **`src/hooks/useAuth.ts` (or similar)**: This file might manage the application's authentication state, utilizing `getToken`, `setToken`, and `clearToken` to synchronize the UI with the user's logged-in status.
*   **`.env` files**: These files are crucial for defining the `VITE_DOKIFY_API_BASE` variable, especially in different environments (development, staging, production).

---
Generated: 2025-10-26T03:11:53.015Z  •  Version: v1
