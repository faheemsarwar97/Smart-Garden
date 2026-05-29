import type { AchievementContext } from "./garden-store";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  goal: number;
  unit: string;
  progress: (ctx: AchievementContext) => number;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "hydration-hero",
    title: "Hydration Hero",
    description: "Trigger 10 precision waterings",
    emoji: "💧",
    goal: 10,
    unit: "waterings",
    progress: (c) => c.waterCount,
  },
  {
    id: "water-saver",
    title: "Water Saver",
    description: "Save 5L vs traditional watering",
    emoji: "🌊",
    goal: 5000,
    unit: "ml saved",
    progress: (c) => c.waterSavedMl,
  },
  {
    id: "sun-keeper",
    title: "Sun Keeper",
    description: "Accumulate 50h of grow-light coverage",
    emoji: "☀️",
    goal: 50,
    unit: "hours",
    progress: (c) => c.lightHours,
  },
  {
    id: "green-thumb",
    title: "Green Thumb",
    description: "Hold health score above 90%",
    emoji: "🌱",
    goal: 90,
    unit: "% health",
    progress: (c) => c.healthScore,
  },
  {
    id: "explorer",
    title: "Garden Explorer",
    description: "Manage 3 active zones",
    emoji: "🗺️",
    goal: 3,
    unit: "zones",
    progress: (c) => c.zoneCount,
  },
  {
    id: "rule-maker",
    title: "Rule Maker",
    description: "Create 3 custom IFTTT rules",
    emoji: "🧩",
    goal: 3,
    unit: "rules",
    progress: (c) => c.ruleCount,
  },
];