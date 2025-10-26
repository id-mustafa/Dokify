---
path: server/src/ws.ts
chunkCount: 1
entities:
  - attachWebSocket
  - broadcast
dependenciesPreview:
  - "import { Server } from 'node:http';"
  - "import { WebSocketServer } from 'ws';"
version: 1
generated_at: "2025-10-26T03:11:29.892Z"
---
# WebSocket Server (`server/src/ws.ts`)

This file implements a WebSocket server that integrates with an existing HTTP server to provide real-time, project-based publish-subscribe (pub/sub) messaging for clients.

## Purpose

The primary goal of this module is to establish a WebSocket endpoint (`/ws`) on an HTTP server. It manages individual client connections and facilitates a pub/sub messaging system. Clients can subscribe to specific projects, and messages broadcasted to a project will only be delivered to subscribed clients.

## Key APIs and Functions

### `attachWebSocket(server: Server)`

This is the main function exported by this module. It takes an existing Node.js HTTP `Server` instance and attaches a WebSocket server to it.

*   **Purpose:** Initializes the WebSocket server and sets up event listeners for client connections and messages.
*   **Inputs:**
    *   `server`: An instance of `node:http.Server`.
*   **Outputs:** None. This function modifies the provided `server` by adding a WebSocket listener.
*   **Internal State:**
    *   Maintains a `Map` named `clients` to store active client connections. Each client is represented by a `Client` object containing a unique `id` and its WebSocket instance (`ws`), and optionally a `projectId` to which it is subscribed.

### `broadcast(projectId: string, payload: any)`

This internal function is responsible for sending a message to all subscribed clients.

*   **Purpose:** Broadcasts a given `payload` to clients subscribed to a specific `projectId`.
*   **Inputs:**
    *   `projectId`: The ID of the project for which the message is intended.
    *   `payload`: The data to be sent to the clients. This will be JSON-stringified before sending.
*   **Outputs:** None. Sends messages to connected clients.
*   **Logic:**
    *   Iterates through all connected clients.
    *   If a client is not subscribed to any project (i.e., `projectId` is empty or not set), it receives all broadcasted messages.
    *   If a client is subscribed to a specific project, it only receives messages broadcasted to that same `projectId`.
    *   Messages are JSON-stringified before being sent.

## Client Communication and Messaging

Clients connect to the WebSocket server at the `/ws` path.

### Connection Establishment

When a new client connects:

1.  A unique `id` is generated for the client.
2.  A `Client` object is created and stored in the `clients` map.
3.  Event listeners are attached to the client's WebSocket connection:
    *   **`on('message')`**: Handles incoming messages.
        *   **Input:** Raw `Buffer` containing the message.
        *   **Processing:**
            *   The message is parsed as JSON.
            *   If the message `type` is `'subscribe'`, the client's `projectId` is updated based on the `projectId` field in the message. If `projectId` is not provided or is falsy, it's treated as an empty string, meaning the client will receive all messages.
        *   **Error Handling:** Malformed JSON messages are silently ignored.
    *   **`on('close')`**: When a client disconnects, its entry is removed from the `clients` map.

### Sending Messages

The `broadcast` function is the primary mechanism for sending messages.

*   **Payload Format:** Any JavaScript object can be passed as the `payload`. It will be serialized into a JSON string before transmission.
*   **Subscription Logic:** Messages are filtered based on the `projectId` specified during subscription.

## Invariants

*   Each connected client is uniquely identified by an `id`.
*   The `clients` map accurately reflects all currently connected clients.
*   Subscribed clients only receive messages relevant to their subscribed project (or all messages if not explicitly subscribed to a project).

## Error Handling

*   **Message Parsing:** Errors during JSON parsing of incoming messages are caught and ignored, preventing the server from crashing due to malformed client messages.
*   **Message Sending:** Errors that occur when sending messages to a client's WebSocket connection are caught and ignored. This is a common practice to prevent a single problematic client from disconnecting others or crashing the server.

## Dependencies

*   **`node:http.Server`**: Requires an existing HTTP server instance to attach the WebSocket server to.
*   **`ws`**: The WebSocket library is a direct dependency for creating and managing the WebSocket server (`WebSocketServer`).
*   **Lazy Import:** The `ws` module is lazily imported to potentially avoid issues in environments where it might not be used, though in this specific file it is always used.

## Examples

### Server Setup

```typescript
import http from 'node:http';
import { attachWebSocket } from './ws';

const server = http.createServer((req, res) => {
    // Handle regular HTTP requests
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('HTTP Server is running\n');
});

attachWebSocket(server); // Attach the WebSocket server

server.listen(3000, () => {
    console.log('HTTP and WebSocket server listening on port 3000');
});
```

### Client Subscription and Message Handling (Conceptual - JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
    console.log('Connected to WebSocket server');

    // Subscribe to project 'project-123'
    ws.send(JSON.stringify({
        type: 'subscribe',
        projectId: 'project-123'
    }));

    // Subscribe to all messages
    ws.send(JSON.stringify({
        type: 'subscribe',
        projectId: '' // Or omit projectId for all
    }));
};

ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('Received message:', message);
    // Handle incoming messages based on their content
};

ws.onclose = () => {
    console.log('Disconnected from WebSocket server');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

// To broadcast a message from the server side (e.g., in another part of your Node.js backend):
// Assuming you have access to the broadcast function or can re-implement it
// broadcast('project-123', { data: 'Hello to project-123 subscribers!' });
// broadcast('', { data: 'This message goes to everyone!' });
```

## Pitfalls

*   **Client `projectId` Management:** If a client sends an invalid or unexpected `projectId` in a `subscribe` message, it will be set as received. Robust error checking on the client-side for valid `projectId`s is recommended.
*   **Server-Side Broadcast Logic:** The `broadcast` function is defined internally. If you need to trigger broadcasts from other parts of your server application, you will need to expose this function or a similar mechanism.
*   **Scalability:** For a very large number of concurrent connections, the current approach of iterating through all clients for broadcasting might become a performance bottleneck. More advanced pub/sub solutions or optimized data structures might be needed in such scenarios.
*   **Security:** This implementation does not include authentication or authorization. In a production environment, you would need to implement security measures to ensure only authorized clients can connect and subscribe to projects.
*   **Error Handling Granularity:** The catch blocks for sending and parsing messages are quite broad. For more sophisticated debugging, more specific error handling could be implemented.

## Related Files

*   **`server/src/http.ts` (or similar):** This is where the `node:http.Server` instance is likely created and managed, as it's passed to `attachWebSocket`.
*   **Client-side code:** Any client application (web browser, mobile app, etc.) that needs to communicate with this WebSocket server will have corresponding client-side WebSocket logic.

---
Generated: 2025-10-26T03:11:37.196Z  •  Version: v1
