"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function sendTeamMessage(teamId: string, content: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const trimmedContent = content.trim();
  if (!trimmedContent) throw new Error("Message cannot be empty");
  if (trimmedContent.length > 2000) throw new Error("Message cannot exceed 2000 characters");

  // Verify membership
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: {
      members: { where: { userId: session.userId } }
    }
  });

  if (!team) throw new Error("Team not found");

  const isOwner = team.ownerId === session.userId;
  const isMember = team.members.length > 0;

  if (!isOwner && !isMember) {
    throw new Error("You must be a member of this team to send messages");
  }

  const message = await db.teamMessage.create({
    data: {
      teamId,
      senderId: session.userId,
      content: trimmedContent,
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true, profile: { select: { profileImage: true } } }
      }
    }
  });

  // Revalidate the chat route so it shows up for standard SSR updates if needed
  revalidatePath(`/teams/${teamId}/chat`);

  return message;
}

export async function getTeamMessages(teamId: string, limit = 50) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  // Verify membership
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: {
      members: { where: { userId: session.userId } }
    }
  });

  if (!team) throw new Error("Team not found");
  
  const isOwner = team.ownerId === session.userId;
  const isMember = team.members.length > 0;

  if (!isOwner && !isMember) {
    throw new Error("You must be a member of this team to read messages");
  }

  const messages = await db.teamMessage.findMany({
    where: { teamId },
    orderBy: { createdAt: "asc" }, // we will just load all latest ones chronologically
    take: -limit, // Prisma take negative means last N
    include: {
      sender: {
        select: { id: true, name: true, image: true, profile: { select: { profileImage: true } } }
      }
    }
  });

  return messages;
}
