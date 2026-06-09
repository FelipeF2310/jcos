"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { issues, actions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

const CreateIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  departmentId: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

export async function createIssue(formData: FormData) {
  const parsed = CreateIssueSchema.parse({
    title: formData.get("title"),
    description: formData.get("description"),
    departmentId: formData.get("departmentId"),
    priority: formData.get("priority"),
  });

  await db.insert(issues).values({
    id: randomUUID(),
    ...parsed,
    status: "open",
  });

  revalidatePath("/issues");
}

export async function updateIssueStatus(id: string, status: "open" | "in-progress" | "resolved" | "escalated") {
  await db.update(issues).set({ status, updatedAt: new Date() }).where(eq(issues.id, id));
  revalidatePath("/issues");
  revalidatePath(`/issues/${id}`);
}

const CreateActionSchema = z.object({
  description: z.string().min(1),
  issueId: z.string().min(1),
  ownerId: z.string().min(1),
  dueDate: z.string().optional(),
});

export async function createAction(formData: FormData) {
  const parsed = CreateActionSchema.parse({
    description: formData.get("description"),
    issueId: formData.get("issueId"),
    ownerId: formData.get("ownerId"),
    dueDate: formData.get("dueDate"),
  });

  await db.insert(actions).values({
    id: randomUUID(),
    description: parsed.description,
    issueId: parsed.issueId,
    ownerId: parsed.ownerId,
    status: "not-started",
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
  });

  revalidatePath("/actions");
  revalidatePath(`/issues/${parsed.issueId}`);
}

export async function updateActionStatus(id: string, status: "not-started" | "in-progress" | "complete") {
  await db.update(actions)
    .set({ status, updatedAt: new Date(), completedAt: status === "complete" ? new Date() : null })
    .where(eq(actions.id, id));
  revalidatePath("/actions");
}
