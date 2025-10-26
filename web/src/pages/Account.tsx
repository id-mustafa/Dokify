import React, { useEffect, useState } from 'react';
import { Card, Title, Text, Button, Group, TextInput, Table, CopyButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconClipboard } from '@tabler/icons-react';
import { api, clearToken } from '../lib/api';

export function Account() {
    const [me, setMe] = useState<{ id: string; email: string } | null>(null);
    const [keys, setKeys] = useState<Array<{ id: string; label: string; created_at: number; last_used_at: number | null; usage_count: number; key?: string }>>([]);
    const [label, setLabel] = useState('');
    useEffect(() => {
        api('/v1/me').then(setMe).catch(() => setMe(null));
        refreshKeys();
    }, []);
    async function refreshKeys() {
        try { const res = await api('/v1/api-keys'); setKeys(res.keys || []); } catch { }
    }

    async function createKey() {
        const res = await api('/v1/api-keys', { method: 'POST', body: JSON.stringify({ label }) });
        setLabel('');
        // Surface the newly created secret key once for copy
        setKeys((prev) => [{ id: res.id, label: res.label, created_at: res.created_at, last_used_at: null, usage_count: 0, key: res.key }, ...prev]);
        notifications.show({
            title: 'API key created',
            message: 'Copy the command now; the secret will not be shown again after you leave this page.',
            color: 'blue'
        });
    }

    async function revokeKey(id: string) {
        await api(`/v1/api-keys/${id}`, { method: 'DELETE' });
        refreshKeys();
    }

    function copy(text: string) {
        try { navigator.clipboard.writeText(text); } catch { }
    }
    return (
        <div className="container">
            <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', marginBottom: 16 }}>
                <Title order={2} c="white">Account</Title>
                {me ? (
                    <>
                        <Text c="dimmed" style={{ marginTop: 8 }}>{me.email}</Text>
                        <Button color="blue" variant="light" style={{ marginTop: 16 }} onClick={() => { clearToken(); window.location.href = '/login'; }}>Logout</Button>
                    </>
                ) : (
                    <Text c="dimmed" style={{ marginTop: 8 }}>Not signed in.</Text>
                )}
            </Card>

            <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                <Group justify="space-between" style={{ marginBottom: 8 }}>
                    <Title order={3} c="white">API Keys</Title>
                </Group>
                <Group style={{ marginBottom: 12 }}>
                    <TextInput placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.currentTarget.value)} styles={{ input: { background: '#0b0b0b', color: 'white' } }} />
                    <Button color="blue" onClick={createKey}>Generate API Key</Button>
                </Group>

                {keys.length === 0 ? (
                    <Text c="dimmed">No API keys yet.</Text>
                ) : (
                    <Table striped highlightOnHover withTableBorder withColumnBorders>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Label</Table.Th>
                                <Table.Th>Usage</Table.Th>
                                <Table.Th>Commands</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {keys.map((k) => {
                                const cliCmd = `dok keys set --api-key=${k.key || '<secret-on-create>'}`;
                                return (
                                    <Table.Tr key={k.id}>
                                        <Table.Td>
                                            <Text c="white">{k.label || '—'}</Text>
                                            <Text c="dimmed" size="sm">created {new Date(k.created_at).toLocaleString()}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text c="white">{k.usage_count} requests</Text>
                                            <Text c="dimmed" size="sm">{k.last_used_at ? `last used ${new Date(k.last_used_at).toLocaleString()}` : 'never used'}</Text>
                                        </Table.Td>
                                        <Table.Td style={{ minWidth: 360 }}>
                                            {k.key ? (
                                                <CopyButton value={cliCmd} timeout={2000}>
                                                    {({ copy }) => (
                                                        <TextInput
                                                            value={cliCmd}
                                                            readOnly
                                                            styles={{ input: { background: '#0b0b0b', color: 'white' } }}
                                                            rightSection={<Button size="compact-sm" variant="light" onClick={() => { copy(); notifications.show({ title: 'Copied', message: 'dok command copied to clipboard', color: 'blue' }); }}><IconClipboard size={18} /></Button>}
                                                        />
                                                    )}
                                                </CopyButton>
                                            ) : (
                                                <Text c="dimmed" size="sm">Secret is only shown once at creation.</Text>
                                            )}
                                        </Table.Td>
                                        <Table.Td>
                                            <Button size="xs" color="red" variant="light" onClick={() => revokeKey(k.id)}>Revoke</Button>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                )}
            </Card>
        </div>
    );
}


