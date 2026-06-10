import Link from "next/link";
import { getIssues } from "@/server/issues";
import { Plus, ArrowRight, AlertCircle } from "lucide-react";

const statusStyle: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  open:          { bg: "#eff6ff", text: "#1d4ed8", dot: "#1d4ed8", label: "Open" },
  "in-progress": { bg: "#fefce8", text: "#a16207", dot: "#ca8a04", label: "In Progress" },
  resolved:      { bg: "#f0fdf4", text: "#15803d", dot: "#16a34a", label: "Resolved" },
  escalated:     { bg: "#fef2f2", text: "#b91c1c", dot: "#dc2626", label: "Escalated" },
};

const priorityStyle: Record<string, { text: string; bg: string }> = {
  low:      { text: "#64748b", bg: "#f8fafc" },
  medium:   { text: "#1d4ed8", bg: "#eff6ff" },
  high:     { text: "#ea580c", bg: "#fff7ed" },
  critical: { text: "#dc2626", bg: "#fef2f2" },
};

const deptNames: Record<string, string> = {
  "public-works": "Public Works",
  "resident-response": "Resident Response",
  "engineering-permitting": "Engineering & Permitting",
};

export default async function IssuesPage() {
  const allIssues = await getIssues();
  const sorted = [...allIssues].sort((a, b) => {
    const order = { escalated: 0, open: 1, "in-progress": 2, resolved: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });

  const open = allIssues.filter(i => i.status !== "resolved").length;
  const escalated = allIssues.filter(i => i.status === "escalated").length;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Issues</h1>
          <p className="text-sm text-slate-500 mt-1">
            {open} open · {escalated > 0 ? <span className="text-red-600 font-medium">{escalated} escalated</span> : "0 escalated"}
          </p>
        </div>
        <Link
          href="/issues/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Plus className="h-4 w-4" /> New Issue
        </Link>
      </div>

      {/* Issue list */}
      <div className="space-y-2">
        {sorted.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center" style={{ borderColor: "var(--border)" }}>
            <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No issues yet.</p>
            <Link href="/issues/new" className="text-sm text-blue-600 hover:underline mt-1 block">Create the first one →</Link>
          </div>
        )}
        {sorted.map((issue) => {
          const s = statusStyle[issue.status] ?? statusStyle.open;
          const p = priorityStyle[issue.priority] ?? priorityStyle.medium;
          return (
            <Link key={issue.id} href={`/issues/${issue.id}`}>
              <div
                className="bg-white rounded-lg border p-4 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all"
                style={{ borderColor: issue.status === "escalated" ? "#fca5a5" : "var(--border)" }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {issue.status === "escalated" && (
                      <span className="text-red-500 text-xs font-bold uppercase tracking-wide">⚠ Escalated</span>
                    )}
                    <p className="text-sm font-semibold text-slate-800 truncate">{issue.title}</p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {deptNames[issue.departmentId] ?? issue.departmentId} · {new Date(issue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                <span
                  className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: p.bg, color: p.text }}
                >
                  {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                </span>

                <span
                  className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: s.bg, color: s.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                  {s.label}
                </span>

                <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
