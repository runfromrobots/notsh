# Supabase Setup Guide

This guide walks through setting up your Supabase project for the SOS game.

## 1. Get Your API Keys

In your Supabase dashboard (https://btgeamphnklcodegpwik.supabase.co):

1. Go to **Project Settings** (gear icon in bottom left)
2. Click **API** in the sidebar
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **`anon` public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (NOT the service role key)

Example:
```
NEXT_PUBLIC_SUPABASE_URL=https://btgeamphnklcodegpwik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. Create Database Schema

1. In Supabase, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire contents of `migrations/001_create_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or Cmd+Enter)

This creates:
- `games` — game state and turn tracking
- `players` — individual player data
- `tiles` — map grid state
- `moves` — turn history
- `encounters` — faction interactions

All tables are set up with realtime subscriptions enabled.

## 3. Update Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://btgeamphnklcodegpwik.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_MAP_SEED=12345
NEXT_PUBLIC_MAX_PLAYERS=8
```

## 4. Enable Row Level Security (RLS)

For production, enable RLS policies. For development, you can disable RLS temporarily:

1. In Supabase, go to **Authentication** → **Policies**
2. For each table, click the table name
3. Toggle **RLS is off** to disable it (development only!)

**⚠️ Note**: For production, implement proper RLS policies to prevent unauthorized access.

## 5. Test the Connection

Run the dev server:

```bash
npm run dev
```

If Supabase is properly configured, you should see no errors in the console. You can test the connection by:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run: `import { supabase } from '@/lib/supabase'; supabase.auth.getSession()`

You should get a session object (likely null if not authenticated).

## 6. Enable Realtime Subscriptions (Optional)

If you want to use realtime features (not yet implemented):

1. Go to **Database** → **Realtime** in Supabase
2. Enable realtime for the tables you want to subscribe to

Currently, the schema has realtime enabled on all tables for future use.

## Troubleshooting

### "Not authenticated" errors
- Supabase anon key is read-only by default
- Games can be created/viewed without auth
- For production, implement auth via email/OAuth

### "RLS policy violation"
- RLS is blocking the request
- Either disable RLS (dev only) or create proper policies

### Connection timeout
- Check your internet connection
- Verify the Supabase URL is correct
- Ensure `.env.local` is in the project root, not in a subdirectory

## Next Steps

- API routes in `app/api/` will handle game logic
- Realtime subscriptions will keep players in sync
- Add authentication for player accounts (future v0.2)
