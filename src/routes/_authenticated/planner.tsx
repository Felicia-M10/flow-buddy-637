import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generatePlan, type PlanResult } from "@/lib/ai.functions";
import { useSyncAll, useTasks, PRIORITY_META, type Priority } from "@/lib/workspace";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/planner")({
  validateSearch: (search: Record<string, unknown>) => ({
    scope: search["scope"] === "week" ? ("week" as const) : ("day" as const),
  }),
  head: () => ({
    meta: [
      { title: "AI Planner — TaskFlow AI" },
      { name: "description", content: "Let AI turn your real tasks into a realistic, humane day or week schedule." },
      { property: "og:title", content: "AI Planner — TaskFlow AI" },
      { property: "og:description", content: "Smart scheduling that respects priorities, deadlines and breaks." },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { scope: initialScope } = Route.useSearch();
  const [scope, setScope] = useState<"day" | "week">(initialScope);
  const [instructions, setInstructions] = useState("");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const run = useServerFn(generatePlan);
  const { data: tasks = [] } = useTasks();
  const sync = useSyncAll();

  const generate = async () => {
    setLoading(true);
    try {
      const result = await run({ data: { instructions, scope } });
      setPlan(result);
      if (!result.blocks.length) toast.message("The planner returned no blocks — add some open tasks first.");
    } catch (e) {
      toast.error((e as Error).message || "Could not generate a plan");
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    if (!plan) return;
    setApplying(true);
    try {
      const updates = plan.blocks.filter((b) => b.taskId && tasks.some((t) => t.id === b.taskId));
      for (const b of updates) {
        await supabase
          .from("tasks")
          .update({
            scheduled_start: new Date(b.start).toISOString(),
            scheduled_end: new Date(b.end).toISOString(),
            ai_reason: b.reason ?? null,
          } as never)
          .eq("id", b.taskId as string);
      }
      sync();
      toast.success(`Applied ${updates.length} scheduled blocks to your tasks`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setApplying(false);
    }
  };

  const time = (v: string) => {
    const d = new Date(v);
    return isNaN(d.getTime()) ? v : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <PageHeader
        title="AI Planner"
        subtitle="Generates a schedule from your actual tasks, deadlines and working hours."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-surface h-fit p-6 lg:col-span-1">
          <div className="mb-4 flex gap-2">
            {(["day", "week"] as const).map((s) => (
              <Button
                key={s}
                variant={scope === s ? "default" : "outline"}
                size="sm"
                onClick={() => setScope(s)}
              >
                {s === "day" ? "Plan my day" : "Plan my week"}
              </Button>
            ))}
          </div>
          <Textarea
            rows={5}
            placeholder="Optional guidance — e.g. deep work in the morning, no meetings after 4pm…"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <Button className="mt-4 w-full" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
            Generate schedule
          </Button>
          {plan && plan.blocks.length > 0 && (
            <Button variant="outline" className="mt-2 w-full" onClick={apply} disabled={applying}>
              <CalendarCheck className="mr-2 size-4" /> Apply to my tasks
            </Button>
          )}
        </div>

        <div className="lg:col-span-2">
          {!plan && (
            <div className="card-surface p-10 text-center text-sm text-muted-foreground">
              Your generated schedule will appear here.
            </div>
          )}
          {plan && (
            <div className="grid gap-4">
              {plan.notes && (
                <div className={`card-surface p-5 text-sm ${plan.overloaded ? "border-destructive/40" : ""}`}>
                  <p className="font-medium">{plan.overloaded ? "Your plan looks overloaded" : "Planner notes"}</p>
                  <p className="mt-1 text-muted-foreground">{plan.notes}</p>
                </div>
              )}
              <div className="card-surface divide-y divide-border">
                {plan.blocks.map((b, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <div className="w-28 shrink-0 text-sm text-muted-foreground">
                      {time(b.start)} – {time(b.end)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{b.title}</p>
                      {b.reason && <p className="mt-0.5 text-xs text-muted-foreground">{b.reason}</p>}
                    </div>
                    <span
                      className={`h-fit rounded-full px-2 py-0.5 text-xs ${
                        b.type === "break"
                          ? "bg-muted text-muted-foreground"
                          : PRIORITY_META[(b.priority as Priority) in PRIORITY_META ? (b.priority as Priority) : "medium"].badge
                      }`}
                    >
                      {b.type === "break" ? "Break" : b.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
