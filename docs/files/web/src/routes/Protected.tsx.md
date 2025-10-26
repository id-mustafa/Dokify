---
path: web/src/routes/Protected.tsx
chunkCount: 1
entities:
  - RequireAuth
  - RedirectIfAuthed
dependenciesPreview:
  - import React from 'react';
  - "import { Navigate, useLocation } from 'react-router-dom';"
  - "import { getToken } from '../lib/api';"
version: 1
generated_at: "2025-10-26T03:11:53.016Z"
---
# Route Protection Components (`web/src/routes/Protected.tsx`)

This file provides essential React components for implementing authentication-based access control within a routing system, specifically designed to work with `react-router-dom`. It defines two key components: `RequireAuth` and `RedirectIfAuthed`.

## Purpose

The primary purpose of this file is to create reusable components that enforce authentication rules for different routes in a React application.

*   **`RequireAuth`**: This component ensures that a user must be authenticated to access a particular route. If the user is not authenticated, they will be redirected to the login page, with their intended destination saved so they can be redirected back after logging in.
*   **`RedirectIfAuthed`**: This component is designed for routes that should only be accessible to unauthenticated users (e.g., login or signup pages). If an authenticated user attempts to access such a route, they will be redirected to a predefined authenticated route (e.g., `/projects`).

## Key APIs and Components

### `RequireAuth`

This component acts as a gatekeeper for protected routes.

*   **Purpose**: To render its `children` only if the user is authenticated. Otherwise, it redirects the user to the login page.
*   **Inputs**:
    *   `children` (`React.ReactNode`): The content that should be rendered if the user is authenticated.
*   **Outputs**:
    *   If authenticated: Renders the provided `children`.
    *   If not authenticated: Renders a `Navigate` component to redirect to `/login`.
*   **Logic**:
    1.  It retrieves an authentication token using `getToken()`.
    2.  It uses `useLocation()` to capture the current URL.
    3.  If no `token` is found, it renders `<Navigate to="/login" replace state={{ from: loc.pathname }} />`. The `replace` prop ensures that the login page replaces the current history entry, preventing users from navigating back to the protected page after logging in. The `state` prop stores the original intended path for post-login redirection.
    4.  If a `token` exists, it simply renders the `children`.
*   **Invariants**:
    *   Requires a functioning `getToken` function to determine authentication status.
    *   Assumes a `/login` route exists for unauthenticated users.
    *   Assumes a `useLocation` hook from `react-router-dom` is available.

### `RedirectIfAuthed`

This component is used to prevent authenticated users from accessing public pages.

*   **Purpose**: To render its `children` only if the user is *not* authenticated. If the user is already authenticated, they are redirected away from the current route.
*   **Inputs**:
    *   `children` (`React.ReactNode`): The content that should be rendered if the user is unauthenticated.
*   **Outputs**:
    *   If unauthenticated: Renders the provided `children`.
    *   If authenticated: Renders a `Navigate` component to redirect to `/projects`.
*   **Logic**:
    1.  It retrieves an authentication token using `getToken()`.
    2.  If a `token` is found (meaning the user is authenticated), it renders `<Navigate to="/projects" replace />`. The `replace` prop is used here as well to prevent users from navigating back to the public page they were redirected from.
    3.  If no `token` exists, it renders the `children`.
*   **Invariants**:
    *   Requires a functioning `getToken` function to determine authentication status.
    *   Assumes a `/projects` route exists as a default landing page for authenticated users.
    *   Assumes a `useLocation` hook from `react-router-dom` is available (though not directly used in the `RedirectIfAuthed` logic, it's part of the import).

## Error Handling

These components do not explicitly define custom error handling logic for scenarios like failed token retrieval. They rely on the `getToken` function to return a falsy value (e.g., `null`, `undefined`, or an empty string) if the token is missing or invalid. The redirection logic then implicitly handles the "error" of an unauthorized access attempt.

## Dependencies

*   **`react`**: For defining React components.
*   **`react-router-dom`**:
    *   `Navigate`: For programmatic navigation.
    *   `useLocation`: To get the current location and store it for redirection.
*   **`../lib/api`**:
    *   `getToken`: A function responsible for retrieving the authentication token. The implementation of `getToken` is crucial for the correct functioning of these components.

## Examples

### Using `RequireAuth` in `react-router-dom`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RequireAuth } from './web/src/routes/Protected';
import LoginPage from './LoginPage';
import ProjectsPage from './ProjectsPage';
import DashboardPage from './DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/projects"
          element={
            <RequireAuth>
              <ProjectsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}
```

In this example, accessing `/projects` or `/dashboard` will first pass through `RequireAuth`. If the user is not logged in, they'll be sent to `/login`.

### Using `RedirectIfAuthed` in `react-router-dom`

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RedirectIfAuthed } from './web/src/routes/Protected';
import LoginPage from './LoginPage';
import LandingPage from './LandingPage'; // A page for unauthenticated users

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <LoginPage />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/"
          element={
            <RedirectIfAuthed>
              <LandingPage />
            </RedirectIfAuthed>
          }
        />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}
```

Here, if a user is already logged in, attempting to navigate to `/login` or `/` will redirect them to `/projects` (as defined in `RedirectIfAuthed`).

## Pitfalls

*   **Reliance on `getToken`**: The correct functioning of both components heavily depends on a robust and accurate `getToken` implementation. If `getToken` has issues (e.g., doesn't clear expired tokens), these components might not behave as expected.
*   **Hardcoded Redirects**: The redirect destinations (`/login` and `/projects`) are hardcoded. For more complex applications, these might need to be configurable or derived from application state.
*   **Client-Side Only**: These are client-side route protections. They do not provide server-side security. Sensitive data should *always* be protected on the backend, regardless of client-side routing.
*   **State Preservation**: While `RequireAuth` saves the `from` location, the mechanism for actually performing the redirect *back* to that location after successful login needs to be implemented in the `LoginPage` component.

## Related Files

*   **`../lib/api.ts`**: This file is expected to contain the `getToken` function, which is a critical dependency for `Protected.tsx`.
*   **`react-router-dom`**: The core routing library used for navigation and location awareness.
*   **Login and Protected Page Components**: Components like `LoginPage.tsx`, `ProjectsPage.tsx`, and `DashboardPage.tsx` would utilize these protection components to define their access requirements.

---
Generated: 2025-10-26T03:11:58.804Z  •  Version: v1
