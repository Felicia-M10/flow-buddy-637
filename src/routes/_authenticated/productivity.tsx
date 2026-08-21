import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";
import { taskStats, useTasks } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/productivity")({
  head: () => ({
    meta: [
      { title: "Productivity — TaskFlow AI" },
      { name: "description", content: "Completion rates, streaks and category breakdowns from your real tasks." },
      { property: "og:title", content: "Productivity — TaskFlow AI" },
      { property: "og:description", content: "See where your focus actually goes each week." },
    ],
  }),
  component: ProductivityPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function ProductivityPage() {
  const { data: tasks = [] } = useTasks();
  const stats = taskStats(tasks);

  const weekly = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return {
        day: d.toLocaleDateString([], { weekday: "short" }),
        completed: tasks.filter((t) => t.completed_at?.slice(0, 10) === key).length,
        created: tasks.filter((t) => t.created_at.slice(0, 10) === key).length,
      };
    });
  }, [tasks]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + 1));
    return [...map].map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const streak = useMemo(() => {
    let count = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const any = tasks.some((t) => t.completed_at?.slice(0, 10) === key);
      if (any) count++;
      else if (i > 0) break;
    }
    return count;
  }, [tasks]);

  return (
    <>
      <PageHeader title="Productivity" subtitle="Insights generated from your real task history." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Completion rate", value: `${stats.productivity}%` },
          { label: "Tasks completed", value: stats.completed },
          { label: "Current streak", value: `${streak} day${streak === 1 ? "" : "s"}` },
          { label: "High priority done", value: stats.highPriorityCompleted },
        ].map((s) => (
          <div key={s.label} className="card-surface p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="text-base font-semibold">Tasks completed this week</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Bar dataKey="completed" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-base font-semibold">Tasks by category</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Created vs completed</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} />
                <Line type="monotone" dataKey="created" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completed" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Overall progress</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats.completed} of {stats.total} tasks complete · {stats.overdue} overdue
          </p>
          <Progress value={stats.productivity} className="mt-4" />
        </div>
      </div>
    </>
  );
}
