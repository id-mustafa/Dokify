import React from 'react';
import { Card, Title, Text, NavLink, Code, Anchor } from '@mantine/core';
import { useParams, Link } from 'react-router-dom';

const sections = [
    { id: 'getting-started', label: 'Getting started' },
    { id: 'cli', label: 'CLI commands' },
    { id: 'api-keys', label: 'API keys' },
    { id: 'projects', label: 'Projects & DokBase' },
    { id: 'agent', label: 'DokAgent' },
    { id: 'visualizer', label: 'Visualizer' }
];

export function Usage() {
    const { section } = useParams();
    const current = section || 'getting-started';
    return (
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
            <Card padding="md" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                {sections.map((s) => (
                    <NavLink key={s.id} component={Link} to={`/usage/${s.id}`} label={s.label} active={current === s.id} />
                ))}
            </Card>
            <Card padding="lg" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
                {current === 'getting-started' && <>
                    <Title order={2} c="white">Getting started</Title>
                    <Text c="dimmed" mt={8}>Install the CLI and log in.</Text>
                    <Code block mt={12}>npm install{`\n`}npm run build{`\n`}dok login</Code>
                </>}
                {current === 'cli' && <>
                    <Title order={2} c="white">CLI commands</Title>
                    <Text c="dimmed" mt={8}>Common workflows.</Text>
                    <Code block mt={12}>dok login{`\n`}dok generate{`\n`}dok keys set --api-key=YOUR_KEY</Code>
                </>}
                {current === 'api-keys' && <>
                    <Title order={2} c="white">API keys</Title>
                    <Text c="dimmed" mt={8}>Create keys and add to dok.</Text>
                    <Code block mt={12}>dok keys set --api-key=YOUR_GENERATED_KEY</Code>
                </>}
                {current === 'projects' && <>
                    <Title order={2} c="white">Projects & DokBase</Title>
                    <Text c="dimmed" mt={8}>View docs, browse files, and open the visualizer.</Text>
                    <Anchor component={Link} to="/projects" c="blue">Go to Projects</Anchor>
                </>}
                {current === 'agent' && <>
                    <Title order={2} c="white">DokAgent</Title>
                    <Text c="dimmed" mt={8}>Ask questions about your repository (API key required).</Text>
                    <Code block mt={12}>POST /v1/agent/ask{`\n`}{`{ "question": "How does auth work?" }`}</Code>
                </>}
                {current === 'visualizer' && <>
                    <Title order={2} c="white">Visualizer</Title>
                    <Text c="dimmed" mt={8}>Explore your docs in 3D and see relationships.</Text>
                </>}
            </Card>
        </div>
    );
}


