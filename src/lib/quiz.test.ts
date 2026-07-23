import { describe, expect, it } from "vitest";
import {
  computeGrowthAreas,
  computeQuizResult,
  generateHybridNickname,
  pickNextQuestion,
  recommendDrills,
  type QuizQuestionData,
} from "@/lib/quiz";

describe("pickNextQuestion", () => {
  const questions: QuizQuestionData[] = [
    { id: "q1", options: [{ tags: { slasher: 3 } }, { tags: { floorgeneral: 3 } }] },
    { id: "q2", options: [{ tags: { floorgeneral: 3 } }, { tags: { connector: 2 } }] },
    { id: "q3", options: [{ tags: { slasher: 1 } }] },
  ];

  it("picks the remaining question most relevant to the current leaders", () => {
    // floorgeneral (3) is the sole leader; q2 scores it 3, q3 scores it 0
    const next = pickNextQuestion(questions, ["q1"], { floorgeneral: 3, slasher: 0, connector: 0 });
    expect(next).toBe("q2");
  });

  it("returns null once every question has been asked", () => {
    const next = pickNextQuestion(questions, ["q1", "q2", "q3"], {});
    expect(next).toBeNull();
  });

  it("returns null after 6 questions even if more remain", () => {
    const many: QuizQuestionData[] = Array.from({ length: 10 }, (_, i) => ({
      id: `q${i}`,
      options: [{ tags: {} }],
    }));
    const asked = many.slice(0, 6).map((q) => q.id);
    expect(pickNextQuestion(many, asked, {})).toBeNull();
  });

  it("returns the only remaining question when just one is left", () => {
    const next = pickNextQuestion(questions, ["q1", "q2"], {});
    expect(next).toBe("q3");
  });
});

describe("generateHybridNickname", () => {
  it("combines top's adjective with second's last name word", () => {
    const top = { name: "Floor General", adjective: "Commanding", emphasize: [] };
    const second = { name: "Shot Creator", adjective: "Shifty", emphasize: [] };
    expect(generateHybridNickname(top, second)).toBe("Commanding Creator");
  });

  it("handles a multi-word archetype name", () => {
    const top = { name: "Lockdown Defender", adjective: "Suffocating", emphasize: [] };
    const second = { name: "Sixth Man Spark", adjective: "Electric", emphasize: [] };
    expect(generateHybridNickname(top, second)).toBe("Suffocating Spark");
  });

  it("handles a single-word archetype name", () => {
    const top = { name: "Slasher", adjective: "Explosive", emphasize: [] };
    const second = { name: "Enforcer", adjective: "Physical", emphasize: [] };
    expect(generateHybridNickname(top, second)).toBe("Explosive Enforcer");
  });
});

describe("computeQuizResult", () => {
  const archetypes = {
    floorgeneral: { name: "Floor General", adjective: "Commanding", emphasize: ["passing", "leadership"] },
    shotcreator: { name: "Shot Creator", adjective: "Shifty", emphasize: ["shooting", "confidence"] },
    slasher: { name: "Slasher", adjective: "Explosive", emphasize: ["strength", "confidence"] },
  };

  it("is not a hybrid when the runner-up is well below 75% of the leader", () => {
    const result = computeQuizResult({ floorgeneral: 10, shotcreator: 2, slasher: 0 }, archetypes);
    expect(result.isHybrid).toBe(false);
    expect(result.nickname).toBeNull();
    expect(result.topArchetypeId).toBe("floorgeneral");
    expect(result.emphasizeSet).toEqual(["passing", "leadership"]);
  });

  it("still reports the real runner-up even when not a hybrid", () => {
    const result = computeQuizResult({ floorgeneral: 10, shotcreator: 2, slasher: 0 }, archetypes);
    expect(result.secondArchetypeId).toBe("shotcreator");
    expect(result.secondScore).toBe(2);
  });

  it("is a hybrid exactly at the 75% threshold", () => {
    const result = computeQuizResult({ floorgeneral: 8, shotcreator: 6, slasher: 0 }, archetypes);
    expect(result.isHybrid).toBe(true);
    expect(result.nickname).toBe("Commanding Creator");
  });

  it("is a hybrid just above the threshold", () => {
    const result = computeQuizResult({ floorgeneral: 10, shotcreator: 8, slasher: 0 }, archetypes);
    expect(result.isHybrid).toBe(true);
  });

  it("is not a hybrid when the leader's score is 0", () => {
    const result = computeQuizResult({ floorgeneral: 0, shotcreator: 0, slasher: 0 }, archetypes);
    expect(result.isHybrid).toBe(false);
  });

  it("dedupes overlapping emphasize attributes between top and second on a hybrid", () => {
    const result = computeQuizResult({ shotcreator: 10, slasher: 8, floorgeneral: 0 }, archetypes);
    expect(result.isHybrid).toBe(true);
    // shotcreator: shooting, confidence; slasher: strength, confidence -- confidence appears once
    expect(result.emphasizeSet).toEqual(["shooting", "confidence", "strength"]);
  });
});

describe("computeGrowthAreas", () => {
  it("excludes emphasized attributes and sorts ascending by value", () => {
    const attrs = { shooting: 80, passing: 30, defence: 50, conditioning: 20 };
    const growth = computeGrowthAreas(attrs, ["shooting"]);
    expect(growth).toEqual(["conditioning", "passing", "defence"]);
  });

  it("respects the count limit", () => {
    const attrs = { a: 1, b: 2, c: 3, d: 4 };
    expect(computeGrowthAreas(attrs, [], 2)).toEqual(["a", "b"]);
  });
});

describe("recommendDrills", () => {
  const drills = [
    { id: "tr1", skill: "Shooting" },
    { id: "tr3", skill: "Defence" },
    { id: "tr4", skill: "Basketball IQ" },
    { id: "tr5", skill: "Conditioning" },
    { id: "tr6", skill: "Shooting" },
  ];

  it("maps attributes to skills and filters matching drills", () => {
    const result = recommendDrills(["shooting"], drills);
    expect(result.map((d) => d.id)).toEqual(["tr1", "tr6"]);
  });

  it("dedupes skills mapped from multiple attributes", () => {
    // confidence and consistency both map to Shooting
    const result = recommendDrills(["confidence", "consistency"], drills);
    expect(result.map((d) => d.id)).toEqual(["tr1", "tr6"]);
  });

  it("respects the limit", () => {
    const result = recommendDrills(["shooting"], drills, 1);
    expect(result).toHaveLength(1);
  });

  it("ignores attributes with no skill mapping", () => {
    const result = recommendDrills(["unknownAttr"], drills);
    expect(result).toEqual([]);
  });
});
