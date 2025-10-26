import React from 'react';
import { Button, Card, Title, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { getToken } from '../lib/api';

export function App() {
    const isAuthed = !!getToken();
    return (
        <div className="container" style={{ paddingTop: 24 }}>
            <Card shadow="xl" padding="xl" radius="lg" style={{ background: 'linear-gradient(180deg,#0a0a0a,#000000)', border: '1px solid #1f1f1f' }}>
                <Title order={1} c="white" style={{ marginBottom: 12 }}>Your codebase. Documented. Reimagined.</Title>
                <Text c="dimmed" size="lg" style={{ marginBottom: 24 }}>
                    Generate beautiful, structured documentation for your projects with a single command. Explore your Dokbase and share with your team.
                </Text>
                <div className="row">
                    <Button component={Link} to="/usage" color="blue" size="md">Get started</Button>
                    {isAuthed ? (
                        <Button component={Link} to="/projects" variant="light" color="blue" size="md">View projects</Button>
                    ) : (
                        <Button component={Link} to="/login" variant="light" color="blue" size="md">Login</Button>
                    )}
                </div>
            </Card>

            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 300px))', justifyContent: 'center', marginTop: 24 }}>
                <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                    <Title order={4} c="white">CLI</Title>
                    <Text c="dimmed">Run <code>dok generate</code> to create docs and upload them to your Dokbase.</Text>
                </Card>
                <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                    <Title order={4} c="white">DokBase Docs Viewer</Title>
                    <Text c="dimmed">Browse files and architecture in a clean, searchable interface.</Text>
                </Card>
                <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                    <Title order={4} c="white">DokAgent</Title>
                    <Text c="dimmed">Ask questions about your codebase and get answers.</Text>
                </Card>
                <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                    <Title order={4} c="white">Visualizer</Title>
                    <Text c="dimmed">Visualize your codebase and architecture in a 3D graph.</Text>
                </Card>
                <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                    <Title order={4} c="white">Team‑ready</Title>
                    <Text c="dimmed">Invite teammates to explore and contribute to your knowledge base.</Text>
                </Card>
                <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                    <Title order={4} c="white">Type Conversions</Title>
                    <Text c="dimmed">Convert your markdown files to pdf, docx, or other formats.</Text>
                </Card>
            </div>
        </div>
    );
}


