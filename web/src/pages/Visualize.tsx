import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Title, Text, NavLink } from '@mantine/core';
import { getToken } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

type Graph = { nodes: { id: string; type?: 'file' | 'directory' }[]; edges: { source: string; target: string }[] };
type Project = { id: string; name: string; slug: string };

export function Visualize() {
    const params = useParams();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedId, setSelectedId] = useState<string>(params.id || '');
    const [graph, setGraph] = useState<Graph | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [docs, setDocs] = useState<Record<string, string>>({});
    const [activePath, setActivePath] = useState<string>('');
    const [detailsWidth, setDetailsWidth] = useState(420);
    const [isResizing, setIsResizing] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const SIDEBAR_WIDTH = 260;
    const effectiveDetailsWidth = sidebarCollapsed ? detailsWidth + SIDEBAR_WIDTH : detailsWidth;
    const mountRef = useRef<HTMLDivElement | null>(null);
    const rendererRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const sceneRef = useRef<any>(null);
    const animRef = useRef<number | null>(null);
    const pickablesRef = useRef<Array<{ mesh: any; id: string }>>([]);

    useEffect(() => { fetchProjects(); }, []);
    useEffect(() => { if (selectedId) { fetchGraph(selectedId); fetchDocs(selectedId); } }, [selectedId]);
    useEffect(() => { if (params.id && params.id !== selectedId) setSelectedId(params.id); }, [params.id]);

    // Resize handler
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 300 && newWidth <= 800) {
                setDetailsWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizing]);

    async function fetchProjects() {
        try {
            const API = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000/v1';
            const token = getToken();
            const res = await fetch(`${API}/projects`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
            if (!res.ok) throw new Error(String(res.status));
            const json = await res.json() as { projects: Project[] };
            setProjects(json.projects || []);
            if (!selectedId && json.projects?.length) {
                setSelectedId(json.projects[0].id);
                navigate(`/projects/${json.projects[0].id}/visualize`, { replace: true });
            }
        } catch (e: any) {
            setError(e?.message || 'Failed to load projects');
        }
    }

    async function fetchGraph(id: string) {
        setGraph(null); setError(null);
        try {
            const API = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000/v1';
            const token = getToken();
            const res = await fetch(`${API}/projects/${id}/assets/graph.json`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
            if (!res.ok) throw new Error(String(res.status));
            const text = await res.text();
            const json = JSON.parse(text);
            console.log('Fetched graph:', json.nodes?.length, 'nodes,', json.edges?.length, 'edges');
            setGraph(json);
            initThree(json);
        } catch (e: any) {
            console.error('Error fetching graph:', e);
            setError(e?.message || 'Failed to load graph');
        }
    }

    async function fetchDocs(id: string) {
        try {
            const API = (import.meta as any).env?.VITE_DOKIFY_API_BASE || 'http://127.0.0.1:4000/v1';
            const token = getToken();
            const res = await fetch(`${API}/projects/${id}/docs`, { headers: token ? { authorization: `Bearer ${token}` } : {} });
            if (!res.ok) return;
            const json = await res.json() as { files: { path: string; content: string }[] };
            const map: Record<string, string> = {};
            for (const f of (json.files || [])) map[f.path] = f.content;
            setDocs(map);
        } catch { }
    }

    function initThree(g: Graph) {
        const mount = mountRef.current; if (!mount) return;
        // Cleanup
        if (animRef.current) cancelAnimationFrame(animRef.current);
        if (rendererRef.current) {
            try { mount.removeChild(rendererRef.current.domElement); } catch { }
            rendererRef.current.dispose();
        }
        pickablesRef.current = [];

        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#0b1222');
        const width = mount.clientWidth || 900;
        const height = 600;
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 5000);
        camera.position.set(0, 300, 800);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        mount.appendChild(renderer.domElement);

        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);

        // OrbitControls for drag/zoom
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 1.2;
        controls.enablePan = true;
        controls.minDistance = 100;
        controls.maxDistance = 2000;

        // Helper function to create text labels
        function createLabel(text: string, isDirectory: boolean = false) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            ctx.font = 'Bold 16px Arial';
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;

            canvas.width = Math.max(128, textWidth + 20);
            canvas.height = 32;

            // Background - different color for directories
            ctx.fillStyle = isDirectory ? 'rgba(139, 92, 246, 0.85)' : 'rgba(15, 22, 41, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Border - different color for directories
            ctx.strokeStyle = isDirectory ? '#a78bfa' : '#60a5fa';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            // Text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'Bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            const spriteMat = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthTest: false,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.scale.set(canvas.width * 0.5, canvas.height * 0.5, 1);
            return sprite;
        }

        // Physics simulation setup
        type Node3D = {
            id: string;
            mesh: InstanceType<typeof THREE.Mesh>;
            label: InstanceType<typeof THREE.Sprite>;
            vx: number;
            vy: number;
            vz: number;
        };

        const fileSphereGeo = new THREE.SphereGeometry(8, 16, 16);
        const dirOctaGeo = new THREE.OctahedronGeometry(15, 0); // Bigger octahedrons for directories
        const nodes3D: Node3D[] = [];
        const nodeMap = new Map<string, Node3D>();

        console.log('Creating nodes:', g.nodes.length, 'nodes found');

        // Create nodes with labels
        g.nodes.forEach((node) => {
            const isDirectory = node.type === 'directory';

            // Use different geometry and color for directories vs files
            const geometry = isDirectory ? dirOctaGeo : fileSphereGeo;
            const color = isDirectory ? 0x8b5cf6 : 0x60a5fa; // purple for dirs, blue for files
            const nodeMat = new THREE.MeshBasicMaterial({ color });
            const mesh = new THREE.Mesh(geometry, nodeMat);

            // Random initial position
            mesh.position.set(
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 600,
                (Math.random() - 0.5) * 800
            );

            (mesh as any).userData = { id: node.id, type: node.type || 'file' };
            scene.add(mesh);

            // Create label with appropriate styling
            const fileName = node.id.split('/').pop() || node.id;
            const label = createLabel(fileName, isDirectory);
            label.position.copy(mesh.position);
            label.position.y += 20;
            scene.add(label);

            const node3D: Node3D = {
                id: node.id,
                mesh,
                label,
                vx: 0,
                vy: 0,
                vz: 0
            };

            nodes3D.push(node3D);
            nodeMap.set(node.id, node3D);

            // Only add files to pickables (directories are not clickable)
            if (!isDirectory) {
                pickablesRef.current.push({ mesh, id: node.id });
            }
        });

        // Create edges (lines)
        const edgeLines: InstanceType<typeof THREE.Line>[] = [];
        console.log('Creating edges:', g.edges.length, 'edges found');
        g.edges.forEach((edge) => {
            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);

            if (sourceNode && targetNode) {
                const points = [
                    sourceNode.mesh.position.clone(),
                    targetNode.mesh.position.clone()
                ];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({
                    color: 0x60a5fa, // Bright blue to match nodes
                    transparent: true,
                    opacity: 0.8,
                    linewidth: 2 // Thicker lines
                });
                const line = new THREE.Line(geometry, material);
                scene.add(line);
                edgeLines.push(line);
            } else {
                console.log('Edge missing nodes:', edge.source, '->', edge.target, 'source:', !!sourceNode, 'target:', !!targetNode);
            }
        });
        console.log('Created', edgeLines.length, 'edge lines');

        // Physics simulation
        const edgeData = g.edges.map(e => ({
            source: nodeMap.get(e.source),
            target: nodeMap.get(e.target)
        })).filter(e => e.source && e.target) as Array<{ source: Node3D; target: Node3D }>;

        function runPhysics() {
            const damping = 0.85;
            const repulsion = 15000;
            const springStrength = 0.001;
            const idealDistance = 150;

            // Apply damping
            nodes3D.forEach(n => {
                n.vx *= damping;
                n.vy *= damping;
                n.vz *= damping;
            });

            // Repulsion between all nodes
            for (let i = 0; i < nodes3D.length; i++) {
                for (let j = i + 1; j < nodes3D.length; j++) {
                    const a = nodes3D[i];
                    const b = nodes3D[j];

                    const dx = a.mesh.position.x - b.mesh.position.x;
                    const dy = a.mesh.position.y - b.mesh.position.y;
                    const dz = a.mesh.position.z - b.mesh.position.z;
                    const distSq = dx * dx + dy * dy + dz * dz + 0.1;
                    const force = repulsion / distSq;

                    const dist = Math.sqrt(distSq);
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    const fz = (dz / dist) * force;

                    a.vx += fx;
                    a.vy += fy;
                    a.vz += fz;
                    b.vx -= fx;
                    b.vy -= fy;
                    b.vz -= fz;
                }
            }

            // Spring forces for edges
            edgeData.forEach(({ source, target }) => {
                const dx = target.mesh.position.x - source.mesh.position.x;
                const dy = target.mesh.position.y - source.mesh.position.y;
                const dz = target.mesh.position.z - source.mesh.position.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;

                const force = springStrength * (dist - idealDistance);
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                const fz = (dz / dist) * force;

                source.vx += fx;
                source.vy += fy;
                source.vz += fz;
                target.vx -= fx;
                target.vy -= fy;
                target.vz -= fz;
            });

            // Update positions
            nodes3D.forEach(n => {
                n.mesh.position.x += n.vx;
                n.mesh.position.y += n.vy;
                n.mesh.position.z += n.vz;

                // Update label position
                n.label.position.copy(n.mesh.position);
                n.label.position.y += 20;
            });

            // Update edge positions
            let edgeIdx = 0;
            edgeData.forEach(({ source, target }) => {
                const line = edgeLines[edgeIdx];
                if (line) {
                    const positions = new Float32Array([
                        source.mesh.position.x, source.mesh.position.y, source.mesh.position.z,
                        target.mesh.position.x, target.mesh.position.y, target.mesh.position.z
                    ]);
                    line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                    line.geometry.attributes.position.needsUpdate = true;
                }
                edgeIdx++;
            });
        }

        // Animation loop
        let physicsSteps = 0;
        const maxPhysicsSteps = 300; // Run physics for 300 frames then stabilize

        const animate = () => {
            if (physicsSteps < maxPhysicsSteps) {
                runPhysics();
                physicsSteps++;
            }

            controls.update();
            renderer.render(scene, camera);
            animRef.current = requestAnimationFrame(animate);
        };
        animate();

        // Click handling with raycasting
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        renderer.domElement.addEventListener('click', (ev: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const meshes = pickablesRef.current.map(p => p.mesh);
            const hits = raycaster.intersectObjects(meshes, false);

            if (hits.length > 0) {
                const hitMesh = hits[0].object as any;
                const nodeData = pickablesRef.current.find(p => p.mesh === hitMesh);
                if (nodeData) {
                    // Only show docs for files (directories are not clickable)
                    const userData = hitMesh.userData;
                    if (userData && userData.type !== 'directory') {
                        setActivePath(nodeData.id);

                        // Highlight selected file (reset all files to blue, then highlight selected)
                        pickablesRef.current.forEach(p => {
                            (p.mesh.material as InstanceType<typeof THREE.MeshBasicMaterial>).color.setHex(0x60a5fa);
                        });
                        (hitMesh.material as InstanceType<typeof THREE.MeshBasicMaterial>).color.setHex(0xfbbf24);
                    }
                }
            }
        });

        rendererRef.current = renderer;
        cameraRef.current = camera;
        sceneRef.current = scene;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: sidebarCollapsed ? `0px 1fr ${effectiveDetailsWidth}px` : `${SIDEBAR_WIDTH}px 1fr ${detailsWidth}px`, height: '100vh', transition: 'grid-template-columns 0.3s ease' }}>
            <div style={{
                borderRight: sidebarCollapsed ? '0' : '1px solid #1f2937',
                padding: sidebarCollapsed ? 0 : 16,
                background: '#0c1220',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
            }}>
                {!sidebarCollapsed && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title order={4} c="white" style={{ marginTop: 0 }}>Visualizer</Title>
                        </div>
                        <div style={{ marginTop: 8, overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
                            {projects.map(p => (
                                <NavLink
                                    key={p.id}
                                    label={p.name}
                                    description={p.slug}
                                    active={selectedId === p.id}
                                    onClick={() => { setSelectedId(p.id); navigate(`/projects/${p.id}/visualize`); }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <div style={{ padding: 24, position: 'relative' }}>
                <Card shadow="md" padding="lg" radius="md" style={{ height: 'calc(100vh - 48px)', overflow: 'hidden', background: '#0f1629', border: '1px solid #1f2937' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            style={{
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '6px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#374151';
                                e.currentTarget.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#1f2937';
                                e.currentTarget.style.color = '#9ca3af';
                            }}
                            title={sidebarCollapsed ? 'Show projects' : 'Hide projects'}
                        >
                            {sidebarCollapsed ? '☰' : '←'}
                        </button>
                        <Title order={3} c="white" style={{ margin: 0 }}>
                            {projects.find(p => p.id === selectedId)?.name || 'Project'} Graph
                        </Title>
                    </div>
                    {!graph && !error && <Text c="dimmed">Loading…</Text>}
                    {error && <Text c="red">{error}</Text>}
                    <div ref={mountRef} style={{ marginTop: 8, width: '100%', height: 600, display: 'block', background: '#0b1222', borderRadius: 6 }} />
                </Card>
                {/* Resize handle */}
                <div
                    onMouseDown={() => setIsResizing(true)}
                    style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '8px',
                        cursor: 'col-resize',
                        background: 'transparent',
                        zIndex: 10,
                        transition: isResizing ? 'none' : 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(96, 165, 250, 0.3)'}
                    onMouseLeave={(e) => !isResizing && (e.currentTarget.style.background = 'transparent')}
                />
            </div>
            <div style={{ padding: 24, background: '#0c1220', overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                <Title order={4} c="white" style={{ marginTop: 0 }}>Details</Title>
                {activePath ? (
                    <div style={{ overflow: 'hidden', width: '100%', maxWidth: '100%' }}>
                        <Text c="dimmed" size="sm" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>{activePath}</Text>
                        <div style={{ marginTop: 8, maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', overflowX: 'hidden', width: '100%', maxWidth: '100%' }}>
                            <Card padding="md" radius="md" style={{ background: '#0f1629', border: '1px solid #1f2937', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                                <div style={{
                                    color: '#e2e8f0',
                                    wordWrap: 'break-word',
                                    overflowWrap: 'break-word',
                                    maxWidth: '100%',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}>
                                    <style>{`
                                        .details-content {
                                            max-width: 100%;
                                            overflow-x: hidden;
                                        }
                                        .details-content * {
                                            max-width: 100%;
                                            box-sizing: border-box;
                                        }
                                        .details-content pre {
                                            overflow-x: auto;
                                            max-width: 100%;
                                            background: #0b1222;
                                            padding: 12px;
                                            border-radius: 6px;
                                            border: 1px solid #1f2937;
                                            white-space: pre-wrap;
                                            word-wrap: break-word;
                                        }
                                        .details-content code {
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                            max-width: 100%;
                                            display: inline-block;
                                        }
                                        .details-content pre code {
                                            white-space: pre-wrap;
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                        }
                                        .details-content p {
                                            margin: 8px 0;
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                            max-width: 100%;
                                        }
                                        .details-content h1, .details-content h2, 
                                        .details-content h3, .details-content h4,
                                        .details-content h5, .details-content h6 {
                                            margin-top: 16px;
                                            margin-bottom: 8px;
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                            max-width: 100%;
                                        }
                                        .details-content ul, .details-content ol {
                                            padding-left: 20px;
                                            max-width: 100%;
                                        }
                                        .details-content li {
                                            margin: 4px 0;
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                        }
                                        .details-content table {
                                            width: 100%;
                                            max-width: 100%;
                                            overflow-x: auto;
                                            display: block;
                                        }
                                        .details-content a {
                                            color: #60a5fa;
                                            word-break: break-all;
                                            overflow-wrap: anywhere;
                                        }
                                        .details-content blockquote {
                                            margin: 8px 0;
                                            padding-left: 12px;
                                            border-left: 3px solid #60a5fa;
                                            word-break: break-word;
                                            overflow-wrap: break-word;
                                        }
                                        .details-content img {
                                            max-width: 100%;
                                            height: auto;
                                        }
                                    `}</style>
                                    <div className="details-content">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {docs[`files/${activePath}.md`] || 'No documentation available.'}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <Text c="dimmed">Select a node to see details.</Text>
                )}
            </div>
        </div>
    );
}


