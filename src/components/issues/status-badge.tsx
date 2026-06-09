import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type IssueStatus = "open" | "in-progress" | "resolved" | "escalated";
type ActionStatus = "not-started" | "in-progress" | "complete";
type MetricStatus = "on-target" | "at-risk" | "off-target";

const issueColors: Record<IssueStatus, string> = {
  "open": "bg-blue-100 text-blue-800",
  "in-progress": "bg-yellow-100 text-yellow-800",
  "resolved": "bg-green-100 text-green-800",
  "escalated": "bg-red-100 text-red-800",
};

const actionColors: Record<ActionStatus, string> = {
  "not-started": "bg-gray-100 text-gray-700",
  "in-progress": "bg-yellow-100 text-yellow-800",
  "complete": "bg-green-100 text-green-800",
};

const metricColors: Record<MetricStatus, string> = {
  "on-target": "bg-green-100 text-green-800",
  "at-risk": "bg-yellow-100 text-yellow-800",
  "off-target": "bg-red-100 text-red-800",
};

export function IssueStatusBadge({ status }: { status: IssueStatus }) {
  return (
    <Badge className={cn("capitalize", issueColors[status])}>
      {status.replace("-", " ")}
    </Badge>
  );
}

export function ActionStatusBadge({ status }: { status: ActionStatus }) {
  return (
    <Badge className={cn("capitalize", actionColors[status])}>
      {status.replace("-", " ")}
    </Badge>
  );
}

export function MetricStatusBadge({ status }: { status: MetricStatus }) {
  return (
    <Badge className={cn("capitalize", metricColors[status])}>
      {status.replace("-", " ")}
    </Badge>
  );
}
