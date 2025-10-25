---
path: src/commands/generate.ts
chunkCount: 1
entities:
  - registerGenerateCommand
dependenciesPreview:
  - "import { Command } from 'commander';"
  - import ora from 'ora';
  - import chalk from 'chalk';
  - "import path from 'node:path';"
  - "import fs from 'node:fs';"
  - "import { loadConfig } from '../config.js';"
  - "import { scanRepository } from '../core/scan.js';"
  - "import { chunkFiles } from '../core/chunk.js';"
  - "import { summarizeChunks } from '../core/summarize.js';"
  - "import { writeDocs } from '../core/docs.js';"
---
# src/commands/generate.ts

## Overview
Auto-generated summary from 1 chunk(s).
## Key Entities
- registerGenerateCommand
## Dependencies (preview)
- import { Command } from 'commander';
- import ora from 'ora';
- import chalk from 'chalk';
- import path from 'node:path';
- import fs from 'node:fs';
- import { loadConfig } from '../config.js';
- import { scanRepository } from '../core/scan.js';
- import { chunkFiles } from '../core/chunk.js';
- import { summarizeChunks } from '../core/summarize.js';
- import { writeDocs } from '../core/docs.js';
- import { buildGraph, writeViewer } from '../core/graph.js';
- import { uploadDocs } from '../core/upload.js';
## Chunk Notes
### Chunk 1/1
- Purpose: Auto summary for generate.ts chunk 1/1
- Entities: registerGenerateCommand