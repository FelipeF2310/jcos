"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { issues, actions, metrics, metricReadings, issueComments, performanceReviews, reviewIssues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { createNotification, notifyByRole } from "./notifications";

// ── Issues ──────────────────────────────────────────────────────────────────

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

  const session = await auth();
  const ownerId = session?.user?.id ?? null;

  await db.insert(issues).values({ id: randomUUID(), ...parsed, status: "open", ownerId });
  revalidatePath("/issues");
}

export async function updateIssueStatus(id: string, status: "open" | "in-progress" | "resolved" | "escalated") {
  await db.update(issues).set({ status, updatedAt: new Date() }).where(eq(issues.id, id));

  if (status === "escalated") {
    const [issue] = await db.select({ title: issues.title }).from(issues).where(eq(issues.id, id)).limit(1);
    if (issue) {
      await notifyByRole("executive", {
        type: "escalation",
        title: `Issue escalated: ${issue.title}`,
        body: "An issue has been escalated and requires executive attention.",
        href: `/issues/${id}`,
      });
    }
  }

  revalidatePath("/issues");
  revalidatePath(`/issues/${id}`);
}

// ── Actions ──────────────────────────────────────────────────────────────────

const CreateActionSchema = z.object({
  description: z.string().min(1),
  issueId: z.string().min(1),
  dueDate: z.string().optional(),
});

export async function createAction(formData: FormData) {
  const parsed = CreateActionSchema.parse({
    description: formData.get("description"),
    issueId: formData.get("issueId"),
    dueDate: formData.get("dueDate"),
  });

  const session = await auth();
  const ownerId = session?.user?.id ?? "unassigned";

  const actionId = randomUUID();
  await db.insert(actions).values({
    id: actionId,
    description: parsed.description,
    issueId: parsed.issueId,
    ownerId,
    status: "not-started",
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
  });

  if (session?.user?.id) {
    await createNotification({
      userId: session.user.id,
      type: "action-assigned",
      title: "Action assigned to you",
      body: parsed.description,
      href: `/issues/${parsed.issueId}`,
    });
  }

  revalidatePath("/actions");
  revalidatePath(`/issues/${parsed.issueId}`);
}

export async function updateActionStatus(id: string, status: "not-started" | "in-progress" | "complete") {
  await db.update(actions)
    .set({ status, updatedAt: new Date(), completedAt: status === "complete" ? new Date() : null })
    .where(eq(actions.id, id));
  revalidatePath("/actions");
}

// ── Metric readings ───────────────────────────────────────────────────────────

const RecordMetricSchema = z.object({
  metricId: z.string().min(1),
  value: z.string().min(1),
  period: z.string().min(1),
  notes: z.string().optional(),
});

export async function recordMetricReading(formData: FormData) {
  const parsed = RecordMetricSchema.parse({
    metricId: formData.get("metricId"),
    value: formData.get("value"),
    period: formData.get("period"),
    notes: formData.get("notes"),
  });

  const target = formData.get("target") as string | null;
  const numValue = parseFloat(parsed.value);
  const numTarget = target ? parseFloat(target) : null;

  let status: "on-target" | "at-risk" | "off-target" = "on-target";
  if (numTarget !== null) {
    const pct = numValue / numTarget;
    if (pct > 1.15) status = "off-target";
    else if (pct > 1.05) status = "at-risk";
    else status = "on-target";
  }

  await db.insert(metricReadings).values({
    id: randomUUID(),
    metricId: parsed.metricId,
    value: parsed.value,
    period: parsed.period,
    notes: parsed.notes ?? null,
  });

  await db.update(metrics)
    .set({ value: parsed.value, status, period: parsed.period, recordedAt: new Date() })
    .where(eq(metrics.id, parsed.metricId));

  const deptId = formData.get("departmentId") as string;
  revalidatePath(`/departments/${deptId}`);
  revalidatePath("/executive");
}

// ── Comments ──────────────────────────────────────────────────────────────────

const AddCommentSchema = z.object({
  issueId: z.string().min(1),
  body: z.string().min(1),
});

export async function addComment(formData: FormData) {
  const parsed = AddCommentSchema.parse({
    issueId: formData.get("issueId"),
    body: formData.get("body"),
  });

  const session = await auth();
  const authorName = session?.user?.name ?? "Anonymous";

  await db.insert(issueComments).values({ id: randomUUID(), ...parsed, authorName });

  // Notify issue owner if set and different from commenter
  const [issue] = await db.select({ ownerId: issues.ownerId, title: issues.title }).from(issues).where(eq(issues.id, parsed.issueId)).limit(1);
  if (issue?.ownerId && issue.ownerId !== session?.user?.id) {
    await createNotification({
      userId: issue.ownerId,
      type: "comment",
      title: `New comment on: ${issue.title}`,
      body: parsed.body.slice(0, 120),
      href: `/issues/${parsed.issueId}`,
    });
  }

  revalidatePath(`/issues/${parsed.issueId}`);
}

// ── Performance reviews ───────────────────────────────────────────────────────

const CreateReviewSchema = z.object({
  type: z.enum(["weekly", "monthly"]),
  departmentId: z.string().optional(),
  reviewDate: z.string().min(1),
  attendees: z.string().optional(),
  summary: z.string().optional(),
});

export async function createReview(formData: FormData) {
  const parsed = CreateReviewSchema.parse({
    type: formData.get("type"),
    departmentId: formData.get("departmentId") || undefined,
    reviewDate: formData.get("reviewDate"),
    attendees: formData.get("attendees") || undefined,
    summary: formData.get("summary") || undefined,
  });

  const id = randomUUID();
  await db.insert(performanceReviews).values({
    id,
    type: parsed.type,
    departmentId: parsed.departmentId ?? null,
    reviewDate: new Date(parsed.reviewDate),
    attendees: parsed.attendees ?? null,
    summary: parsed.summary ?? null,
    status: "scheduled",
  });

  const issueIds = (formData.get("issueIds") as string ?? "").split(",").filter(Boolean);
  for (const issueId of issueIds) {
    await db.insert(reviewIssues).values({ id: randomUUID(), reviewId: id, issueId, notes: null });
  }

  // Notify directors about scheduled review
  await notifyByRole("director", {
    type: "review-scheduled",
    title: `${parsed.type === "weekly" ? "Weekly" : "Monthly"} review scheduled`,
    body: `Review scheduled for ${new Date(parsed.reviewDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
    href: `/reviews/${id}`,
  });

  revalidatePath("/reviews");
  return id;
}

export async function completeReview(id: string, summary: string) {
  await db.update(performanceReviews)
    .set({ status: "completed", summary })
    .where(eq(performanceReviews.id, id));
  revalidatePath("/reviews");
  revalidatePath(`/reviews/${id}`);
}
