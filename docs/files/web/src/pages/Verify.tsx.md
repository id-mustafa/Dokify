---
path: web/src/pages/Verify.tsx
chunkCount: 1
entities:
  - Verify
dependenciesPreview:
  - "import React, { useEffect, useState } from 'react';"
version: 1
generated_at: "2025-10-26T03:11:52.974Z"
---
# Verify Page Component (`web/src/pages/Verify.tsx`)

This document details the `Verify` React component, responsible for handling the device verification process.

## Purpose

The `Verify` component serves as the user interface for verifying a device's identity. It operates by:

1.  Extracting a `user_code` from the URL's query parameters.
2.  Sending this `user_code` to a backend API endpoint (`/v1/verify`) for verification.
3.  Displaying the verification status to the user, which can indicate success, validation errors (e.g., missing or invalid/expired codes), or network issues during the API call.

## Key APIs and Components

*   **`React`**: The core JavaScript library for building user interfaces.
*   **`useEffect`**: A React Hook used to perform side effects in function components. In this case, it's used to initiate the device verification process when the component mounts.
*   **`useState`**: A React Hook for adding state to function components. It's used here to manage the `status` message displayed to the user.
*   **`fetch` API**: Used to make HTTP requests to the backend API for verification.

## Inputs and Outputs

### Inputs

*   **`window.location.href`**: The component reads the URL of the current page. Specifically, it extracts the value of the `user_code` query parameter from this URL.
*   **`VITE_DOKIFY_API_BASE` Environment Variable**: This environment variable, prefixed with `VITE_`, is used to determine the base URL of the Dokify API. If it's not defined, it defaults to `http://127.0.0.1:4000`.

### Outputs

*   **User Interface**: The component renders a simple HTML structure with a title ("Dokify Device Verification") and a paragraph displaying the current `status` message.
*   **API Request**: An asynchronous `POST` request is sent to the backend API at `${API_BASE}/v1/verify`.

## Invariants

*   The component expects a `user_code` to be present in the URL query parameters. If it's missing, the status will be set to "Missing user_code".
*   The `status` state is initialized as an empty string.

## Error Handling

The component employs the following error handling mechanisms:

*   **Missing `user_code`**: If the `user_code` query parameter is not found in the URL, the `status` is set to "Missing user_code", and the API call is not made.
*   **API Response (Non-OK)**: If the `fetch` request completes but the HTTP response status code indicates an error (i.e., `!r.ok`), the `status` is set to "Invalid or expired code".
*   **Network Errors**: If the `fetch` request fails due to network issues (e.g., the server is unreachable), the `.catch()` block is executed, and the `status` is set to "Network error".

## Dependencies

*   **`react`**: For component structure and state management.
*   **`react-dom`**: (Implicitly, as it's a React application) For rendering the component to the DOM.
*   **Environment Variables**: Relies on `VITE_DOKIFY_API_BASE` to configure the API endpoint.

## Examples

When a user is directed to this page with a URL like:

`https://your-app.com/verify?user_code=abcdef123456`

The component will:

1.  Extract `abcdef123456` as the `user_code`.
2.  Send a `POST` request to `/v1/verify` with the body `{"user_code": "abcdef123456"}`.
3.  If the backend responds with a successful status, the user will see:
    ```
    Dokify Device Verification
    Approved! You can close this tab.
    ```
4.  If the backend responds with an error or the code is invalid, the user might see:
    ```
    Dokify Device Verification
    Invalid or expired code
    ```
5.  If there's a network problem, the user might see:
    ```
    Dokify Device Verification
    Network error
    ```

## Pitfalls

*   **Environment Variable Configuration**: Ensure that `VITE_DOKIFY_API_BASE` is correctly configured in the `.env` files or build environment. An incorrect or missing variable could lead to connection errors.
*   **URL Structure**: The component strictly relies on the `user_code` being a query parameter. Any deviation in the URL structure could lead to the "Missing user_code" error.
*   **API Changes**: The component is tightly coupled to the `/v1/verify` endpoint and expects a JSON response. Any changes to the API's URL, method, or response format will require modifications to this component.

## Related Files

*   **`web/src/App.tsx`**: Likely the parent component that routes to `/verify`.
*   **Backend API (`/v1/verify`)**: The server-side logic that handles the actual verification of the `user_code`. This component makes an API call to it.

---
Generated: 2025-10-26T03:11:56.996Z  •  Version: v1
