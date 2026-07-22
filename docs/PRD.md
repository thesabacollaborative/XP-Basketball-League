Product Requirements Document
The XP Basketball League — Platform Build
Document owner: Product/Delivery team Intended reader: Claude Code (implementation agent) and any human engineers working alongside it Reference implementation: xp-basketball-league-app.html (delivered earlier in this project) — a fully working, single-file HTML/CSS/JS click-through prototype covering the entire information architecture, data model, copy, scoring algorithms and visual design language described below. Treat it as the source of truth for UX, microcopy and business logic. This PRD's job is to tell you how to turn that prototype into a real, persisted, multi-user product — not to redesign it. Where this document and the prototype disagree, flag it rather than silently picking one.

1. What we're building
The XP Basketball League is a gamified operating system for recreational and community basketball: one platform that turns playing, training, coaching, officiating, volunteering and content creation into a single connected progression system. Think of it as a real-world RPG character sheet for basketball — every role has an XP track, every player has an evolving "build" (archetype), and every session runs through a lightweight prepare → play → reflect loop.
Branding hierarchy (must be respected in all UI copy, not just visible strings):
Entity
Prominence
Where it appears
The XP Basketball League
Primary, everywhere
Page titles, nav, headings, all user-facing product language
Full-Court Community
Partial — appears twice, unobtrusively
One small sidebar footer credit ("Run by Full-Court Community"), one line on the investor/Vision page
Saba Collaborative Community Interest Company
Minimal — appears once, smallest text on the page
One dev-note-style legal footnote on the Vision page only
Do not let the CIC name appear anywhere else. Do not let "Full-Court Community" become the loud brand anywhere in the product surface.
1.1 Goals
	1	Increase recreational basketball participation and retention through visible, evidence-backed progression rather than raw talent.
	2	Give every kind of contributor — player, coach, referee/official, volunteer, content creator — an equally real, equally trackable status.
	3	Make cheating/self-inflated stats structurally difficult without requiring a human witness at every session.
	4	Produce clean, auditable participation and outcome data usable in funding and sponsorship reporting.
	5	Ship an MVP that is a faithful, persisted, multi-user version of the attached prototype before adding any net-new feature.
1.2 Non-goals (out of scope for v1)
	•	Real money payments/checkout (design the data model for it; do not build billing yet).
	•	Native mobile apps (build responsive web first; structure the frontend so a future React Native/Expo client can share the API).
	•	Full computer-vision pipelines running in production (stub these behind clearly labelled "prototype"/"simulated" states, per the existing pattern in Training & Clinics and AI Minigames, until Phase 3).

2. Users & roles
Four roles, matching the prototype's onboarding screen exactly. A single person can hold multiple roles over time (e.g., a Player who becomes a Coach); model roles as a many-to-many relationship on the user, not a single enum, even though v1 UI only lets someone actively "wear" one role at a time (mirroring the prototype's role-switch pattern).
Role
Summary
Primary XP track
Player
Logs games, trains, takes the archetype quiz, chases badges
Player
Coach
Runs sessions, logs coaching hours, builds Academy content
Coach
Creator
Films/edits/publishes content, grows a fan following
Creator
Admin/Official
Runs leagues, courts and events; officiates matches
Official
A fifth implicit track, Community, accrues to any role through volunteering, mentoring and conduct — it is not a role, it's a track everyone contributes to.

3. Information architecture
Build this exact navigation (grouped as in the prototype):
Play — Dashboard · Your Card · Playstyle Quiz · Training & Clinics · Log Activity · My Clips League — Teams · Compete · Leaderboard · Badges · Community Feed Learn — How It Works Organisation — The Vision
Onboarding (role selection) is a separate, pre-navigation flow, not a nav item.

4. Core systems — detailed requirements
4.1 XP & progression engine
Five independent XP tracks (Player, Community, Creator, Coach, Official). Each track has: current XP, current level, XP-to-next-level.
	•	Level-up formula: carry forward the prototype's algorithm — on gaining XP, while xp >= next, subtract next from xp, increment level, then set next = round(next * 1.28). This compounding curve is intentional; do not linearise it.
	•	XP is tiered, not flat, across four bands. Every XP-granting action must be classified into one of these bands, and the verification requirement scales with the band:
