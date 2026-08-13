# Deployment Workflow for Next.js + Vercel Projects

This document outlines the deployment setup used for this project. Follow these steps when creating similar projects in the future.

## Pre-Deployment Setup

### 1. GitHub Actions TypeScript Checking
Create `.github/workflows/typecheck.yml`:
- Runs type-check on every push
- Catches errors before Vercel builds
- Provides fast feedback loop
- View status in repo → **Actions** tab

**Key benefit:** Errors caught in 1-2 minutes instead of waiting for Vercel's slower build.

### 2. Vercel API Token Setup ⭐ IMPORTANT
**When setting up Vercel deployment for ANY project:**

1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it descriptively (e.g., `claude-[projectname]`)
4. Copy the token (starts with `vcp_`)
5. **Save it somewhere safe** - you'll need it for:
   - Claude Code sessions to monitor deployments
   - CI/CD automation
   - Build status checks

**Why:** Allows automated monitoring, deployment status checks, and redeploy triggers without manual intervention.

### 3. Project Setup Checklist
- [ ] Create `.github/workflows/typecheck.yml` (see template below)
- [ ] Generate Vercel API token
- [ ] Connect GitHub repo to Vercel for auto-deployment on push
- [ ] Test first deployment to confirm setup works

## Workflow During Development

### On Every Code Push:
1. **GitHub Actions runs** (1-2 min) - catches TypeScript errors
2. **Vercel builds** (3-5 min) - if GitHub Actions passes
3. **Claude checks deployment status** (via Vercel API) - catches build errors immediately
4. **Automatic fixes pushed** if issues found

### Monitoring:
- GitHub repo → **Actions** tab: See type-check status
- Vercel dashboard: See build logs and deployment status
- Claude Code: Reports status and can auto-redeploy

## Vercel API Token Usage

Once you have a token, provide it to Claude Code with:
```
I'm setting up Vercel API monitoring. Here's my token: vcp_XXXXXX
```

This enables:
- Automated deployment status checks
- Build log inspection
- Automatic redeploy triggers
- Zero manual deployment oversight needed

## Project-Specific Details

**This Project (notsh-survival):**
- Vercel Project ID: `prj_rHFD5IYE6CSTmnUnzAM4KBHMR0Pb`
- GitHub Repo: `runfromrobots/notsh`
- Deployment URL: `notsh-survival.vercel.app`

---

**Remember:** Always generate a fresh Vercel token for new projects. Never reuse tokens across projects.
