export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full font-display text-base"
          style={{
            background:
              "conic-gradient(from 220deg, var(--color-wood), var(--color-xp), var(--color-wood))",
            color: "#0a0c0f",
          }}
        >
          XP
        </div>
        <div className="font-heading text-lg tracking-wide">XP LEAGUE</div>
      </div>
      <h1 className="font-display text-4xl tracking-tight text-chalk">
        The XP Basketball League
      </h1>
      <p className="max-w-md text-center text-sm text-chalk-dim">
        Phase 0 scaffold — design tokens ported, nav shell and auth coming next.
      </p>
      <div className="flex gap-2">
        <span className="rounded-full border border-line bg-surface-alt px-3 py-1 font-mono text-xs">
          <span className="text-xp">●</span> xp
        </span>
        <span className="rounded-full border border-line bg-surface-alt px-3 py-1 font-mono text-xs">
          <span className="text-fan">●</span> fan
        </span>
        <span className="rounded-full border border-line bg-surface-alt px-3 py-1 font-mono text-xs">
          <span className="text-danger">●</span> danger
        </span>
        <span className="rounded-full border border-line bg-surface-alt px-3 py-1 font-mono text-xs">
          <span className="text-info">●</span> info
        </span>
      </div>
    </div>
  );
}
