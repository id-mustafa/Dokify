import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, TextInput, Title, Text, Group } from '@mantine/core';
import { api } from '../lib/api';

type Project = { id: string; name: string; slug: string };

export function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);

    const wsRef = useRef<WebSocket | null>(null);
    useEffect(() => {
        refresh();
        // Live updates via WebSocket
        const apiBase = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000';
        const url = apiBase.replace('http', 'ws') + '/ws';
        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;
            ws.addEventListener('open', () => {
                // Subscribe to all-projects updates (empty projectId)
                ws.send(JSON.stringify({ type: 'subscribe', projectId: '' }));
            });
            ws.addEventListener('message', (ev) => {
                try {
                    const msg = JSON.parse(String(ev.data));
                    if (msg.type === 'docs-updated') refresh();
                } catch { }
            });
        } catch { }
        return () => { try { wsRef.current?.close(); } catch { } };
    }, []);

    async function refresh() {
        setLoading(true);
        try { const res = await api('/v1/projects'); setProjects(res.projects || []); } finally { setLoading(false); }
    }

    async function create() {
        if (!name.trim()) return;
        await api('/v1/projects', { method: 'POST', body: JSON.stringify({ name }) });
        setName('');
        refresh();
    }

    async function remove(id: string) {
        await api(`/v1/projects/${id}`, { method: 'DELETE' });
        refresh();
    }

    return (
        <div>
            <div className="container">
                <Card shadow="md" padding="lg" radius="md" style={{ background: 'linear-gradient(180deg,#0a0a0a,#000000)', border: '1px solid #1f2937' }}>
                    <Title order={2} c="white">Projects</Title>
                    <div className="row" style={{ margin: '12px 0 16px' }}>
                        <TextInput placeholder="New project name" value={name} onChange={e => setName(e.currentTarget.value)} styles={{ input: { background: '#0e1422', color: 'white' } }} />
                        <Button color="blue" onClick={create}>Create</Button>
                    </div>
                    {loading ? <Text c="dimmed">Loading...</Text> : (
                        <div className="stack">
                            {projects.map(p => (
                                <Card key={p.id} padding="md" radius="md" style={{ background: '#0c1220', border: '1px solid #1f2937' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <Text c="white">{p.name}</Text>
                                            <Text c="dimmed" size="sm">{p.slug}</Text>
                                        </div>
                                        <Group gap="xs">
                                            <Link className="link" to={`/projects/${p.id}`}>Open</Link>
                                            <Link className="link" to={`/projects/${p.id}/visualize`}>Visualize</Link>
                                            <Button size="xs" color="red" variant="light" onClick={() => remove(p.id)}>Delete</Button>
                                        </Group>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}


