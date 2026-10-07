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

  // Verify membership lightweight check
  const teamAuth = await db.team.findUnique({
    where: { id: teamId },
    select: { ownerId: true }
  });

  if (!teamAuth) throw new Error("Team not found");

  if (teamAuth.ownerId !== session.userId) {
    const isMember = await db.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: session.userId } },
      select: { userId: true }
    });
    if (!isMember) {
      throw new Error("You must be a member of this team to send messages");
    }
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
  revalidatePath('/teams/' + teamId + '/chat');

  return message;
}

export async function getTeamMessages(teamId: string, limit = 50, afterId?: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  // Verify membership lightweight check
  const teamAuth = await db.team.findUnique({
    where: { id: teamId },
    select: { ownerId: true }
  });

  if (!teamAuth) throw new Error("Team not found");

  if (teamAuth.ownerId !== session.userId) {
    const isMember = await db.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: session.userId } },
      select: { userId: true }
    });
    if (!isMember) {
      throw new Error("You must be a member of this team to read messages");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryParams: any = {
    where: { teamId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }], // deterministic sorting for cursor
    include: {
      sender: {
        select: { id: true, name: true, image: true, profile: { select: { profileImage: true } } }
      }
    }
  };

  if (afterId) {
    queryParams.cursor = { id: afterId };
    queryParams.skip = 1; // skip the cursor message itself
  } else {
    queryParams.take = -limit; // only apply negative take for initial loads
  }

  const messages = await db.teamMessage.findMany(queryParams);

  return messages;
}





