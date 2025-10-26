---
path: web/src/pages/Projects.tsx
chunkCount: 1
entities:
  - Projects
  - apiBase
  - refresh
  - create
dependenciesPreview:
  - "import React, { useEffect, useRef, useState } from 'react';"
  - "import { Link } from 'react-router-dom';"
  - "import { Card, Button, TextInput, Title, Text } from '@mantine/core';"
  - "import { api } from '../lib/api';"
version: 1
generated_at: "2025-10-26T03:11:51.906Z"
---
# Projects Page (`web/src/pages/Projects.tsx`)

## Purpose

The `Projects` component is a React page responsible for displaying a list of projects and enabling users to create new ones. It fetches project data from a backend API, maintains real-time updates for project lists using WebSockets, and provides a user interface for both viewing existing projects and initiating the creation of new ones.

## Key APIs and Functions

*   **`Projects` Component:** The main React component that orchestrates the display and management of projects.
*   **`refresh()` function:** This function is responsible for fetching the latest list of projects from the API. It's called on component mount and whenever a refresh is needed.
*   **WebSocket Integration:**
    *   Establishes a WebSocket connection to the backend API for real-time project updates.
    *   Subscribes to updates for all projects by sending a `subscribe` message with an empty `projectId`.
    *   Listens for incoming messages and updates the `projects` state when new or modified project data is received.
*   **`create()` function (implied by purpose and entities):** Although not explicitly shown in the provided excerpt, the component's purpose indicates a function to handle the creation of new projects, likely triggered by a user action and interacting with the API.

## State Management

The component utilizes React's `useState` hook to manage the following pieces of state:

*   **`projects` (`Project[]`):** An array to store the list of fetched projects. Each project object is expected to have at least `id`, `name`, and `slug` properties.
*   **`name` (`string`):** Stores the name of the new project being entered by the user in the input field.
*   **`loading` (`boolean`):** Indicates whether the initial project data is being fetched.

## WebSocket Handling

The component uses `useRef` to maintain a reference to the WebSocket connection (`wsRef`). This allows the WebSocket instance to persist across re-renders without being recreated.

*   **Connection Establishment:** A WebSocket connection is established to the API base URL, with the protocol switched to `ws` and the path appended with `/ws`.
*   **Subscription:** Upon successful WebSocket connection (`open` event), the component subscribes to all project updates by sending a message: `{ type: 'subscribe', projectId: '' }`.
*   **Message Handling:** The `message` event listener parses incoming JSON messages. If a message pertains to projects (e.g., contains `type: 'project'` and `projectId`), it updates the `projects` state accordingly to reflect real-time changes.

## Inputs and Outputs

*   **Inputs (User Interface):**
    *   A text input field for users to enter the name of a new project.
    *   A button to trigger the creation of a new project.
*   **Outputs (UI Display):**
    *   A list of existing projects, likely displayed as cards or links.
    *   Loading indicators while fetching project data.
*   **Environment Variable Input:**
    *   `VITE_DOKIFY_API_BASE`: An environment variable that specifies the base URL for the API. If not provided, it defaults to `http://127.0.0.1:4000`.

## Invariants

*   The `projects` state will always be an array of `Project` objects.
*   The `name` state will always be a string.
*   The `loading` state will be `true` during initial data fetching and `false` otherwise.
*   The WebSocket connection, if established, will attempt to maintain a live link for updates.

## Error Handling

The provided excerpt demonstrates basic error handling for WebSocket message parsing:

*   A `try...catch` block is used when parsing incoming WebSocket messages (`JSON.parse(String(ev.data))`). This prevents the application from crashing if a malformed JSON message is received. Further error handling for API requests or WebSocket connection failures would be expected in a complete implementation.

## Dependencies

*   **`react`:** For building the component.
*   **`react-router-dom`:** Used for navigation, specifically `Link` to navigate to individual project pages.
*   **`@mantine/core`:** A UI component library providing components like `Card`, `Button`, `TextInput`, `Title`, and `Text`.
*   **`../lib/api`:** A local module likely containing utility functions for interacting with the backend API.

## Examples

(Conceptual, based on the provided code and purpose)

1.  **Viewing Projects:** Upon loading the page, a list of existing projects will be displayed, each likely appearing as a clickable card or link leading to its dedicated page.
2.  **Creating a New Project:**
    *   The user types a project name (e.g., "My New App") into a text input.
    *   The user clicks a "Create Project" button.
    *   The component sends a request to the API to create the project.
    *   Upon successful creation, the `projects` list updates in real-time (via WebSocket or after a refresh) to include the new project.
3.  **Real-time Updates:** If another user creates or modifies a project while this page is open, the `projects` list on this page will automatically refresh to show the changes without requiring a manual page reload.

## Pitfalls and Considerations

*   **WebSocket Reconnection:** The current implementation does not explicitly show logic for handling WebSocket disconnections and automatic reconnections. This is a crucial aspect for robust real-time applications.
*   **API Error Handling:** While WebSocket message parsing has a `try...catch`, comprehensive error handling for API requests (e.g., project creation, initial fetch) is not detailed in the excerpt and should be implemented to provide user feedback on failures.
*   **Environment Variable Configuration:** Ensuring the `VITE_DOKIFY_API_BASE` environment variable is correctly set in different deployment environments is vital for the application to connect to the correct API.
*   **WebSocket Message Format:** The exact structure of WebSocket messages for project updates (e.g., `type: 'project'`, `action: 'created'/'updated'`) is assumed and should be clearly defined in the API specification.
*   **State Updates on WebSocket Message:** The logic for updating the `projects` state based on incoming WebSocket messages needs to be robust to handle additions, updates, and deletions correctly.

## Related Files

*   **`../lib/api`:** This file is a direct dependency and likely contains functions for making HTTP requests to the backend API, such as fetching projects and creating new ones.
*   **`src/pages/` directory:** This file resides within the `pages` directory, suggesting other page components (e.g., individual project pages) might exist here.
*   **`react-router-dom`:** Used for routing, indicating that this component is part of a larger client-side routing setup.

---
Generated: 2025-10-26T03:11:57.510Z  •  Version: v1
