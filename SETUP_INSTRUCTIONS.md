# Quick Setup Instructions for Deployment

## What's Been Implemented

### ✅ Database Migration
- Migrated from in-memory storage to Supabase PostgreSQL
- Created complete schema in `server/schema.sql`
- Added database connection module in `server/src/database.ts`
- All data now persists: users, projects, docs, API keys, chats, messages

### ✅ Chat Persistence
- DokAgent now saves all conversations
- Chat history sidebar with create/delete functionality
- Messages stored in database with conversation context
- Auto-generated chat titles from first question

### ✅ Updated Files
1. **Server**:
   - `server/src/database.ts` - New Supabase connection module
   - `server/src/agent.ts` - Chat persistence and history
   - `server/src/index.ts` - Database initialization on startup
   - `server/schema.sql` - Complete database schema

2. **Web**:
   - `web/src/pages/DokAgent.tsx` - Chat history UI with sidebar

3. **Documentation**:
   - `DEPLOYMENT.md` - Comprehensive deployment guide
   - `README.md` - Updated with database requirements
   - `SETUP_INSTRUCTIONS.md` - This file

## Next Steps to Deploy

### 1. Set Up Supabase (5 minutes)

```bash
# Go to https://supabase.com and create a new project
# Once created, go to SQL Editor and run:
```

Copy the contents of `server/schema.sql` and run it in Supabase SQL Editor.

### 2. Get Your Supabase Credentials

In Supabase Dashboard:
- Settings → API
- Copy **URL** (Project URL): `https://[PROJECT-REF].supabase.co`
- Copy **service_role key** (NOT anon key - this is for server-side access)

### 3. Update Environment Variables

Create `server/.env`:
```bash
# Supabase (from Settings → API)
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=your-service-role-key-here

# Database URL (from Settings → Database → Connection String)
# Optional but recommended - enables auto-migration of tables on startup
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# Generate this with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-generated-secret-here

# AI Keys (required for dok generate to work)
ANTHROPIC_API_KEY=sk-ant-your-key
GOOGLE_API_KEY=AIzaSy-your-key

# Server URLs (update for production)
API_BASE=http://localhost:4000
WEB_BASE=http://localhost:5173

# OAuth (optional, for GitHub/Google login)
GITHUB_CLIENT_ID=your-id
GITHUB_CLIENT_SECRET=your-secret
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
```

Create `web/.env`:
```bash
VITE_DOKIFY_API_BASE=http://localhost:4000
```

### 4. Test Locally

```bash
# Terminal 1 - Server
cd server
npm install
npm run build
npm start

# Terminal 2 - Web
cd web
npm install
npm run dev

# Terminal 3 - CLI (optional)
cd ../
npm install
npm run build
npm link  # Makes 'dok' available globally
```

### 5. Verify Everything Works

1. **Test Web App**:
   - Go to http://localhost:5173
   - Register a new account
   - Create a project
   - Try DokAgent (should see chat history sidebar)

2. **Test CLI**:
   ```bash
   dok login
   cd /path/to/your/project
   dok generate
   ```

3. **Verify Database**:
   - Check Supabase dashboard → Table Editor
   - You should see data in: users, projects, docs, chats, messages

### 6. Deploy to Production

Follow the detailed guide in `DEPLOYMENT.md` for:
- Deploying server to Railway/Vercel/VPS
- Deploying web to Vercel/Netlify
- Setting up custom domains
- Configuring OAuth

## Common Issues

### "SUPABASE_URL or SUPABASE_KEY not set"
- Make sure `server/.env` exists and has both `SUPABASE_URL` and `SUPABASE_KEY`
- Restart the server after adding the variables

### "Failed to connect to database"
- Check you're using the **service_role** key (not anon key)
- Ensure Supabase project is not paused
- Verify URL format: `https://[project-ref].supabase.co` (no trailing slash)

### "No chats displaying"
- Chat history only shows after you've had at least one conversation
- Try asking DokAgent a question first

### OAuth not working locally
- OAuth requires HTTPS in production
- For local testing, you can skip OAuth and use email/password registration

## What Changed from In-Memory?

### Before (In-Memory)
- Data lost on server restart
- No chat history
- Not suitable for production
- Single-instance only

### After (Supabase)
- ✅ Data persists across restarts
- ✅ Chat history saved
- ✅ Production-ready
- ✅ Can scale horizontally
- ✅ Automatic backups

## Support

If you run into issues:
1. Check Supabase logs in dashboard
2. Check server console output
3. Verify all environment variables are set
4. See full troubleshooting in `DEPLOYMENT.md`

Good luck with your deployment! 🚀

