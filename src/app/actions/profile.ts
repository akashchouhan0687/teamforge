"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ProfileSchema, type ProfileFormState } from "@/lib/definitions";
import { PROFICIENCY_LEVELS, type ProficiencyLevel } from "@/lib/skills";

/**
 * Updates or creates the authenticated user's profile.
 * Authenticated user ID is always determined server-side from the session.
 */
export async function updateProfile(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await getSession();
  if (!session?.userId) {
    return {
      errors: { general: ["You must be signed in to update your profile."] },
    };
  }

  const rawData = {
    name: formData.get("name"),
    department: formData.get("department"),
    year: formData.get("year"),
    bio: formData.get("bio") || "",
    location: formData.get("location") || "",
    profileImage: formData.get("profileImage") || "",
    interests: formData.get("interests") || "",
  };

  const validated = ProfileSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { name, department, year, bio, location, profileImage, interests } =
    validated.data;

  try {
    // Update User name & image
    await db.user.update({
      where: { id: session.userId },
      data: {
        name,
        image: profileImage || null,
      },
    });

    // Upsert Profile
    await db.profile.upsert({
      where: { userId: session.userId },
      update: {
        department,
        year,
        bio: bio || null,
        location: location || null,
        profileImage: profileImage || null,
        interests: interests || null,
      },
      create: {
        userId: session.userId,
        department,
        year,
        bio: bio || null,
        location: location || null,
        profileImage: profileImage || null,
        interests: interests || null,
      },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/edit");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Profile updated successfully!",
    };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return {
      errors: { general: ["Failed to save profile. Please try again."] },
      success: false,
    };
  }
}

/**
 * Adds a skill with proficiency to the user's profile.
 */
export async function addUserSkill(
  skillId: string,
  proficiency: string = "Intermediate"
) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  if (!PROFICIENCY_LEVELS.includes(proficiency as ProficiencyLevel)) {
    proficiency = "Intermediate";
  }

  // Ensure skill exists
  const skill = await db.skill.findUnique({ where: { id: skillId } });
  if (!skill) {
    throw new Error("Skill not found");
  }

  // Upsert user skill
  await db.userSkill.upsert({
    where: {
      userId_skillId: {
        userId: session.userId,
        skillId,
      },
    },
    update: { proficiency },
    create: {
      userId: session.userId,
      skillId,
      proficiency,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Removes a skill from the user's profile.
 */
export async function removeUserSkill(skillId: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  await db.userSkill.deleteMany({
    where: {
      userId: session.userId,
      skillId,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/dashboard");

  return { success: true };
}

/**
 * Updates proficiency level for an existing user skill.
 */
export async function updateUserSkillProficiency(
  skillId: string,
  proficiency: string
) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  if (!PROFICIENCY_LEVELS.includes(proficiency as ProficiencyLevel)) {
    throw new Error("Invalid proficiency level");
  }

  await db.userSkill.update({
    where: {
      userId_skillId: {
        userId: session.userId,
        skillId,
      },
    },
    data: { proficiency },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/dashboard");

  return { success: true };
}
