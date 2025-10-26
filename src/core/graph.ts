import fs from 'node:fs';
import path from 'node:path';
import { RepoScan } from './scan.js';

export type Graph = {
    nodes: { id: string; type: 'file' | 'directory' }[];
    edges: { source: string; target: string }[];
};

export async function buildGraph(scan: RepoScan): Promise<Graph> {
    const nodeSet = new Set<string>();
    const edges: Array<{ source: string; target: string }> = [];

    // Build a tree graph: add all files and create parent->child relationships
    for (const abs of scan.files) {
        const rel = path.relative(scan.root, abs).replace(/\\/g, '/');
        nodeSet.add(rel); // Add the file

        // For each file, create edges from parent directories to children
        const parts = rel.split('/');

        // If file is in subdirectories, add directory nodes and edges
        if (parts.length > 1) {
            for (let i = 0; i < parts.length - 1; i++) {
                const dirPath = parts.slice(0, i + 1).join('/');
                const childPath = parts.slice(0, i + 2).join('/');

                nodeSet.add(dirPath); // Add directory node

                // Create edge from directory to its child (either subdirectory or file)
                edges.push({ source: dirPath, target: childPath });
            }
        }
    }

    // Helper function to check if a path is a directory (no file extension)
    function isDirectory(id: string): boolean {
        const lastPart = id.split('/').pop() || '';
        return !lastPart.includes('.');
    }

    // Build nodes array with auto-detected types
    const nodes: Array<{ id: string; type: 'file' | 'directory' }> = Array.from(nodeSet).map(id => ({
        id,
        type: isDirectory(id) ? 'directory' : 'file'
    }));

    // Deduplicate edges
    const uniqueEdges = Array.from(
        new Map(edges.map(e => [`${e.source}→${e.target}`, e])).values()
    );

    return { nodes, edges: uniqueEdges };
}

export async function writeViewer(params: { docsDir: string; graph: Graph }): Promise<void> {
    const indexPath = path.join(params.docsDir, 'index.html');
    const graphPath = path.join(params.docsDir, 'graph.json');
    fs.writeFileSync(graphPath, JSON.stringify(params.graph, null, 2), 'utf-8');
    fs.writeFileSync(indexPath, htmlViewer(), 'utf-8');
}

function htmlViewer(): string {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dokify Docs</title>
    <style>
      body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; display: flex; height: 100vh; }
      #sidebar { width: 320px; border-right: 1px solid #e5e7eb; overflow: auto; padding: 12px; }
      #main { flex: 1; overflow: auto; }
      #graph { height: 50vh; border-bottom: 1px solid #e5e7eb; }
      a { color: #2563eb; text-decoration: none; }
      a:hover { text-decoration: underline; }
      ul { margin: 0; padding-left: 18px; }
      li { margin: 2px 0; }
    </style>
  </head>
  <body>
    <div id="sidebar">
      <h3>Files</h3>
      <ul id="fileList"></ul>
    </div>
    <div id="main">
      <div id="graph"></div>
      <iframe id="docFrame" style="width:100%; height:50vh; border:0;"></iframe>
    </div>
    <script>
      async function init() {
        const res = await fetch('graph.json');
        const graph = await res.json();
        const ul = document.getElementById('fileList');
        graph.nodes.forEach(n => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = 'files/' + n.id + '.md';
          a.textContent = n.id;
          a.addEventListener('click', (e) => {
            e.preventDefault();
            const frame = document.getElementById('docFrame');
            frame.src = a.getAttribute('href');
          });
          li.appendChild(a);
          ul.appendChild(li);
        });
      }
      init();
    </script>
  </body>
</html>`;
}


