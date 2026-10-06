"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";

export async function markNotificationAsRead(notificationId: string) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  await db.notification.update({
    where: { id: notificationId, userId: session.userId },
    data: { read: true }
  });

  revalidatePath(`/notifications`);
}

export async function markAllNotificationsAsRead() {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  await db.notification.updateMany({
    where: { userId: session.userId, read: false },
    data: { read: true }
  });

  revalidatePath(`/notifications`);
}