Tier
XP range
Verification required
Examples
Routine
5–50
Self-report, lightly checked
Attendance, small logged drills, casual pickup
Standard
50–300
Confirming witness (opponent/teammate/referee/coach)
A full witnessed match, a coached session, published content
Significant
300–1,500
Recorded evidence or coach sign-off
A completed certification, a coach-verified skills combine, a tracked personal best
Rare / major
1,500–10,000
Admin review required, never auto-granted
Verified tournament win, season MVP, Master Coach certification, league championship
	•	Implement Major Milestones exactly as in the prototype: a fixed catalogue of high-value achievements, each submitted by a user into a pending state, only converted to awarded XP when an Admin-role user approves it. This is not optional polish — it's what keeps the 10,000-XP ceiling meaningful and fraud-resistant.
	•	Match/session/content logging XP must be weighted by activity type, not flat. Port the prototype's GAME_TYPE_XP, OFFICIATING_XP, COACH_SESSION_XP and CREATOR_CONTENT_XP lookup tables as the v1 defaults; make them admin-configurable in the data model even if the admin UI to edit them isn't built until later.
4.2 Life Progression System (six pathways)
Independent of XP tracks, every user progresses along six pathways, each a 0–100% completion value derived from weighted activity: Athlete, Leadership, Coaching, Community, Creator, Professional. Back this with real underlying activity counts (not a hand-set percentage) as soon as persistence exists — define a transparent scoring function per pathway rather than a black box (funders and users will both ask "why is this 58%?").
4.3 Archetype / Playstyle Quiz system
	•	26 archetypes, each with: id, name, icon, adjective (for hybrid naming), description, 3–4 emphasized attributes, and a bespoke training-methodology tip. Port the full ARCHETYPES object verbatim as seed data.
	•	18-question scenario bank, each offering 3–5 options, each tagging 1–3 archetypes with an integer weight. Port QUIZ_QUESTIONS verbatim as seed data.
	•	Adaptive selection: max 6 questions per run, dynamically picking whichever remaining question best discriminates between the current leading archetypes. Port quizPickNext().
	•	Hybrid result generation: if the second-place archetype's score is ≥75% of the top score, generate a combined "hybrid" result via the procedural nickname generator (adjective of A + noun of B). This must be computed from the two archetypes' fields, not hard-coded per pair — 325 possible pairings must all work.
	•	Full analysis output: top matches, character strengths, growth areas (user's own lowest attributes outside the emphasize set), training methodology, recommended drills (pulled live via the attribute→skill mapping, not hard-coded per archetype), a browsable archetype library, and "Set as my archetype."
4.4 The Come-Up Cycle (reflective practice loop)
Three-phase loop attached to Log Activity, grounded in Kolb's Experiential Learning Cycle and Gibbs' Reflective Cycle:
Phase
Sub-areas
Captures
1. Preparation
Organisation, Visualisation, Routines
Session goal, visualisation prompt, routine rehearsal, a user-set cue word
2. Performance
Self-talk, Focus, Managing emotions
One-tap mood check-in, cue-word reminder, breathing-reset prompt
3. Reflection
Journal, Coach feedback, Video analysis, Performance log
Structured journal, read-only coach feedback, linked clip, linked match history
The cue word persists per user and is explained via an expandable panel (port copy verbatim). Completing Reflection grants Routine-tier XP (+15) and carries the "what will you do differently" answer forward as next session's Preparation seed.
4.5 Evidence & Fair Play (anti-cheat) system
Implement every one of these as a real backend rule, not just explanatory copy:
	1	Two-party confirmation — match stats require a named witness before XP is granted.
	2	Recorded drills — witness tap-to-confirm (free) or automatic match against a recorded clip (paid).
	3	Multi-signal verification (paid target state) — camera tracking + audio detection + motion sensors, stored as per-signal confidence scores, not one boolean.
	4	Geofenced check-in — attendance XP requires the device inside the court's geofence.
	5	Diminishing returns — repeated self-reported entries in a short window earn reduced XP (define the decay function explicitly).
	6	Community flags & review — any member can flag a suspicious entry into the same pending/approved queue as Major Milestones.
	7	Random audits — fast-climbing leaderboard entries periodically queued for evidence spot-checks.
	8	Evidence decay — unverified/stale entries contribute less to derived stats over time.
4.6 Badges
Evidence-tiered catalogue (Bronze/Silver/Gold/Hall-of-Fame-style) spanning player, community, creator, coach and official categories. Progress bars read from live counters, never a hand-set percentage.
4.7 AI Minigames (paid tier)
Eight minigames, each pairing one real technique with one skill gap. Keep behind a clearly labelled "Play (simulated)" stub in v1/v2; treat the table below as the Phase 3 spec, not v1 scope:
Minigame
Real technique to integrate later
Reaction Reflex Trainer
Pose tracking + reaction timing from camera frames
Shot Arc Calibrator
Ball-tracking computer vision, frame-by-frame trajectory
Handle Pressure Simulator
Pose tracking + reactive randomised audio/visual cues
Closeout & Footwork IQ
Full-body pose estimation vs. a benchmark posture
Decision-Making Film Room
AI-curated, tagged game-situation clip library
Free Throw Consistency Score
Motion consistency scoring across repeated attempts
Vertical & First-Step Tracker
Camera-based jump/sprint estimation from frame timing
Conditioning Pace Coach
Wearable heart-rate data cross-checked against motion/pace
When real integration begins, prefer on-device processing (e.g. a WASM/TF.js pose model in-browser) over server-side video upload — better for cost, latency, and privacy given under-18 users (§7.3).
4.8 Teams, Competitions, Leaderboard, Community Feed, Training & Clinics, Clips, Log Activity
Build as demonstrated in the prototype: Teams (creation, roster, crest/colours, borough identity), Compete (catalogue with format/fee/dates/slots, registration), Leaderboard (tabbed, sortable), Community Feed (role-tagged posts, likes/comments), Training & Clinics (role-specific libraries, difficulty tiers Beginner→Elite, XP from §4.1's scale), Clips (private-by-default video catalogue with coach notes), Log Activity (role-specific forms gated by §4.5, hosting §4.4 and Major Milestones).
4.9 How It Works & The Vision pages
Must stay in sync with real configuration values (XP tiers, badge thresholds, pathway definitions) rather than hard-coded prose that can drift from the actual system.

5. Data model (v1 target schema)
Entity
Key fields
User
id, name, email, credentials, active role, created_at
UserRole
user_id, role, joined_at
XPTrack
user_id, track, xp, level, next_threshold
PathwayProgress
user_id, pathway, percent, last_recalculated_at
Archetype (seed)
id, name, icon, adjective, description, emphasize_attributes[], tip
QuizQuestion / QuizOption (seed)
scenario text, option text, tag weights
QuizResult
user_id, top_archetype_id, second_archetype_id, is_hybrid, nickname, scores JSON, completed_at
Attribute
user_id, key, value, evidence_reps, confidence, percentile
ActivityLog
user_id, role, type, tier, xp_awarded, witness, verification_signals JSON, status, created_at
Milestone (catalogue)
id, title, tier, xp, track, description
MilestoneSubmission
user_id, milestone_id, status, reviewed_by, reviewed_at
ReflectionEntry
user_id, activity_log_id, cue_word, mood, journal fields, coach_feedback_ref, created_at
Badge (catalogue)
id, name, category, tiers[]
BadgeProgress
user_id, badge_id, current_progress
Team
id, name, crest, colours, borough, created_by
TeamMember
team_id, user_id, role_on_team
Competition
id, name, format, fee, dates, slots, filled
Registration
competition_id, team_id/user_id, status
Match
id, type, date, result, participants, confirmations[], linked activity logs
Clip
user_id, title, date, duration, storage_url, notes, visibility
Minigame (catalogue)
id, title, tag, tech description, detail copy
FeedPost
user_id, role, text, likes, comments, created_at
Court/Block
id, name, geofence polygon/radius, affiliated organisation

6. Suggested technical architecture
Recommendations, not mandates — deviate with good reason, but don't default to something heavier than necessary.
	•	Frontend: Next.js (App Router) + TypeScript + Tailwind CSS. Port the prototype's dark theme CSS variables (--ink, --concrete, --xp green, --gold, etc.) into the Tailwind theme so visual continuity is exact, not reinterpreted.
	•	State/data-fetching: React Query or SWR against a typed API layer. Do not reintroduce the prototype's single global mutable state object/manual re-render pattern in production — that was appropriate for a single-file demo, not a multi-user app.
	•	Backend: Next.js API routes or a dedicated Node/Express/Fastify service; Prisma as ORM.
	•	Database: PostgreSQL (Neon or Supabase).
	•	Auth: NextAuth.js or Supabase Auth, with role stored per the UserRole table, not a single field.
	•	File/video storage: S3-compatible (Cloudflare R2 or AWS S3).
	•	Geofencing: store court geo-coordinates + radius; verify check-ins server-side.
	•	Testing: Vitest/Jest for unit tests on XP/leveling/quiz-scoring logic specifically (these are pure functions — test them thoroughly, they're the economic core of the product); Playwright for end-to-end flows (quiz completion, activity logging, milestone approval).
	•	Hosting: Vercel + managed Postgres + R2/S3, or an equivalent stack you're confident in.

7. Non-functional requirements
7.1 Performance — Dashboard and Log Activity interactive in under 2 seconds on mid-range mobile, 4G.
7.2 Accessibility — WCAG 2.1 AA minimum: colour contrast audit of the dark theme (don't assume it passes), full keyboard navigation, screen-reader labels on icon-only buttons.
7.3 Privacy, safeguarding & data protection — This product will have under-18 users. Non-negotiable:
	•	Age-appropriate onboarding with parental/guardian consent capture for under-13s (and under-16s where local law requires it), before any profile data is collected.
	•	Data minimisation: no biometric video data retained server-side unless explicitly consented to and legally justified.
	•	A visible safeguarding/reporting pathway distinct from the anti-cheat "flag" — a minor's safety report must route to a human, not an automated queue.
	•	UK GDPR / equivalent compliance: exportable and deletable personal data on request.
	•	Coach/Official accounts should record safeguarding check status (e.g. DBS-equivalent) even if verifying it isn't automated in v1.
7.4 Fairness & anti-gaming — Every XP-granting code path must be traceable to a tier (§4.1) and a verification rule (§4.5) — no ad hoc awardXP() calls without documented justification. Log every XP grant with enough metadata to support a later audit.

8. Phased build plan
Phase 0 — Foundation: Project scaffold, design tokens ported from the prototype, auth, empty role-based navigation shell.
Phase 1 — MVP parity: Every screen in §3, backed by a real database instead of the prototype's in-memory object, single-user, faithful to existing copy/logic. Definition of done: a user can complete onboarding, take the archetype quiz, log an activity with a witness, see XP/levels update, earn a badge, and view Vision/How It Works — all persisted across a reload.
Phase 2 — Multi-user & social: Teams, Competitions with real registration, Leaderboard against real other users, Community Feed, Major Milestones with a working admin-approval flow across two real accounts.
Phase 3 — Verification & AI: Real geofenced check-in, at least one real on-device computer-vision minigame (recommend starting with Shot Arc Calibrator or Free Throw Consistency Score — narrowest, most tractable scope), evidence confidence scoring, random audit queue.
Phase 4 — Monetisation & scale readiness: Payment integration for paid-tier features, admin-configurable XP tables and milestone catalogue, analytics/reporting export for funders.

9. Open questions for the product owner
	1	Which identity provider/auth approach is preferred?
	2	Is there an existing brand/design system beyond the prototype's dark theme, or is that final?
	3	What is the actual legal consent flow required for under-18 signups in the target launch region(s)?
	4	Which court/venue data source will back geofencing — manually entered by admins, or an external places API?
	5	Confirm the one-time placement of the Saba Collaborative CIC legal footnote is acceptable to legal/compliance, since this PRD treats it as fixed.
