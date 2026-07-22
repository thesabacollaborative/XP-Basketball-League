/**
 * Seeds catalogue/config data ported verbatim from the prototype
 * (docs/xp-basketball-league-app.html), per the build brief's instruction
 * to port ARCHETYPES/QUIZ_QUESTIONS/XP lookup tables verbatim.
 *
 * Rather than hand-transcribing ~26 archetypes and 18 quiz questions (real
 * risk of a typo silently drifting from the source of truth), this reads
 * the prototype's actual <script> data section and evaluates it directly,
 * so the seed can never disagree with the prototype it's sourced from.
 *
 * Deliberately NOT seeded: teams/leaderboards/matches/feed/competitions/
 * roleCards from the prototype's DB object. Those are the prototype's
 * fictional demo user ("Jordan Ade") and other made-up people/teams --
 * seeding them would fabricate fake accounts and social data in a real
 * database. Phase 2 builds Teams/Competitions/Leaderboard/Community with
 * real user-created data instead. Same reasoning for badge/training
 * "progress"/"completion"/"rating" fields -- those are that fictional
 * user's personal stats, not catalogue data; real users start at zero.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db";
import { classifyXPTier } from "../src/lib/xp";
import { XP_RULE_CATEGORIES } from "../src/lib/xp-rules";

interface PrototypeData {
  ARCHETYPES: Record<
    string,
    { name: string; icon: string; adj: string; desc: string; emphasize: string[]; tip: string }
  >;
  QUIZ_QUESTIONS: Array<{
    id: string;
    scenario: string;
    options: Array<{ text: string; tags: Record<string, number> }>;
  }>;
  GAME_TYPE_XP: Record<string, number>;
  OFFICIATING_XP: Record<string, number>;
  COACH_SESSION_XP: Record<string, number>;
  CREATOR_CONTENT_XP: Record<string, number>;
  DB: {
    badges: Record<
      string,
      Array<{
        id: string;
        name: string;
        icon: string;
        sub: string;
        desc: string;
        tiers: Array<{ name: string; req: number }>;
      }>
    >;
    training: Record<
      string,
      Array<{
        id: string;
        title: string;
        difficulty: string;
        xp: number;
        skill: string;
        equipment: string;
        time: string;
        recLevel: string;
      }>
    >;
    minigames: Array<{
      id: string;
      title: string;
      tag: string;
      tech: string;
      desc: string;
      detail: string;
    }>;
    milestones: Array<{
      id: string;
      title: string;
      tier: string;
      xp: number;
      track: string;
      desc: string;
    }>;
  };
}

function extractPrototypeData(): PrototypeData {
  const htmlPath = path.join(__dirname, "..", "docs", "xp-basketball-league-app.html");
  const html = readFileSync(htmlPath, "utf-8");

  const start = html.indexOf("const ARCHETYPES = {");
  // Search from `start` onward -- "2. STATE" also appears earlier, in the
  // file's header comment listing all sections.
  const stateMarkerIndex = html.indexOf("2. STATE", start);
  if (start === -1 || stateMarkerIndex === -1) {
    throw new Error(
      "Could not find the expected data markers in docs/xp-basketball-league-app.html -- " +
        "has the prototype's structure changed? Update the extraction markers in prisma/seed.ts.",
    );
  }

  const roughSlice = html.slice(start, stateMarkerIndex);
  const lastBraceEnd = roughSlice.lastIndexOf("};");
  if (lastBraceEnd === -1) {
    throw new Error("Could not find the end of the DB object while extracting prototype data.");
  }
  const code = roughSlice.slice(0, lastBraceEnd + 2);

  const run = new Function(
    `${code}\nreturn { ARCHETYPES, QUIZ_QUESTIONS, GAME_TYPE_XP, OFFICIATING_XP, COACH_SESSION_XP, CREATOR_CONTENT_XP, DB };`,
  );
  return run() as PrototypeData;
}

async function seedArchetypes(data: PrototypeData) {
  const entries = Object.entries(data.ARCHETYPES);
  for (const [id, a] of entries) {
    await db.archetype.upsert({
      where: { id },
      create: {
        id,
        name: a.name,
        icon: a.icon,
        adjective: a.adj,
        description: a.desc,
        emphasize: a.emphasize,
        tip: a.tip,
      },
      update: {
        name: a.name,
        icon: a.icon,
        adjective: a.adj,
        description: a.desc,
        emphasize: a.emphasize,
        tip: a.tip,
      },
    });
  }
  console.log(`Seeded ${entries.length} archetypes`);
}

async function seedQuiz(data: PrototypeData) {
  for (const [index, q] of data.QUIZ_QUESTIONS.entries()) {
    await db.quizQuestion.upsert({
      where: { id: q.id },
      create: { id: q.id, scenario: q.scenario, order: index },
      update: { scenario: q.scenario, order: index },
    });

    await db.quizOption.deleteMany({ where: { questionId: q.id } });
    for (const opt of q.options) {
      await db.quizOption.create({
        data: { questionId: q.id, text: opt.text, tags: opt.tags },
      });
    }
  }
  console.log(`Seeded ${data.QUIZ_QUESTIONS.length} quiz questions`);
}

async function seedXPRules(data: PrototypeData) {
  const tables: Array<[string, Record<string, number>]> = [
    [XP_RULE_CATEGORIES.GAME, data.GAME_TYPE_XP],
    [XP_RULE_CATEGORIES.OFFICIATING, data.OFFICIATING_XP],
    [XP_RULE_CATEGORIES.COACH_SESSION, data.COACH_SESSION_XP],
    [XP_RULE_CATEGORIES.CREATOR_CONTENT, data.CREATOR_CONTENT_XP],
  ];

  let count = 0;
  for (const [category, table] of tables) {
    for (const [key, xp] of Object.entries(table)) {
      await db.xPRule.upsert({
        where: { category_key: { category, key } },
        create: { category, key, xp, tier: classifyXPTier(xp) },
        update: { xp, tier: classifyXPTier(xp) },
      });
      count += 1;
    }
  }
  console.log(`Seeded ${count} XP rules`);
}

async function seedBadges(data: PrototypeData) {
  let count = 0;
  for (const [category, badges] of Object.entries(data.DB.badges)) {
    for (const b of badges) {
      await db.badge.upsert({
        where: { id: b.id },
        create: {
          id: b.id,
          name: b.name,
          category,
          icon: b.icon,
          sub: b.sub,
          description: b.desc,
          tiers: b.tiers,
        },
        update: {
          name: b.name,
          category,
          icon: b.icon,
          sub: b.sub,
          description: b.desc,
          tiers: b.tiers,
        },
      });
      count += 1;
    }
  }
  console.log(`Seeded ${count} badges`);
}

async function seedTraining(data: PrototypeData) {
  let count = 0;
  for (const [category, items] of Object.entries(data.DB.training)) {
    for (const item of items) {
      await db.trainingItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          category,
          title: item.title,
          difficulty: item.difficulty,
          xp: item.xp,
          skill: item.skill,
          equipment: item.equipment,
          timeLabel: item.time,
          recLevel: item.recLevel,
        },
        update: {
          category,
          title: item.title,
          difficulty: item.difficulty,
          xp: item.xp,
          skill: item.skill,
          equipment: item.equipment,
          timeLabel: item.time,
          recLevel: item.recLevel,
        },
      });
      count += 1;
    }
  }
  console.log(`Seeded ${count} training items`);
}

async function seedMinigames(data: PrototypeData) {
  for (const mg of data.DB.minigames) {
    await db.minigame.upsert({
      where: { id: mg.id },
      create: { id: mg.id, title: mg.title, tag: mg.tag, tech: mg.tech, desc: mg.desc, detail: mg.detail },
      update: { title: mg.title, tag: mg.tag, tech: mg.tech, desc: mg.desc, detail: mg.detail },
    });
  }
  console.log(`Seeded ${data.DB.minigames.length} minigames`);
}

async function seedMilestones(data: PrototypeData) {
  for (const m of data.DB.milestones) {
    const tier = m.tier.toUpperCase() as "SIGNIFICANT" | "RARE" | "STANDARD" | "ROUTINE";
    const track = m.track.toUpperCase() as "PLAYER" | "COACH" | "CREATOR" | "OFFICIAL" | "COMMUNITY";
    await db.milestone.upsert({
      where: { id: m.id },
      create: { id: m.id, title: m.title, tier, xp: m.xp, track, description: m.desc },
      update: { title: m.title, tier, xp: m.xp, track, description: m.desc },
    });
  }
  console.log(`Seeded ${data.DB.milestones.length} milestones`);
}

async function main() {
  const data = extractPrototypeData();
  await seedArchetypes(data);
  await seedQuiz(data);
  await seedXPRules(data);
  await seedBadges(data);
  await seedTraining(data);
  await seedMinigames(data);
  await seedMilestones(data);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
