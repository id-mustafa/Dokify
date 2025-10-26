---
path: web/src/pages/App.tsx
chunkCount: 1
entities:
  - App
dependenciesPreview:
  - import React from 'react';
  - "import { Button, Card, Title, Text } from '@mantine/core';"
  - "import { Link } from 'react-router-dom';"
  - "import { getToken } from '../lib/api';"
version: 1
generated_at: "2025-10-26T03:11:49.751Z"
---
# App Component (`web/src/pages/App.tsx`)

## Purpose

The `App` component serves as the **landing page** for the Dokify application. Its primary role is to present the product's value proposition, highlight key features, and provide **conditional navigation** based on the user's authentication status.

The landing page features a prominent "hero" section with a compelling title and description, accompanied by call-to-action buttons. Below this, it displays a grid of feature cards, visually showcasing the core capabilities of Dokify.

## Key APIs and Components

This component utilizes several external libraries and custom modules to render its content and functionality:

*   **`@mantine/core`**: This UI component library is extensively used for styling and interactive elements.
    *   `Button`: Renders clickable buttons, used for primary calls to action and navigation.
    *   `Card`: Provides a visually distinct container for grouping content, used for the hero section and individual feature cards.
    *   `Title`: Renders semantic headings, used for the main page title.
    *   `Text`: Displays textual content, used for descriptions and feature details.
*   **`react-router-dom`**: This library is used for declarative routing in React applications.
    *   `Link`: Renders anchor tags that facilitate client-side navigation between different routes without full page reloads.
*   **`../lib/api`**: This local module contains utility functions for interacting with the Dokify backend.
    *   `getToken`: This function is crucial for determining the user's authentication status. It's expected to return a token if the user is logged in, or a falsy value otherwise.

## Inputs

The `App` component's behavior is primarily driven by the **authentication state**.

*   **`authentication state from getToken()`**: The component calls the `getToken()` function to check if a valid authentication token exists. This input directly influences which navigation buttons are displayed.

## Outputs

The `App` component renders **JSX** to the browser, creating the visual structure and interactive elements of the landing page.

## Invariants

*   The `container` div will always have `paddingTop` set to `24px`.
*   The main `Card` in the hero section will always have a `shadow` of "xl", `padding` of "xl", and `radius` of "lg".
*   The hero `Card` will have a specific background gradient (`linear-gradient(180deg,#0a0a0a,#000000)`) and a border color (`#1f1f1f`).
*   The main `Title` will have a white color (`c="white"`) and a bottom margin of `12px`.
*   The descriptive `Text` will have a dimmed color (`c="dimmed"`) and a bottom margin of `24px`.

## Error Handling

The provided code excerpt does not explicitly demonstrate explicit error handling mechanisms for the `App` component itself. However, the reliance on `getToken()` implies that if this function fails or returns an unexpected value, it might lead to incorrect rendering of navigation buttons. Robust error handling for API calls should be implemented within the `getToken()` function or its callers.

## Dependencies

*   **React**: The core React library is a fundamental dependency for all React components.
*   **Mantine Core**: The `@mantine/core` library provides the foundational UI components used for styling and layout.
*   **React Router DOM**: `react-router-dom` is essential for managing navigation within the application.
*   **Dokify API Utilities**: The `../lib/api` module, specifically the `getToken` function, is a direct dependency for determining authentication status.

## Examples

**Scenario 1: User is not authenticated.**

When `getToken()` returns a falsy value (e.g., `null` or `undefined`), the `isAuthed` variable will be `false`. The `App` component will render:

*   A "Get started" button, linking to `/usage`.
*   A button to sign up or log in (the exact `to` path is truncated in the excerpt but implies an authentication-related route).

**Scenario 2: User is authenticated.**

When `getToken()` returns a truthy value (e.g., an authentication token), the `isAuthed` variable will be `true`. The `App` component will render:

*   A "Get started" button, linking to `/usage`.
*   A "View projects" button, linking to `/projects`, allowing authenticated users to access their projects.

## Pitfalls

*   **`getToken()` Reliability**: The component heavily relies on the `getToken()` function to accurately reflect the authentication status. If `getToken()` has issues (e.g., fails to retrieve a valid token from local storage or cookies), the authentication logic will be flawed, potentially preventing authenticated users from accessing features or showing incorrect navigation options to unauthenticated users.
*   **Incomplete Authentication Path**: The `else` block for the authenticated user's button (`<Button component={Link} to="`) is truncated in the provided excerpt. It's crucial to ensure this path correctly directs users to their intended destination (e.g., a dashboard or projects list).
*   **Styling Dependencies**: The component relies on specific class names like `"container"` and inline styles. Changes to these could impact the visual presentation.

## Related Files

*   **`../lib/api.ts`**: This file likely contains the implementation of the `getToken()` function and potentially other API-related utilities.
*   **`web/src/pages/`**: Other files within this directory will likely represent other pages of the Dokify application, such as `/usage` and `/projects`, which are linked from the `App` component.
*   **`@mantine/core`**: The UI components used here are part of the Mantine library. Refer to Mantine's documentation for details on their usage and customization.
*   **`react-router-dom`**: The routing capabilities are provided by this library. Consult `react-router-dom` documentation for advanced routing concepts.

---
Generated: 2025-10-26T03:11:54.544Z  •  Version: v1
