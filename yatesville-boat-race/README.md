# The Inaugural Yatesville Creek Paper Boat Race

An informational site for a spring 2027 paper boat race down Yatesville Creek in Sprakers, New York. Boats launch from a secret spot below Yatesville Falls and finish at The Root.

The landing page has a map of the creek, from Yatesville Falls to the Mohawk River, **with south at the top**. That way the creek flows down the page the same way the boats do. Below the map is a sign-up form for people who want an email when registration opens.

**Tech stack** (the same as notsh):
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript, CSS Modules
- **Backend**: Next.js API route (`/api/notify`)
- **Database**: Supabase (Postgres) holds the notify list
- **Deployment**: Vercel, with a GitHub Actions type check on every push

## Local development

```bash
cd yatesville-boat-race
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

You can run the site without Supabase. The form will just answer "Sign-ups aren't open just yet."

## Supabase setup

1. Create a Supabase project (the free tier is fine).
2. In the SQL Editor, run `migrations/001_create_notify_list.sql`. It creates the `notify_list` table. Row-level security lets the public key **add** emails but never read them.
3. Copy the Project URL and anon key into `.env.local`, and into the Vercel project's environment variables.
4. To see who signed up, open Supabase → Table Editor → `notify_list`, or export it as CSV.

## Deployment (Vercel)

This site lives in the `yatesville-boat-race/` folder of the `runfromrobots/notsh` repo:

1. In Vercel, choose **Add New → Project** and import `runfromrobots/notsh` again. This creates a second Vercel project from the same repo.
2. Set **Root Directory** to `yatesville-boat-race`. The framework is detected as Next.js.
3. Add the env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy. Pushes that touch this folder redeploy the site. GitHub Actions (`.github/workflows/yatesville-typecheck.yml`) type-checks, lints and builds it first.
5. To monitor deployments:
   `VERCEL_PROJECT_ID=prj_xxx VERCEL_TOKEN=vcp_xxx ./.vercel-monitor.sh`

## The map

`lib/mapData.ts` is generated from OpenStreetMap data (© OpenStreetMap contributors, ODbL) by `scripts/build-map.py`. Things you may want to tune:

- `FINISH_INDEX` is where **The Root** marker sits on the creek. It's currently a placeholder near the creek mouth.
- `START_HINT_INDEX` is where the "?" start marker points. It's deliberately vague and isn't the real start.
- `LAT_MIN/LAT_MAX/LON_MIN/LON_MAX` set the map window.

To regenerate the map, export the area from Overpass as JSON, then run:

```bash
python3 scripts/build-map.py area.json > lib/mapData.ts
```
