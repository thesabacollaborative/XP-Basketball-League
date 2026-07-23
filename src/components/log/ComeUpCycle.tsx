"use client";

import { useState } from "react";
import { setCueWord, submitReflection } from "@/app/(app)/log/actions";

type CycleTab = "prepare" | "perform" | "reflect";

const TAB_META: Record<CycleTab, string> = {
  prepare: "1 · Preparation",
  perform: "2 · Performance",
  reflect: "3 · Reflection",
};

const MOODS = ["😤", "😕", "😐", "🙂", "🔥"];

export function ComeUpCycle({
  cueWord,
  growthSeed,
  initialTab,
}: {
  cueWord: string | null;
  growthSeed: string | null;
  initialTab: CycleTab;
}) {
  const [tab, setTab] = useState<CycleTab>(initialTab);
  const [mood, setMood] = useState<number | null>(null);
  const [cueExplainerOpen, setCueExplainerOpen] = useState(false);

  return (
    <div className="mb-6 rounded-lg border border-line bg-surface p-5">
      <div className="mb-4 flex w-fit flex-wrap gap-1.5 rounded-full border border-line bg-surface-alt p-1">
        {(Object.entries(TAB_META) as [CycleTab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${
              tab === key ? "bg-surface-raised text-chalk" : "text-chalk-dim hover:text-chalk"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "prepare" ? (
        <div>
          <p className="mb-3 text-sm text-chalk-dim">
            Two minutes before you play — organisation, visualisation and routine.
          </p>
          {growthSeed ? (
            <p className="mb-3 rounded-sm border border-line bg-surface-alt px-3 py-2 text-xs text-chalk-dim">
              Last time you said you&apos;d do differently: <em>&ldquo;{growthSeed}&rdquo;</em>
            </p>
          ) : null}
          <ul className="mb-4 list-disc pl-4 text-[13px] leading-relaxed text-chalk-dim">
            <li>What&apos;s the one thing you want to walk away better at today?</li>
            <li>Picture your first three touches of the ball — what do they look like?</li>
            <li>What&apos;s your routine before you shoot? Say it in your head right now.</li>
          </ul>
          <form action={setCueWord} className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-chalk-faint">
              Today&apos;s cue word — come back to it if things go wrong
            </label>
            <div className="flex gap-2">
              <input
                name="cue"
                defaultValue={cueWord ?? ""}
                placeholder="e.g. Steady"
                className="flex-1 rounded-sm border border-line bg-surface-alt px-3 py-2 text-sm text-chalk outline-none focus:border-xp"
              />
              <button
                type="submit"
                className="rounded-sm bg-xp px-4 py-2 text-sm font-semibold text-[#0a0c0f] hover:brightness-110"
              >
                Set cue word
              </button>
            </div>
          </form>
          <button
            type="button"
            onClick={() => setCueExplainerOpen((v) => !v)}
            className="mt-4 flex w-full items-center justify-between rounded-md border border-line bg-surface-alt px-3 py-2 text-left text-xs font-semibold text-chalk-dim"
          >
            What&apos;s a cue word, and how do I use mine?
            <span>{cueExplainerOpen ? "▲" : "▼"}</span>
          </button>
          {cueExplainerOpen ? (
            <div className="mt-2 rounded-md border border-line px-3 py-3 text-xs leading-relaxed text-chalk-dim">
              <p className="mt-0">
                A cue word is a short, personally meaningful word or phrase you say in your head
                to trigger a mental and physical state you&apos;ve already rehearsed — it isn&apos;t a
                generic slogan, it&apos;s a private shortcut back to a routine you&apos;ve drilled
                hundreds of times.
              </p>
              <p>
                <b className="text-chalk">Why it works:</b> research on self-talk in sport finds it
                most effective for tasks needing precision and focus — like shooting — because it
                interrupts an anxious or distracted train of thought and re-engages a rehearsed
                routine faster than consciously thinking it through.
              </p>
              <h4 className="mb-1 mt-3 font-heading text-sm tracking-wide text-chalk">
                How to build your own
              </h4>
              <ul className="list-disc pl-4">
                <li>
                  <b className="text-chalk">Keep it short and personal</b> — one or two syllables,
                  and something that means something to you specifically, not a borrowed slogan.
                </li>
                <li>
                  <b className="text-chalk">Attach it to something physical</b> — a breath, a
                  dribble, a foot-set — so it&apos;s reinforced by the body, not just the mind.
                </li>
                <li>
                  <b className="text-chalk">Drill it in low-stakes practice first</b> — a cue word
                  only works under pressure if it&apos;s already been repeated calmly, hundreds of
                  times, before you ever need it in a game.
                </li>
                <li>
                  <b className="text-chalk">Save it for the moment it matters</b> — after a
                  mistake, before a free throw, entering crunch time — using it constantly wears
                  out its power.
                </li>
                <li>
                  <b className="text-chalk">Revisit it each season</b> — as your game and mindset
                  change, your cue word can too.
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "perform" ? (
        <div>
          <p className="mb-3 text-sm text-chalk-dim">
            Quick checks for natural breaks in play — water breaks, drill changeovers — covering
            self-talk, focus and managing emotions.
          </p>
          {cueWord ? (
            <div className="mb-4 inline-block rounded-full border border-line bg-surface-alt px-3 py-1 text-xs text-chalk-dim">
              Your cue word: &ldquo;{cueWord}&rdquo;
            </div>
          ) : (
            <p className="mb-4 text-sm text-chalk-dim">Set a cue word in Preparation first.</p>
          )}
          <p className="mb-2 text-[12.5px] text-chalk-dim">One tap: how are you feeling right now?</p>
          <div className="mb-4 flex gap-2">
            {MOODS.map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMood(i)}
                className={`rounded-sm border px-3 py-1.5 text-base ${
                  mood === i ? "border-xp bg-xp text-[#0a0c0f]" : "border-line bg-surface-alt"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <p className="text-sm text-chalk-dim">
            Reset focus with box breathing — 4 seconds in, 4 seconds hold, 4 seconds out, repeated
            4 times.
          </p>
        </div>
      ) : null}

      {tab === "reflect" ? (
        <div>
          <p className="mb-3 text-sm text-chalk-dim">
            Two minutes after you play — journal, coach feedback, video analysis and your
            performance log, in one place.
          </p>
          <form action={submitReflection} className="flex flex-col gap-3">
            <input type="hidden" name="mood" value={mood ?? ""} />
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-chalk-faint">
                Journal — what happened today, and how did it feel?
              </label>
              <textarea
                name="j1"
                rows={2}
                className="w-full rounded-sm border border-line bg-surface-alt px-3 py-2 text-sm text-chalk outline-none focus:border-xp"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-chalk-faint">
                One thing that went well, one that didn&apos;t
              </label>
              <textarea
                name="j2"
                rows={2}
                className="w-full rounded-sm border border-line bg-surface-alt px-3 py-2 text-sm text-chalk outline-none focus:border-xp"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-chalk-faint">
                What will you do differently next time?
              </label>
              <textarea
                name="j3"
                rows={2}
                className="w-full rounded-sm border border-line bg-surface-alt px-3 py-2 text-sm text-chalk outline-none focus:border-xp"
              />
            </div>
            <button
              type="submit"
              className="w-fit rounded-sm bg-xp px-4 py-2 text-sm font-semibold text-[#0a0c0f] hover:brightness-110"
            >
              Log reflection · +15 XP
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
