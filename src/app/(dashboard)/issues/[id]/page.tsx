import { notFound } from "next/navigation";
import { getIssue } from "@/server/issues";
import { getActions } from "@/server/actions";
import { updateIssueStatus } from "@/server/actions-mutations";
import { IssueStatusBadge, ActionStatusBadge } from "@/components/issues/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [issue, issueActions] = await Promise.all([getIssue(id), getActions(id)]);

  if (!issue) notFound();

  const isResolved = issue.status === "resolved";

  async function advance() {
    "use server";
    const next = issue!.status === "open" ? "in-progress" : "resolved";
    await updateIssueStatus(id, next);
  }

  async function escalate() {
    "use server";
    await updateIssueStatus(id, "escalated");
  }

  const advanceLabel = issue.status === "open" ? "Mark In Progress" : "Mark Resolved";

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/issues" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          <ArrowLeft className="h-4 w-4 mr-1" />Issues
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          <div className="flex gap-2 shrink-0">
            {!isResolved && (
              <>
                <form action={advance}>
                  <Button size="sm">{advanceLabel}</Button>
                </form>
                {issue.status !== "escalated" && (
                  <form action={escalate}>
                    <Button size="sm" variant="destructive">Escalate</Button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <IssueStatusBadge status={issue.status} />
          <Badge className={priorityColors[issue.priority]}>{issue.priority} priority</Badge>
          <span className="text-sm text-muted-foreground">{issue.departmentId}</span>
          <span className="text-sm text-muted-foreground">
            Opened {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>

        {issue.description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{issue.description}</p>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Actions ({issueActions.length})</h2>
          <Link href={`/actions?issueId=${id}`} className={cn(buttonVariants({ size: "sm" }))}>
            <Plus className="h-4 w-4 mr-1" />Add Action
          </Link>
        </div>

        {issueActions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No actions yet. Add one to start tracking progress.</p>
        ) : (
          <div className="space-y-3">
            {issueActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">{action.description}</p>
                  {action.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Due {new Date(action.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <ActionStatusBadge status={action.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
