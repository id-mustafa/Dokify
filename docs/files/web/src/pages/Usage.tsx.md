---
path: web/src/pages/Usage.tsx
chunkCount: 1
entities:
  - Usage
dependenciesPreview:
  - import React from 'react';
  - "import { Card, Title, Text, NavLink, Code, Anchor } from '@mantine/core';"
  - "import { useParams, Link } from 'react-router-dom';"
version: 1
generated_at: "2025-10-26T03:11:52.678Z"
---
# Usage Page (`web/src/pages/Usage.tsx`)

## Purpose

The `Usage` component serves as the central hub for contextual documentation within the Dokify platform. It provides users with clear, step-by-step guides, code examples, and relevant links for various platform features. The page dynamically renders content based on the selected documentation section, which is controlled via URL parameters.

## Key Components and APIs

This component utilizes several key pieces of technology:

*   **`React`**: The core library for building the user interface.
*   **`@mantine/core`**: A popular React component library providing UI elements such as:
    *   `Card`: For visually grouping content.
    *   `Title`: For semantic headings.
    *   `Text`: For displaying plain text.
    *   `NavLink`: For creating navigation links, used here for the sidebar.
    *   `Code`: For displaying code snippets.
    *   `Anchor`: For creating hypertext links.
*   **`react-router-dom`**: A library for handling routing in React applications, specifically:
    *   `useParams`: A hook to access URL parameters, used here to determine the currently active documentation section.
    *   `Link`: A component for declarative navigation between routes.

## Structure and Content

The `Usage` page is structured into two main areas:

1.  **Sidebar Navigation**: A fixed-width sidebar (`220px`) containing a list of documentation topics. Each topic is represented by a `NavLink` that links to a specific section of the usage page (e.g., `/usage/getting-started`). The sidebar is styled with a dark background and a subtle border.
    *   The available sections are:
        *   Getting started
        *   CLI commands
        *   API keys
        *   Projects & DokBase
        *   DokAgent
        *   Visualizer
    *   The `current` variable, derived from the URL parameter, determines which `NavLink` is highlighted as active.

2.  **Main Content Area**: This area dynamically displays the detailed documentation for the selected section. The content within this area is rendered conditionally based on the `current` section. Each section can include:
    *   `Title` components for section headings.
    *   `Text` components for explanatory content.
    *   `Code` components for presenting command-line instructions or code snippets.
    *   `Anchor` components for external or internal links.

## Inputs and Outputs

*   **Inputs**:
    *   **URL Parameter**: The primary input is a URL parameter representing the desired documentation `section`. For example, `/usage/cli` would load the "CLI commands" documentation.
    *   **Default Section**: If no `section` parameter is present in the URL, the component defaults to displaying the 'getting-started' section.

*   **Outputs**:
    *   The `Usage` component renders a complete HTML page with the navigation sidebar and the selected documentation content.

## Invariants

*   The sidebar always displays the six defined documentation sections.
*   The main content area always displays documentation corresponding to the `current` section.
*   The `current` section is derived from the URL parameter or defaults to 'getting-started'.

## Error Handling

The current code excerpt does not explicitly show error handling for invalid section IDs. If a URL parameter refers to a section that is not defined in the `sections` array, the component will not render any content for that section. Future enhancements could include a fallback "Section not found" message.

## Dependencies

*   **`@mantine/core`**: For UI components.
*   **`react-router-dom`**: For routing and URL parameter management.

## Examples

**Navigating to the CLI Commands Section:**

If a user is on the page and clicks a link to `/usage/cli`, the `useParams` hook will capture `'cli'`, setting `current` to `'cli'`. The `NavLink` for 'CLI commands' will be highlighted, and the content corresponding to the `'cli'` section will be displayed in the main content area.

**Basic Structure within a Section (e.g., 'getting-started'):**

```tsx
{current === 'getting-started' && <>
    <Title order={2} c="white">Getting Started</Title>
    <Text mt="md">Welcome to Dokify! This guide will walk you through the initial steps.</Text>
    <Text mt="md">First, ensure you have Node.js installed.</Text>
    <Code block mt="md">node -v</Code>
    <Text mt="md">You can install the Dokify CLI using npm:</Text>
    <Code block mt="md">npm install -g @dokify/cli</Code>
    <Text mt="md">For more details, check out the <Anchor component={Link} to="/docs/installation">detailed installation guide</Anchor>.</Text>
</>}
```

## Pitfalls

*   **Missing Section Content**: If a section ID is defined in the `sections` array but no corresponding rendering logic is implemented in the `Usage` component's main content area, that section will appear blank.
*   **URL Mismatch**: Any discrepancy between the `id` in the `sections` array and the actual URL parameter value will lead to incorrect content display or no content at all.

## Related Files

*   **`web/src/App.tsx`**: This file would likely define the routing for the `/usage/:section` path, pointing to the `Usage` component.
*   **`web/src/components/Layout.tsx` (or similar)**: This file might provide the overall page structure, including headers, footers, and potentially a main content wrapper, within which the `Usage` component is rendered.
*   **`web/src/pages/index.ts`**: This file likely exports all the page components, including `Usage`.

---
Generated: 2025-10-26T03:11:57.124Z  •  Version: v1
