---
path: web/src/pages/Login.tsx
chunkCount: 1
entities:
  - Login
  - apiBase
  - onSubmit
dependenciesPreview:
  - "import React, { useEffect, useState } from 'react';"
  - "import { api, setToken } from '../lib/api';"
  - "import { Button, Card, TextInput, PasswordInput, Title, Text, SegmentedControl, Group } from '@mantine/core';"
  - import logo from '../public/dokify.png';
version: 1
generated_at: "2025-10-26T03:11:50.114Z"
---
# `Login.tsx` - User Authentication and Registration Page

This file defines the `Login` React component, which serves as the primary user interface for authentication and registration within the application. It supports both traditional email/password-based authentication and OAuth flows for GitHub and Google. Additionally, it handles the capture of OAuth callback tokens and manages device flow approvals for CLI/IDE integrations, ultimately redirecting authenticated users to the projects dashboard.

## Purpose

The `Login` component provides a unified interface for users to:

*   **Log in** using their email and password.
*   **Register** for a new account with email and password.
*   **Authenticate via OAuth** using GitHub or Google.
*   **Capture authentication tokens** received from OAuth redirects.
*   **Approve device flow requests**, enabling CLI and IDE integrations.
*   **Redirect** successfully authenticated users to the main application dashboard.

## Key APIs and Functions

*   **`Login()` (React Component):** The main functional component that renders the entire login/registration interface.
*   **`useState()` hooks:** Used extensively for managing the component's internal state:
    *   `name`: Stores the user's name for registration.
    *   `email`: Stores the user's email address for both login and registration.
    *   `password`: Stores the user's password for both login and registration.
    *   `error`: Stores any error messages to be displayed to the user.
    *   `loading`: A boolean indicating whether an authentication request is in progress.
    *   `mode`: Controls whether the component is in 'login' or 'register' mode.
    *   `success`: A boolean indicating if a token was successfully captured.
*   **`useEffect()` hook:**
    *   **OAuth Token Capture:** This hook runs on component mount and checks the URL's hash (`window.location.hash`) for an OAuth token (e.g., `#token=...`). If found, it decodes and sets the token using `setToken` from `../lib/api` and sets the `success` state to `true`.
    *   **Device Flow Approval:** If an OAuth token is captured, this effect also checks for a `device_code` parameter in the URL (`window.location.search`). If present, it signifies an attempt to approve a device flow for CLI/IDE integrations. The component then attempts to use the captured token to approve this device flow.
*   **`api.login()` and `api.register()` (from `../lib/api`):** These functions are responsible for making actual API calls to the backend for user login and registration respectively.
*   **`setToken()` (from `../lib/api`):** This function is used to store the authentication token globally (likely in local storage or application context) after a successful login or OAuth callback.
*   **`onSubmit()`:** This function orchestrates the submission logic based on the current `mode` (login or register). It calls either `api.login()` or `api.register()` with the appropriate credentials and handles the response, including setting tokens, displaying errors, or redirecting.

## Inputs and Outputs

### Inputs:

*   **User Input:**
    *   Email address
    *   Password
    *   Name (for registration)
*   **URL Parameters:**
    *   `token`: Captured from the URL hash for OAuth callbacks.
    *   `device_code`: Used to approve device flow requests.

### Outputs:

*   **User Interface:**
    *   Login/registration form fields.
    *   Error messages.
    *   Loading indicators.
    *   Success indicators.
    *   OAuth provider buttons.
*   **Application State:**
    *   Authentication token set via `setToken()`.
    *   User redirected to the projects dashboard upon successful authentication.

## Invariants

*   When in 'login' mode, the `name` input field is not displayed.
*   When in 'register' mode, the `name` input field is required.
*   An error message is displayed if authentication or registration fails.
*   A loading indicator is shown while authentication or registration is in progress.
*   Upon successful authentication (via email/password or OAuth), the user's session is established, and they are redirected.

## Error Handling

The component handles errors in the following ways:

*   **API Errors:** Errors returned from `api.login()` or `api.register()` are caught and stored in the `error` state, which is then displayed to the user.
*   **OAuth Token Capture Errors:** While the code for handling errors during token decoding and `setToken` calls is truncated, it's implied that such errors would be caught and potentially logged or displayed.
*   **Device Flow Approval Errors:** Similarly, errors during the device flow approval process would be handled, though specific details are not shown in the excerpt.
*   **Form Validation:** Basic validation for required fields like email and password is likely handled implicitly by the `@mantine/core` components or within the `onSubmit` logic.

## Dependencies

*   **`react`:** For building the component.
*   **`react-dom`:** For rendering React components.
*   **`../lib/api`:** Provides the `api` object for making backend requests and `setToken` for managing authentication tokens.
*   **`@mantine/core`:** A popular React UI library providing pre-built components like `Button`, `Card`, `TextInput`, `PasswordInput`, `Title`, `Text`, `SegmentedControl`, and `Group` for a consistent and accessible UI.
*   **`../public/dokify.png`:** The application logo, likely displayed on the login page.

## Examples

**1. User Logging In:**

A user enters their email and password and clicks the "Login" button. The `onSubmit` function is triggered, calling `api.login()`. If successful, the token is set, and the user is redirected.

**2. User Registering:**

A user switches to "Register" mode, enters their name, email, and password, and clicks "Register". The `onSubmit` function calls `api.register()`. Upon success, the user is typically logged in automatically and redirected.

**3. OAuth Callback (e.g., GitHub):**

A user clicks a "Login with GitHub" button, is redirected to GitHub for authentication, and then redirected back to the application with a token in the URL hash (e.g., `https://your-app.com/#token=your-github-token`). The `useEffect` hook captures this token, sets it using `setToken`, and marks `success` as true.

**4. CLI/IDE Device Flow Approval:**

After authenticating via OAuth, if a `device_code` is present in the URL, the `useEffect` hook attempts to use the captured OAuth token to approve that device flow, allowing a connected CLI or IDE to authenticate on behalf of the user.

## Pitfalls

*   **Security of Token Handling:** Ensure that `setToken` securely stores the token (e.g., using `localStorage` with appropriate security considerations or HTTP-only cookies if served from the same domain).
*   **Error Message Clarity:** Provide clear and actionable error messages to users to guide them in resolving issues.
*   **OAuth Redirect URIs:** Incorrectly configured redirect URIs on OAuth provider platforms can lead to users being unable to complete the authentication flow.
*   **Device Flow State Management:** If device flow approval fails or times out, the user experience might be confusing if not handled gracefully.
*   **URL Manipulation:** Malicious users could attempt to manipulate URL parameters to gain unauthorized access; robust backend validation is crucial.

## Related Files

*   **`../lib/api.ts`:** This file is a critical dependency, containing the `api` object for backend communication and the `setToken` function for managing authentication tokens. The `Login` component heavily relies on these for its core functionality.
*   **`@mantine/core`:** This UI library is used extensively for the visual elements of the login page, ensuring a consistent and accessible user experience.
*   **Navigation/Routing Components:** While not directly shown, this component will likely interact with routing mechanisms (e.g., `react-router-dom`) to handle the redirection to the projects dashboard upon successful authentication.

---
Generated: 2025-10-26T03:11:57.042Z  •  Version: v1
