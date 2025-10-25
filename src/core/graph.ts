import fs from 'node:fs';
import path from 'node:path';
import { RepoScan } from './scan.js';

export type Graph = {
    nodes: { id: string }[];
    edges: { source: string; target: string }[];
};

export async function buildGraph(scan: RepoScan): Promise<Graph> {
    const nodes = scan.files.map((f) => ({ id: path.relative(scan.root, f) }));
    // MVP: no edges without parsing imports across languages; leave empty
    const edges: { source: string; target: string }[] = [];
    return { nodes, edges };
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


