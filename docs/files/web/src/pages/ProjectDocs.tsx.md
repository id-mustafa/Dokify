---
path: web/src/pages/ProjectDocs.tsx
chunkCount: 1
entities:
  - ProjectDocs
  - refresh
  - toggle
  - renderTree
dependenciesPreview:
  - "import React, { useEffect, useMemo, useState } from 'react';"
  - "import { useParams, Link } from 'react-router-dom';"
  - "import { api } from '../lib/api';"
  - "import { Card, TextInput, Title, Text, NavLink } from '@mantine/core';"
  - "import ReactMarkdown from 'react-markdown';"
  - "import remarkGfm from 'remark-gfm';"
version: 1
generated_at: "2025-10-26T03:11:51.737Z"
---
# `ProjectDocs.tsx` - Project Documentation Viewer

This document provides technical details for the `ProjectDocs.tsx` React component, which is responsible for displaying project documentation in a user-friendly, two-panel interface.

## Purpose

The `ProjectDocs` component serves as a dedicated viewer for project documentation. It fetches the hierarchical structure of documentation files and their content from a backend API. The component presents this information in a two-panel layout:

*   **Left Panel:** A navigable, hierarchical file tree that displays the folder and file structure.
*   **Right Panel:** A content viewer that renders the selected documentation file's content, parsed from Markdown.

Key features include:

*   **Hierarchical Navigation:** Users can browse through project documentation using a tree-like structure.
*   **Content Rendering:** Markdown files are rendered into rich HTML content.
*   **Search and Filtering:** The file tree can be filtered dynamically as the user types, with the tree expanding to reveal matching files.
*   **API Integration:** Relies on an API to retrieve both the file tree structure and individual file content.
*   **State Management:** Manages the fetched file data, tree structure, filter state, and the expansion state of the tree nodes.

## Key APIs and Functions

The `ProjectDocs` component leverages several internal and external functions and state management hooks:

### Internal Functions

*   **`refresh()`:** This asynchronous function is responsible for fetching the latest project documentation data. It calls the API twice:
    *   To get the list of all documentation files (`/v1/projects/:projectId/docs`).
    *   To get the hierarchical tree structure of the documentation folders and files (`/v1/projects/:projectId/docs-tree`).
    *   It updates the component's internal state (`files` and `tree`) with the fetched data.
    *   It's triggered when the `projectId` changes (e.g., when navigating to a different project's documentation).

### Core React Hooks and Concepts

*   **`useState`:** Used extensively to manage the following state:
    *   `files`: An array of `FileRow` objects, each containing the `path` and `content` of a documentation file, along with its `updated_at` timestamp.
    *   `filter`: A string representing the current search query for filtering files in the tree.
    *   `active`: A string representing the currently selected (active) file, used for highlighting in the tree and displaying its content.
    *   `tree`: An array of `TreeNode` objects, representing the hierarchical structure of the documentation.
    *   `expanded`: A `Set` storing the paths of tree nodes that are currently expanded.
*   **`useEffect`:**
    *   Primarily used to call the `refresh()` function when the `projectId` obtained from the URL parameters changes. This ensures the component fetches the correct documentation for the selected project.
*   **`useMemo`:** Likely used for memoizing computed values, such as filtered versions of the file tree or file lists, to optimize performance.
*   **`useParams` (from `react-router-dom`):** Extracts the `projectId` from the URL, allowing the component to dynamically load documentation for the current project.

### External Libraries and Components

*   **`react-router-dom`:**
    *   `useParams`: For accessing route parameters (e.g., `:projectId`).
    *   `Link`: For creating navigation links within the application.
*   **`@mantine/core`:** Provides UI components for a consistent and accessible user interface:
    *   `Card`: For structured content grouping.
    *   `TextInput`: For user input, specifically for the search/filter functionality.
    *   `Title`, `Text`: For displaying headings and general text content.
    *   `NavLink`: Likely used to render individual items within the file tree, providing clickability and potentially visual cues for active or expanded states.
*   **`react-markdown`:** A library for rendering Markdown content.
    *   `ReactMarkdown`: The core component for parsing and displaying Markdown.
*   **`remark-gfm`:** A remark plugin that enables GitHub Flavored Markdown (GFM) support for `react-markdown`, allowing for features like tables, task lists, etc.
*   **`../lib/api`:** A custom module for making API requests. The `api` function is imported and used to communicate with the backend.

## Inputs and Outputs

### Inputs

