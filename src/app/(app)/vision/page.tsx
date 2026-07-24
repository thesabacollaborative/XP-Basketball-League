import { db } from "@/lib/db";

const PILLARS = [
  {
    n: "01",
    t: "XP",
    d: "The progression engine — Player, Community, Creator, Coach and Official tracks turn every contribution into measurable status.",
  },
  {
    n: "02",
    t: "Court Culture",
    d: "The lifestyle layer — events, fashion, music and media that make the league a scene, not just a schedule.",
  },
  {
    n: "03",
    t: "Academy",
    d: "Training and education — the drill library, coaching certification, and the pathway from beginner to Hall of Fame.",
  },
  {
    n: "04",
    t: "Studio",
    d: "Content, streaming and production — the tools that turn a Tuesday-night run into a highlight fans replay.",
  },
  {
    n: "05",
    t: "The League",
    d: "The operating system tying it together — open for other clubs, coaches and community organisations to run their own sessions on the same infrastructure, and built to be adaptable to other sports once proven on the court.",
  },
];

const MONETISATION = [
  "Freemium subscriptions (AI tracking, adaptive training, minigames)",
  "Tournament & competition entry fees",
  "Team registration fees",
  "Merchandise",
  "Community fundraising & donations",
  "Livestreaming",
];

const ROADMAP = [
  { label: "London", sub: "Founding league", done: true },
  { label: "England", sub: "Multi-city rollout", done: false },
  { label: "Europe", sub: "Cross-border leagues", done: false },
  { label: "Global", sub: "Platform, any city", done: false },
];

export default async function VisionPage() {
  const [teamCount, badgeCount, userCount] = await Promise.all([
    db.team.count(),
    db.badge.count(),
    db.user.count(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-line bg-surface p-7">
        <div className="mb-2.5 font-mono text-[11px] uppercase tracking-[3px] text-xp">
          FOR INVESTORS, PARTNERS &amp; FUNDERS
        </div>
        <h1 className="font-display text-3xl leading-tight md:text-4xl">
          Basketball is the medium. <span className="text-xp">Human development is the product.</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-chalk-dim">
          The XP Basketball League, delivered by Full-Court Community, pairs real-world sessions
          with a Life Progression System — six development pathways expressed in-app as five XP
          tracks, evidence-verified badges, and role-specific interfaces for players, coaches,
          creators and officials. London first, then England, Europe, then global.
        </p>
      </div>

      <div>
        <h2 className="mb-1 font-heading text-xl tracking-wide">Traction</h2>
        <p className="mb-4 text-sm text-chalk-dim">
          Real counts from this deployment — no illustrative/demo figures.
        </p>
        <div className="grid grid-cols-2 gap-0 overflow-hidden rounded-lg border border-line md:grid-cols-4">
          {[
            { label: "Active teams", value: teamCount },
            { label: "XP tracks", value: 5 },
            { label: "Badge families", value: badgeCount },
            { label: "Registered users", value: userCount },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`p-5 text-center ${i > 0 ? "border-l border-line" : ""}`}
            >
              <b className="block font-display text-3xl text-xp">{s.value}</b>
              <span className="text-[11px] uppercase tracking-wide text-chalk-faint">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 font-heading text-xl tracking-wide">Five Pillars</h2>
        <p className="mb-4 text-sm text-chalk-dim">The full operating system, one pillar at a time.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.n} className="relative overflow-hidden rounded-lg border border-line bg-surface p-4">
              <div className="absolute right-4 top-2 font-display text-4xl text-surface-raised">
                {p.n}
              </div>
              <h3 className="relative font-heading text-base tracking-wide">{p.t}</h3>
              <p className="relative mt-1 text-xs text-chalk-dim">{p.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 font-heading text-xl tracking-wide">Roadmap</h2>
        <p className="mb-4 text-sm text-chalk-dim">Geographic expansion, in order.</p>
        <div className="flex rounded-lg border border-line bg-surface p-5">
          {ROADMAP.map((step) => (
            <div key={step.label} className="relative flex-1 pt-6 text-center">
              <div className="absolute left-0 right-0 top-[7px] h-0.5 bg-line" />
              <div
                className={`absolute left-1/2 top-0.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 ${
                  step.done ? "border-xp bg-xp" : "border-wood bg-surface-alt"
                }`}
              />
              <b className="block font-heading text-sm tracking-wide">{step.label}</b>
              <span className="text-[11px] text-chalk-faint">{step.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-1 font-heading text-xl tracking-wide">Monetisation</h2>
        <p className="mb-4 text-sm text-chalk-dim">Multiple revenue lines, live from day one.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MONETISATION.map((m) => (
            <div key={m} className="rounded-lg border border-line bg-surface p-4 text-sm font-semibold">
              {m}
            </div>
          ))}
        </div>
      </div>

      <footer className="rounded-md border border-dashed border-line px-4 py-3 font-mono text-[11.5px] text-chalk-faint">
        <b className="text-chalk-dim">Dev note —</b> the stats above read live from the database so
        they can&apos;t drift out of sync. Full-Court Community, which delivers The XP Basketball
        League, operates as a project of Saba Collaborative CIC.
      </footer>
    </div>
  );
}
