import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, CheckSquare, Clock, Plus, Sparkles, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { TaskDialog } from "@/components/TaskDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  PRIORITY_META,
  isToday,
  taskStats,
  useEvents,
  useProfile,
  useTasks,
  useToggleTask,
  type Task,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TaskFlow AI" },
      { name: "description", content: "Your day at a glance: today's tasks, upcoming events and progress." },
      { property: "og:title", content: "Dashboard — TaskFlow AI" },
      { property: "og:description", content: "Today's focus, upcoming events and live productivity stats." },
    ],
  }),
  component: Dashboard,
});

function Stat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Clock }) {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { data: tasks = [] } = useTasks();
  const { data: events = [] } = useEvents();
  const { data: profile } = useProfile();
  const toggle = useToggleTask();
  const [open, setOpen] = useState(false);

  const stats = taskStats(tasks);
  const today = tasks.filter((t) => t.status !== "done" && isToday(t));
  const upcoming = events
    .filter((e) => new Date(e.ends_at).getTime() >= Date.now())
    .slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader
        title={`${greeting}${profile?.display_name ? `, ${profile.display_name}` : ""}`}
        subtitle="Here's everything happening in your workspace today."
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/planner">
                <Sparkles className="mr-2 size-4" /> Plan my day
              </Link>
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 size-4" /> New task
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Due today" value={stats.dueToday} icon={Clock} />
        <Stat label="Completed" value={stats.completed} icon={CheckSquare} />
        <Stat label="Overdue" value={stats.overdue} icon={CalendarDays} />
        <Stat label="Productivity" value={`${stats.productivity}%`} icon={TrendingUp} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="card-surface p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Today's focus</h2>
            <Link to="/tasks" className="text-sm text-primary hover:underline">
              View all tasks
            </Link>
          </div>
          {today.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nothing scheduled for today. Ask the AI planner to build your day.
            </p>
          )}
          <ul className="divide-y divide-border">
            {today.map((t: Task) => (
              <li key={t.id} className="flex items-start gap-3 py-3">
                <Checkbox checked={t.status === "done"} onCheckedChange={() => toggle.mutate(t)} className="mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category}
                    {t.due_time ? ` · ${t.due_time}` : ""} · {t.duration_minutes} min
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${PRIORITY_META[t.priority].badge}`}>
                  {PRIORITY_META[t.priority].label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-4">
          <div className="card-surface p-6">
            <h2 className="text-base font-semibold">Progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {stats.completed} of {stats.total} tasks complete
            </p>
            <Progress value={stats.productivity} className="mt-4" />
          </div>
          <div className="card-surface p-6">
            <h2 className="text-base font-semibold">Upcoming</h2>
            {upcoming.length === 0 && <p className="mt-3 text-sm text-muted-foreground">No upcoming events.</p>}
            <ul className="mt-3 space-y-3">
              {upcoming.map((e) => (
                <li key={e.id} className="text-sm">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.starts_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <TaskDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
