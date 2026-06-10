import { notFound } from "next/navigation";
import { getIssue } from "@/server/issues";
import { getActions } from "@/server/actions";
import { getComments } from "@/server/issue-comments";
import { updateIssueStatus, addComment } from "@/server/actions-mutations";
import Link from "next/link";
import { ArrowLeft, Plus, CheckCircle2, Clock, AlertTriangle, Circle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  open:          { label: "Open",        bg: "#eff6ff", text: "#1d4ed8", dot: "#1d4ed8" },
  "in-progress": { label: "In Progress", bg: "#fefce8", text: "#a16207", dot: "#ca8a04" },
  resolved:      { label: "Resolved",    bg: "#f0fdf4", text: "#15803d", dot: "#16a34a" },
  escalated:     { label: "Escalated",   bg: "#fef2f2", text: "#b91c1c", dot: "#dc2626" },
};
const actionStatusConfig: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  "not-started": { label: "Not Started", icon: Circle,       color: "#94a3b8" },
  "in-progress": { label: "In Progress", icon: Clock,        color: "#ca8a04" },
  "complete":    { label: "Complete",    icon: CheckCircle2, color: "#16a34a" },
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

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [issue, issueActions, comments] = await Promise.all([getIssue(id), getActions(id), getComments(id)]);
  if (!issue) notFound();

  const isResolved = issue.status === "resolved";
  const s = statusConfig[issue.status] ?? statusConfig.open;
  const p = priorityStyle[issue.priority] ?? priorityStyle.medium;
  const completedActions = issueActions.filter((a) => a.status === "complete").length;

  async function advance() {
    "use server";
    const next = issue!.status === "open" ? "in-progress" : "resolved";
    await updateIssueStatus(id, next);
  }
  async function escalate() {
    "use server";
    await updateIssueStatus(id, "escalated");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/issues" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Issues
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: issue.status === "escalated" ? "#fca5a5" : "var(--border)" }}>
        {issue.status === "escalated" && <div className="h-1 bg-red-500" />}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                  {s.label}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: p.bg, color: p.text }}>
                  {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)} Priority
                </span>
                <span className="text-xs text-slate-400">{deptNames[issue.departmentId] ?? issue.departmentId}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-400">Opened {new Date(issue.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{issue.title}</h1>
              {issue.description && <p className="text-sm text-slate-600 mt-3 leading-relaxed">{issue.description}</p>}
            </div>
            {!isResolved && (
              <div className="flex flex-col gap-2 shrink-0">
                <form action={advance}>
                  <button type="submit" className="w-full px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: "#1d4ed8" }}>
                    {issue.status === "open" ? "Mark In Progress" : "Mark Resolved"}
                  </button>
                </form>
                {issue.status !== "escalated" && (
                  <form action={escalate}>
                    <button type="submit" className="w-full px-4 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                      <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />Escalate
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="font-semibold text-slate-900">Corrective Actions</h2>
            <p className="text-xs text-slate-400 mt-0.5">{completedActions} of {issueActions.length} complete</p>
          </div>
          <Link href={`/actions?issueId=${id}`} className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add Action
          </Link>
        </div>
        {issueActions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-400">No actions yet. Add one to start tracking progress.</p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {issueActions.map((action) => {
              const as = actionStatusConfig[action.status] ?? actionStatusConfig["not-started"];
              const Icon = as.icon;
              return (
                <li key={action.id} className="flex items-start gap-4 px-6 py-4">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: as.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{action.description}</p>
                    {action.dueDate && (
                      <p className="text-xs text-slate-400 mt-1">Due {new Date(action.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    )}
                  </div>
                  <span className="text-xs font-medium shrink-0" style={{ color: as.color }}>{as.label}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Comments / activity */}
      <div className="bg-white rounded-xl border" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <MessageSquare className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900">Activity</h2>
          <span className="text-xs text-slate-400 ml-1">({comments.length})</span>
        </div>

        {comments.length > 0 && (
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {comments.map((comment) => (
              <li key={comment.id} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                    {comment.authorName.charAt(0)}
                  </div>
                  <span className="text-sm font-semibold text-slate-800">{comment.authorName}</span>
                  <span className="text-xs text-slate-400">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at{" "}
                    {new Date(comment.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed pl-9">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}

        {/* Add comment form */}
        <div className="px-6 py-4 border-t bg-slate-50" style={{ borderColor: "var(--border)" }}>
          <form action={async (formData: FormData) => {
            "use server";
            await addComment(formData);
          }} className="space-y-3">
            <input type="hidden" name="issueId" value={id} />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="authorName" className="text-xs">Your name</Label>
                <Input id="authorName" name="authorName" placeholder="e.g. Director Smith" required className="h-8 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="body" className="text-xs">Comment</Label>
              <Textarea id="body" name="body" placeholder="Add an update, note, or decision..." rows={3} required />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm">Post Comment</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
