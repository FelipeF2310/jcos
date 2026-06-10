import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { randomUUID } from "crypto";

type NotifType = "escalation" | "comment" | "action-assigned" | "review-scheduled";

interface CreateNotifInput {
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  href: string;
}

export async function createNotification(input: CreateNotifInput) {
  await db.insert(notifications).values({ id: randomUUID(), read: false, ...input });
}

export async function notifyByRole(
  role: "executive" | "director" | "staff",
  input: Omit<CreateNotifInput, "userId">,
) {
  const targets = await db.select({ id: users.id }).from(users).where(eq(users.role, role));
  await Promise.all(targets.map((u) => createNotification({ ...input, userId: u.id })));
}

export async function getNotifications(userId: string, limit = 20) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  return row?.count ?? 0;
}

export async function markAllRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}
