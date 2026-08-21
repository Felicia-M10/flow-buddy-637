import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { TaskDialog } from "@/components/TaskDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PRIORITY_META,
  useCategories,
  useDeleteTask,
  useTasks,
  useToggleTask,
  type Task,
} from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/tasks")({
  validateSearch: (search: Record<string, unknown>) => ({ q: (search["q"] as string) ?? "" }),
  head: () => ({
    meta: [
      { title: "My Tasks — TaskFlow AI" },
      { name: "description", content: "Create, filter and complete tasks with priorities, deadlines and tags." },
      { property: "og:title", content: "My Tasks — TaskFlow AI" },
      { property: "og:description", content: "One shared task list powering your planner, calendar and assistant." },
    ],
  }),
  component: TasksPage,
});

const ORDER = { urgent: 0, high: 1, medium: 2, low: 3 } as const;

function TasksPage() {
  const { q } = Route.useSearch();
  const { data: tasks = [] } = useTasks();
  const { data: categories = [] } = useCategories();
  const toggle = useToggleTask();
  const remove = useDeleteTask();

  const [query, setQuery] = useState(q);
  const [category, setCategory] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("priority");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    const list = tasks.filter((t) => {
      if (query && !`${t.title} ${t.description ?? ""} ${t.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
        return false;
      if (category !== "all" && t.category !== category) return false;
      if (priority !== "all" && t.priority !== priority) return false;
      if (status !== "all" && t.status !== status) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "priority") return ORDER[a.priority] - ORDER[b.priority];
      if (sort === "deadline") return (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
      return b.created_at.localeCompare(a.created_at);
    });
  }, [tasks, query, category, priority, status, sort]);

  return (
    <>
      <PageHeader
        title="My Tasks"
        subtitle="Everything in one list — the AI planner and calendar read from here."
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" /> New task
          </Button>
        }
      />

      <div className="card-surface mb-4 grid gap-3 p-4 md:grid-cols-5">
        <Input placeholder="Search tasks…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {["urgent", "high", "medium", "low"].map((p) => (
              <SelectItem key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Sort: priority</SelectItem>
            <SelectItem value="deadline">Sort: deadline</SelectItem>
            <SelectItem value="created">Sort: newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card-surface divide-y divide-border">
        {filtered.length === 0 && (
          <p className="p-10 text-center text-sm text-muted-foreground">No tasks match these filters yet.</p>
        )}
        {filtered.map((t) => (
          <div key={t.id} className="flex items-start gap-3 p-4">
            <Checkbox checked={t.status === "done"} onCheckedChange={() => toggle.mutate(t)} className="mt-1" />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${t.status === "done" ? "text-muted-foreground line-through" : ""}`}>
                {t.title}
              </p>
              {t.description && <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>}
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className={`rounded-full px-2 py-0.5 ${PRIORITY_META[t.priority].badge}`}>
                  {PRIORITY_META[t.priority].label}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5">{t.category}</span>
                {t.due_date && <span>Due {t.due_date}{t.due_time ? ` ${t.due_time}` : ""}</span>}
                {t.tags.map((tag) => (
                  <span key={tag} className="text-primary">#{tag}</span>
                ))}
              </div>
              {t.ai_reason && <p className="mt-1.5 text-xs italic text-primary">AI: {t.ai_reason}</p>}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditing(t);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  await remove.mutateAsync(t.id);
                  toast.success("Task deleted");
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <TaskDialog open={open} onOpenChange={setOpen} task={editing} />
    </>
  );
}
