"use server";

import { auth } from "@/auth";
import { markAllRead } from "./notifications";
import { revalidatePath } from "next/cache";

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;
  await markAllRead(session.user.id);
  revalidatePath("/", "layout");
}
