import { redirect } from "next/navigation";
import { createReview } from "@/server/actions-mutations";
import { getIssues } from "@/server/issues";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  { id: "public-works", name: "Public Works" },
  { id: "resident-response", name: "Resident Response Center" },
  { id: "engineering-permitting", name: "Engineering & Permitting" },
];

export default async function NewReviewPage() {
  const openIssues = (await getIssues()).filter((i) => i.status !== "resolved");

  async function handleCreate(formData: FormData) {
    "use server";
    const issueIds = formData.getAll("issueId").join(",");
    formData.set("issueIds", issueIds);
    const id = await createReview(formData);
    redirect(`/reviews/${id}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/reviews" className="text-xs text-slate-400 hover:text-slate-600 mb-2 block">← Reviews</Link>
        <h1 className="text-2xl font-bold text-slate-900">Schedule Performance Review</h1>
        <p className="text-sm text-slate-500 mt-1">Create a weekly department review or monthly executive review</p>
      </div>

      <form action={handleCreate} className="space-y-6 bg-white rounded-xl border p-6" style={{ borderColor: "var(--border)" }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="type">Review Type</Label>
            <select name="type" required className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm">
              <option value="weekly">Weekly Department Review</option>
              <option value="monthly">Monthly Executive Review</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reviewDate">Date</Label>
            <Input id="reviewDate" name="reviewDate" type="date" defaultValue={today} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="departmentId">Department <span className="text-slate-400">(leave blank for executive review)</span></Label>
          <select name="departmentId" className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm">
            <option value="">All Departments — Executive</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="attendees">Attendees</Label>
          <Input id="attendees" name="attendees" placeholder="e.g. Director Smith, Deputy Director Jones, Analyst Park" />
        </div>

        {openIssues.length > 0 && (
          <div className="space-y-2">
            <Label>Issues to Review <span className="text-slate-400">(optional)</span></Label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto border rounded-lg p-3" style={{ borderColor: "var(--border)" }}>
              {openIssues.map((issue) => (
                <label key={issue.id} className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" name="issueId" value={issue.id} className="mt-0.5" />
                  <span className="text-sm text-slate-700">{issue.title}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-400">Selected issues will be linked to this review for discussion tracking.</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit">Schedule Review</Button>
          <Link href="/reviews" className={cn(buttonVariants({ variant: "outline" }))}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
