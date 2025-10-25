# Dokify CLI

Generate and upload documentation for your codebase.

## Install

```bash
npm install
npm run build
```

## Usage

- Login with an access token (optional for local-only):

```bash
dok login --api https://api.dokify.com --token YOUR_TOKEN
```

- Generate docs (local only, no external calls or upload):

```bash
node dist/cli.js generate --local-only
```

This creates a `docs/` folder with:
- `files/` markdown per file
- `overview/overview.md`
- `index.html` simple viewer
- `graph.json` nodes/edges for the project

## Notes

- Config is stored in `~/.dokify/config.json` when permitted, with a fallback to a local `.dokify/` folder.
- Upload is currently stubbed; it logs intent unless `apiBaseUrl` and `token` are set.
- Summarization uses a local heuristic fallback for MVP.
