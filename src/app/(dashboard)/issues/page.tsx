import Link from "next/link";
import { getIssues } from "@/server/issues";
import { IssueStatusBadge } from "@/components/issues/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default async function IssuesPage() {
  const allIssues = await getIssues();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Issues</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage operational issues across departments</p>
        </div>
        <Link href="/issues/new" className={buttonVariants()}>
          <Plus className="h-4 w-4 mr-2" />New Issue
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allIssues.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  No issues yet. <Link href="/issues/new" className="underline">Create the first one.</Link>
                </TableCell>
              </TableRow>
            )}
            {allIssues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell>
                  <Link href={`/issues/${issue.id}`} className="font-medium hover:underline">
                    {issue.title}
                  </Link>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{issue.departmentId}</TableCell>
                <TableCell>
                  <Badge className={priorityColors[issue.priority]}>{issue.priority}</Badge>
                </TableCell>
                <TableCell>
                  <IssueStatusBadge status={issue.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
