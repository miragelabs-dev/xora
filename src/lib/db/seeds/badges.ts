import { db } from "../index";
import { badges } from "../schema";

const defaultBadges = [
  {
    name: "Streak Starter",
    description: "Complete your first 3-day streak",
    icon: "🔥",
    requirementType: "streak",
    requirementValue: 3,
  },
  {
    name: "Week Warrior",
    description: "Complete a 7-day streak",
    icon: "⚡",
    requirementType: "streak",
    requirementValue: 7,
  },
  {
    name: "Streak Master",
    description: "Complete a 10-day streak",
    icon: "🏆",
    requirementType: "streak",
    requirementValue: 10,
  },
  {
    name: "Monthly Champion",
    description: "Complete a 30-day streak",
    icon: "👑",
    requirementType: "streak",
    requirementValue: 30,
  },
  {
    name: "Social Butterfly",
    description: "Give 100 likes to posts",
    icon: "🦋",
    requirementType: "likes",
    requirementValue: 100,
  },
  {
    name: "Content Creator",
    description: "Create 50 posts",
    icon: "✍️",
    requirementType: "posts",
    requirementValue: 50,
  },
  {
    name: "Point Collector",
    description: "Earn 1000 points",
    icon: "💎",
    requirementType: "points",
    requirementValue: 1000,
  },
];

export async function seedBadges() {
  try {
    await db.insert(badges).values(defaultBadges);
    console.log("✅ Default badges seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding badges:", error);
  }
}