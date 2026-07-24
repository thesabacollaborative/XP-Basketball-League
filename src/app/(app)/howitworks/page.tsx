import { XP_TIER_RANGES } from "@/lib/xp";

function AccordionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-lg border border-line bg-surface p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between">
        <h3 className="font-heading text-base tracking-wide">{title}</h3>
        <span className="text-chalk-faint transition group-open:rotate-180">▼</span>
      </summary>
      <div className="mt-3.5 space-y-3 border-t border-line pt-3.5 text-[13px] leading-relaxed text-chalk-dim [&_h4]:mb-1.5 [&_h4]:mt-4 [&_h4]:font-heading [&_h4]:text-sm [&_h4]:tracking-wide [&_h4]:text-chalk [&_h4:first-child]:mt-0 [&_li]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_b]:text-chalk">
        {children}
      </div>
    </details>
  );
}

export default function HowItWorksPage() {
  const { ROUTINE, STANDARD, SIGNIFICANT, RARE } = XP_TIER_RANGES;

  return (
    <div className="flex flex-col gap-3">
      <p className="mb-2 text-sm text-chalk-dim">
        Everything the progression system runs on, in one place.
      </p>

      <AccordionPanel title="XP System — 5 tracks">
        <h4>
          The XP scale — four tiers, up to {RARE.max.toLocaleString()}
        </h4>
        <p>
          XP is deliberately not flat. Routine actions stay small so levels still take real time;
          rare, heavily-verified achievements can be worth hundreds of times more, so a single
          logged pickup game never feels equal to a verified league championship.
        </p>
        <ul>
          <li>
            <b>
              Routine ({ROUTINE.min}–{ROUTINE.max} XP)
            </b>{" "}
            — attendance, small logged drills, casual pickup games. Self-reported, lightly
            checked.
          </li>
          <li>
            <b>
              Standard ({STANDARD.min}–{STANDARD.max} XP)
            </b>{" "}
            — a full witnessed match, a coached session, published content. Needs a confirming
            witness.
          </li>
          <li>
            <b>
              Significant ({SIGNIFICANT.min.toLocaleString()}–{SIGNIFICANT.max.toLocaleString()} XP)
            </b>{" "}
            — a completed certification, a coach-verified skills combine, a tracked personal best.
            Needs recorded or coach-witnessed evidence.
          </li>
          <li>
            <b>
              Rare / major ({RARE.min.toLocaleString()}–{RARE.max.toLocaleString()} XP)
            </b>{" "}
            — a verified tournament win, a season MVP, a Master Coach qualification, a league
            championship. Always queued for league admin review before XP is granted — see Major
            Milestones on the Log Activity page.
          </li>
        </ul>
        <h4>Player XP — ways to earn</h4>
        <ul>
          <li>
            Log a verified match or scrimmage (confirmed by an opponent, teammate or referee) —
            weighted by format, from a Pickup run up to a full Tournament
          </li>
          <li>Complete a recorded training drill — weighted by difficulty, from Beginner up to Elite</li>
          <li>Hit a personal best on a tracked drill</li>
          <li>Maintain a play streak (consecutive days logging verified court time)</li>
          <li>Complete daily, weekly and season-long challenges</li>
          <li>Cross a milestone on any attribute</li>
          <li>Submit a Major Milestone (tournament win, MVP, championship) for admin-verified XP up to {RARE.max.toLocaleString()}</li>
        </ul>
        <h4>Community XP — ways to earn</h4>
        <ul>
          <li>Volunteer at league events</li>
          <li>Organise or host a pickup session</li>
          <li>Mentor a beginner (confirmed by the mentee)</li>
          <li>Attend league-run community days</li>
          <li>Contribute to fundraising events</li>
          <li>Keep a clean conduct record across a season</li>
        </ul>
        <h4>Creator XP — ways to earn</h4>
        <ul>
          <li>Publish a highlight clip or recap</li>
          <li>Grow fan count through content</li>
          <li>Host or produce a livestream</li>
          <li>Get featured on the Community Feed</li>
          <li>Maintain a posting streak</li>
          <li>Produce a long-form piece (interview, documentary)</li>
        </ul>
        <h4>Coach XP — ways to earn</h4>
        <ul>
          <li>Run a certified training session — weighted by session type</li>
          <li>Get an athlete to a verified level-up</li>
          <li>Complete a coaching certification — up to 4,000 XP for the highest accreditation tier</li>
          <li>Receive positive, confirmed athlete feedback</li>
          <li>Design a drill adopted by the Academy library</li>
          <li>Log consistent season-long coaching hours</li>
        </ul>
        <h4>Official XP — ways to earn</h4>
        <ul>
          <li>Officiate a verified match — weighted by format, from a Pickup game up to a Tournament</li>
          <li>Maintain a high call-accuracy rating over a season</li>
          <li>Complete rules and mechanics certifications</li>
          <li>Mediate a dispute fairly, confirmed on review</li>
          <li>Officiate at league events or tournaments</li>
          <li>Mentor newer officials</li>
        </ul>
      </AccordionPanel>

      <AccordionPanel title="Life Progression System — 6 pathways">
        <h4>Athlete</h4>
        <ul>
          <li>Verified matches and drills</li>
          <li>Conditioning benchmarks</li>
          <li>Attribute milestones</li>
        </ul>
        <h4>Leadership</h4>
        <ul>
          <li>Team captaincy</li>
          <li>Organising games and sessions</li>
          <li>Mentoring, and positive reputation actions</li>
        </ul>
        <h4>Coaching</h4>
        <ul>
          <li>Coaching sessions run</li>
          <li>Certifications completed</li>
          <li>Athlete improvement outcomes</li>
        </ul>
        <h4>Community</h4>
        <ul>
          <li>Volunteering and event hosting</li>
          <li>Fundraising</li>
          <li>Mentorship</li>
        </ul>
        <h4>Creator</h4>
        <ul>
          <li>Content published</li>
          <li>Fan growth</li>
          <li>Livestreams and engagement</li>
        </ul>
        <h4>Professional</h4>
        <ul>
          <li>Certifications across any track</li>
          <li>Multi-season consistency</li>
          <li>Milestones in officiating, coaching or admin roles</li>
        </ul>
      </AccordionPanel>

      <AccordionPanel title="Community Reputation">
        <h4>Reputation goes up for</h4>
        <ul>
          <li>Helping beginners</li>
          <li>Fair play marks from opponents</li>
          <li>Consistent attendance</li>
          <li>Volunteering and coaching</li>
          <li>Positive, verified content</li>
        </ul>
        <h4>Reputation goes down for</h4>
        <ul>
          <li>Verified conduct violations</li>
          <li>No-shows</li>
          <li>Unsportsmanlike reports upheld after review</li>
        </ul>
      </AccordionPanel>

      <AccordionPanel title="Fan Base">
        <h4>Fans grow from</h4>
        <ul>
          <li>Strong verified performances</li>
          <li>Viral highlight clips</li>
          <li>Milestone achievements</li>
          <li>Positive community reputation</li>
          <li>Winning streaks</li>
        </ul>
        <h4>Fans decline from</h4>
        <ul>
          <li>Prolonged inactivity</li>
          <li>Verified unsportsmanlike conduct</li>
          <li>Unresolved disputes</li>
        </ul>
      </AccordionPanel>

      <AccordionPanel title="Evidence & Fair Play (anti-cheat)">
        <p>
          The XP Basketball League is built so that <b>no one can self-report their way to the
          top</b>. Every XP-earning action follows one of these rules:
        </p>
        <ul>
          <li>
            <b>Two-party confirmation</b> — match stats need sign-off from an opponent, teammate
            captain or referee before XP is granted.
          </li>
          <li>
            <b>Recorded drills</b> — training drills are filmed (your camera, or a coach witnessing
            live) and timestamped; free tier requires a witness tap-to-confirm, paid tier verifies
            automatically against the recording.
          </li>
          <li>
            <b>Multi-signal verification</b> — camera-based shot/rep tracking, ball-strike audio
            detection and phone motion sensors cross-check each other, so a session can&apos;t be
            faked from the sofa.
          </li>
          <li>
            <b>Geofenced check-in</b> — XP for attending an affiliated court requires your device
            to register inside that court&apos;s location, the same way run-tracking apps confirm
            a route was actually run.
          </li>
          <li>
            <b>Diminishing returns</b> — repeated self-reported entries in a short window earn
            reduced XP, to blunt spam.
          </li>
          <li>
            <b>Community flags &amp; review</b> — any verified member can flag a suspicious entry;
            league admins/officials review before anything is reversed.
          </li>
          <li>
            <b>Random audits</b> — fast-climbing leaderboard entries are subject to periodic
            evidence spot-checks, comparing self-logged trends against occasional
            camera-verified skill checks.
          </li>
          <li>
            <b>Evidence decay</b> — stale or unverified entries contribute less over time, so a
            single good game can&apos;t inflate a score indefinitely.
          </li>
        </ul>
      </AccordionPanel>

      <AccordionPanel title="Attributes & Fairness Methodology">
        <p>Attributes aren&apos;t self-declared — each one is computed from weighted, verified evidence:</p>
        <ul>
          <li>Verified matches carry the most weight.</li>
          <li>Recorded or witnessed training drills carry moderate weight.</li>
          <li>
            Peer ratings from verified teammates and opponents carry the least weight, and are
            capped so no single rating can swing a score.
          </li>
        </ul>
        <p>
          Every attribute is shown as <b>Top X% at your level</b> — an anonymised comparison
          against players at the same level and league tier, recalculated weekly — so &ldquo;70
          Shooting, Top 26%&rdquo; always means something relative to your peers, not an arbitrary
          number.
        </p>
        <p>
          A <b>confidence tag</b> (Low / Medium / High) shows how much verified evidence backs the
          figure, which rewards logging more verified reps rather than letting one big night carry
          an attribute.
        </p>
      </AccordionPanel>
    </div>
  );
}
