"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function sendConnectionRequest(receiverId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  if (session.userId === receiverId) throw new Error("Cannot connect with yourself");

  const existing = await db.connection.findFirst({
    where: {
      OR: [
        { senderId: session.userId, receiverId },
        { senderId: receiverId, receiverId: session.userId }
      ]
    }
  });

  if (existing) {
    if (existing.status === 'pending') throw new Error("Connection request already pending");
    if (existing.status === 'accepted') throw new Error("Already connected");
    // If rejected, we might allow resending, but for now let's just update the existing to pending
    await db.connection.update({
      where: { id: existing.id },
      data: { status: 'pending', senderId: session.userId, receiverId }
    });
  } else {
    await db.connection.create({
      data: {
        senderId: session.userId,
        receiverId,
        status: 'pending'
      }
    });
  }

  // Create notification
  await db.notification.create({
    data: {
      userId: receiverId,
      type: 'CONNECTION_REQUEST',
      title: 'New Connection Request',
      message: 'Someone sent you a connection request.',
    }
  });

  revalidatePath('/profile/' + receiverId);
  revalidatePath('/connections');
}

export async function acceptConnectionRequest(connectionId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const connection = await db.connection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error("Connection not found");
  if (connection.receiverId !== session.userId) throw new Error("Unauthorized");

  const unreadNotifs = await db.notification.findMany({
    where: { userId: session.userId, type: 'CONNECTION_REQUEST', read: false },
    take: 1
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txOperations: any[] = [
    db.connection.update({
      where: { id: connectionId },
      data: { status: 'accepted' }
    }),
    db.notification.create({
      data: {
        userId: connection.senderId,
        type: 'CONNECTION_ACCEPTED',
        title: 'Connection Accepted',
        message: 'Your connection request was accepted.',
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

  revalidatePath('/connections');
  revalidatePath('/profile/' + connection.senderId);
}

export async function declineConnectionRequest(connectionId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const connection = await db.connection.findUnique({ where: { id: connectionId } });
  if (!connection) throw new Error("Connection not found");
  if (connection.receiverId !== session.userId) throw new Error("Unauthorized");

  const unreadNotifs = await db.notification.findMany({
    where: { userId: session.userId, type: 'CONNECTION_REQUEST', read: false },
    take: 1
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const txOperations: any[] = [
    db.connection.update({
      where: { id: connectionId },
      data: { status: 'rejected' }
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

  revalidatePath('/connections');
}

