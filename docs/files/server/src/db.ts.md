---
path: server/src/db.ts
chunkCount: 1
entities:
  - migrate
dependenciesPreview:
version: 1
generated_at: "2025-10-26T03:11:26.603Z"
---
# `server/src/db.ts`

This file provides a lightweight, in-memory data store for the Minimum Viable Product (MVP) to avoid native database dependencies. It defines the schema for several key entities using TypeScript `Map` objects with strict type definitions. The data stored in this `db` object is ephemeral and will be lost when the server restarts.

## Key APIs and Functions

### `db` Object

The core of this module is the `db` object, which acts as our in-memory database. It is a collection of `Map` instances, each representing a different entity type:

*   **`users`**: Stores user information.
    *   **Schema**: `Map<string, { id: string; email: string; name?: string; password_hash: string; created_at: number }>`
    *   Each entry is keyed by a user `id`.
*   **`projects`**: Stores project details associated with users.
    *   **Schema**: `Map<string, { id: string; owner_user_id: string; name: string; slug: string; created_at: number }>`
    *   Each entry is keyed by a project `id`.
*   **`docs`**: Stores documentation content for projects.
    *   **Schema**: `Map<string, { id: string; project_id: string; path: string; content: string; updated_at: number }>`
    *   Each entry is keyed by a documentation `id`.
*   **`apiKeys`**: Stores API keys generated for users.
    *   **Schema**: `Map<string, { id: string; user_id: string; key: string; label: string; created_at: number; last_used_at: number | null; usage_count: number }>`
    *   Each entry is keyed by an API key `id`.
*   **`apiUsageByKey`**: Tracks usage statistics for API keys.
    *   **Schema**: `Map<string, { key_id: string; total_requests: number; total_input_tokens: number; total_output_tokens: number; total_usd: number; last_used_at: number | null }>`
    *   Each entry is keyed by an API key `id`.

### `migrate()` Function

The `migrate()` function is included for completeness but is a no-operation (`no-op`) function in this in-memory MVP context. In a persistent database setup, this function would typically handle schema migrations.

## Inputs and Outputs

*   **Inputs**: This module does not expose any explicit input parameters for its core `db` object. Data is populated and accessed through the methods of the `Map` objects themselves (e.g., `db.users.set(...)`, `db.projects.get(...)`).
*   **Outputs**: The primary output is the `db` object, which contains the five `Map` collections described above.

## Invariants

*   Data is stored in memory and is **ephemeral**. It will be lost upon server restart.
*   Each `Map` uses a string identifier as its key for efficient lookups.
*   TypeScript types are strictly enforced for all data stored within the `Map` collections, ensuring data integrity.

## Error Handling

This module relies on the standard behavior of JavaScript `Map` objects. Potential errors might arise from:

*   **Type mismatches**: Attempting to store data that doesn't conform to the defined TypeScript schemas.
*   **Key collisions**: While `Map` handles this by overwriting existing entries, it's important to manage unique IDs to avoid unintended data loss.
*   **Accessing non-existent keys**: Using `.get()` on a key that doesn't exist will return `undefined`. Consumers of the `db` object must handle these cases.

## Dependencies

This module has no external dependencies. It relies solely on built-in JavaScript `Map` objects and TypeScript for type safety.

## Examples

### Adding a User

```typescript
import { db } from './db';

const userId = 'user-123';
db.users.set(userId, {
    id: userId,
    email: 'test@example.com',
    name: 'John Doe',
    password_hash: 'hashed_password_string',
    created_at: Date.now()
});

### Retrieving a Project

```typescript
import { db } from './db';

const projectId = 'project-abc';
const project = db.projects.get(projectId);

if (project) {
    console.log(`Project Name: ${project.name}`);
} else {
    console.log('Project not found.');
}
```

### Updating API Key Usage

```typescript
import { db } from './db';

const apiKeyId = 'api-key-xyz';
const usageRecord = db.apiUsageByKey.get(apiKeyId);

if (usageRecord) {
    usageRecord.total_requests++;
    usageRecord.last_used_at = Date.now();
    // ... update other metrics like tokens, cost, etc.
    db.apiUsageByKey.set(apiKeyId, usageRecord); // Re-set to ensure Map update if object is mutated directly
} else {
    // Create new usage record if it doesn't exist
    db.apiUsageByKey.set(apiKeyId, {
        key_id: apiKeyId,
        total_requests: 1,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_usd: 0,
        last_used_at: Date.now()
    });
}
```

## Pitfalls

*   **Data Loss**: The most significant pitfall is the ephemeral nature of the data. Any data entered into `db` will be lost upon server restart. This module is strictly for MVP purposes.
*   **Scalability**: In-memory `Map`s are not suitable for large datasets or high-concurrency scenarios where persistent storage and robust querying capabilities are required.
*   **Concurrency**: While `Map` operations are generally atomic, complex multi-step operations involving multiple `Map` lookups and updates could lead to race conditions in a highly concurrent environment if not managed carefully.
*   **No Persistence Layer**: There is no mechanism for saving or loading this data to disk, meaning the entire dataset must be re-created on each server start.

## Related Files

*   This file (`server/src/db.ts`) is a foundational module for data storage. Any server-side logic that needs to interact with user data, project data, documentation, or API keys will likely import and use the `db` object from this file.

```

---
Generated: 2025-10-26T03:11:31.926Z  •  Version: v1
