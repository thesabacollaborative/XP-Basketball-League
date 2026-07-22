/**
 * Placeholder minor-consent gate (see CLAUDE.md) — under 13 requires a
 * guardian email + consent before any profile data collection continues.
 * Not a legally vetted jurisdiction-aware flow yet.
 */
export const GUARDIAN_CONSENT_AGE_THRESHOLD = 13;

export function calculateAge(dateOfBirth: Date, now: Date = new Date()): number {
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = now.getMonth() - dateOfBirth.getMonth();
  const dayDiff = now.getDate() - dateOfBirth.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
}

export function requiresGuardianConsent(
  dateOfBirth: Date,
  now: Date = new Date(),
): boolean {
  return calculateAge(dateOfBirth, now) < GUARDIAN_CONSENT_AGE_THRESHOLD;
}
