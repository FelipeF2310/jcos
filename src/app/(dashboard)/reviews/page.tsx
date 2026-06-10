import { getReviews } from "@/server/performance-reviews";
import Link from "next/link";
import { Plus, ArrowRight, Calendar, CheckCircle2, Clock } from "lucide-react";

const deptNames: Record<string, string> = {
  "public-works": "Public Works",
  "resident-response": "Resident Response Center",
  "engineering-permitting": "Engineering & Permitting",
};

export default async function ReviewsPage() {
  const reviews = await getReviews();

  const completed = reviews.filter((r) => r.status === "completed").length;
  const scheduled = reviews.filter((r) => r.status === "scheduled").length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Performance Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">
            {completed} completed · {scheduled} scheduled
          </p>
        </div>
        <Link
          href="/reviews/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Plus className="h-4 w-4" /> Schedule Review
        </Link>
      </div>

      <div className="space-y-2">
        {reviews.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center" style={{ borderColor: "var(--border)" }}>
            <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No reviews yet.</p>
          </div>
        )}
        {reviews.map((review) => {
          const isCompleted = review.status === "completed";
          const isMonthly = review.type === "monthly";
          return (
            <Link key={review.id} href={`/reviews/${review.id}`}>
              <div className="bg-white rounded-lg border p-4 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all" style={{ borderColor: "var(--border)" }}>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: isMonthly ? "#eff6ff" : "#f0fdf4" }}
                >
                  {isCompleted
                    ? <CheckCircle2 className="h-5 w-5" style={{ color: "#16a34a" }} />
                    : <Clock className="h-5 w-5" style={{ color: isMonthly ? "#1d4ed8" : "#16a34a" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-xs font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
                      style={{ backgroundColor: isMonthly ? "#eff6ff" : "#f0fdf4", color: isMonthly ? "#1d4ed8" : "#15803d" }}
                    >
                      {review.type}
                    </span>
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {review.departmentId ? deptNames[review.departmentId] : "Executive — All Departments"}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(review.reviewDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    {review.attendees && ` · ${review.attendees.split(",").length} attendees`}
                  </p>
                </div>
                <span
                  className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: isCompleted ? "#f0fdf4" : "#fefce8",
                    color: isCompleted ? "#15803d" : "#a16207",
                  }}
                >
                  {isCompleted ? "Completed" : "Scheduled"}
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
