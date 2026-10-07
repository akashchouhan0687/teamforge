"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function createTeam(projectId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { team: true },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.userId !== session.userId) {
    throw new Error("Unauthorized: Only the project owner can create a team");
  }

  if (project.team) {
    throw new Error("Team already exists for this project");
  }

  const teamName = formData.get("name")?.toString().trim() || `${project.title} Team`;

  const newTeam = await db.team.create({
    data: {
      name: teamName,
      projectId: project.id,
      ownerId: session.userId,
      members: {
        create: {
          userId: session.userId,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/teams");
  redirect(`/teams/${newTeam.id}`);
}

export async function removeTeamMember(teamId: string, userIdToRemove: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { members: true },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.ownerId !== session.userId) {
    throw new Error("Unauthorized: Only the team owner can remove members");
  }

  if (userIdToRemove === team.ownerId) {
    throw new Error("Cannot remove the team owner");
  }

  await db.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId: userIdToRemove,
      },
    },
  });

  revalidatePath(`/teams/${teamId}`);
}

export async function leaveTeam(teamId: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  const team = await db.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.ownerId === session.userId) {
    throw new Error("Team owner cannot leave the team normally");
  }

  await db.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId: session.userId,
      },
    },
  });

  revalidatePath(`/teams/${teamId}`);
  revalidatePath("/teams");
  redirect("/teams");
}

export async function updateTeam(teamId: string, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  const newName = formData.get("name")?.toString().trim();
  if (!newName) {
    throw new Error("Team name is required");
  }

  const team = await db.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.ownerId !== session.userId) {
    throw new Error("Unauthorized: Only the team owner can edit the team");
  }

  await db.team.update({
    where: { id: teamId },
    data: { name: newName },
  });

  revalidatePath(`/teams/${teamId}`);
}

export async function deleteTeam(teamId: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  const team = await db.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new Error("Team not found");
  }

  if (team.ownerId !== session.userId) {
    throw new Error("Unauthorized: Only the team owner can delete the team");
  }

  await db.team.delete({
    where: { id: teamId },
  });

  revalidatePath("/teams");
  if (team.projectId) {
    revalidatePath(`/projects/${team.projectId}`);
  }
  redirect("/teams");
}

