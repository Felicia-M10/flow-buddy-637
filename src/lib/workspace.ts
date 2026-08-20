import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Priority = "low" | "medium" | "high" | "urgent";
export type Status = "todo" | "in_progress" | "done";

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: Priority;
  status: Status;
  due_date: string | null;
  due_time: string | null;
  duration_minutes: number;
  scheduled_start: string | null;
  scheduled_end: string | null;
  tags: string[];
  recurrence: string;
  ai_reason: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRow = {
  id: string;
  title: string;
  kind: string;
  starts_at: string;
  ends_at: string;
  notes: string | null;
};

export type ResearchRow = {
  id: string;
  topic: string;
  summary: string | null;
  key_points: string[];
  insights: string[];
  recommendations: string[];
  questions: string[];
  created_at: string;
};

export type NotificationRow = {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  read: boolean;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  theme: string;
  work_start: string;
  work_end: string;
  notifications_enabled: boolean;
};

const table = (name: string) => supabase.from(name as never);

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await table("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Task[];
    },
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await table("events").select("*").order("starts_at");
      if (error) throw error;
      return (data ?? []) as unknown as EventRow[];
    },
  });
}

export function useResearch() {
  return useQuery({
    queryKey: ["research"],
    queryFn: async () => {
      const { data, error } = await table("research").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as ResearchRow[];
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await table("categories").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; name: string; color: string }[];
    },
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await table("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as NotificationRow[];
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await table("profiles").select("*").maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Profile | null;
    },
  });
}

export function useChatHistory() {
  return useQuery({
    queryKey: ["chat"],
    queryFn: async () => {
      const { data, error } = await table("chat_messages").select("*").order("created_at").limit(200);
      if (error) throw error;
      return (data ?? []) as unknown as { id: string; role: string; content: string; created_at: string }[];
    },
  });
}

/** Invalidate everything that derives from tasks so all pages stay in sync. */
export function useSyncAll() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["events"] });
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
}

async function notify(title: string, body: string, kind = "info") {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await table("notifications").insert({ user_id: data.user.id, title, body, kind } as never);
}

export function useCreateTask() {
  const sync = useSyncAll();
  return useMutation({
    mutationFn: async (input: Partial<Task>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { data, error } = await table("tasks")
        .insert({ ...input, user_id: auth.user.id } as never)
        .select()
        .single();
      if (error) throw error;
      await notify("Task created", `“${input.title}” was added to your workspace.`, "task");
      return data as unknown as Task;
    },
    onSuccess: sync,
  });
}

export function useUpdateTask() {
  const sync = useSyncAll();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<Task> & { id: string }) => {
      const { data, error } = await table("tasks").update(patch as never).eq("id", id).select().single();
      if (error) throw error;
      return data as unknown as Task;
    },
    onSuccess: sync,
  });
}

export function useToggleTask() {
  const sync = useSyncAll();
  return useMutation({
    mutationFn: async (task: Task) => {
      const done = task.status !== "done";
      const { error } = await table("tasks")
        .update({ status: done ? "done" : "todo", completed_at: done ? new Date().toISOString() : null } as never)
        .eq("id", task.id);
      if (error) throw error;
      if (done) await notify("Task completed", `Nice work finishing “${task.title}”.`, "milestone");
      return done;
    },
    onSuccess: sync,
  });
}

export function useDeleteTask() {
  const sync = useSyncAll();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await table("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: sync,
  });
}

export function useSaveResearch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: Omit<ResearchRow, "id" | "created_at">) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await table("research").insert({ ...r, user_id: auth.user.id } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["research"] }),
  });
}

export function useUpsertProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<Profile>) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await table("profiles")
        .upsert({ id: auth.user.id, ...patch } as never)
        .eq("id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await table("categories").insert({ user_id: auth.user.id, name } as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await table("notifications").update({ read: true } as never).eq("read", false);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

/* ---------- derived helpers ---------- */

export const PRIORITY_META: Record<Priority, { label: string; dot: string; badge: string }> = {
  urgent: { label: "Urgent", dot: "bg-destructive", badge: "bg-destructive/10 text-destructive" },
  high: { label: "High", dot: "bg-warning", badge: "bg-warning/15 text-warning-foreground dark:text-warning" },
  medium: { label: "Medium", dot: "bg-primary", badge: "bg-primary/10 text-primary" },
  low: { label: "Low", dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground" },
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function isToday(task: Task) {
  const t = todayISO();
  if (task.due_date === t) return true;
  return Boolean(task.scheduled_start && task.scheduled_start.slice(0, 10) === t);
}

export function taskStats(tasks: Task[]) {
  const done = tasks.filter((t) => t.status === "done");
  const today = todayISO();
  const overdue = tasks.filter((t) => t.status !== "done" && t.due_date && t.due_date < today);
  const dueToday = tasks.filter((t) => t.status !== "done" && isToday(t));
  const rate = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
  return {
    total: tasks.length,
    completed: done.length,
    remaining: tasks.length - done.length,
    dueToday: dueToday.length,
    overdue: overdue.length,
    productivity: rate,
    highPriorityCompleted: done.filter((t) => t.priority === "high" || t.priority === "urgent").length,
  };
}
