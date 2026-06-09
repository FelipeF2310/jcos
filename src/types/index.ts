import { z } from "zod";

export const IssueStatusSchema = z.enum([
  "open",
  "in-progress",
  "resolved",
  "escalated",
]);

export const IssuePrioritySchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export const ActionStatusSchema = z.enum([
  "not-started",
  "in-progress",
  "complete",
]);

export const MetricStatusSchema = z.enum(["on-target", "at-risk", "off-target"]);

export type IssueStatus = z.infer<typeof IssueStatusSchema>;
export type IssuePriority = z.infer<typeof IssuePrioritySchema>;
export type ActionStatus = z.infer<typeof ActionStatusSchema>;
export type MetricStatus = z.infer<typeof MetricStatusSchema>;
