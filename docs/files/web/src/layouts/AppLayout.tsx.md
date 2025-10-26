---
path: web/src/layouts/AppLayout.tsx
chunkCount: 1
entities:
  - AppLayout
  - active
  - onChange
dependenciesPreview:
  - import React from 'react';
  - "import { AppShell, Burger, Group, NavLink, Title } from '@mantine/core';"
  - "import { Link, useLocation } from 'react-router-dom';"
  - "import { getToken, clearToken } from '../lib/api';"
  - import logo from '../public/dokify.png';
version: 1
generated_at: "2025-10-26T03:11:46.427Z"
---
# AppLayout Component (`web/src/layouts/AppLayout.tsx`)

## Purpose

The `AppLayout` component serves as the primary layout structure for the authenticated sections of the application. It provides a consistent and responsive shell that includes a header, a navigation bar (navbar), and a main content area. This layout is responsible for managing the application's authentication state, facilitating navigation between core application routes, and conditionally rendering features that are only accessible to authenticated users. The navbar features a burger menu that collapses on smaller screen sizes.

## Key APIs/Classes/Functions

*   **`AppLayout` (React Functional Component):** The main component that orchestrates the layout. It accepts `children` as a `React.ReactNode` to render the content within the main area.
*   **`AppShell` (Mantine UI):** A fundamental layout component from the Mantine UI library, providing the overall structure for headers, sidebars, and main content.
*   **`Burger` (Mantine UI):** A toggle component used to open and close the mobile navigation menu.
*   **`Group` (Mantine UI):** A utility component for arranging elements horizontally with spacing.
*   **`NavLink` (Mantine UI):** A component for creating navigation links within the navbar.
*   **`Title` (Mantine UI):** Used for displaying the application's title or logo.
*   **`Link` (React Router DOM):** Used for client-side navigation between different routes in the application.
*   **`useLocation` (React Router DOM):** A hook to access the current location object, allowing the component to determine the active navigation link.
*   **`getToken`, `clearToken` (from `../lib/api`):** Utility functions to interact with the authentication token stored in local storage or a similar mechanism. These are crucial for managing the `isAuthed` state.

## Inputs and Outputs

*   **Inputs:**
    *   `children`: `React.ReactNode` - The content that will be rendered within the main area of the layout. This is what appears between the header and the navbar.
*   **Outputs:**
    *   A React element representing the application's main layout, including the header, navbar, and the provided `children` in the main content area.

## Invariants

*   The `AppShell` component is always present, defining the fundamental layout structure.
*   The header, with a fixed height of 56, is always visible.
*   The navbar has a defined width (220) and a breakpoint (`sm`) for responsiveness.
*   The authentication state (`isAuthed`) is derived from the presence of an authentication token.
*   The `active` function correctly identifies the currently active navigation link based on the `location.pathname`.

## Error Handling

While explicit error handling for network requests or component rendering failures isn't directly visible within this snippet, the component relies on the `getToken` function. If `getToken` were to fail or return an unexpected value, it might affect the initial `isAuthed` state. The `window.addEventListener('dok:auth-changed', onChange)` suggests a mechanism for reacting to external authentication status changes, which could implicitly handle some error scenarios by re-evaluating the authentication state.

## Dependencies

*   **`react`:** For building the user interface.
*   **`@mantine/core`:** A popular React component library providing UI elements like `AppShell`, `Burger`, `Group`, `NavLink`, and `Title`.
*   **`react-router-dom`:** For managing client-side routing and navigation.
*   **`../lib/api`:** Contains utility functions for authentication token management (`getToken`, `clearToken`).
*   **`../public/dokify.png`:** The application's logo image.

## Examples

Imagine a user navigating through the application:

1.  **Initial Load:** When the `AppLayout` component mounts, it checks for an authentication token using `getToken()`. If a token exists, `isAuthed` is initialized to `true`. The `AppShell` renders with its header and navbar.
2.  **Authentication Status Change:** If another part of the application (or an external event) triggers a `dok:auth-changed` event (e.g., a successful login or logout), the `onChange` function within the `useEffect` hook will be called. This function re-checks `getToken()` and updates the `isAuthed` state, causing the UI to re-render if necessary (e.g., showing/hiding authenticated routes).
3.  **Navigation:** When a user clicks on a `NavLink` (e.g., "Projects"), `react-router-dom`'s `Link` component handles the navigation. The `useLocation` hook updates, and the `active` function will correctly highlight the "Projects" `NavLink` in the navbar.
4.  **Mobile View:** On a small screen, the navbar will be collapsed. Clicking the `Burger` icon will set the `opened` state to `true`, expanding the navbar. Clicking the burger again will collapse it.

## Pitfalls

*   **Global Event Listener:** The use of `window.addEventListener('dok:auth-changed', onChange)` relies on other parts of the application dispatching this custom event correctly. If the event is not fired or dispatched with the wrong name, the authentication state might not update as expected.
*   **Token Expiration:** This component primarily checks for the *presence* of a token. It doesn't inherently handle token expiration logic, which would typically be managed by the API calls made by functions within `../lib/api`.
*   **Styling:** The hardcoded background and text colors (`styles={{ main: { background: 'var(--bg)', color: 'var(--text)' } }}`) and header background (`style={{ background: '#0a0a0a', borderBottom: '1px so` ) might need to be made more dynamic or configurable for better theming.
*   **Authentication Guard:** While `AppLayout` manages the `isAuthed` state, the actual protection of routes that should *only* be accessible when authenticated would be implemented in higher-level route definitions or within the components rendered by `children`.

## Related Files

*   **`../lib/api.ts`:** This file is crucial as it contains the `getToken` and `clearToken` functions, which are fundamental to the authentication state management within `AppLayout`.
*   **`web/src/pages/` (and similar):** Components within the `pages` directory will likely be rendered as the `children` of `AppLayout`, forming the core content areas of the authenticated application.
*   **`web/src/App.tsx` (or main routing file):** This file would likely be responsible for setting up `react-router-dom` and integrating `AppLayout` into the overall application structure, defining which routes render within `AppLayout`.

---
Generated: 2025-10-26T03:11:51.905Z  •  Version: v1
