# Dokify

> AI-powered documentation generator for your codebase

Dokify automatically generates comprehensive, human-readable documentation for your entire codebase using advanced AI models. It creates searchable documentation, interactive 3D visualizations, and provides a beautiful web interface for browsing your project structure.

## Features

- 📝 **AI-Generated Documentation** - Uses Claude Haiku for intelligent code analysis and Gemini for synthesizing human-readable docs
- 🎨 **3D Visualization** - Interactive Three.js-powered graph showing your project structure
- 🔍 **Smart Search & Browse** - Navigate documentation with collapsible file trees and markdown rendering
- ☁️ **Cloud Sync** - Upload and share documentation with your team via Dokify.com
- ⚡ **Fast & Cached** - Intelligent caching speeds up regeneration significantly
- 📊 **Version Tracking** - Automatic versioning with timestamps on all documentation

## Installation

```bash
npm install -g dokify
```

## Quick Start

```bash
# Authenticate with Dokify
dok login

# Generate documentation for your project
cd /path/to/your/project
dok generate

# View your docs at https://dokify.com/projects
```

## CLI Commands

### `dok login`
Authenticate with Dokify using OAuth device flow. Opens your browser to complete authentication.

```bash
dok login
```

### `dok generate`
Generate and upload documentation for your current repository.

```bash
# Basic usage
dok generate

# Available flags:
dok generate --no-ai              # Skip AI, generate basic structure only
dok generate --local-only         # Generate with AI but don't upload
dok generate --concurrency 16     # Set concurrent AI requests
dok generate --no-cache           # Bypass cache, regenerate everything
dok generate --help               # Show all options
```

### `dok upload`
Upload existing documentation without regenerating it. Useful when you've already generated docs and just want to push them to Dokify.

```bash
# Upload existing ./docs folder
dok upload
```

**Requirements:**
- You must be logged in (`dok login`)
- The `./docs` folder must exist (run `dok generate` first)

### `dok key`
Manage your Dokify API key.

```bash
dok key --show                    # Display current API key
dok key --set dok_xxxxxx          # Set API key manually
dok key --unset                   # Remove stored key
```

### Other Commands

```bash
dok whoami                        # Display current user info
dok logout                        # Clear authentication tokens
dok version                       # Show installed version
```

## How It Works

1. **Scanning** - Dokify scans your repository, respecting `.gitignore` and `.dokignore` files
2. **Chunking** - Large files are intelligently split into manageable chunks
3. **AI Analysis** - Claude Haiku extracts structured facts from each code chunk
4. **Synthesis** - Gemini combines insights into comprehensive, human-readable documentation
5. **Upload** - Documentation is uploaded to Dokify.com with version tracking

## Generated Output

Dokify creates a `docs/` folder containing:

```
docs/
├── README.md           # Project overview with setup and architecture
├── files/              # Individual documentation for each source file
│   ├── src/
│   │   ├── index.ts.md
│   │   └── ...
├── graph.json          # Project structure data for visualization
└── index.html          # Standalone viewer for offline browsing
```

## Configuration

### Excluding Files

Create a `.dokignore` file in your project root:

```
# .dokignore
node_modules/
dist/
build/
*.test.ts
__tests__/
.env*
```

### Environment Variables

```bash
# Override API server URL
export DOKIFY_API_BASE=https://dokify.com

# Set API key via environment
export DOKIFY_API_KEY=dok_xxxxxxxxxxxxxx
```

### Config Location

Configuration is stored at:
- `~/.dokify/config.json` - User configuration
- `~/.dokify/cache/` - AI summary cache

## Web Interface

