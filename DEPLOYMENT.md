# Deployment

How this app is actually deployed, kept up to date as the real process
changes (see `docs/build-brief.md` — this replaces tribal knowledge, not
aspirational steps we haven't done).

## Stack

- **Hosting:** Vercel (project `saba19/xp-basketball-league`)
- **Database:** Neon Postgres (`neondb` project), pooled connection string
  used for both the running app and migrations (see `CLAUDE.md` for why no
  separate direct-connection URL is needed)
- **Git:** GitHub — `thesabacollaborative/XP-Basketball-League`, `main` branch
- **Email:** Resend, sandbox sender (`onboarding@resend.dev`) until a real
  domain is verified — sandbox only delivers to the Resend account's own
  signup address

## One-time setup (already done)

1. Created a Neon project, grabbed the pooled connection string
2. Pushed this repo to GitHub
3. `vercel link --yes --project xp-basketball-league` to create the Vercel
   project
4. Connected the Vercel project to the GitHub repo (Vercel dashboard →
   Project → Settings → Git → Connect Git Repository) — this is what enables
   auto-deploy on push to `main` and preview deployments on PRs
5. Set environment variables via `vercel env add <NAME> production,preview --value "..." --yes`:
   `DATABASE_URL`, `AUTH_SECRET` (generated fresh for prod, not reused from
   local dev), `AUTH_TRUST_HOST`, `AUTH_RESEND_KEY`, `EMAIL_FROM`
6. First deploy: `vercel --prod`

## Ongoing deploys

- **Production:** push to `main` on GitHub — Vercel auto-deploys
- **Preview:** open a PR — Vercel deploys a preview URL automatically
  (currently shares the same Neon database as production; per-branch
  database isolation via Neon's branching isn't wired up yet)
- **Migrations run automatically as part of every deploy** — `package.json`'s
  `build` script is `prisma migrate deploy && next build`, not a manual step
- Manual deploy from local: `vercel --prod` (rarely needed once the GitHub
  integration is doing its job)

## Environment variables

See `.env.example` for the full list and what each one is for. Set them in
Vercel via the dashboard (Project → Settings → Environment Variables) or
`vercel env add`. Never in a committed file.

## Known gaps (intentional, not yet built)

- No preview-database isolation (Phase 2+ concern, would use Neon's Vercel
  integration for branch-per-PR databases)
- No staging environment separate from preview deployments
- Resend is sandbox-mode only (no verified sending domain yet) — real
  multi-recipient email needs a verified domain in Resend
- No CI gate yet (lint/typecheck/test aren't required to pass before deploy —
  Phase 5 work per the build brief)
