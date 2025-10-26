#!/usr/bin/env node
// Quick diagnostic for visualizer issues

import fs from 'fs';
import path from 'path';

console.log('🔍 Dokify Visualizer Diagnostic\n');

// Check if docs folder exists
const docsDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(docsDir)) {
    console.log('❌ No docs folder found');
    console.log('   Run: dok generate --local-only\n');
    process.exit(1);
}
console.log('✓ docs folder exists');

// Check if graph.json exists
const graphPath = path.join(docsDir, 'graph.json');
if (!fs.existsSync(graphPath)) {
    console.log('❌ No graph.json found');
    console.log('   Run: dok generate --local-only\n');
    process.exit(1);
}
console.log('✓ graph.json exists');

// Parse and analyze graph
try {
    const graphContent = fs.readFileSync(graphPath, 'utf-8');
    const graph = JSON.parse(graphContent);
    
    console.log(`\n📊 Graph Statistics:`);
    console.log(`   Nodes: ${graph.nodes?.length || 0}`);
    console.log(`   Edges: ${graph.edges?.length || 0}`);
    
    // Count node types
    const fileCount = graph.nodes?.filter(n => n.type === 'file').length || 0;
    const dirCount = graph.nodes?.filter(n => n.type === 'directory').length || 0;
    const untyped = graph.nodes?.filter(n => !n.type).length || 0;
    
    console.log(`\n📁 Node Types:`);
    console.log(`   Files: ${fileCount}`);
    console.log(`   Directories: ${dirCount}`);
    if (untyped > 0) {
        console.log(`   ⚠️  Untyped: ${untyped}`);
    }
    
    // Check for issues
    console.log(`\n🔍 Issues:`);
    
    if (graph.edges?.length === 0) {
        console.log(`   ⚠️  No edges found (nodes won't be connected)`);
        console.log(`       This might be expected for flat project structures`);
    } else {
        console.log(`   ✓ Edges present`);
    }
    
    if (dirCount === 0 && graph.nodes?.length > 1) {
        console.log(`   ⚠️  No directories found`);
        console.log(`       Expected for flat structures, but unusual for nested projects`);
    } else if (dirCount > 0) {
        console.log(`   ✓ Directory nodes present`);
    }
    
    if (untyped > 0) {
        console.log(`   ❌ Some nodes are missing type field`);
        console.log(`       Re-run: dok generate --local-only`);
    } else {
        console.log(`   ✓ All nodes have types`);
    }
    
    // Sample edges
    if (graph.edges?.length > 0) {
        console.log(`\n📝 Sample Edges:`);
        graph.edges.slice(0, 3).forEach((edge, i) => {
            console.log(`   ${i + 1}. ${edge.source} → ${edge.target}`);
        });
        if (graph.edges.length > 3) {
            console.log(`   ... and ${graph.edges.length - 3} more`);
        }
    }
    
    console.log(`\n✅ Graph structure looks valid`);
    console.log(`\nNext steps:`);
    console.log(`   1. Rebuild server: cd server && npm run build`);
    console.log(`   2. Restart server: cd server && npm start`);
    console.log(`   3. Upload docs: dok upload`);
    console.log(`   4. Open web UI and navigate to Visualizer\n`);
    
} catch (error) {
    console.log(`❌ Failed to parse graph.json: ${error.message}\n`);
    process.exit(1);
}

