---
path: package.json
chunkCount: 1
entities:
dependenciesPreview:
version: 1
generated_at: "2025-10-26T03:11:26.594Z"
---
# package.json

## Package
- name: dokify
- version: 0.1.0

## Scripts
- build: tsc -p tsconfig.json
- postbuild: chmod +x dist/cli.js || true
- dev: ts-node --esm src/cli.ts
- start: node dist/cli.js
- clean: rm -rf dist
- mock:server: npm run build && node dist/dev/mock-server.js
- web:dev: npm --prefix web run dev
- web:build: npm --prefix web run build
- web:preview: npm --prefix web run preview
- server:dev: npm --prefix server run dev
- server:build: npm --prefix server run build
- server:start: npm --prefix server run start

## Dependencies
- commander: ^12.1.0
- chalk: ^5.3.0
- ora: ^8.0.1
- zod: ^3.23.8
- fast-glob: ^3.3.2
- ignore: ^5.3.1
- js-yaml: ^4.1.0
- undici: ^6.19.8
- dotenv: ^16.4.5

## Dev Dependencies
- typescript: ^5.6.3
- ts-node: ^10.9.2
- @types/node: ^22.7.6


---
Generated: 2025-10-26T03:11:26.595Z  •  Version: v1
