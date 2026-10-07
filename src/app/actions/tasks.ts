"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function createTask(teamId: string, data: {
  title: string;
  description?: string;
  assignedToId?: string | null;
  priority?: string; // "LOW" | "MEDIUM" | "HIGH"
  dueDate?: Date | null;
}) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { members: true }
  });
  if (!team) throw new Error("Team not found");
  if (team.ownerId !== session.userId) throw new Error("Only the team owner can create tasks");

  if (data.assignedToId) {
    const isMember = team.members.some(m => m.userId === data.assignedToId);
    if (!isMember) throw new Error("Assigned user is not a member of this team");
  }

  await db.task.create({
    data: {
      teamId,
      title: data.title,
      description: data.description,
      assignedToId: data.assignedToId,
      priority: data.priority || "MEDIUM",
      status: "TODO",
      dueDate: data.dueDate,
      createdById: session.userId,
    }
  });

  revalidatePath(`/teams/${teamId}`);
}

export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string | null;
  assignedToId?: string | null;
  priority?: string;
  status?: string;
  dueDate?: Date | null;
}) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { team: { include: { members: true } } }
  });
  if (!task) throw new Error("Task not found");

  if (task.team.ownerId !== session.userId) {
    throw new Error("Only the team owner can edit task details");
  }

  if (data.assignedToId && data.assignedToId !== task.assignedToId) {
    const isMember = task.team.members.some(m => m.userId === data.assignedToId);
    if (!isMember) throw new Error("Assigned user is not a member of this team");
  }

  await db.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description,
      assignedToId: data.assignedToId,
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate,
    }
  });

  revalidatePath(`/teams/${task.teamId}`);
}

export async function updateTaskStatus(taskId: string, status: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  if (!["TODO", "IN_PROGRESS", "COMPLETED"].includes(status)) {
    throw new Error("Invalid status");
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { team: true }
  });
  if (!task) throw new Error("Task not found");

  const isOwner = task.team.ownerId === session.userId;
  const isAssignedToMe = task.assignedToId === session.userId;

  if (!isOwner && !isAssignedToMe) {
    throw new Error("Only the team owner or the assigned member can update the task status");
  }

  await db.task.update({
    where: { id: taskId },
    data: { status }
  });

  revalidatePath(`/teams/${task.teamId}`);
}

export async function deleteTask(taskId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: { team: true }
  });
  if (!task) throw new Error("Task not found");

  if (task.team.ownerId !== session.userId) {
    throw new Error("Only the team owner can delete a task");
  }

  await db.task.delete({
    where: { id: taskId }
  });

  revalidatePath(`/teams/${task.teamId}`);
}
