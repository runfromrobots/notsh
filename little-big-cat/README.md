# Little Big Cat

A sign-up site for an upcoming music project: **Little Big Cat**, the album, with **BedLunch**, an EP, coming out first. The main goal is to collect emails from people who want to hear the music when it's out.

It's built the same way as the Yatesville Creek Paper Boat Race site:
- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript, CSS Modules
- **Backend**: Next.js API route (`/api/notify`)
- **Database**: Supabase (Postgres) holds the mailing list
- **Deployment**: Vercel, with a GitHub Actions type check on every push

This folder is a self-contained app inside the `notsh` repo. You can move it to its own repo at any time; nothing in it depends on the rest of `notsh`.

## Things still to decide

All of these are in `lib/project.ts`:
- **`ARTIST_NAME`**: `null` for now. While it's `null`, the page shows a "Billed as" section listing `NAME_CANDIDATES` (Little Big Cat, Rip's BedLunch, Rip's BedLunch Band). Set it to the final name and that section goes away, and the name appears in the top bar.
- **Release dates**: each release's `when` reads "Release date TBA".
- **Release blurbs**: each release's `body`.

## Local development

```bash
cd little-big-cat
npm install
cp .env.example .env.local   # fill in Supabase URL + anon key
npm run dev
```

You can run the site without Supabase. The form will just answer "The list isn't open just yet."

## Supabase setup

1. Create a Supabase project (the free tier is fine).
2. In the SQL Editor, run `migrations/001_create_mailing_list.sql`. It creates the `mailing_list` table. Row-level security lets the public key **add** emails but never read them.
3. Copy the Project URL and anon key into `.env.local`, and into the Vercel project's environment variables.
4. To see who signed up, open Supabase → Table Editor → `mailing_list`, or export it as CSV.

## Sign-up alerts (optional)

Each new sign-up can send you an email titled `Little Big Cat sign-up: <email>` through [Resend](https://resend.com). Repeat sign-ups don't send a second alert, and a failed alert never blocks the sign-up. It stays off until these Vercel environment variables are set:

| Variable | Value |
|---|---|
| `RESEND_API_KEY` | an API key from resend.com → API Keys |
| `SIGNUP_ALERT_TO` | where alerts go (must be the email you signed up to Resend with, unless you verify a domain) |
| `SIGNUP_ALERT_FROM` | optional; defaults to `Little Big Cat <onboarding@resend.dev>` |

## Deployment (Vercel)

1. In Vercel, choose **Add New → Project** and import `runfromrobots/notsh`.
2. Set **Root Directory** to `little-big-cat`. The framework is detected as Next.js.
3. Add the env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (plus the Resend ones if you want alerts).
4. Deploy. GitHub Actions (`.github/workflows/little-big-cat.yml`) type-checks, lints and builds this folder whenever it changes.
