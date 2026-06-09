import { redirect } from "next/navigation";
import { createIssue } from "@/server/actions-mutations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  { id: "public-works", name: "Public Works" },
  { id: "resident-response", name: "Resident Response Center" },
  { id: "engineering-permitting", name: "Engineering & Permitting" },
];

export default function NewIssuePage() {
  async function handleCreate(formData: FormData) {
    "use server";
    await createIssue(formData);
    redirect("/issues");
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Issue</h1>
        <p className="text-muted-foreground text-sm mt-1">Document an operational issue for tracking and resolution</p>
      </div>

      <form action={handleCreate} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Brief description of the issue" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" placeholder="What is happening? What is the impact?" rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department</Label>
            <select name="departmentId" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select name="priority" required className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Create Issue</Button>
          <Link href="/issues" className={cn(buttonVariants({ variant: "outline" }))}>Cancel</Link>
        </div>
      </form>
    </div>
  );
}
