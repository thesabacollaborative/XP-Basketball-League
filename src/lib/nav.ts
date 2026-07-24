import type { Role } from "@/generated/prisma/enums";

export const NAV_GROUPS = [
  {
    group: "Play",
    links: [
      { id: "dashboard", icon: "🏠", label: "Dashboard" },
      { id: "mycard", icon: "🪪", label: "Your Card" },
      { id: "quiz", icon: "🧩", label: "Playstyle Quiz" },
      { id: "training", icon: "🎥", label: "Training & Clinics" },
      { id: "log", icon: "📝", label: "Log Activity" },
      { id: "clips", icon: "📼", label: "My Clips" },
    ],
  },
  {
    group: "League",
    links: [
      { id: "teams", icon: "👥", label: "Teams" },
      { id: "compete", icon: "🏅", label: "Compete" },
      { id: "leaderboard", icon: "🏆", label: "Leaderboard" },
      { id: "badges", icon: "🎖️", label: "Badges" },
      { id: "community", icon: "💬", label: "Community Feed" },
    ],
  },
  {
    group: "Learn",
    links: [{ id: "howitworks", icon: "❓", label: "How It Works" }],
  },
  {
    group: "Organisation",
    links: [{ id: "vision", icon: "📈", label: "The Vision" }],
  },
] as const;

export const TITLES: Record<string, [string, string]> = {
  dashboard: ["Dashboard", "Your progression at a glance"],
  mycard: ["Your Card", "Full profile, stats and archetype"],
  quiz: ["Playstyle Quiz", "Scenario-based archetype finder"],
  training: ["Training & Clinics", "Tailored library per role"],
  log: ["Log Activity", "Every entry needs confirmation"],
  clips: ["My Clips", "Your personal recorded catalogue"],
  teams: ["Teams", "Create, join and compete"],
  compete: ["Compete", "Paid registered competitions"],
  leaderboard: ["Leaderboard", "Every role, ranked"],
  badges: ["Badges", "Evidence-based tiered achievements"],
  community: ["Community Feed", "Highlights and league chatter"],
  howitworks: ["How It Works", "XP, reputation, fans & fair play, explained"],
  vision: ["The Vision", "For investors, partners and funders"],
};

export const ROLE_META: Record<Role, { icon: string; label: string }> = {
  PLAYER: { icon: "🏀", label: "Player" },
  COACH: { icon: "📋", label: "Coach" },
  CREATOR: { icon: "🎬", label: "Creator" },
  ADMIN: { icon: "🗂️", label: "Admin" },
};

export const ROLE_DASHBOARD_COPY: Record<Role, { headline: string; sub: string }> = {
  PLAYER: {
    headline: "Your game. Tracked, trained, levelled up.",
    sub: "Log every run, build your Player Card, and climb the league — one XP track at a time.",
  },
  COACH: {
    headline: "Build players. Build the game.",
    sub: "Track your athletes' progress, run sessions, and grow your Coach XP track and reputation.",
  },
  CREATOR: {
    headline: "Capture the culture. Grow the brand.",
    sub: "Turn highlights into fans, and fans into a Creator track that funds the next production.",
  },
  ADMIN: {
    headline: "Run the league like clockwork.",
    sub: "Teams, courts and events and the Official track — the operating layer behind XP Basketball League.",
  },
};
