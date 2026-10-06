"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { ProjectSchema, type ProjectFormState } from "@/lib/definitions";

/**
 * Creates a new project for the authenticated user.
 */
export async function createProject(
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await getSession();
  if (!session?.userId) {
    return {
      errors: { general: ["You must be signed in to create a project."] },
      success: false,
    };
  }

  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    role: formData.get("role") || "",
    technologies: formData.get("technologies") || "",
    githubUrl: formData.get("githubUrl") || "",
    liveUrl: formData.get("liveUrl") || "",
    imageUrl: formData.get("imageUrl") || "",
    projectType: formData.get("projectType") || "",
    teamSize: formData.get("teamSize") || "",
    requiredSkills: formData.get("requiredSkills") || "[]",
    preferredSkills: formData.get("preferredSkills") || "[]",
  };

  const validated = ProjectSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { title, description, role, technologies, githubUrl, liveUrl, imageUrl, projectType, teamSize, requiredSkills, preferredSkills } =
    validated.data;

  let reqSkillsArr: string[] = [];
  let prefSkillsArr: string[] = [];
  try {
    reqSkillsArr = JSON.parse(requiredSkills as string || "[]");
    prefSkillsArr = JSON.parse(preferredSkills as string || "[]");
  } catch (e) {
    // Ignore invalid JSON
  }

  const skillsData = [
    ...reqSkillsArr.map(id => ({ skillId: id, requirementType: 'REQUIRED' })),
    ...prefSkillsArr.map(id => ({ skillId: id, requirementType: 'PREFERRED' }))
  ];

  let createdProjectId: string;

  try {
    const project = await db.project.create({
      data: {
        userId: session.userId,
        title,
        description,
        role: role || null,
        technologies: technologies || null,
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        imageUrl: imageUrl || null,
        image: imageUrl || null, // backwards compatibility
        projectType: projectType || null,
        teamSize: teamSize ? Number(teamSize) : null,
        skills: {
          create: skillsData
        }
      },
    });
    createdProjectId = project.id;
  } catch (error) {
    console.error("Failed to create project:", error);
    return {
      errors: { general: ["An unexpected error occurred while creating the project."] },
      success: false,
    };
  }

  revalidatePath("/projects");
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  redirect(`/projects/${createdProjectId}`);
}

/**
 * Updates an existing project owned by the authenticated user.
 */
export async function updateProject(
  projectId: string,
  prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const session = await getSession();
  if (!session?.userId) {
    return {
      errors: { general: ["You must be signed in to edit a project."] },
      success: false,
    };
  }

  // 1. Verify existence and ownership
  const existingProject = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!existingProject) {
    return {
      errors: { general: ["Project not found."] },
      success: false,
    };
  }

  if (existingProject.userId !== session.userId) {
    return {
      errors: { general: ["Unauthorized: You can only edit your own projects."] },
      success: false,
    };
  }

  // 2. Validate input
  const rawData = {
    title: formData.get("title"),
    description: formData.get("description"),
    role: formData.get("role") || "",
    technologies: formData.get("technologies") || "",
    githubUrl: formData.get("githubUrl") || "",
    liveUrl: formData.get("liveUrl") || "",
    imageUrl: formData.get("imageUrl") || "",
    projectType: formData.get("projectType") || "",
    teamSize: formData.get("teamSize") || "",
    requiredSkills: formData.get("requiredSkills") || "[]",
    preferredSkills: formData.get("preferredSkills") || "[]",
  };

  const validated = ProjectSchema.safeParse(rawData);
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { title, description, role, technologies, githubUrl, liveUrl, imageUrl, projectType, teamSize, requiredSkills, preferredSkills } =
    validated.data;

  let reqSkillsArr: string[] = [];
  let prefSkillsArr: string[] = [];
  try {
    reqSkillsArr = JSON.parse(requiredSkills as string || "[]");
    prefSkillsArr = JSON.parse(preferredSkills as string || "[]");
  } catch (e) {
    // Ignore invalid JSON
  }

  const skillsData = [
    ...reqSkillsArr.map(id => ({ skillId: id, requirementType: 'REQUIRED' })),
    ...prefSkillsArr.map(id => ({ skillId: id, requirementType: 'PREFERRED' }))
  ];

  try {
    // Using transaction to cleanly replace skills
    await db.$transaction([
      db.projectSkill.deleteMany({
        where: { projectId: projectId }
      }),
      db.project.update({
        where: { id: projectId },
        data: {
          title,
          description,
          role: role || null,
          technologies: technologies || null,
          githubUrl: githubUrl || null,
          liveUrl: liveUrl || null,
          imageUrl: imageUrl || null,
          image: imageUrl || null,
          projectType: projectType || null,
          teamSize: teamSize ? Number(teamSize) : null,
          skills: {
            create: skillsData
          }
        },
      })
    ]);
  } catch (error) {
    console.error("Failed to update project:", error);
    return {
      errors: { general: ["Failed to save project changes."] },
      success: false,
    };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  redirect(`/projects/${projectId}`);
}

/**
 * Deletes a project owned by the authenticated user.
 */
export async function deleteProject(projectId: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized: You must be signed in.");
  }

  const existingProject = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!existingProject) {
    throw new Error("Project not found.");
  }

  if (existingProject.userId !== session.userId) {
    throw new Error("Unauthorized: You can only delete your own projects.");
  }

  await db.project.delete({
    where: { id: projectId },
  });

  revalidatePath("/projects");
  revalidatePath("/profile");
  revalidatePath("/dashboard");

  return { success: true };
}
