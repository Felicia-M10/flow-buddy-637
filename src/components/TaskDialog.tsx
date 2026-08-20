import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  useCategories,
  useCreateTask,
  useUpdateTask,
  type Task,
  type Priority,
} from "@/lib/workspace";

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  task?: Task | null;
  defaults?: Partial<Task>;
};

const empty = {
  title: "",
  description: "",
  category: "Work",
  priority: "medium" as Priority,
  due_date: "",
  due_time: "",
  duration_minutes: 60,
  tags: "",
  recurrence: "none",
};

export function TaskDialog({ open, onOpenChange, task, defaults }: Props) {
  const { data: categories = [] } = useCategories();
  const create = useCreateTask();
  const update = useUpdateTask();
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...empty,
      ...(defaults
        ? {
            ...defaults,
            tags: (defaults.tags ?? []).join(", "),
            due_date: defaults.due_date ?? "",
          }
        : {}),
      ...(task
        ? {
            title: task.title,
            description: task.description ?? "",
            category: task.category,
            priority: task.priority,
            due_date: task.due_date ?? "",
            due_time: task.due_time ?? "",
            duration_minutes: task.duration_minutes,
            tags: task.tags.join(", "),
            recurrence: task.recurrence,
          }
        : {}),
    } as typeof empty);
  }, [open, task, defaults]);

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error("Give your task a title");
      return;
    }
    const payload: Partial<Task> = {
      title: form.title.trim(),
      description: form.description || null,
      category: form.category,
      priority: form.priority,
      due_date: form.due_date || null,
      due_time: form.due_time || null,
      duration_minutes: Number(form.duration_minutes) || 60,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      recurrence: form.recurrence,
    };
    try {
      if (task) await update.mutateAsync({ id: task.id, ...payload });
      else await create.mutateAsync(payload);
      toast.success(task ? "Task updated" : "Task created");
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(categories.length ? categories.map((c) => c.name) : ["Work", "Personal", "Study", "Other"]).map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["low", "medium", "high", "urgent"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p[0].toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Deadline</Label>
              <Input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={form.due_time}
                onChange={(e) => setForm({ ...form, due_time: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                min={5}
                step={5}
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Repeats</Label>
              <Select value={form.recurrence} onValueChange={(v) => setForm({ ...form, recurrence: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["none", "daily", "weekly", "monthly"].map((r) => (
                    <SelectItem key={r} value={r}>
                      {r === "none" ? "Does not repeat" : r[0].toUpperCase() + r.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={create.isPending || update.isPending}>
            {task ? "Save changes" : "Create task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
