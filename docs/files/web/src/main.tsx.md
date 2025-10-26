---
path: web/src/main.tsx
chunkCount: 1
entities:
dependenciesPreview:
  - import React from 'react';
  - "import { createRoot } from 'react-dom/client';"
  - "import { AppRouter } from './AppRouter';"
  - import '@mantine/core/styles.css';
  - import '@mantine/notifications/styles.css';
  - import './theme.css';
  - "import { MantineProvider } from '@mantine/core';"
  - "import { Notifications } from '@mantine/notifications';"
version: 1
generated_at: "2025-10-26T03:11:47.866Z"
---
# `web/src/main.tsx` - Application Entry Point

This file serves as the main entry point for the React web application. It's responsible for initializing the React application within the browser's DOM, configuring essential UI providers, and rendering the top-level application router.

## Purpose

The primary goal of `main.tsx` is to:

1.  **Bootstrap the React Application**: It locates the root DOM element where the React application will be mounted.
2.  **Configure UI and Theming**: It sets up the `MantineProvider` to manage the application's UI components and theme. Specifically, it enforces a dark color scheme and sets 'gray' as the primary color for the theme.
3.  **Enable Notifications**: It integrates the `Notifications` component from Mantine to provide a consistent way to display user notifications, positioned at the top-right of the screen.
4.  **Render the Application Router**: It renders the `AppRouter` component, which is responsible for handling all application routing and displaying the appropriate components based on the URL.

## Key APIs and Components

*   **`document.getElementById('root')!`**: This standard DOM API is used to select the HTML element with the ID 'root' from the document. This is where the React application will be injected. The non-null assertion operator (`!`) indicates that we expect this element to always exist.
*   **`createRoot(container)`**: From `react-dom/client`, this function creates a React root to manage the DOM node.
*   **`container.render(...)`**: This method from the React root is used to render the React element tree into the specified DOM container.
*   **`MantineProvider`**: This component from `@mantine/core` is crucial for integrating Mantine's UI library. It provides access to the theme, styling utilities, and other Mantine features throughout the application.
    *   `defaultColorScheme="dark"`: This prop ensures that the application will default to a dark theme.
    *   `theme={{ primaryColor: 'gray' }}`: This prop customizes the application's theme, setting 'gray' as the primary color to be used for key UI elements.
*   **`Notifications`**: This component from `@mantine/notifications` enables the display of toast-like notifications.
    *   `position="top-right"`: This prop configures the default position where notifications will appear on the screen.
*   **`AppRouter`**: This is a custom component (presumably defined in `./AppRouter.tsx`) that handles the application's navigation and routing logic.

## Inputs

*   **DOM Element**: The application expects a single DOM element with the `id` attribute set to `'root'` to exist in the HTML file where this script is loaded.
*   **Configuration**: The `MantineProvider` is configured with:
    *   `defaultColorScheme`: set to `'dark'`.
    *   `theme.primaryColor`: set to `'gray'`.
*   **Notification Settings**: The `Notifications` component is configured with:
    *   `position`: set to `'top-right'`.

## Outputs

The primary output is the rendering of the entire React application within the DOM element identified by `'root'`. This includes the UI provided by Mantine, the notification system, and the routed views managed by `AppRouter`.

## Invariants

*   The DOM element with `id='root'` must exist. If it doesn't, `document.getElementById('root')` will return `null`, and the non-null assertion (`!`) will cause a runtime error.
*   The application will always start with a dark color scheme due to `defaultColorScheme="dark"`.

## Error Handling

The current implementation does not explicitly define custom error handling for initialization failures. However, if `document.getElementById('root')` fails to find the element, a runtime error will occur due to the non-null assertion (`!`). Errors within the `MantineProvider`, `Notifications`, or `AppRouter` components will be handled by React's default error boundary mechanisms or any specific error handling implemented within those components.

## Dependencies

*   **`react`**: Core React library for building user interfaces.
*   **`react-dom/client`**: For client-side rendering of React applications.
*   **`./AppRouter`**: The application's main routing component.
*   **`@mantine/core/styles.css`**: Base styles for Mantine UI components.
*   **`@mantine/notifications/styles.css`**: Styles for the Mantine notifications system.
*   **`./theme.css`**: Custom theme styles for the application.
*   **`@mantine/core`**: The main Mantine UI library.
*   **`@mantine/notifications`**: The Mantine notifications system.

## Examples

This file is the starting point of the application. Its execution is triggered automatically when the web page loads and the JavaScript bundle is executed. The code demonstrates the typical structure for initializing a React application with Mantine:

```typescript
// Find the root element in the DOM
const container = document.getElementById('root')!;

// Create a React root and render the application
createRoot(container).render(
    <MantineProvider defaultColorScheme="dark" theme={{ primaryColor: 'gray' }}>
        <Notifications position="top-right" />
        <AppRouter />
    </MantineProvider>
);
```

## Pitfalls

*   **Missing Root Element**: If the HTML file where this script is executed does not contain an element with `id="root"`, the application will crash at startup.
*   **Dependency Issues**: Ensure all specified dependencies are correctly installed and imported. Mismatched versions or missing packages can lead to runtime errors.
*   **Configuration Conflicts**: If other parts of the application or global styles try to override Mantine's `defaultColorScheme` or `primaryColor`, unexpected visual behavior might occur.

## Related Files

*   **`./AppRouter.tsx`**: This file defines the main routing structure of the application, determining which components are rendered based on the URL.
*   **`./theme.css`**: Contains custom CSS that likely complements or overrides Mantine's default theming.
*   **`@mantine/core/styles.css`**: The base stylesheet for Mantine's core components.
*   **`@mantine/notifications/styles.css`**: The stylesheet for Mantine's notification system.

---
Generated: 2025-10-26T03:11:52.677Z  •  Version: v1
