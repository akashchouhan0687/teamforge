import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { AddMemberClient } from "./AddMemberClient";

interface AddMemberPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: "Add Team Member — TeamForge",
};

export default async function AddMemberPage({ params }: AddMemberPageProps) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const team = await db.team.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          skills: {
            include: { skill: true }
          }
        }
      },
      members: true
    }
  });

  if (!team) {
    notFound();
  }

  const isOwner = team.ownerId === session.userId;

  if (!isOwner) {
    redirect(`/teams/${team.id}`);
  }

  const availableUsers = await db.user.findMany({
    where: {
      teamMembers: {
        none: {
          teamId: team.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      image: true,
      profile: {
        select: {
          department: true,
          year: true,
          bio: true,
          location: true,
          profileImage: true,
          interests: true,
        }
      },
      skills: {
        include: { skill: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  const projectRequiredSkills = team.project?.skills
    .filter(s => s.requirementType === 'REQUIRED')
    .map(s => s.skill.name) || [];

  return (
    <AddMemberClient 
      team={team} 
      availableUsers={availableUsers} 
      projectRequiredSkills={projectRequiredSkills} 
    />
  );
}
