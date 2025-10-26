---
path: web/src/pages/Account.tsx
chunkCount: 1
entities:
  - Account
  - refreshKeys
  - createKey
  - revokeKey
  - copy
dependenciesPreview:
  - "import React, { useEffect, useState } from 'react';"
  - "import { Card, Title, Text, Button, Group, TextInput, Table, CopyButton } from '@mantine/core';"
  - "import { notifications } from '@mantine/notifications';"
  - "import { IconClipboard } from '@tabler/icons-react';"
  - "import { api, clearToken } from '../lib/api';"
version: 1
generated_at: "2025-10-26T03:11:48.761Z"
---
# Account Management Page (`web/src/pages/Account.tsx`)

This component serves as the central hub for managing user account information and API keys. It displays the user's profile, provides functionality to log out, and enables the creation, viewing, and revocation of API keys.

## Purpose

The primary purpose of the `Account` component is to offer a comprehensive interface for users to:

*   **View Profile Information:** Display the user's email address.
*   **Logout:** Facilitate the secure termination of the user's session.
*   **Manage API Keys:**
    *   Generate new API keys with descriptive labels.
    *   View existing API keys, including their ID, label, creation date, last usage, and usage count.
    *   Securely copy API keys to the clipboard.
    *   Revoke (delete) API keys that are no longer needed.
    *   Track the usage of each API key.

## Key APIs, Classes, and Functions

### Components (from `@mantine/core` and custom)

*   **`Card`**: Used to visually group and present sections of account information and API key management.
*   **`Title`**: Displays prominent headings for different sections (e.g., "Account", "API Keys").
*   **`Text`**: Renders standard text, such as user email addresses and key details.
*   **`Button`**: Provides interactive elements for actions like "Logout" and "Generate New Key".
*   **`Group`**: Organizes child elements horizontally, useful for aligning buttons or input fields.
*   **`TextInput`**: An input field for users to enter a label for new API keys.
*   **`Table`**: Displays API key information in a structured tabular format.
*   **`CopyButton`**: A specialized button component that allows users to copy associated content to the clipboard.
*   **`IconClipboard`**: An icon visually representing the copy action.

### Custom Functions

*   **`refreshKeys()`**: An asynchronous function responsible for fetching the latest list of API keys from the backend and updating the `keys` state.
*   **`createKey()`**: An asynchronous function that sends a request to the backend to generate a new API key with a provided label. It then updates the `keys` state with the newly created key (initially exposing the secret key for copying) and clears the label input.
*   **`revokeKey(id: string)`**: An asynchronous function that sends a request to the backend to revoke (delete) an API key specified by its `id`. After successful revocation, it refreshes the list of keys.

## Inputs and Outputs

### Inputs

*   **User Object (`me`)**: Fetched from the `/v1/me` API endpoint. Expected to have at least an `id` and `email` property.
*   **API Key Label (`label`)**: A string entered by the user in the `TextInput` field for new API key generation.

### Outputs

*   **Displayed User Information**: The user's email address is displayed.
*   **API Key List**: An array of API key objects is displayed in a table. Each key object may contain:
    *   `id`: Unique identifier for the API key.
    *   `label`: User-defined label for the API key.
    *   `created_at`: Timestamp of key creation.
    *   `last_used_at`: Timestamp of the last time the key was used (can be `null`).
    *   `usage_count`: Number of times the key has been used.
    *   `key` (optional): The actual secret API key string, only shown immediately after creation for copying.

## State Management

The component utilizes `useState` to manage the following internal states:

*   **`me`**: Stores the user object, initialized to `null`.
*   **`keys`**: Stores an array of API key objects, initialized as an empty array.
*   **`label`**: Stores the current value of the API key label input, initialized as an empty string.

## Invariants

*   When the component mounts, it attempts to fetch user information and refresh the API keys.
*   If fetching user data fails, `me` remains `null`.
*   If fetching API keys fails, `keys` remains an empty array.
*   The secret API key is only briefly exposed immediately after creation and is not stored in the `keys` state thereafter to maintain security.

## Error Handling

*   **API Call Failures**: `.catch()` blocks are used to handle potential errors during API calls for fetching user data and API keys. In case of an error, the respective state (`me` or `keys`) is either set to `null` or remains in its previous state (or an empty array).
*   **`createKey` Error**: If `createKey` fails, the error is silently ignored by the `try...catch` block, meaning the UI will not reflect the failed attempt to create a key, and the `label` input will be cleared. This could be improved by surfacing a notification to the user.
*   **`revokeKey` Error**: Similar to `createKey`, errors during revocation are caught and not explicitly handled beyond preventing a crash.

## Dependencies

*   **`React`**: Core React library for component creation.
*   **`useEffect`**: React hook for managing side effects (like data fetching on mount).
*   **`useState`**: React hook for managing component state.
*   **`@mantine/core`**: A comprehensive UI component library providing `Card`, `Title`, `Text`, `Button`, `Group`, `TextInput`, `Table`, and `CopyButton`.
*   **`@mantine/notifications`**: Used for displaying user-facing notifications (though not explicitly shown in the provided excerpts for error handling).
*   **`@tabler/icons-react`**: Provides the `IconClipboard` for the copy button.
*   **`../lib/api`**: A custom module that likely provides the `api` function for making HTTP requests and `clearToken` for logout functionality.

## Examples

### Displaying User Information and API Keys

Upon loading, the component will attempt to fetch and display the logged-in user's email. If the user has existing API keys, they will be listed in a table with columns for Label, Created At, Last Used, and Usage Count.

### Generating a New API Key

1.  Enter a descriptive label (e.g., "My Project API Key") in the "Label" input field.
2.  Click the "Generate New Key" button.
3.  A new API key will appear in the table. Its secret key will be displayed for a short period, allowing you to copy it using the clipboard icon.
4.  The "Label" input field will be cleared.

### Copying an API Key

1.  Locate the API key you wish to copy in the table.
2.  Click the clipboard icon next to the API key's secret string.
3.  The key will be copied to your system's clipboard.

### Revoking an API Key

1.  Locate the API key you wish to revoke in the table.
2.  Click the "Revoke" button associated with that key.
3.  The API key will be removed from the table after a successful revocation.

## Pitfalls and Considerations

*   **Secret Key Exposure**: The secret API key is only shown immediately after creation. If the user misses copying it, they will need to generate a new key. There's no mechanism to retrieve a forgotten secret key.
*   **Error Notification**: The current error handling for `createKey` and `revokeKey` is silent. In a production environment, users should be notified when these operations fail.
*   **`last_used_at` and `usage_count`**: The accuracy and real-time nature of these metrics depend on the backend implementation.
*   **Security**: The `api` function and `clearToken` from `../lib/api` are crucial for security. Ensure these are robust and handle authentication/authorization correctly.
*   **Large Number of Keys**: If a user has a very large number of API keys, the table might become unwieldy. Pagination or other display optimizations might be necessary.

## Related Files

*   **`../lib/api`**: This file is a critical dependency, providing the `api` function for backend communication and `clearToken` for handling logout. Its implementation directly impacts the functionality and security of the `Account` page.

---
Generated: 2025-10-26T03:11:54.691Z  •  Version: v1
