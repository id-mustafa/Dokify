---
path: server/src/middleware.ts
chunkCount: 1
entities:
  - requireApiKey
  - key
  - meterUsage
  - record
dependenciesPreview:
  - "import { FastifyReply, FastifyRequest } from 'fastify';"
  - "import { db } from './db.js';"
version: 1
generated_at: "2025-10-26T03:11:26.603Z"
---
# Middleware Functions (`server/src/middleware.ts`)

This file provides essential middleware functions for Fastify, focusing on API key authentication and usage tracking. These functions are crucial for securing your API endpoints and monitoring resource consumption.

## Key APIs/Classes/Functions

### `requireApiKey(req: FastifyRequest, reply: FastifyReply)`

This function acts as an authentication middleware. It intercepts incoming requests and verifies the presence and validity of an API key provided in the `x-api-key` header.

*   **Purpose**: To ensure that only authenticated clients with valid API keys can access protected resources.
*   **Inputs**:
    *   `req`: The Fastify request object, which will contain the `x-api-key` header.
    *   `reply`: The Fastify reply object, used to send error responses.
*   **Outputs**:
    *   Returns `true` if the API key is valid and the request is allowed to proceed.
    *   Sends a `401 Unauthorized` response with an error code (`missing_api_key` or `invalid_api_key`) and terminates the request if the API key is missing or invalid.
*   **Side Effects**: If the API key is valid, it attaches the API key's record to the request object as `req.apiKey`. This makes the key's details (like its ID) available to subsequent middleware and route handlers.

### `meterUsage(req: FastifyRequest, _reply: FastifyReply, params: MeterParams = {})`

This function is a usage metering middleware. It tracks various metrics associated with API key usage, such as request counts, token consumption, and associated costs.

*   **Purpose**: To log and aggregate usage statistics for each API key, enabling cost allocation, rate limiting, and usage monitoring.
*   **Inputs**:
    *   `req`: The Fastify request object. It is expected that `requireApiKey` has already been run, attaching the `apiKey` record to `req.apiKey`.
    *   `_reply`: The Fastify reply object (unused in this function, hence the underscore prefix).
    *   `params`: An optional object containing usage details:
        *   `inputTokens` (number, optional): The number of input tokens consumed by the request.
        *   `outputTokens` (number, optional): The number of output tokens consumed by the request.
        *   `usd` (number, optional): The cost in USD associated with the request.
*   **Outputs**:
    *   This function primarily has side effects. It updates usage records in the database.
*   **Side Effects**:
    *   Retrieves the API key record from `req.apiKey`.
    *   If an `apiKey` record is found, it updates the corresponding entry in `db.apiUsageByKey`.
    *   Increments `total_requests`, `total_input_tokens`, `total_output_tokens`, and `total_usd` based on the provided `params`.
    *   Updates `last_used_at` to the current timestamp.

### `MeterParams` (Type)

A TypeScript type definition representing the parameters that can be passed to the `meterUsage` function.

*   **Purpose**: To define the structure of the usage metrics that can be tracked.
*   **Properties**:
    *   `inputTokens`?: number
    *   `outputTokens`?: number
    *   `usd`?: number

## Invariants

*   The `requireApiKey` function expects the `x-api-key` header to be a string.
*   The `meterUsage` function expects that `req.apiKey` has been populated by a preceding middleware (like `requireApiKey`). If `req.apiKey` is not found, `meterUsage` will silently return without updating any metrics.

## Error Handling

*   **`requireApiKey`**:
    *   **Missing API Key**: If the `x-api-key` header is not present, it returns a `401 Unauthorized` response with the error code `missing_api_key`.
    *   **Invalid API Key**: If the provided API key does not match any stored keys, it returns a `401 Unauthorized` response with the error code `invalid_api_key`.
*   **`meterUsage`**:
    *   This function handles the absence of `req.apiKey` gracefully by simply returning. It does not throw an error, but this implies that usage will not be metered if `requireApiKey` was not successfully executed beforehand.

## Dependencies

*   **`fastify`**: This middleware is designed to work within the Fastify framework, utilizing its `FastifyRequest` and `FastifyReply` types.
*   **`./db.js`**: This module is responsible for database interactions. Specifically:
    *   `db.apiKeys`: Used by `requireApiKey` to look up valid API keys.
    *   `db.apiUsageByKey`: Used by `meterUsage` to store and update usage metrics keyed by API key ID.

## Examples

### Protecting an Endpoint with API Key Authentication

```typescript
import Fastify from 'fastify';
import { requireApiKey } from './middleware'; // Assuming this file is in the same directory

const fastify = Fastify();

fastify.addHook('onRequest', requireApiKey); // Apply requireApiKey to all routes

fastify.get('/protected-data', async (request, reply) => {
    // If we reach here, the API key was valid and attached to request.apiKey
    const apiKeyInfo = (request as any).apiKey;
    return { message: `Hello, authenticated user with key ID: ${apiKeyInfo.id}` };
});

// ... start server ...
```

### Metering API Usage After Authentication

```typescript
import Fastify from 'fastify';
import { requireApiKey, meterUsage } from './middleware';

const fastify = Fastify();

// Apply authentication first
fastify.addHook('onRequest', requireApiKey);

fastify.post('/generate-text', async (request, reply) => {
    const { prompt } = request.body as { prompt: string };

    // Simulate an API call that consumes tokens and costs money
    const outputTokens = 100;
    const inputTokens = prompt.length / 4; // Rough estimation
    const cost = 0.0001; // Simulated cost

    // Meter the usage
    meterUsage(request, reply, { inputTokens, outputTokens, usd: cost });

    return { generatedText: "This is a generated response." };
});

// ... start server ...
```

## Pitfalls

*   **Order of Middleware**: It is critical that `requireApiKey` is executed *before* `meterUsage`. If `meterUsage` is called without `req.apiKey` being populated, it will silently fail to record any usage data.
*   **Error Handling in `meterUsage`**: The `meterUsage` function does not explicitly throw errors if it cannot update the database. If there are database issues during usage metering, the application might not surface these errors directly, potentially leading to silent data loss for usage tracking.
*   **`as any` Type Assertions**: The use of `(req as any).apiKey` bypasses TypeScript's type checking. While common in middleware for adding properties, it's a good practice to ensure the type safety elsewhere or to use more robust methods for extending Fastify's request object if the application grows significantly.

## Related Files

*   **`server/src/db.ts`**: This file is directly related as it provides the `db` object, which the middleware functions interact with to retrieve API keys and store usage metrics.
*   **`server/src/routes/`**: Any route files that utilize these middleware functions for authentication and usage tracking are inherently related.

---
Generated: 2025-10-26T03:11:32.588Z  •  Version: v1
