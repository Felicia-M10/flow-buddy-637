import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useEvents, useTasks, PRIORITY_META, type Task } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — TaskFlow AI" },
      { name: "description", content: "See scheduled tasks and events together in a month or week view." },
      { property: "og:title", content: "Calendar — TaskFlow AI" },
      { property: "og:description", content: "Your AI-scheduled blocks and events in one timeline." },
    ],
  }),
  component: CalendarPage,
});

const iso = (d: Date) => d.toISOString().slice(0, 10);

function CalendarPage() {
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState<"month" | "week">("month");
  const { data: tasks = [] } = useTasks();
  const { data: events = [] } = useEvents();

  const days = useMemo(() => {
    if (view === "week") {
      const start = new Date(cursor);
      start.setDate(start.getDate() - start.getDay());
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor, view]);

  const tasksFor = (d: string) =>
    tasks.filter((t: Task) => t.due_date === d || t.scheduled_start?.slice(0, 10) === d);
  const eventsFor = (d: string) => events.filter((e) => e.starts_at.slice(0, 10) === d);

  const shift = (dir: number) => {
    const next = new Date(cursor);
    if (view === "week") next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setCursor(next);
  };

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="Scheduled tasks and events, synced with your planner."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => shift(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-40 text-center text-sm font-medium">
              {cursor.toLocaleDateString([], { month: "long", year: "numeric" })}
            </span>
            <Button variant="outline" size="icon" onClick={() => shift(1)}>
              <ChevronRight className="size-4" />
            </Button>
            <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>
              Month
            </Button>
            <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>
              Week
            </Button>
          </div>
        }
      />

      <div className="card-surface overflow-hidden p-2">
        <div className="grid grid-cols-7 border-b border-border pb-2 text-center text-xs font-medium text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const key = iso(d);
            const inMonth = view === "week" || d.getMonth() === cursor.getMonth();
            const today = key === iso(new Date());
            return (
              <div
                key={key}
                className={`min-h-28 border-b border-r border-border p-1.5 ${inMonth ? "" : "opacity-40"}`}
              >
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${
                    today ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                >
                  {d.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {eventsFor(key).map((e) => (
                    <p key={e.id} className="truncate rounded bg-muted px-1.5 py-0.5 text-[11px]">
                      {e.title}
                    </p>
                  ))}
                  {tasksFor(key).slice(0, 4).map((t) => (
                    <p
                      key={t.id}
                      className={`truncate rounded px-1.5 py-0.5 text-[11px] ${PRIORITY_META[t.priority].badge}`}
                    >
                      {t.title}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
