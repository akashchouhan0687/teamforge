import { db } from "@/lib/db";

export const DEFAULT_SKILLS = [
  // Programming
  { name: "C", category: "Programming" },
  { name: "C++", category: "Programming" },
  { name: "Java", category: "Programming" },
  { name: "Python", category: "Programming" },
  { name: "JavaScript", category: "Programming" },
  { name: "TypeScript", category: "Programming" },

  // Web
  { name: "HTML", category: "Web" },
  { name: "CSS", category: "Web" },
  { name: "React", category: "Web" },
  { name: "Next.js", category: "Web" },
  { name: "Node.js", category: "Web" },

  // Database
  { name: "MySQL", category: "Database" },
  { name: "PostgreSQL", category: "Database" },
  { name: "MongoDB", category: "Database" },
  { name: "SQL", category: "Database" },

  // Other
  { name: "UI/UX", category: "Other" },
  { name: "Cybersecurity", category: "Other" },
  { name: "Machine Learning", category: "Other" },
  { name: "Git", category: "Other" },
  { name: "GitHub", category: "Other" },
] as const;

export const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

/**
 * Ensures default skills exist in the database.
 * Safe to run multiple times.
 */
export async function seedDefaultSkills() {
  for (const skill of DEFAULT_SKILLS) {
    await db.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: { name: skill.name, category: skill.category },
    });
  }
}

/**
 * Retrieves all available skills, ordered by category and name.
 * Seeds default skills if none exist.
 */
export async function getAllSkills() {
  let skills = await db.skill.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  if (skills.length === 0) {
    await seedDefaultSkills();
    skills = await db.skill.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });
  }

  return skills;
}
