@AGENTS.md

# The XP Basketball League — project memory

Source-of-truth documents live in `docs/`:
- `docs/PRD.md` — full product requirements
- `docs/xp-basketball-league-app.html` — the working prototype. Source of truth for
  UX, copy, data model shape, and business logic (XP formulas, quiz scoring, badge
  tiers). Read the `<script>` section before touching XP/quiz/badge logic.
- `docs/build-brief.md` — the original build brief with working agreement, phased
  build order, and security requirements.

## Decisions already made (don't re-litigate without a strong reason)

- **DB host:** Neon (branch-per-PR previews pair with Vercel preview deployments).
  Connects via the universal `@prisma/adapter-pg` + `pg` driver (Node.js runtime
  everywhere, not edge — bcrypt needs Node crypto), not Neon's serverless
  HTTP/WebSocket adapter. Same adapter works against local dev (`prisma dev`,
  plain TCP) and Neon's pooled connection string with zero code branching.
  Local dev DB: `npx prisma dev --name xp-league-local --detach` (throwaway,
  data doesn't persist across `prisma dev rm`).
- **Storage:** Cloudflare R2 (S3-compatible, no egress fees) for Clips.
- **Under-18 consent (v1):** placeholder gate — capture DOB at signup; if under 13
  (or under 16 where required) require a guardian email + checkbox consent. Stored
  but not legally vetted. Swap in real legal copy/flow later without a schema change.
- **CIC/branding footnote:** keep exactly as the prototype does it — a small
  permanent sidebar credit ("Run by Full-Court Community") + exactly one small
  legal line on the Vision page dev-note footer ("...operates as a project of Saba
  Collaborative CIC"). Do not add either name anywhere else.
- **Geofencing data source:** deferred to Phase 4, not yet decided.
- **Known PRD/prototype gap:** PRD §4.5 requires a diminishing-returns decay
  function for repeated self-reports and evidence decay over time. The prototype's
  `awardXP()` does neither — flat award every time. Design the real decay function
  explicitly in Phase 2 (Evidence & Fair Play), don't silently port the prototype's
  flat behavior there.

## Stack specifics

- Next.js 16.2.11 (App Router), React 19.2, Tailwind v4, TypeScript, Turbopack
  (default in this version).
- **This Next.js version has breaking changes vs older training data** — before
  writing App Router code, be aware:
  - `params`, `searchParams`, `cookies()`, `headers()` are all `Promise`s now —
    must `await` them. Use the `PageProps<'/route'>` / `LayoutProps` helpers from
    `next typegen` for type safety.
  - `middleware.ts` is renamed to `proxy.ts`, exported function renamed `proxy`
    (not `middleware`). No edge runtime support in `proxy` — it's nodejs-only.
  - `next.config.ts`: `turbopack` is now a top-level config key, not under
    `experimental`.
  - ESLint uses flat config (`eslint.config.mjs`) by default; `next lint` is
    removed — use the ESLint CLI directly (already wired as `npm run lint`).
  - `next/image`: use `images.remotePatterns`, not the deprecated `images.domains`.
  - Full details: `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
    (re-read if upgrading further, or if something behaves unexpectedly).
- Prototype's actual design tokens (its `:root` — note these don't match the
  build brief's example names like `--ink`/`--concrete`, which don't exist in this
  prototype; use the real ones):
  `--bg`, `--surface`, `--surface-alt`, `--surface-raised`, `--line`, `--chalk`,
  `--chalk-dim`, `--chalk-faint`, `--wood`, `--wood-dim`, `--xp`, `--xp-dim`,
  `--fan`, `--danger`, `--info`. Fonts: Anton/Bebas Neue (display/heading), Inter
  (body), JetBrains Mono (mono).

## Current status

Phase 0 is complete and **deployed**: live at https://xp-basketball-league.vercel.app,
auto-deploying from `main` on `thesabacollaborative/XP-Basketball-League`
(GitHub). Real Neon Postgres in production (same DB for production and
preview deployments — no per-branch DB isolation yet). Real Resend email in
sandbox mode (only delivers to the Resend account's own signup address until
a domain is verified). See `DEPLOYMENT.md` for the full setup.

**Outstanding:** two real secrets (the Neon DB password and the Resend API
key) were pasted into chat during setup — per the build brief's own security
rule, flag to the user that these should be rotated once the deploy is
confirmed stable, don't just assume it's been done.

Also **not yet built**: Auth.js's `session` strategy is `"database"` with an
**email-only** login (no password) — see the "Auth.js" note below for why.
Route protection is per-page (`requireUser`/`requireOnboardedUser` in
`src/lib/session.ts`), not global middleware/`proxy.ts`.

To resume local dev after a restart: the local Postgres from `prisma dev` does
not survive a machine restart in the background — run
`npx prisma dev --name xp-league-local --detach` again, confirm `.env`'s
`DATABASE_URL`/`SHADOW_DATABASE_URL` still match its printed connection
strings (ports can change), then `npx prisma migrate deploy`.

## Auth.js

Auth.js hard-requires JWT session strategy for any Credentials (password)
provider — confirmed in `@auth/core`'s source (`assert.ts`), not just docs:
"Signing in with credentials only supported if JWT strategy is enabled." This
conflicts with the brief's "database sessions, not JWT-only" requirement, and
it's a single global setting, not per-provider. Per user decision: **no
password login at all** — email magic-link only (next-auth's `Resend`
provider), which gets full database sessions with zero custom code. If
password login is ever added later, it cannot share this Auth.js instance's
session strategy without revisiting this decision.

## Working agreement (from the build brief)

1. Plan before building each phase; show the plan before implementing unless told
   to proceed without checking in.
2. Small, verifiable vertical slices — finish one before starting the next.
3. Tests as you go, especially XP/leveling math, quiz scoring, tiered XP
   verification — these are pure functions and the economic core of the product.
4. Commit incrementally, one logical change per commit.
5. Never guess on security or money — stop and ask.
6. Don't silently deviate from the PRD or prototype's business logic — flag
   disagreements instead of picking one.
