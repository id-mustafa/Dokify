# Dokify CLI

Generate and upload documentation for your codebase.

## Install

```bash
npm install
npm run build
```

## Usage

- Login with device flow (opens browser and stores token):

```bash
dok login
```

- Or register/login on the web app and use API keys from your Account.

- Dev server base URL persistence and env override:

```bash
# Once set with --api, future dok login uses it automatically
dok login --api http://127.0.0.1:4000

# Or set environment variable for CI/sessions
export DOKIFY_API_BASE=http://127.0.0.1:4000
dok login
```

- Generate docs (local only, no external calls or upload):

```bash
node dist/cli.js generate --local-only
```

API keys
--------

- Generate an API key in the web app under Account → API Keys.
- Copy the command shown to add your key to the dok CLI:

```bash
dok keys set --api-key=YOUR_GENERATED_KEY
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
- Dokify manages provider keys (no BYOK). Your API key authenticates usage.
