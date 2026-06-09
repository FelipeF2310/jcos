import type { Session } from "next-auth";

type Role = "executive" | "director" | "staff";

interface JCOSUser {
  role?: Role;
  departmentId?: string;
}

function getUser(session: Session | null): JCOSUser {
  return (session?.user as JCOSUser) ?? {};
}

export function canViewExecutiveScorecard(session: Session | null): boolean {
  return getUser(session).role === "executive";
}

export function canManageIssues(session: Session | null): boolean {
  const role = getUser(session).role;
  return role === "executive" || role === "director";
}

export function canViewDepartment(session: Session | null, departmentId: string): boolean {
  const user = getUser(session);
  if (user.role === "executive") return true;
  return user.departmentId === departmentId;
}
