import React from 'react';
import { Card, Title, Text, NavLink, Code, Anchor, List, Divider, Badge } from '@mantine/core';
import { useParams, Link } from 'react-router-dom';

const sections = [
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'installation', label: 'Installation' },
    { id: 'cli-commands', label: 'CLI Commands' },
    { id: 'generating-docs', label: 'Generating Docs' },
    { id: 'api-keys', label: 'API Keys' },
    { id: 'projects', label: 'Projects & DokBase' },
    { id: 'visualizer', label: '3D Visualizer' },
    { id: 'configuration', label: 'Configuration' },
    { id: 'best-practices', label: 'Best Practices' }
];

export function Usage() {
    const { section } = useParams();
    const current = section || 'getting-started';
    return (
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <Card padding="md" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', height: 'fit-content', position: 'sticky', top: 24 }}>
                <Title order={5} c="white" mb={12}>Documentation</Title>
                {sections.map((s) => (
                    <NavLink key={s.id} component={Link} to={`/usage/${s.id}`} label={s.label} active={current === s.id} style={{ marginBottom: 4 }} />
                ))}
            </Card>
            <Card padding="xl" radius="md" style={{ background: '#0a0a0a', border: '1px solid #1f1f1f', minHeight: '70vh' }}>
                {current === 'getting-started' && <>
                    <Title order={2} c="white">Getting Started with Dokify</Title>
                    <Text c="dimmed" mt={12} size="lg">
                        Dokify is an AI-powered documentation generator that automatically creates comprehensive,
                        human-readable documentation for your entire codebase. It uses Claude for intelligent code
                        analysis and Gemini for synthesizing insights into clear, searchable documentation.
                    </Text>
                    <Divider my={20} />
                    <Title order={3} c="white" mt={24}>What Dokify Does</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>📝 <strong>AI-Generated Documentation</strong> - Automatically documents your code with context-aware summaries</List.Item>
                        <List.Item>🎨 <strong>3D Visualization</strong> - Explore your codebase structure in an interactive 3D graph</List.Item>
                        <List.Item>🔍 <strong>Smart Search</strong> - Find and browse documentation across your entire project</List.Item>
                        <List.Item>☁️ <strong>Cloud Sync</strong> - Upload and share documentation with your team</List.Item>
                        <List.Item>⚡ <strong>Fast & Cached</strong> - Intelligent caching speeds up regeneration</List.Item>
                    </List>
                    <Title order={3} c="white" mt={32}>Quick Start</Title>
                    <Code block mt={12} style={{ fontSize: '14px' }}>
                        {`# Install globally\nnpm install -g dokify\n\n# Authenticate\ndok login\n\n# Generate documentation for your project\ncd /path/to/your/project\ndok generate`}
                    </Code>
                    <Text c="dimmed" mt={16}>
                        That's it! Your documentation will be generated in the <Code>docs/</Code> folder and uploaded to Dokify.com
                        where you can browse, search, and visualize it.
                    </Text>
                </>}

                {current === 'installation' && <>
                    <Title order={2} c="white">Installation</Title>
                    <Divider my={20} />

                    <Title order={3} c="white" mt={24}>NPM (Recommended)</Title>
                    <Text c="dimmed" mt={12}>
                        Install Dokify globally to use it from anywhere:
                    </Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>npm install -g dokify</Code>

                    <Title order={3} c="white" mt={32}>Verify Installation</Title>
                    <Text c="dimmed" mt={12}>Check that Dokify is installed correctly:</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>
                        {`dok version\n# Should output: dokify vX.X.X`}
                    </Code>

                    <Title order={3} c="white" mt={32}>System Requirements</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>Node.js 16.x or higher</List.Item>
                        <List.Item>npm or yarn</List.Item>
                        <List.Item>Git (for repository scanning)</List.Item>
                        <List.Item>Active internet connection (for AI generation and uploads)</List.Item>
                    </List>
                </>}

                {current === 'cli-commands' && <>
                    <Title order={2} c="white">CLI Commands Reference</Title>
                    <Text c="dimmed" mt={12} size="lg">Complete reference for all Dokify CLI commands.</Text>
                    <Divider my={20} />

                    <Title order={3} c="white" mt={24}><Code>dok login</Code></Title>
                    <Text c="dimmed" mt={8}>Authenticate with Dokify using OAuth device flow.</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>dok login</Code>
                    <Text c="dimmed" mt={8} size="sm">
                        Opens your browser to complete authentication. The token is saved locally for future use.
                    </Text>

                    <Title order={3} c="white" mt={32}><Code>dok generate</Code></Title>
                    <Text c="dimmed" mt={8}>Generate documentation for your current repository.</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>
                        {`# Generate and upload documentation\ndok generate\n\n# Generate locally without AI\ndok generate --no-ai\n\n# Generate with AI but don't upload\ndok generate --local-only\n\n# Set concurrency for faster generation\ndok generate --concurrency 16\n\n# Disable cache for fresh generation\ndok generate --no-cache`}
                    </Code>
                    <Text c="dimmed" mt={12}><strong>Flags:</strong></Text>
                    <List mt={8} spacing="xs" c="dimmed" size="sm">
                        <List.Item><Code>--no-ai</Code> - Skip AI processing, generate basic structure only</List.Item>
                        <List.Item><Code>--local-only</Code> - Generate with AI but don't upload to Dokify servers</List.Item>
                        <List.Item><Code>--concurrency &lt;n&gt;</Code> - Set number of concurrent AI requests (default: 8)</List.Item>
                        <List.Item><Code>--no-cache</Code> - Bypass cache and regenerate all summaries</List.Item>
                        <List.Item><Code>--help</Code> - Show all available options</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}><Code>dok key</Code></Title>
                    <Text c="dimmed" mt={8}>Manage your Dokify API key.</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>
                        {`# Show current API key\ndok key --show\n\n# Set API key manually\ndok key --set dok_xxxxxxxxxxxxxx\n\n# Remove stored API key\ndok key --unset`}
                    </Code>

                    <Title order={3} c="white" mt={32}><Code>dok whoami</Code></Title>
                    <Text c="dimmed" mt={8}>Display current authenticated user information.</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>dok whoami</Code>

                    <Title order={3} c="white" mt={32}><Code>dok logout</Code></Title>
                    <Text c="dimmed" mt={8}>Clear stored authentication tokens.</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>dok logout</Code>

                    <Title order={3} c="white" mt={32}><Code>dok version</Code></Title>
                    <Text c="dimmed" mt={8}>Display the installed Dokify version.</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>dok version</Code>
                </>}

                {current === 'generating-docs' && <>
                    <Title order={2} c="white">Generating Documentation</Title>
                    <Text c="dimmed" mt={12} size="lg">Learn how Dokify analyzes and documents your codebase.</Text>
                    <Divider my={20} />

                    <Title order={3} c="white" mt={24}>How It Works</Title>
                    <List mt={12} spacing="md" c="dimmed">
                        <List.Item>
                            <strong>1. Scanning</strong> - Dokify scans your repository, respecting <Code>.gitignore</Code> and <Code>.dokignore</Code> files
                        </List.Item>
                        <List.Item>
                            <strong>2. Chunking</strong> - Large files are intelligently split into manageable chunks
                        </List.Item>
                        <List.Item>
                            <strong>3. AI Analysis</strong> - Claude Haiku extracts structured facts from each chunk
                        </List.Item>
                        <List.Item>
                            <strong>4. Synthesis</strong> - Gemini combines insights into human-readable documentation
                        </List.Item>
                        <List.Item>
                            <strong>5. Upload</strong> - Documentation is uploaded to Dokify.com with version tracking
                        </List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Generated Output</Title>
                    <Text c="dimmed" mt={12}>Dokify creates a <Code>docs/</Code> folder in your project with:</Text>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item><Code>README.md</Code> - Project overview with setup instructions and architecture</List.Item>
                        <List.Item><Code>files/*.md</Code> - Individual documentation for each source file</List.Item>
                        <List.Item><Code>graph.json</Code> - Project structure data for visualization</List.Item>
                        <List.Item><Code>index.html</Code> - Standalone viewer for offline browsing</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Excluding Files</Title>
                    <Text c="dimmed" mt={12}>Create a <Code>.dokignore</Code> file in your project root to exclude files/directories:</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>
                        {`# .dokignore example\nnode_modules/\ndist/\n*.test.ts\n__tests__/\n.env*`}
                    </Code>

                    <Title order={3} c="white" mt={32}>Performance Tips</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>Use <Code>--concurrency 16</Code> for faster generation on large projects</List.Item>
                        <List.Item>Cache automatically speeds up subsequent runs</List.Item>
                        <List.Item>Exclude test files and build artifacts with <Code>.dokignore</Code></List.Item>
                        <List.Item>Use <Code>--local-only</Code> for quick local previews</List.Item>
                    </List>
                </>}

                {current === 'api-keys' && <>
                    <Title order={2} c="white">Managing API Keys</Title>
                    <Text c="dimmed" mt={12} size="lg">Create and manage API keys for programmatic access.</Text>
                    <Divider my={20} />

                    <Title order={3} c="white" mt={24}>Creating an API Key</Title>
                    <List mt={12} spacing="sm" c="dimmed" type="ordered">
                        <List.Item>Navigate to <Anchor component={Link} to="/account/me" c="blue">Account Settings</Anchor></List.Item>
                        <List.Item>Click "Generate API Key"</List.Item>
                        <List.Item>Copy the key immediately (it won't be shown again)</List.Item>
                        <List.Item>Use the provided command to set it in your CLI</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Setting Your API Key</Title>
                    <Code block mt={12} style={{ fontSize: '14px' }}>
                        {`# Set via CLI\ndok key --set dok_xxxxxxxxxxxxxx\n\n# Or set via environment variable\nexport DOKIFY_API_KEY=dok_xxxxxxxxxxxxxx`}
                    </Code>

                    <Title order={3} c="white" mt={32}>API Key Security</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>🔒 Never commit API keys to version control</List.Item>
                        <List.Item>🔄 Rotate keys periodically for security</List.Item>
                        <List.Item>❌ Revoke compromised keys immediately</List.Item>
                        <List.Item>📊 Monitor key usage in Account Settings</List.Item>
                    </List>
                </>}

                {current === 'projects' && <>
                    <Title order={2} c="white">Projects & DokBase</Title>
                    <Text c="dimmed" mt={12} size="lg">Browse, search, and manage your documentation.</Text>
                    <Divider my={20} />

                    <Title order={3} c="white" mt={24}>Viewing Your Projects</Title>
                    <Text c="dimmed" mt={12}>
                        Access your projects from the <Anchor component={Link} to="/projects" c="blue">Projects page</Anchor>.
                        Each project shows:
                    </Text>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>Project name and creation date</List.Item>
                        <List.Item>Number of documented files</List.Item>
                        <List.Item>Quick actions: View, Upload, Delete, Visualize</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Browsing Documentation</Title>
                    <Text c="dimmed" mt={12}>Click any project to enter DokBase - your documentation browser featuring:</Text>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item><strong>Collapsible File Tree</strong> - Navigate your project structure</List.Item>
                        <List.Item><strong>Markdown Rendering</strong> - Rich, formatted documentation</List.Item>
                        <List.Item><strong>Search & Filter</strong> - Quickly find specific files</List.Item>
                        <List.Item><strong>Version Tracking</strong> - See when docs were last updated</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Uploading Updates</Title>
                    <Text c="dimmed" mt={12}>
                        Simply run <Code>dok generate</Code> in your project to upload the latest documentation.
                        Dokify automatically versions your docs and shows timestamps.
                    </Text>
                </>}

                {current === 'visualizer' && <>
                    <Title order={2} c="white">3D Visualizer</Title>
                    <Text c="dimmed" mt={12} size="lg">Explore your codebase structure in interactive 3D.</Text>
                    <Divider my={20} />

                    <Title order={3} c="white" mt={24}>Accessing the Visualizer</Title>
                    <Text c="dimmed" mt={12}>
                        Click the <Badge color="blue">Visualizer</Badge> tab in the navigation or the "Visualize"
                        button on any project to open the 3D graph view.
                    </Text>

                    <Title order={3} c="white" mt={32}>Navigation Controls</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item><strong>🖱️ Left Click + Drag</strong> - Rotate the camera around the graph</List.Item>
                        <List.Item><strong>🖱️ Scroll Wheel</strong> - Zoom in and out</List.Item>
                        <List.Item><strong>🖱️ Middle Click + Drag</strong> - Pan the view</List.Item>
                        <List.Item><strong>🖱️ Click Node</strong> - View documentation for that file</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Understanding the Graph</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>
                            <strong>🔵 Blue Spheres</strong> - Files (clickable to view docs)
                        </List.Item>
                        <List.Item>
                            <strong>🟣 Purple Octahedrons</strong> - Directories (structural nodes)
                        </List.Item>
                        <List.Item>
                            <strong>⚡ Yellow Highlight</strong> - Currently selected file
                        </List.Item>
                        <List.Item>
                            <strong>📏 Gray Lines</strong> - Parent-child relationships
                        </List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Tips for Large Projects</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>Collapse the project sidebar (←) for more viewing space</List.Item>
                        <List.Item>Resize the details pane by dragging its left edge</List.Item>
                        <List.Item>Let the physics simulation settle for clearer structure</List.Item>
                        <List.Item>Use zoom to focus on specific areas of interest</List.Item>
                    </List>
                </>}

                {current === 'configuration' && <>
                    <Title order={2} c="white">Configuration</Title>
                    <Text c="dimmed" mt={12} size="lg">Customize Dokify's behavior with configuration options.</Text>
                    <Divider my={20} />

                    <Title order={3} c="white" mt={24}>Config File Location</Title>
                    <Text c="dimmed" mt={12}>Dokify stores configuration at:</Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>~/.dokify/config.json</Code>

                    <Title order={3} c="white" mt={32}>Environment Variables</Title>
                    <List mt={12} spacing="md" c="dimmed">
                        <List.Item>
                            <Code>DOKIFY_API_BASE</Code> - Override API server URL
                            <Code block mt={8} style={{ fontSize: '13px' }}>export DOKIFY_API_BASE=https://dokify.com</Code>
                        </List.Item>
                        <List.Item>
                            <Code>DOKIFY_API_KEY</Code> - Set API key via environment
                            <Code block mt={8} style={{ fontSize: '13px' }}>export DOKIFY_API_KEY=dok_xxxxxxxxxxxxxx</Code>
                        </List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Cache Location</Title>
                    <Text c="dimmed" mt={12}>
                        Dokify caches AI-generated summaries to speed up regeneration:
                    </Text>
                    <Code block mt={12} style={{ fontSize: '14px' }}>~/.dokify/cache/</Code>
                    <Text c="dimmed" mt={8} size="sm">
                        Clear cache manually or use <Code>--no-cache</Code> flag when generating.
                    </Text>
                </>}

                {current === 'best-practices' && <>
                    <Title order={2} c="white">Best Practices</Title>
                    <Text c="dimmed" mt={12} size="lg">Get the most out of Dokify with these recommendations.</Text>
                    <Divider my={20} />

                    <Title order={3} c="white" mt={24}>Documentation Workflow</Title>
                    <List mt={12} spacing="md" c="dimmed" type="ordered">
                        <List.Item>Run <Code>dok generate</Code> after major feature additions</List.Item>
                        <List.Item>Review generated docs in DokBase before sharing</List.Item>
                        <List.Item>Use <Code>--local-only</Code> for draft reviews</List.Item>
                        <List.Item>Keep <Code>.dokignore</Code> updated to exclude unnecessary files</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Performance Optimization</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>Increase <Code>--concurrency</Code> for large projects (e.g., 16-32)</List.Item>
                        <List.Item>Let cache work its magic - avoid <Code>--no-cache</Code> unless needed</List.Item>
                        <List.Item>Exclude build artifacts and dependencies in <Code>.dokignore</Code></List.Item>
                        <List.Item>Generate docs on a schedule rather than every commit</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Team Collaboration</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>Share project links with team members for easy access</List.Item>
                        <List.Item>Use the visualizer in meetings to explain architecture</List.Item>
                        <List.Item>Keep documentation up-to-date for onboarding</List.Item>
                        <List.Item>Generate docs in CI/CD for automatic updates</List.Item>
                    </List>

                    <Title order={3} c="white" mt={32}>Common Issues</Title>
                    <List mt={12} spacing="sm" c="dimmed">
                        <List.Item>
                            <strong>Slow generation?</strong> Increase concurrency or exclude more files
                        </List.Item>
                        <List.Item>
                            <strong>Missing files?</strong> Check <Code>.gitignore</Code> and <Code>.dokignore</Code>
                        </List.Item>
                        <List.Item>
                            <strong>Stale docs?</strong> Use <Code>--no-cache</Code> to regenerate
                        </List.Item>
                        <List.Item>
                            <strong>Upload failing?</strong> Check authentication with <Code>dok whoami</Code>
                        </List.Item>
                    </List>
                </>}
            </Card>
        </div>
    );
}


