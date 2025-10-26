---
path: server/src/agent.ts
chunkCount: 1
entities:
  - registerAgentRoutes
  - body
dependenciesPreview:
  - "import { FastifyInstance } from 'fastify';"
  - "import { requireApiKey, meterUsage } from './middleware.js';"
version: 1
generated_at: "2025-10-26T03:11:26.602Z"
---
# Agent API (`server/src/agent.ts`)

## Purpose

This file defines and registers routes for interacting with the agent functionality. Specifically, it exposes a `/v1/agent/ask` POST endpoint. This endpoint is designed to receive user questions, validate them along with the necessary API key, and simulate an agent's response. While currently returning a placeholder, the ultimate goal is to integrate with Large Language Models (LLMs) like Claude or Gemini. Crucially, this endpoint also handles the metering of token usage for billing purposes.

## Key APIs/Classes/Functions

*   **`registerAgentRoutes(app: FastifyInstance)`**: This is the primary function exported by this file. It takes a `FastifyInstance` as input and registers the agent-related routes onto it.

## Endpoint: `/v1/agent/ask` (POST)

This endpoint allows clients to submit questions to the agent.

### Inputs

*   **`app: FastifyInstance`**: The Fastify application instance to which the route will be registered.
*   **`req.body.question: string`**: The user's question, expected to be a string within the request body.
*   **API Key**: An API key is required for authentication, enforced by the `requireApiKey` middleware.

### Outputs

*   **Success Response**: Returns a JSON object with a placeholder `answer` property:
    ```json
    {
      "answer": "Thanks for your question. The agent will be wired to LLMs next."
    }
    ```
*   **Error Response (HTTP 400)**: If the `question` is missing or empty in the request body, an HTTP 400 Bad Request response is returned with the error code `invalid_request`.

### Invariants

*   A valid API key must be provided in the request.
*   The request body must contain a non-empty `question` field.

### Error Handling

*   **Missing/Empty Question**: If the `question` field is not present in the request body or is an empty string, the server will respond with a `400 Bad Request` status code and a JSON payload `{ error: 'invalid_request' }`.
*   **API Key Validation**: The `requireApiKey` middleware (imported from `./middleware.js`) is responsible for validating the API key. If the key is invalid or missing, this middleware will handle the appropriate error response.

### Dependencies

*   **`fastify`**: The `FastifyInstance` type is imported from the `fastify` library, indicating that this file is part of a Fastify-based server.
*   **`./middleware.js`**: This file relies on two middleware functions:
    *   `requireApiKey`: For API key authentication.
    *   `meterUsage`: For metering token consumption.

## Examples

**Submitting a question:**

```bash
curl -X POST \
  http://your-server-url/v1/agent/ask \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "question": "What is the capital of France?"
  }'
```

**Expected Success Response:**

```json
{
  "answer": "Thanks for your question. The agent will be wired to LLMs next."
}
```

**Example of an invalid request (missing question):**

```bash
curl -X POST \
  http://your-server-url/v1/agent/ask \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "other_field": "some_value"
  }'
```

**Expected Error Response:**

```json
{
  "error": "invalid_request"
}
```

## Pitfalls

*   **Placeholder Response**: The current implementation returns a static placeholder response. For production use, this needs to be replaced with actual LLM integration.
*   **Token Metering Accuracy**: The `meterUsage` function is called with hardcoded token counts and USD values. In a real-world scenario, these values would need to be dynamically determined based on the LLM's actual output and pricing.
*   **Input Validation**: While the `question` is checked for emptiness, more robust validation for the `question`'s content might be necessary depending on the expected user input and LLM integration.

## Related Files

*   **`server/src/middleware.js`**: This file is a key dependency, as it provides the `requireApiKey` and `meterUsage` middleware functions essential for the `/v1/agent/ask` endpoint's functionality.

---
Generated: 2025-10-26T03:11:29.891Z  •  Version: v1
