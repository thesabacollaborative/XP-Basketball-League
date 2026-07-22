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
