# Dokify Environment Variables Checklist

## 🔴 REQUIRED Backend Variables (Render - dokify-api service)

These MUST be set for the app to work:

| Variable | Description | Example | Required? |
|----------|-------------|---------|-----------|
| `JWT_SECRET` | Secret key for JWT tokens | `your-long-random-secret-key-here` | ✅ YES |
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` | ✅ YES |
| `SUPABASE_KEY` | Supabase anon public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ YES |
| `ANTHROPIC_API_KEY` | Claude API key for AI summaries | `sk-ant-xxxxx` | ✅ YES |
| `GOOGLE_API_KEY` | Gemini API key for synthesis | `AIzaSyxxxxx` | ✅ YES |
| `WEB_BASE` | Frontend URL | `https://dokify.onrender.com` | ✅ YES |
| `API_BASE` | Backend URL (for OAuth callbacks) | `https://dokify-api.onrender.com` | ✅ YES |

## 🟡 OPTIONAL Backend Variables

These enhance functionality but aren't strictly required:

| Variable | Description | Example | Required? |
|----------|-------------|---------|-----------|
| `DATABASE_URL` | PostgreSQL connection string (for auto-migration) | `postgresql://user:pass@host:5432/db` | 🟡 OPTIONAL |
| `GITHUB_CLIENT_ID` | GitHub OAuth app ID | `Iv1.xxxxxxxxxxxx` | 🟡 OPTIONAL* |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | `xxxxxxxxxxxx` | 🟡 OPTIONAL* |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxxxx.apps.googleusercontent.com` | 🟡 OPTIONAL* |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxxx` | 🟡 OPTIONAL* |
| `PORT` | Server port | `4000` | 🟢 Has default |
| `HOST` | Server host | `0.0.0.0` | 🟢 Has default |
| `ANTHROPIC_MODEL` | Claude model name | `claude-3-5-haiku-latest` | 🟢 Has default |
| `GOOGLE_MODEL` | Gemini model name | `gemini-1.5-flash` | 🟢 Has default |

\* Required only if you want GitHub/Google OAuth login

## 🟢 AUTO-GENERATED Backend Variables

These are automatically generated from `API_BASE`, but you can override them:

| Variable | Description | Auto-Generated Value |
|----------|-------------|---------------------|
| `GITHUB_REDIRECT_URI` | GitHub OAuth callback | `${API_BASE}/v1/oauth/github/callback` |
| `GOOGLE_REDIRECT_URI` | Google OAuth callback | `${API_BASE}/v1/oauth/google/callback` |
| `VERIFY_BASE` | Device verification URL | Same as `API_BASE` |

---

## 🔴 REQUIRED Frontend Variables (Render - dokify service)

| Variable | Description | Example | Required? |
|----------|-------------|---------|-----------|
| `VITE_DOKIFY_API_BASE` | Backend API URL | `https://dokify-api.onrender.com/v1` | ✅ YES |

**⚠️ IMPORTANT:** Frontend URL MUST include `/v1` at the end!

---

## ✅ Production Setup (Render)

### Backend Service (dokify-api):

```bash
# Required
JWT_SECRET=generate-a-long-random-string-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=sk-ant-xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx
WEB_BASE=https://dokify.onrender.com
API_BASE=https://dokify-api.onrender.com

# Optional (for OAuth)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

# Optional (for auto-migration)
DATABASE_URL=postgresql://postgres:password@host:5432/database

# Render sets these automatically
PORT=4000
HOST=0.0.0.0
```

### Frontend Service (dokify):

```bash
VITE_DOKIFY_API_BASE=https://dokify-api.onrender.com/v1
```

---

## 🏠 Local Development Setup

### Backend (`server/.env`):

```bash
JWT_SECRET=dev-secret
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://postgres:password@localhost:5432/database
ANTHROPIC_API_KEY=sk-ant-xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx
WEB_BASE=http://127.0.0.1:5173
API_BASE=http://127.0.0.1:4000

# Optional for local OAuth testing
GITHUB_CLIENT_ID=your-dev-client-id
GITHUB_CLIENT_SECRET=your-dev-secret
GOOGLE_CLIENT_ID=your-dev-client-id
GOOGLE_CLIENT_SECRET=your-dev-secret
```

### Frontend (`web/.env`):

```bash
VITE_DOKIFY_API_BASE=http://127.0.0.1:4000/v1
```

### CLI (`~/.dokify/config.json`):

```json
{
  "apiBaseUrl": "http://127.0.0.1:4000/v1",
  "apiKey": "dok_xxxxx"
}
```

---

## 🔐 How to Get These Values

### Supabase (Database):
1. Go to https://supabase.com
2. Create project
3. Settings → API → Copy `URL` and `anon public` key

### Anthropic (Claude):
1. Go to https://console.anthropic.com
2. Create API key

### Google AI (Gemini):
1. Go to https://aistudio.google.com/app/apikey
2. Create API key

### GitHub OAuth:
1. Go to https://github.com/settings/developers
2. New OAuth App
3. Set callback: `https://dokify-api.onrender.com/v1/oauth/github/callback`

### Google OAuth:
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 Client ID
3. Set callback: `https://dokify-api.onrender.com/v1/oauth/google/callback`

### JWT Secret:
Generate a random string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✅ All environment variables are correct!

**Summary:**
- ✅ Backend defaults fixed (now uses localhost instead of hardcoded production URLs)
- ✅ All required variables documented
- ✅ Optional variables clearly marked
- ✅ Production and local dev configurations provided

