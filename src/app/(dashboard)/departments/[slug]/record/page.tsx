import { notFound, redirect } from "next/navigation";
import { getMetrics } from "@/server/metrics";
import { recordMetricReading } from "@/server/actions-mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEPT_NAMES: Record<string, string> = {
  "public-works": "Public Works",
  "resident-response": "Resident Response Center",
  "engineering-permitting": "Engineering & Permitting",
};

export default async function RecordMetricPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!DEPT_NAMES[slug]) notFound();

  const deptMetrics = await getMetrics(slug);

  const today = new Date().toISOString().split("T")[0];

  async function handleRecord(formData: FormData) {
    "use server";
    await recordMetricReading(formData);
    redirect(`/departments/${slug}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/departments/${slug}`} className="text-xs text-slate-400 hover:text-slate-600 mb-2 block">
          ← {DEPT_NAMES[slug]}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Record Metric Reading</h1>
        <p className="text-sm text-slate-500 mt-1">Enter current performance data for {DEPT_NAMES[slug]}</p>
      </div>

      <div className="space-y-6">
        {deptMetrics.map((metric) => (
          <form key={metric.id} action={handleRecord} className="bg-white rounded-xl border p-6 space-y-4" style={{ borderColor: "var(--border)" }}>
            <input type="hidden" name="metricId" value={metric.id} />
            <input type="hidden" name="departmentId" value={slug} />
            <input type="hidden" name="target" value={metric.target ?? ""} />
            <input type="hidden" name="unit" value={metric.unit ?? ""} />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{metric.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current: {metric.value ?? "—"}{metric.unit ? ` ${metric.unit}` : ""} · Target: {metric.target ?? "—"}{metric.unit ? ` ${metric.unit}` : ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor={`value-${metric.id}`}>
                  New Value {metric.unit && <span className="text-slate-400">({metric.unit})</span>}
                </Label>
                <Input
                  id={`value-${metric.id}`}
                  name="value"
                  type="number"
                  step="0.1"
                  placeholder={metric.value ?? ""}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`period-${metric.id}`}>Period</Label>
                <Input
                  id={`period-${metric.id}`}
                  name="period"
                  defaultValue={today.slice(0, 7)}
                  placeholder="2026-06"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`notes-${metric.id}`}>Notes <span className="text-slate-400">(optional)</span></Label>
              <Textarea
                id={`notes-${metric.id}`}
                name="notes"
                placeholder="Any context for this reading..."
                rows={2}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="sm">Save Reading</Button>
            </div>
          </form>
        ))}

        <Link href={`/departments/${slug}`} className={cn(buttonVariants({ variant: "outline" }))}>
          Cancel
        </Link>
      </div>
    </div>
  );
}
