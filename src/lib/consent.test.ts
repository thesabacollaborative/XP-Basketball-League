import { describe, expect, it } from "vitest";
import { calculateAge, requiresGuardianConsent } from "@/lib/consent";

describe("calculateAge", () => {
  it("computes a simple whole-year age", () => {
    expect(calculateAge(new Date("2010-01-01"), new Date("2026-01-01"))).toBe(16);
  });

  it("has not had this year's birthday yet", () => {
    expect(calculateAge(new Date("2010-06-15"), new Date("2026-06-01"))).toBe(15);
  });

  it("had this year's birthday already", () => {
    expect(calculateAge(new Date("2010-06-15"), new Date("2026-06-30"))).toBe(16);
  });

  it("is exactly on the birthday", () => {
    expect(calculateAge(new Date("2010-06-15"), new Date("2026-06-15"))).toBe(16);
  });
});

describe("requiresGuardianConsent", () => {
  it("requires consent under the threshold", () => {
    expect(requiresGuardianConsent(new Date("2015-01-01"), new Date("2026-01-01"))).toBe(true);
  });

  it("does not require consent at exactly the threshold age", () => {
    expect(requiresGuardianConsent(new Date("2013-01-01"), new Date("2026-01-01"))).toBe(false);
  });

  it("does not require consent for adults", () => {
    expect(requiresGuardianConsent(new Date("1990-01-01"), new Date("2026-01-01"))).toBe(false);
  });

  it("requires consent one day before the threshold birthday", () => {
    expect(requiresGuardianConsent(new Date("2013-01-02"), new Date("2026-01-01"))).toBe(true);
  });
});
