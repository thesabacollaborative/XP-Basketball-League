import { ATTR_TO_SKILL, type AttributeKey } from "@/lib/attributes";

export interface QuizOptionData {
  tags: Record<string, number>;
}

export interface QuizQuestionData {
  id: string;
  options: QuizOptionData[];
}

const MAX_QUESTIONS = 6;

/**
 * Adaptive question selection ported from the prototype's quizPickNext():
 * of the remaining questions, pick whichever best discriminates between
 * the current top two leading archetypes. Stops after MAX_QUESTIONS or
 * once every question has been asked.
 */
export function pickNextQuestion(
  questions: QuizQuestionData[],
  askedIds: string[],
  scores: Record<string, number>,
): string | null {
  const remaining = questions.filter((q) => !askedIds.includes(q.id));
  if (remaining.length === 0 || askedIds.length >= MAX_QUESTIONS) return null;

  const leaders = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => id);

  function relevance(q: QuizQuestionData): number {
    let s = 0;
    for (const opt of q.options) {
      for (const [archetypeId, weight] of Object.entries(opt.tags)) {
        if (leaders.includes(archetypeId)) s += weight;
      }
    }
    return s;
  }

  const sorted = [...remaining].sort((a, b) => relevance(b) - relevance(a));
  return sorted[0].id;
}

export interface ArchetypeData {
  name: string;
  adjective: string;
  emphasize: string[];
}

/** Combines two archetypes into a procedural hybrid nickname (adjective
 * of the top archetype + noun of the runner-up), ported verbatim from
 * generateHybridNickname(). Must work for all 325 possible pairings, not
 * hard-coded per pair. */
export function generateHybridNickname(top: ArchetypeData, second: ArchetypeData): string {
  const nounB = second.name.split(" ").pop() ?? second.name;
  return `${top.adjective} ${nounB}`;
}

export interface QuizResultComputation {
  topArchetypeId: string;
  topScore: number;
  secondArchetypeId: string | null;
  secondScore: number;
  isHybrid: boolean;
  nickname: string | null;
  emphasizeSet: string[];
  sortedScores: Array<[string, number]>;
}

/**
 * Hybrid trigger: if the runner-up's score is >= 75% of the leader's
 * score, the result is a hybrid of both rather than a single archetype.
 */
export function computeQuizResult(
  scores: Record<string, number>,
  archetypes: Record<string, ArchetypeData>,
): QuizResultComputation {
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topArchetypeId, topScore] = sortedScores[0];
  const [secondArchetypeId, secondScore] = sortedScores[1] ?? [null, 0];

  const isHybrid = Boolean(secondArchetypeId) && topScore > 0 && secondScore >= topScore * 0.75;

  const top = archetypes[topArchetypeId];
  const second = isHybrid && secondArchetypeId ? archetypes[secondArchetypeId] : null;
  const nickname = isHybrid && second ? generateHybridNickname(top, second) : null;
  const emphasizeSet = [...new Set(second ? [...top.emphasize, ...second.emphasize] : top.emphasize)];

  return {
    topArchetypeId,
    topScore,
    secondArchetypeId,
    secondScore,
    isHybrid,
    nickname,
    emphasizeSet,
    sortedScores,
  };
}

/** User's own lowest attributes outside the archetype's emphasized set,
 * ported from viewQuiz()'s growthAreas computation. */
export function computeGrowthAreas(
  attributes: Record<string, number>,
  emphasizeSet: string[],
  count = 3,
): string[] {
  return Object.keys(attributes)
    .filter((k) => !emphasizeSet.includes(k))
    .sort((a, b) => attributes[a] - attributes[b])
    .slice(0, count);
}

/** Pulls recommended drills live via the attribute-to-skill mapping,
 * rather than hard-coding drills per archetype (PRD 4.3). */
export function recommendDrills<T extends { skill: string }>(
  attrs: string[],
  drills: T[],
  limit = 4,
): T[] {
  const skills = [
    ...new Set(attrs.map((a) => ATTR_TO_SKILL[a as AttributeKey]).filter(Boolean)),
  ];
  return drills.filter((d) => skills.includes(d.skill)).slice(0, limit);
}
