"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function sendTeamInvitation(teamId: string, receiverId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const team = await db.team.findUnique({
    where: { id: teamId },
    include: { project: true, members: true }
  });

  if (!team) throw new Error("Team not found");
  if (team.ownerId !== session.userId) throw new Error("Only the team owner can send invitations");

  if (team.members.some(m => m.userId === receiverId)) {
    throw new Error("User is already a member of this team");
  }

  if (team.project?.teamSize && team.members.length >= team.project.teamSize) {
    throw new Error("Team is full");
  }

  const existing = await db.teamRequest.findFirst({
    where: { teamId, receiverId, status: 'pending' }
  });

  if (existing) throw new Error("An invitation is already pending for this user");

  await db.teamRequest.create({
    data: {
      teamId,
      senderId: session.userId,
      receiverId,
      status: 'pending'
    }
  });

  await db.notification.create({
    data: {
      userId: receiverId,
      type: 'TEAM_INVITATION',
      title: 'Team Invitation',
      message: team.name + ' invited you to join their team.',
    }
  });

  revalidatePath('/teams/' + teamId);
}

export async function acceptTeamInvitation(requestId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const request = await db.teamRequest.findUnique({
    where: { id: requestId },
    include: { team: { include: { project: true, members: true } } }
  });

  if (!request) throw new Error("Invitation not found");
  if (request.receiverId !== session.userId) throw new Error("Unauthorized");
  if (request.status !== 'pending') throw new Error("Invitation is no longer pending");

  const team = request.team;
  if (team.members.some(m => m.userId === session.userId)) {
    throw new Error("You are already a member of this team");
  }

  if (team.project?.teamSize && team.members.length >= team.project.teamSize) {
    throw new Error("This team is now full");
  }

  const unreadNotifs = await db.notification.findMany({
    where: { 
      userId: session.userId, 
      type: 'TEAM_INVITATION', 
      read: false,
      message: team.name + ' invited you to join their team.'
    },
    take: 1
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txOperations: any[] = [
    db.teamRequest.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    }),
    db.teamMember.create({
      data: {
        teamId: team.id,
        userId: session.userId,
        role: 'MEMBER'
      }
    }),
    db.notification.create({
      data: {
        userId: team.ownerId,
        type: 'INVITATION_ACCEPTED',
        title: 'Invitation Accepted',
        message: 'A user accepted your team invitation.',
      }
    })
  ];

  if (unreadNotifs.length > 0) {
    txOperations.push(
      db.notification.update({
        where: { id: unreadNotifs[0].id },
        data: { read: true }
      })
    );
  }

  await db.$transaction(txOperations);

  revalidatePath('/notifications');
  revalidatePath('/teams/' + team.id);
}

export async function declineTeamInvitation(requestId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const request = await db.teamRequest.findUnique({ 
    where: { id: requestId },
    include: { team: true } 
  });
  if (!request) throw new Error("Invitation not found");
  if (request.receiverId !== session.userId) throw new Error("Unauthorized");

  const unreadNotifs = await db.notification.findMany({
    where: { 
      userId: session.userId, 
      type: 'TEAM_INVITATION', 
      read: false,
      message: request.team.name + ' invited you to join their team.'
    },
    take: 1
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txOperations: any[] = [
    db.teamRequest.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    }),
    db.notification.create({
      data: {
        userId: request.senderId,
        type: 'INVITATION_DECLINED',
        title: 'Invitation Declined',
        message: 'A user declined your team invitation.',
      }
    })
  ];

  if (unreadNotifs.length > 0) {
    txOperations.push(
      db.notification.update({
        where: { id: unreadNotifs[0].id },
        data: { read: true }
      })
    );
  }

  await db.$transaction(txOperations);

  revalidatePath('/notifications');
}

export async function cancelTeamInvitation(requestId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const request = await db.teamRequest.findUnique({
    where: { id: requestId },
    include: { team: true }
  });

  if (!request) throw new Error("Invitation not found");
  if (request.team.ownerId !== session.userId) throw new Error("Unauthorized");

  const unreadNotifs = await db.notification.findMany({
    where: { 
      userId: request.receiverId, 
      type: 'TEAM_INVITATION', 
      read: false,
      message: request.team.name + ' invited you to join their team.'
    },
    take: 1
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txOperations: any[] = [
    db.teamRequest.update({
      where: { id: requestId },
      data: { status: 'cancelled' }
    })
  ];

  if (unreadNotifs.length > 0) {
    txOperations.push(
      db.notification.update({
        where: { id: unreadNotifs[0].id },
        data: { read: true }
      })
    );
  }

  await db.$transaction(txOperations);

  revalidatePath('/teams/' + request.teamId);
}

