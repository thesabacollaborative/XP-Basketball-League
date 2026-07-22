# Build brief: The XP Basketball League

You are building a production application from two documents already in this repo:
- `PRD.md` — the full product requirements document
- `xp-basketball-league-app.html` — a working single-file prototype that is the
  source of truth for UX, copy, data model shape, and business logic (XP formulas,
  quiz scoring, badge tiers, etc.)

Read both fully before writing any code. Do not start building until you've done this.

## Your working agreement

1. **Plan before you build.** For each phase below, first write out a short task
   list (a TODO.md or use your own task tracking) and show me the plan before
   implementing it, unless I've explicitly told you to proceed without checking in.
2. **Work in small, verifiable increments.** Finish one vertical slice (e.g. "auth
   works end to end") before starting the next, not all files half-done in parallel.
3. **Write tests as you go**, not at the end — especially for the XP/leveling math,
   the quiz scoring algorithm, and the tiered XP verification rules. These are pure
   functions and the economic core of the product; they need real unit test coverage.
4. **Commit incrementally** with clear messages, one logical change per commit.
5. **Never guess on security or money.** If you're unsure whether something is a
   security or payments risk, stop and ask me rather than shipping it.
6. **Don't silently deviate from the PRD or the prototype's business logic.** If you
   think something in them is wrong or impractical, tell me why before changing it.

## Tech stack (decided — don't re-litigate this without a strong reason)

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes / Route Handlers (keep it one deployable app unless
  you hit a real scaling reason not to)
- **ORM:** Prisma
- **Database:** PostgreSQL, hosted on Supabase or Neon (your choice — pick one and
  tell me why)
- **Auth:** Auth.js (NextAuth) with a credentials + email provider, session stored
  in the database (not JWT-only), roles modeled as a join table per the PRD's
  `UserRole` entity, not a single enum column
- **Payments:** Stripe (Checkout + Billing Portal for the premium/paid tier
  described in the PRD's monetisation section; Subscriptions, not one-off charges)
- **File/video storage:** Cloudflare R2 or AWS S3 (pick one) for the Clips feature
- **Testing:** Vitest for unit tests, Playwright for end-to-end tests
- **Hosting:** Vercel for the app, managed Postgres from whichever provider you
  picked above
- **Styling source of truth:** port the prototype's dark-theme CSS variables
  (`--ink`, `--concrete`, the green XP accent, `--gold`, etc. — read them straight
  out of the prototype's `:root`) into `tailwind.config.ts` as named theme colors.
  Do not reinterpret or "improve" the visual design — match it.

## Build order — work through these phases in sequence

### Phase 0 — Foundation
- Initialize the Next.js + TypeScript + Tailwind project
- Set up Prisma with the full schema from PRD §5 (every entity listed there)
- Set up Auth.js with the four roles (Player/Coach/Creator/Admin) as a
  many-to-many `UserRole` relationship
- Empty, role-aware navigation shell matching PRD §3's exact information
  architecture (Play/League/Learn/Organisation groups)
- Get a bare-bones app deployed to Vercel end-to-end (even with no real features)
  before writing more features, so the deployment pipeline is proven early
- **Definition of done:** a user can sign up, log in, pick a role, see an empty
  dashboard, and the whole thing is live on a real URL.

### Phase 1 — MVP parity with the prototype
Build every screen in PRD §3, backed by the real database instead of the
prototype's in-memory JS object. Port the prototype's exact logic, don't
reinvent it:
- XP tracks + the compounding level-up formula (`next = round(next * 1.28)`)
- The four-tier XP scale (Routine/Standard/Significant/Rare) from PRD §4.1
- The 26-archetype quiz system from PRD §4.3 — port `ARCHETYPES` and
  `QUIZ_QUESTIONS` verbatim as seed data, implement the adaptive question
  selection and the hybrid-nickname generator exactly as specified
- The Come-Up Cycle (Preparation/Performance/Reflection) from PRD §4.4
- Badges, Training & Clinics, Log Activity forms per role
- **Definition of done:** a single user can complete onboarding, take the
  archetype quiz, log a witnessed activity, see XP/levels update, earn a
  badge, and everything persists across a logout/login — matching the
  prototype's behavior exactly, just for real.

### Phase 2 — Multi-user & social
- Teams, Competitions with real registration, Leaderboard against real other
  users, Community Feed
- Major Milestones (PRD §4.1) with a real admin-approval workflow tested
  across two separate real accounts (one submits, a different admin account approves)
- Evidence & Fair Play rules from PRD §4.5 enforced server-side, not just
  described in copy — every XP grant must be traceable to a tier and a
  verification rule

### Phase 3 — Payments
- Stripe subscription integration for the paid tier described in the PRD's
  monetisation section (premium AI features, advanced analytics, etc.)
- Stripe Checkout for signup, Stripe Billing Portal for managing/canceling
  - Verify Stripe webhook signatures on every incoming webhook — do not trust
    unverified webhook payloads
  - Handle subscription lifecycle events properly (created, updated, canceled,
    payment_failed) and reflect tier access in the database immediately
  - Never store raw card data; you should never touch it — Stripe Elements/
    Checkout handles this
- Gate the paid-tier features (AI Minigames, advanced stats) behind the
  subscription status in the database, checked server-side on every request,
  not just hidden in the UI

### Phase 4 — Verification & AI (stub-first)
- Real geofenced check-in for court attendance
- At least one real on-device computer-vision minigame — start with the
  narrowest one (Shot Arc Calibrator or Free Throw Consistency Score), using
  an on-device model (e.g. TensorFlow.js / MediaPipe running in the browser)
  rather than uploading video to a server, for both cost and privacy reasons
  given under-18 users
- Everything else in the AI Minigames table stays behind a clearly labeled
  "simulated" state until scoped separately

### Phase 5 — Deployment hardening & launch readiness
- Production environment variables fully separated from development/staging
- Automated checks (lint, typecheck, tests) required to pass before deploy
- Error monitoring (e.g. Sentry) wired up
- Basic analytics/reporting export for the funding/sponsorship use case in
  the PRD

## Security requirements — non-negotiable, apply from Phase 0 onward

**Secrets & API keys**
- All secrets (database URL, Auth.js secret, Stripe keys, storage keys) live in
  environment variables only — never hardcoded, never committed
- Create a `.env.example` with every required variable name and a placeholder
  value, commit that; add the real `.env` (or `.env.local`) to `.gitignore`
  immediately, before it ever contains a real secret
- In Vercel (or wherever you deploy), set environment variables through the
  hosting dashboard's secret storage, not in code or in a committed config file
- Use separate API keys/credentials for development, staging and production —
  never reuse a production key locally
- If you ever generate or receive a real secret during this build, treat it as
  compromised the moment it appears in a chat log or a file that could be
  committed — rotate it rather than trusting it's fine

**Authentication**
- Passwords hashed with a strong algorithm (bcrypt or argon2), never stored
  or logged in plaintext
- Rate-limit login and signup endpoints to slow credential-stuffing attempts
- Require email verification before granting full account access
- Session tokens/cookies must be `httpOnly`, `secure`, and `sameSite`-protected
- Implement the PRD's under-18 consent-capture flow before collecting any
  profile data from a minor — do not skip this because it's inconvenient

**Database**
- Use a least-privilege database role for the app's normal runtime connection
  (not a superuser/admin role)
- All queries go through Prisma's parameterized query building — no raw string
  concatenation into SQL, ever
- Enable connection pooling appropriate to your host (e.g. Supabase's pooler
  or Prisma Accelerate) so you don't exhaust connections in production

**API & input handling**
- Validate and sanitize every incoming request body/query param (e.g. with
  Zod) before it touches the database or business logic
- Every route that grants XP, approves a milestone, or touches payment status
  must check the caller's role/session server-side — never trust a client-sent
  role or user ID
- Add CSRF protection on state-changing routes if you're using cookie-based
  sessions
- Rate-limit any endpoint that can be spammed to farm XP (this is also a
  product-integrity requirement per the PRD's Evidence & Fair Play system, not
  just a security one)

**Dependencies & infra**
- Run a dependency vulnerability scan (e.g. `npm audit` or GitHub Dependabot)
  and don't ship with known high-severity vulnerabilities unaddressed
- Enforce HTTPS everywhere (Vercel does this by default — don't disable it)
- Keep the Stripe webhook endpoint's signing secret in environment variables
  and verify every webhook signature before acting on it

## Deployment requirements

- App deploys from the `main` branch to Vercel automatically on merge, with
  preview deployments on pull requests
- Database migrations run through Prisma Migrate as part of the deploy step,
  not applied manually
- Staging environment (or at minimum, Vercel preview deployments) used to test
  Stripe integration with test-mode keys before anything touches live keys
- Document the actual deployment steps you end up using in a `DEPLOYMENT.md`
  file in the repo as you go, so this isn't tribal knowledge

## What to do right now

1. Confirm you've read `PRD.md` and `xp-basketball-league-app.html` in full.
2. Propose the Phase 0 task list.
3. Ask me any of the PRD's open questions (§9) that you need answered before
   you can proceed — don't guess silently on auth provider choice, hosting
   provider choice, or the CIC footnote placement.
4. Wait for my go-ahead before writing code.