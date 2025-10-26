---
path: web/src/AppRouter.tsx
chunkCount: 1
entities:
  - AppRouter
dependenciesPreview:
  - import React from 'react';
  - "import { createBrowserRouter, RouterProvider } from 'react-router-dom';"
  - "import { App } from './pages/App';"
  - "import { Verify } from './pages/Verify';"
  - "import { Login } from './pages/Login';"
  - "import { Projects } from './pages/Projects';"
  - "import { ProjectDocs } from './pages/ProjectDocs';"
  - "import { AppLayout } from './layouts/AppLayout';"
  - "import { Usage } from './pages/Usage';"
  - "import { Account } from './pages/Account';"
version: 1
generated_at: "2025-10-26T03:11:45.880Z"
---
# AppRouter.tsx

This file configures the client-side routing for the Dokify web application using React Router. It defines all application routes, their corresponding page components, layouts, and authentication protection rules.

## Purpose

The primary purpose of `AppRouter.tsx` is to establish a declarative routing structure for the Dokify application. It maps URLs to specific React components, ensuring that users are directed to the correct views based on their navigation. This includes handling public routes, authenticated routes, and routes that redirect based on authentication status.

## Key APIs and Components

*   **`createBrowserRouter`**: This function from `react-router-dom` is used to create a browser-based router instance. It allows you to define your routes using a declarative array of route objects.
*   **`RouterProvider`**: This component from `react-router-dom` makes the router instance available to your application. It should be rendered at the top level of your application.
*   **`AppLayout`**: This is a custom layout component that wraps multiple routes. It likely provides common UI elements such as navigation bars, footers, or sidebars, maintaining a consistent look and feel across different application sections.
*   **`RequireAuth`**: This is a higher-order component (HOC) or a wrapper component that enforces authentication. If a user is not authenticated, they will be redirected away from routes protected by `RequireAuth`.
*   **`RedirectIfAuthed`**: This HOC or wrapper component handles redirection for routes that should only be accessible to unauthenticated users. If a user is already authenticated, they will be redirected elsewhere (e.g., to the dashboard).

## Routes Defined

The following routes are configured:

*   `/login`: Renders the `Login` page, protected by `RedirectIfAuthed` to prevent already logged-in users from accessing it.
*   `/verify`: Renders the `Verify` page.
*   `/`: The root path, which renders the `App` page within the `AppLayout`.
*   `/usage`: Renders the `Usage` page within the `AppLayout`.
*   `/usage/:section`: A dynamic route for the `Usage` page, allowing for specific sections to be displayed within the `AppLayout`.
*   `/projects`: Renders the `Projects` page, requiring authentication via `RequireAuth` and using the `AppLayout`.
*   `/projects/:id`: A dynamic route to display specific project documentation (`ProjectDocs`), requiring authentication and using the `AppLayout`.
*   `/account`: Renders the `Account` page, requiring authentication and using the `AppLayout`.

## Inputs and Outputs

*   **Inputs**: This file primarily takes route definitions as input, specifying the `path` and the `element` (React component) to render for each path. It also implicitly relies on the availability of page components (like `App`, `Login`, `Projects`) and layout components (`AppLayout`), as well as authentication wrapper components (`RequireAuth`, `RedirectIfAuthed`).
*   **Outputs**: The primary output is a configured `BrowserRouter` instance that can be used by `RouterProvider` to manage application navigation.

## Invariants

*   The `AppLayout` component is consistently used for authenticated and public routes that are part of the main application flow (excluding `/login` and `/verify`).
*   Routes requiring user authentication are wrapped in `RequireAuth`.
*   Routes intended for unauthenticated users (like login) are protected by `RedirectIfAuthed`.

## Error Handling

While `AppRouter.tsx` itself doesn't explicitly define custom error boundary components for route rendering, it relies on the underlying React Router and React mechanisms for error handling. If a component within a route fails to render, React's default error handling or any higher-level error boundaries in the application would take effect.

The structure implies that authentication failures handled by `RequireAuth` and `RedirectIfAuthed` will trigger programmatic redirects, rather than rendering error messages directly.

## Dependencies

*   **`react`**: For building the user interface components.
*   **`react-router-dom`**: The core library for client-side routing in React applications.
*   **Local Components**:
    *   `./pages/App`
    *   `./pages/Verify`
    *   `./pages/Login`
    *   `./pages/Projects`
    *   `./pages/ProjectDocs`
    *   `./layouts/AppLayout`
    *   `./pages/Usage`
    *   `./pages/Account`
    *   `./routes/Protected` (specifically `RequireAuth` and `RedirectIfAuthed`)

## Examples

To use this router, `AppRouter.tsx` is typically rendered within the main `App.tsx` or `index.tsx` file like so:

```typescript
// In your main application entry point (e.g., index.tsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter } from './AppRouter'; // Assuming AppRouter is exported from AppRouter.tsx

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
```

And the `AppRouter` component itself would export the `RouterProvider`:

```typescript
// AppRouter.tsx (simplified export for example)
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// ... other imports

const routes = [
    // ... route definitions as in the chunk
];

const router = createBrowserRouter(routes);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
```

## Pitfalls

*   **Incorrect Export**: If `AppRouter` is not correctly exported from this file, the main application entry point will not be able to import and use it.
*   **Missing Dependencies**: Ensure all imported page and layout components are correctly located and exported from their respective files.
*   **Logic Errors in Protected Routes**: Bugs within `RequireAuth` or `RedirectIfAuthed` could lead to unintended access or redirection issues.
*   **Route Order**: While `createBrowserRouter` handles exact path matching well, complex nested routes or a large number of routes could potentially lead to unexpected behavior if not carefully ordered.
*   **Dynamic Route Parameter Mismatch**: If the `:id` or `:section` parameters are not correctly handled by their respective components (`ProjectDocs`, `Usage`), the application might not display the intended data.

## Related Files

*   `./pages/App.tsx`: The main landing page component.
*   `./pages/Verify.tsx`: Component for handling email verification or similar.
*   `./pages/Login.tsx`: Component for user authentication.
*   `./pages/Projects.tsx`: Component listing user projects.
*   `./pages/ProjectDocs.tsx`: Component for displaying documentation for a specific project.
*   `./layouts/AppLayout.tsx`: The common layout structure for most application pages.
*   `./pages/Usage.tsx`: Component for displaying usage information.
*   `./pages/Account.tsx`: Component for managing user account settings.
*   `./routes/Protected.tsx`: Contains the `RequireAuth` and `RedirectIfAuthed` logic for route protection.

---
Generated: 2025-10-26T03:11:51.736Z  •  Version: v1
