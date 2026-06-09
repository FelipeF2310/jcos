import Link from "next/link";
import { getActions } from "@/server/actions";
import { ActionStatusBadge } from "@/components/issues/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateActionStatus, createAction } from "@/server/actions-mutations";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default async function ActionsPage({ searchParams }: { searchParams: Promise<{ issueId?: string }> }) {
  const { issueId } = await searchParams;
  const allActions = await getActions(issueId);

  if (issueId) {
    async function handleCreate(formData: FormData) {
      "use server";
      await createAction(formData);
      redirect(`/issues/${formData.get("issueId")}`);
    }

    return (
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add Action</h1>
          <p className="text-muted-foreground text-sm mt-1">Create a corrective action for this issue</p>
        </div>

        <form action={handleCreate} className="space-y-6">
          <input type="hidden" name="issueId" value={issueId} />
          <input type="hidden" name="ownerId" value="unassigned" />

          <div className="space-y-2">
            <Label htmlFor="description">Action Description</Label>
            <Textarea id="description" name="description" placeholder="What specific action will be taken?" rows={3} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>

          <div className="flex gap-3">
            <Button type="submit">Create Action</Button>
            <Link href={`/issues/${issueId}`} className={cn(buttonVariants({ variant: "outline" }))}>Cancel</Link>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Actions</h1>
        <p className="text-muted-foreground text-sm mt-1">All corrective actions across issues</p>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allActions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  No actions yet. Actions are created from individual issues.
                </TableCell>
              </TableRow>
            )}
            {allActions.map((action) => {
              const nextStatus = action.status === "not-started" ? "in-progress" : "complete";
              const btnLabel = action.status === "not-started" ? "Start" : action.status === "in-progress" ? "Complete" : "Done";

              async function advance() {
                "use server";
                await updateActionStatus(action.id, nextStatus);
              }

              return (
                <TableRow key={action.id}>
                  <TableCell className="font-medium">{action.description}</TableCell>
                  <TableCell>
                    <Link href={`/issues/${action.issueId}`} className="text-sm text-blue-600 hover:underline">
                      View issue
                    </Link>
                  </TableCell>
                  <TableCell><ActionStatusBadge status={action.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    <form action={advance}>
                      <Button size="sm" variant="outline" disabled={action.status === "complete"}>
                        {btnLabel}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
