# Dokify Deployment Guide

This guide will help you deploy Dokify to production using Supabase for the database.

## Prerequisites

- Supabase account ([supabase.com](https://supabase.com))
- Node.js 18+ installed
- Domain name (optional, for custom domains)

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `dokify` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for it to initialize

### 1.2 Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `/server/schema.sql` from this repository
3. Paste it into the SQL Editor
4. Click **RUN** to execute the schema

This will create all necessary tables:
- `users` - User accounts
- `projects` - Project metadata
- `docs` - Documentation files
- `api_keys` - API key management
- `api_usage` - Usage tracking
- `chats` - DokAgent chat sessions
- `messages` - DokAgent messages

### 1.3 Get Your Supabase Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **URL** (Project URL): `https://[PROJECT-REF].supabase.co`
   - **anon/public** OR **service_role key**: Use `service_role` key for server-side access

3. (Optional) For auto-migrations, get Database URL:
   - Go to **Settings** → **Database** → **Connection string**
   - Select **URI** format
   - Copy the connection string (replace `[YOUR-PASSWORD]` with your database password)
   - This enables the server to automatically create tables on startup

4. Save these for the next step

## Step 2: Configure Environment Variables

Create a `.env` file in the `/server` directory:

```bash
# Server Configuration
PORT=4000
HOST=0.0.0.0
API_BASE=https://your-api-domain.com
WEB_BASE=https://your-web-domain.com

# Supabase (from Settings → API)
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=your-service-role-key-from-supabase

# Database URL (from Settings → Database → Connection String)
# Optional but recommended - enables auto-migration of tables on startup
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random

# AI API Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here
GOOGLE_API_KEY=AIzaSy-your-key-here
GOOGLE_MODEL=gemini-1.5-flash

# OAuth - GitHub (optional)
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret

# OAuth - Google (optional)
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

### 2.1 Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

### 2.2 Get AI API Keys

- **Anthropic (Claude)**: Get key from [console.anthropic.com](https://console.anthropic.com)
- **Google (Gemini)**: Get key from [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

## Step 3: Deploy the Server

### Option A: Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Initialize project:
   ```bash
   cd server
   railway init
   ```

4. Add environment variables:
   ```bash
   railway variables set SUPABASE_URL="https://your-project.supabase.co"
   railway variables set SUPABASE_KEY="your-service-role-key"
   railway variables set JWT_SECRET="your-jwt-secret"
   # ... add all other variables
   ```

5. Deploy:
   ```bash
   railway up
   ```

### Option B: Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd server
   vercel
   ```

3. Add environment variables in Vercel dashboard

### Option C: Deploy to Your Own VPS

1. SSH into your server
2. Install Node.js 18+
3. Clone your repository
4. Install dependencies:
   ```bash
   cd server
   npm install
   ```

5. Build:
   ```bash
   npm run build
   ```

6. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name dokify-server
   pm2 save
   pm2 startup
   ```

7. Set up Nginx reverse proxy (optional but recommended)

## Step 4: Deploy the Web App

### 4.1 Update Web Environment

Create `.env` in `/web` directory:

```bash
VITE_DOKIFY_API_BASE=https://your-api-domain.com
```

### 4.2 Build Web App

```bash
cd web
npm install
npm run build
```

### 4.3 Deploy to Vercel (Recommended)

```bash
cd web
vercel --prod
```

Or deploy `web/dist` to any static hosting (Netlify, Cloudflare Pages, etc.)

## Step 5: Set Up OAuth (Optional)

### GitHub OAuth

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Dokify
   - **Homepage URL**: `https://your-web-domain.com`
   - **Authorization callback URL**: `https://your-api-domain.com/auth/github/callback`
4. Copy Client ID and Client Secret to your server `.env`

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Configure consent screen
6. Add authorized redirect URI: `https://your-api-domain.com/auth/google/callback`
7. Copy Client ID and Client Secret to your server `.env`

## Step 6: Test Your Deployment

1. Visit your web app URL
2. Register a new account
3. Generate an API key from the Account page
4. Install and configure the CLI:
   ```bash
   npm install -g dokify
   dok key set --api-key=YOUR_KEY
   ```

5. Test documentation generation:
   ```bash
   cd your-project
   dok generate
   ```

## Troubleshooting

### Database Connection Errors

- Verify your `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Use the `service_role` key (not the `anon` key) for server-side access
- Check that all tables were created (re-run `schema.sql` if needed)
- Ensure Supabase project is not paused

### OAuth Not Working

- Verify callback URLs match exactly (including https://)
- Check that OAuth app is not in development mode
- Ensure client ID and secret are correct

### CLI Can't Connect

- Verify `API_BASE` is set correctly in server `.env`
- Check that server is running and accessible
- Test API endpoint: `curl https://your-api-domain.com/health`

## Backup and Maintenance

### Database Backups

Supabase automatically backs up your database daily. You can also:

1. Manual backup in Supabase dashboard → Database → Backups
2. Export via SQL:
   ```bash
   pg_dump "your-connection-string" > backup.sql
   ```

### Monitoring

- Monitor usage in Supabase dashboard
- Set up alerts for API errors
- Track LLM costs via API usage logs

## Scaling Considerations

- **Database**: Supabase scales automatically up to your plan limit
- **Server**: Add horizontal scaling with load balancer
- **CDN**: Use Cloudflare or similar for web app
- **LLM Costs**: Monitor token usage, implement rate limiting if needed

## Security Checklist

- ✅ Change JWT_SECRET from default
- ✅ Use strong database password
- ✅ Enable SSL/HTTPS for all endpoints
- ✅ Keep API keys in environment variables only
- ✅ Regularly rotate OAuth secrets
- ✅ Monitor for unusual API usage patterns
- ✅ Keep dependencies updated

## Support

For issues, visit: [github.com/yourusername/dokify/issues](https://github.com/yourusername/dokify/issues)

