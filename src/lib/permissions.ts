import type { Session } from "next-auth";

type Role = "executive" | "director" | "staff";

export function canViewExecutiveScorecard(session: Session | null): boolean {
  return session?.user?.role === "executive";
}

export function canManageIssues(session: Session | null): boolean {
  const role = session?.user?.role as Role | undefined;
  return role === "executive" || role === "director";
}

export function canViewDepartment(
  session: Session | null,
  departmentId: string
): boolean {
  const role = session?.user?.role as Role | undefined;
  if (role === "executive") return true;
  return session?.user?.departmentId === departmentId;
}
