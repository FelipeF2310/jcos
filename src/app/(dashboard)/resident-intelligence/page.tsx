import { getIssues } from "@/server/issues";
import Link from "next/link";
import { ArrowRight, TrendingUp, CheckCircle2, AlertCircle, Activity } from "lucide-react";

const deptNames: Record<string, string> = {
  "public-works": "Public Works",
  "resident-response": "Resident Response Center",
  "engineering-permitting": "Engineering & Permitting",
};

const DEPT_IDS = ["public-works", "resident-response", "engineering-permitting"];

const statusStyle: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  open:          { bg: "#eff6ff", text: "#1d4ed8", dot: "#1d4ed8", label: "Open" },
  "in-progress": { bg: "#fefce8", text: "#a16207", dot: "#ca8a04", label: "In Progress" },
  resolved:      { bg: "#f0fdf4", text: "#15803d", dot: "#16a34a", label: "Resolved" },
  escalated:     { bg: "#fef2f2", text: "#b91c1c", dot: "#dc2626", label: "Escalated" },
};

export default async function ResidentIntelligencePage() {
  const allIssues = await getIssues();

  const totalOpen = allIssues.filter((i) => i.status !== "resolved").length;
  const totalResolved = allIssues.filter((i) => i.status === "resolved").length;
  const resolutionRate = allIssues.length > 0 ? Math.round((totalResolved / allIssues.length) * 100) : 0;
  const critical = allIssues.filter((i) => i.priority === "critical" && i.status !== "resolved").length;

  const byDept = DEPT_IDS.map((id) => {
    const deptIssues = allIssues.filter((i) => i.departmentId === id);
    return {
      id, name: deptNames[id],
      total: deptIssues.length,
      open: deptIssues.filter(i => i.status !== "resolved").length,
      pct: allIssues.length > 0 ? Math.round((deptIssues.length / allIssues.length) * 100) : 0,
    };
  });

  const recent = [...allIssues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">CitiStat · June 2026</p>
        <h1 className="text-2xl font-bold text-slate-900">Resident Intelligence</h1>
        <p className="text-sm text-slate-500 mt-1">Consolidated view of resident concerns and service demand</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Issues", value: allIssues.length, icon: Activity, color: "#1d4ed8", bg: "#eff6ff" },
          { label: "Open / Active", value: totalOpen, icon: AlertCircle, color: "#ca8a04", bg: "#fefce8" },
          { label: "Resolved", value: totalResolved, icon: CheckCircle2, color: "#16a34a", bg: "#f0fdf4" },
          { label: "Resolution Rate", value: `${resolutionRate}%`, icon: TrendingUp, color: "#7c3aed", bg: "#f5f3ff" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">{label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* By Department */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Service Demand by Department</h2>
          <div className="space-y-3">
            {byDept.map((dept) => (
              <Link key={dept.id} href={`/departments/${dept.id}`}>
                <div className="bg-white rounded-lg border p-4 hover:border-blue-200 transition-colors group" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-sm font-semibold text-slate-800">{dept.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{dept.total} total</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${dept.pct}%`, backgroundColor: "#1d4ed8" }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">{dept.open} open issue{dept.open !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-slate-400">{dept.pct}% of total</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent issues */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Recent Issues</h2>
          {recent.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: "var(--border)" }}>
              <p className="text-sm text-slate-400">No issues recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((issue) => {
                const s = statusStyle[issue.status] ?? statusStyle.open;
                return (
                  <Link key={issue.id} href={`/issues/${issue.id}`}>
                    <div className="bg-white rounded-lg border p-3 flex items-center gap-3 hover:border-blue-200 transition-colors" style={{ borderColor: "var(--border)" }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{issue.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {deptNames[issue.departmentId] ?? issue.departmentId} · {new Date(issue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span
                        className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: s.bg, color: s.text }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                        {s.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
              <Link href="/issues" className="block text-center text-xs text-blue-600 hover:underline pt-1">
                View all issues →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
