import { notFound } from "next/navigation";
import { getReview, getReviewIssues } from "@/server/performance-reviews";
import { getIssue } from "@/server/issues";
import { completeReview } from "@/server/actions-mutations";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const deptNames: Record<string, string> = {
  "public-works": "Public Works",
  "resident-response": "Resident Response Center",
  "engineering-permitting": "Engineering & Permitting",
};

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  open:          { bg: "#eff6ff", text: "#1d4ed8", dot: "#1d4ed8", label: "Open" },
  "in-progress": { bg: "#fefce8", text: "#a16207", dot: "#ca8a04", label: "In Progress" },
  resolved:      { bg: "#f0fdf4", text: "#15803d", dot: "#16a34a", label: "Resolved" },
  escalated:     { bg: "#fef2f2", text: "#b91c1c", dot: "#dc2626", label: "Escalated" },
};

export default async function ReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await getReview(id);
  if (!review) notFound();

  const reviewIssueLinks = await getReviewIssues(id);
  const issuesData = await Promise.all(reviewIssueLinks.map((ri) => getIssue(ri.issueId)));

  const isCompleted = review.status === "completed";
  const isMonthly = review.type === "monthly";

  async function handleComplete(formData: FormData) {
    "use server";
    const summary = formData.get("summary") as string;
    await completeReview(id, summary);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/reviews" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600">
        <ArrowLeft className="h-3.5 w-3.5" /> Reviews
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
                style={{ backgroundColor: isMonthly ? "#eff6ff" : "#f0fdf4", color: isMonthly ? "#1d4ed8" : "#15803d" }}
              >
                {review.type} review
              </span>
              <span
                className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: isCompleted ? "#f0fdf4" : "#fefce8", color: isCompleted ? "#15803d" : "#a16207" }}
              >
                {isCompleted ? "Completed" : "Scheduled"}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {review.departmentId ? deptNames[review.departmentId] : "Executive — All Departments"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {new Date(review.reviewDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          {isCompleted
            ? <CheckCircle2 className="h-8 w-8 text-green-400 shrink-0" />
            : <Clock className="h-8 w-8 text-yellow-400 shrink-0" />
          }
        </div>

        {review.attendees && (
          <div className="flex items-start gap-2 mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
            <Users className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <p className="text-sm text-slate-600">{review.attendees}</p>
          </div>
        )}
      </div>

      {/* Summary */}
      {isCompleted && review.summary && (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-slate-400" />
            <h2 className="font-semibold text-slate-900">Summary & Decisions</h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{review.summary}</p>
        </div>
      )}

      {/* Issues reviewed */}
      {issuesData.filter(Boolean).length > 0 && (
        <div className="bg-white rounded-xl border" style={{ borderColor: "var(--border)" }}>
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="font-semibold text-slate-900">Issues Reviewed ({issuesData.filter(Boolean).length})</h2>
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {reviewIssueLinks.map((ri, i) => {
              const issue = issuesData[i];
              if (!issue) return null;
              const s = statusConfig[issue.status] ?? statusConfig.open;
              return (
                <li key={ri.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link href={`/issues/${issue.id}`} className="text-sm font-medium text-slate-800 hover:underline">
                        {issue.title}
                      </Link>
                      {ri.notes && <p className="text-xs text-slate-500 mt-1 italic">{ri.notes}</p>}
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                      {s.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Complete review form */}
      {!isCompleted && (
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-semibold text-slate-900 mb-4">Complete this Review</h2>
          <form action={handleComplete} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="summary">Summary & Decisions</Label>
              <Textarea
                id="summary"
                name="summary"
                placeholder="What was discussed? What decisions were made? What actions were assigned?"
                rows={5}
                required
              />
            </div>
            <Button type="submit">Mark as Completed</Button>
          </form>
        </div>
      )}
    </div>
  );
}
