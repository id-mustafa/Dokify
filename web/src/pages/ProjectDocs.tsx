import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, TextInput, Title, Text, NavLink } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type FileRow = { path: string; content: string; updated_at: number };
type TreeNode = { name: string; path?: string; children?: TreeNode[] };

export function ProjectDocs() {
    const { id: projectId = '' } = useParams();
    const [files, setFiles] = useState<FileRow[]>([]);
    const [filter, setFilter] = useState('');
    const [active, setActive] = useState<string>('');
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    useEffect(() => { refresh(); }, [projectId]);

    async function refresh() {
        const [filesRes, treeRes] = await Promise.all([
            api(`/v1/projects/${projectId}/docs`),
            api(`/v1/projects/${projectId}/docs-tree`)
        ]);
        setFiles(filesRes.files || []);
        setTree(Array.isArray(treeRes.tree) ? treeRes.tree : []);
        if (filesRes.files?.length && !active) setActive(filesRes.files[0].path);
    }

    const filtered = useMemo(() => files.filter(f => f.path.toLowerCase().includes(filter.toLowerCase())), [files, filter]);
    const activeFile = filtered.find(f => f.path === active) || filtered[0];

    function toggle(pathKey: string) {
        const next = new Set(expanded);
        if (next.has(pathKey)) next.delete(pathKey); else next.add(pathKey);
        setExpanded(next);
    }

    function renderTree(nodes: TreeNode[], parentPath = ''): React.ReactNode {
        return nodes
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((n) => {
                const full = parentPath ? `${parentPath}/${n.name}` : n.name;
                const isLeaf = !!n.path && (!n.children || n.children.length === 0);
                const hasChildren = !!(n.children && n.children.length > 0);
                // Filter: if a filter is set, only show matching leaves and their ancestors
                const matchesFilter = filter.trim().length === 0 || (isLeaf && full.toLowerCase().includes(filter.toLowerCase()));
                const childRendered = hasChildren ? renderTree(n.children || [], full) : null;
                const childHasMatch = hasChildren && React.Children.count(childRendered) > 0;
                if (!matchesFilter && !childHasMatch) return null;
                if (isLeaf) {
                    return (
                        <NavLink
                            key={full}
                            label={n.name}
                            active={active === (n.path || '')}
                            onClick={() => setActive(n.path || '')}
                            leftSection={<span style={{ width: 18, display: 'inline-block' }}>📄</span>}
                        />
                    );
                }
                const opened = expanded.has(full) || filter.trim().length > 0; // auto-open when filtering
                return (
                    <NavLink
                        key={full}
                        label={n.name}
                        onClick={() => toggle(full)}
                        opened={opened}
                        leftSection={<span style={{ width: 18, display: 'inline-block' }}>📁</span>}
                        style={{ fontWeight: 600 }}
                    >
                        {opened ? childRendered : null}
                    </NavLink>
                );
            });
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh' }}>
            <div style={{ borderRight: '1px solid #1f2937', padding: 16, background: '#0c1220' }}>
                <div className="row" style={{ marginBottom: 12 }}>
                    <Link className="link" to="/projects">← Projects</Link>
                </div>
                <TextInput placeholder="Filter files" value={filter} onChange={e => setFilter(e.currentTarget.value)} styles={{ input: { background: '#0e1422', color: 'white' } }} />
                <div style={{ marginTop: 12, overflow: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
                    {filter.trim().length > 0 ? (
                        filtered.map(f => (
                            <div key={f.path} onClick={() => setActive(f.path)} style={{ padding: '8px 6px', borderRadius: 6, cursor: 'pointer', background: active === f.path ? '#111827' : 'transparent' }}>
                                {f.path}
                            </div>
                        ))
                    ) : (
                        <div>
                            {renderTree(tree)}
                        </div>
                    )}
                </div>
            </div>
            <div style={{ padding: 24 }}>
                <Card shadow="md" padding="lg" radius="md" style={{ height: 'calc(100vh - 48px)', overflow: 'auto', background: '#0f1629', border: '1px solid #1f2937' }}>
                    {activeFile ? (
                        <div>
                            <Title order={3} c="white" style={{ marginTop: 0 }}>{activeFile.path}</Title>
                            <div style={{ lineHeight: 1.7 }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {activeFile.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <Text c="dimmed">No files</Text>
                    )}
                </Card>
            </div>
        </div>
    );
}