*   **`projectId` (from URL `useParams`):** This is the primary input, determining which project's documentation to load. It's expected to be a string identifier.
*   **User Input (Filter):** A string entered into the `TextInput` component, used to filter the displayed file tree.

### Outputs

*   **Rendered UI:** The component renders a two-panel interface containing:
    *   A search input field.
    *   A hierarchical file tree.
    *   A Markdown content viewer for the selected file.
*   **API Calls:** The component makes GET requests to the following endpoints:
    *   `/v1/projects/:projectId/docs`
    *   `/v1/projects/:projectId/docs-tree`

## Invariants

*   The `projectId` parameter from the URL is expected to be a valid identifier for a project.
*   The API responses for `docs` and `docs-tree` are expected to be in a predictable format (arrays of files and tree nodes, respectively).
*   The `tree` data structure is expected to be a valid, potentially nested, array of `TreeNode` objects.
*   The `files` data structure is expected to be an array of `FileRow` objects.

## Error Handling

While the provided excerpt doesn't explicitly detail error handling mechanisms, the following are standard considerations:

*   **API Request Failures:** If API calls to fetch documentation data fail (e.g., network errors, server errors), the component should ideally display an informative error message to the user and potentially provide a way to retry the operation.
*   **Invalid `projectId`:** If the `projectId` from the URL does not correspond to an existing project, the API might return a 404 error, which should be handled gracefully.
*   **Malformed API Responses:** If the API returns data in an unexpected format (e.g., `treeRes.tree` is not an array), the component should gracefully handle this to prevent crashes. The current code attempts some basic checks (e.g., `Array.isArray(treeRes.tree)`), but more robust validation might be needed.
*   **File Not Found:** If a file is selected but its content cannot be fetched, this should be handled.

## Dependencies

*   **Runtime Dependencies:**
    *   `react`: For building the user interface.
    *   `react-dom`: For rendering React components in the browser.
    *   `react-router-dom`: For handling routing and accessing URL parameters.
    *   `@mantine/core`: For UI components.
    *   `react-markdown`: For Markdown rendering.
    *   `remark-gfm`: For GitHub Flavored Markdown support.
    *   Custom `api` module (`../lib/api`): For making HTTP requests to the backend.
*   **Build/Development Dependencies:** (Assumed, not explicitly listed in facts)
    *   TypeScript: For static typing.
    *   Webpack/Vite: For bundling.
    *   Babel: For JavaScript transpilation.

## Examples

### Basic Usage

When a user navigates to `/projects/:projectId/docs`, the `ProjectDocs` component will:

1.  Extract `:projectId` from the URL.
2.  Call `refresh()` to fetch the project's documentation tree and files.
3.  Display the file tree on the left.
4.  When a user clicks on a file in the tree (e.g., `README.md`), its content will be fetched (if not already cached) and rendered in Markdown format on the right.

### Filtering Example

If the user types "contributing" into the search bar:

1.  The `filter` state will be updated.
2.  The component will likely re-render, filtering the `tree` data to only show nodes that match the filter string (either in their name or path).
3.  The `expanded` state might be updated to automatically expand parent directories that contain matching files, making them visible to the user.

## Pitfalls and Considerations

*   **Performance with Large Documentation Sets:** For projects with a very large number of documentation files, fetching all files and the entire tree upfront might impact initial load times. Consider strategies like lazy loading or more granular API endpoints if this becomes an issue.
*   **State Management Complexity:** Managing the `expanded` state of a potentially deep tree can become complex. Ensure the logic for expanding/collapsing nodes and handling filtering updates is robust.
*   **API Response Times:** The component's responsiveness is directly tied to the API's performance. Slow API responses for fetching the tree or file content will lead to a poor user experience.
*   **Markdown Rendering Limitations:** While `react-markdown` with `remark-gfm` is powerful, very complex Markdown features or custom extensions might require additional plugins or custom rendering logic.
*   **Error Handling Robustness:** The current code has basic checks for array types. More comprehensive error handling and user feedback mechanisms are crucial for a production-ready component.

## Related Files

*   **`../lib/api.ts`**: This file likely contains the implementation for making API requests, including the `api` function used by `ProjectDocs`.
*   **`pages/` directory**: Other components within this directory might handle project-specific views or navigation.
*   **`components/` directory**: If the file tree or individual file rendering logic is abstracted into separate components (e.g., `FileTree`, `MarkdownViewer`), they would reside here.
*   **`react-router-dom` configuration**: The routing setup that defines how `ProjectDocs` is accessed based on URL parameters.

---
Generated: 2025-10-26T03:12:00.146Z  •  Version: v1
