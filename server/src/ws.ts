import { Server } from 'node:http';
import { WebSocketServer } from 'ws';

type Client = { id: string; ws: any; projectId?: string };

export function attachWebSocket(server: Server) {
    // Lazy import ws to avoid ESM issues if unused
    const wss = new WebSocketServer({ server, path: '/ws' });
    const clients = new Map<string, Client>();

    wss.on('connection', (ws: any) => {
        const id = Math.random().toString(36).slice(2);
        const client: Client = { id, ws };
        clients.set(id, client);
        ws.on('message', (raw: Buffer) => {
            try {
                const msg = JSON.parse(raw.toString());
                if (msg.type === 'subscribe') client.projectId = msg.projectId ? String(msg.projectId) : '';
            } catch { }
        });
        ws.on('close', () => { clients.delete(id); });
    });

    function broadcast(projectId: string, payload: any) {
        const data = JSON.stringify(payload);
        for (const c of clients.values()) {
            // Empty projectId subscribers receive all
            if (!c.projectId || c.projectId === '' || c.projectId === projectId) {
                try { c.ws.send(data); } catch { }
            }
        }
    }

    return { wss, broadcast };
}


