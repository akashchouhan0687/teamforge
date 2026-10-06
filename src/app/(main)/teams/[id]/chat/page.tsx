import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { TeamChatClient } from "./TeamChatClient";
import { getTeamMessages } from "@/app/actions/chat";

export const metadata = {
  title: "Team Chat — TeamForge",
};

interface TeamChatPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamChatPage({ params }: TeamChatPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  // Fetch team info + verify access
  const team = await db.team.findUnique({
    where: { id },
    include: {
      project: { select: { title: true, teamSize: true } },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: { select: { profileImage: true } }
            }
          }
        }
      }
    }
  });

  if (!team) notFound();

  const isOwner = team.ownerId === session.userId;
  const isMember = team.members.some(m => m.userId === session.userId);

  if (!isOwner && !isMember) {
    redirect("/teams");
  }

  // Get initial messages
  const initialMessages = await getTeamMessages(team.id);

  return (
    <TeamChatClient 
      team={team as any} 
      initialMessages={initialMessages as any} 
      currentUserId={session.userId} 
    />
  );
}