Visit [dokify.com](https://dokify.com) to:

- Browse your documentation in DokBase
- Explore projects in interactive 3D with the Visualizer
- Manage API keys and account settings
- Share documentation with your team

### 3D Visualizer Features

- 🔵 **Blue Spheres** = Files (clickable to view docs)
- 🟣 **Purple Octahedrons** = Directories (structural nodes)
- ⚡ **Yellow Highlight** = Currently selected file
- 📏 **Gray Lines** = Parent-child relationships

**Controls:**
- Left Click + Drag → Rotate camera
- Scroll Wheel → Zoom in/out
- Middle Click + Drag → Pan view
- Click Node → View documentation

## Performance Tips

- Use `--concurrency 16` (or higher) for large projects
- Let cache work - avoid `--no-cache` unless necessary
- Exclude test files and build artifacts in `.dokignore`
- Use `--local-only` for quick local previews

## Development

### Project Structure

```
Dokify/
├── src/                # CLI source code
│   ├── cli.ts          # Main CLI entry point
│   ├── commands/       # CLI commands (login, generate, keys, etc.)
│   ├── core/           # Core functionality (scan, chunk, summarize, upload)
│   └── config.ts       # Configuration management
├── server/             # Backend API server
│   └── src/
│       ├── index.ts    # Server entry point
│       ├── auth.ts     # Authentication & OAuth
│       ├── docs.ts     # Documentation endpoints
│       └── llm.ts      # AI provider integration
├── web/                # React web application
│   └── src/
│       ├── pages/      # Page components
│       └── lib/        # Shared utilities
└── docs/               # Generated documentation
```

### Running Locally

#### CLI Development

```bash
# Install dependencies
npm install

# Build CLI
npm run build

# Link for local development
npm link

# Run CLI
dok --help
```

#### Server Development

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:4000`

#### Web Development

```bash
cd web
npm install
npm run dev
```

Web app runs at `http://localhost:5173`

### Environment Setup

Create `.env` files:

**`server/.env`:**
```bash
SUPABASE_URL=https://[your-project].supabase.co
SUPABASE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
ANTHROPIC_API_KEY=your-anthropic-key
GOOGLE_API_KEY=your-google-key
GITHUB_CLIENT_ID=your-github-oauth-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

**`web/.env`:**
```bash
VITE_DOKIFY_API_BASE=http://localhost:4000
```

## Architecture

### AI Processing Pipeline

1. **Chunk-Level Analysis (Claude Haiku)**
   - Extracts structured facts: purpose, entities, inputs/outputs, dependencies
   - Fast, cost-effective for initial analysis
   - Results cached for subsequent runs

2. **File-Level Synthesis (Gemini)**
   - Combines chunk facts with code context
   - Generates comprehensive, human-readable documentation
   - Concurrent processing for speed

3. **Project-Level Overview (Gemini)**
   - Synthesizes project README with setup instructions
   - Documents environment configs, scripts, and architecture
   - Provides high-level understanding

### Tech Stack

- **CLI**: Node.js, TypeScript, Commander.js
- **Backend**: Fastify, JWT auth, OAuth 2.0, WebSockets
- **Frontend**: React, Vite, Mantine UI, Three.js
- **Database**: PostgreSQL (Supabase)
- **AI**: Anthropic Claude, Google Gemini

## Deployment

Dokify uses Supabase PostgreSQL for data persistence. To deploy your own instance:

1. **Set up Supabase**:
   - Create a project at [supabase.com](https://supabase.com)
   - Run the schema in `server/schema.sql` via SQL Editor
   - Get your `SUPABASE_URL` and `SUPABASE_KEY` (service_role) from Settings → API

2. **Configure environment variables**:
   ```bash
   SUPABASE_URL=https://[your-project].supabase.co
   SUPABASE_KEY=your-service-role-key
   JWT_SECRET=your-random-secret
   ANTHROPIC_API_KEY=sk-ant-xxx
   GOOGLE_API_KEY=AIzaSyxxx
   # ... other OAuth keys
   ```

3. **Deploy**:
   - Server: Railway, Vercel, or your own VPS
   - Web: Vercel, Netlify, or Cloudflare Pages

📖 **Full deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## License

MIT

## Support

For issues, questions, or feature requests:
- Visit [dokify.com](https://dokify.com)
- Check the [Usage Documentation](https://dokify.com/usage)
- Report issues on GitHub

---

Made with ❤️ by the Dokify team
