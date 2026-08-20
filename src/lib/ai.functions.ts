import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callAI, parseJson } from "./ai-core.server";

export type ScheduleBlock = {
  taskId: string | null;
  title: string;
  start: string;
  end: string;
  priority: string;
  type: "task" | "break" | "event";
  reason?: string;
};

export type PlanResult = {
  blocks: ScheduleBlock[];
  notes: string;
  overloaded: boolean;
};

type Ctx = { supabase: any; userId: string };

async function workspaceContext(context: Ctx) {
  const [tasks, events, research, profile] = await Promise.all([
    context.supabase
      .from("tasks")
      .select("id,title,description,category,priority,status,due_date,due_time,duration_minutes,scheduled_start,scheduled_end,tags,completed_at")
      .eq("user_id", context.userId)
      .order("due_date", { ascending: true })
      .limit(200),
    context.supabase
      .from("events")
      .select("id,title,kind,starts_at,ends_at")
      .eq("user_id", context.userId)
      .order("starts_at", { ascending: true })
      .limit(100),
    context.supabase
      .from("research")
      .select("topic,summary,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(15),
    context.supabase.from("profiles").select("display_name,work_start,work_end").eq("id", context.userId).maybeSingle(),
  ]);

  return {
    tasks: tasks.data ?? [],
    events: events.data ?? [],
    research: research.data ?? [],
    profile: profile.data ?? { display_name: null, work_start: "09:00", work_end: "17:00" },
  };
}

export const generatePlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { instructions?: string; scope?: "day" | "week"; date?: string }) => ({
    instructions: (data?.instructions ?? "").slice(0, 2000),
    scope: data?.scope === "week" ? ("week" as const) : ("day" as const),
    date: data?.date ?? new Date().toISOString().slice(0, 10),
  }))
  .handler(async ({ data, context }): Promise<PlanResult> => {
    const ws = await workspaceContext(context as Ctx);
    const open = ws.tasks.filter((t: any) => t.status !== "done");

    const raw = await callAI([
      {
        role: "system",
        content:
          "You are TaskFlow AI's planner. Build a realistic, humane schedule from the user's REAL tasks. " +
          "Respect priority (urgent > high > medium > low), deadlines, durations, existing calendar events and working hours. " +
          "Insert short breaks between long blocks. Never invent tasks that are not in the list, except breaks. " +
          'Reply with JSON ONLY: {"blocks":[{"taskId":string|null,"title":string,"start":"YYYY-MM-DDTHH:mm","end":"YYYY-MM-DDTHH:mm","priority":"urgent|high|medium|low|none","type":"task|break|event","reason":string}],"notes":string,"overloaded":boolean}. ' +
          "If there is more work than available time, set overloaded true and explain in notes which lower priority tasks should move.",
      },
      {
        role: "user",
        content: JSON.stringify({
          today: data.date,
          scope: data.scope,
          workingHours: { start: ws.profile.work_start, end: ws.profile.work_end },
          instructions: data.instructions,
          tasks: open,
          calendarEvents: ws.events,
        }),
      },
    ]);

    const parsed = parseJson<PlanResult>(raw, { blocks: [], notes: raw.slice(0, 500), overloaded: false });
    return {
      blocks: Array.isArray(parsed.blocks) ? parsed.blocks : [],
      notes: parsed.notes ?? "",
      overloaded: Boolean(parsed.overloaded),
    };
  });

export type ResearchResult = {
  topic: string;
  summary: string;
  key_points: string[];
  insights: string[];
  recommendations: string[];
  questions: string[];
};

export const runResearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { topic: string; context?: string }) => ({
    topic: String(data?.topic ?? "").slice(0, 500),
    context: String(data?.context ?? "").slice(0, 20000),
  }))
  .handler(async ({ data }): Promise<ResearchResult> => {
    const raw = await callAI([
      {
        role: "system",
        content:
          "You are TaskFlow AI's research assistant. Produce a rigorous, well-organised briefing. " +
          'Reply with JSON ONLY: {"summary":string,"key_points":string[],"insights":string[],"recommendations":string[],"questions":string[]}. ' +
          "5-8 key points, 3-5 insights, 3-5 recommendations, 3-5 further questions. Be concrete and avoid filler.",
      },
      {
        role: "user",
        content: `Topic / question: ${data.topic}\n\nPasted material (may be empty):\n${data.context}`,
      },
    ]);

    const parsed = parseJson<Omit<ResearchResult, "topic">>(raw, {
      summary: raw.slice(0, 2000),
      key_points: [],
      insights: [],
      recommendations: [],
      questions: [],
    });

    const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
    return {
      topic: data.topic,
      summary: String(parsed.summary ?? ""),
      key_points: arr(parsed.key_points),
      insights: arr(parsed.insights),
      recommendations: arr(parsed.recommendations),
      questions: arr(parsed.questions),
    };
  });

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { message: string }) => ({ message: String(data?.message ?? "").slice(0, 4000) }))
  .handler(async ({ data, context }) => {
    const ctx = context as Ctx;
    const ws = await workspaceContext(ctx);

    const history = await ctx.supabase
      .from("chat_messages")
      .select("role,content")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(12);

    const prior = (history.data ?? []).reverse().map((m: any) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content as string,
    }));

    const now = new Date().toISOString();
    const reply = await callAI([
      {
        role: "system",
        content:
          "You are the TaskFlow AI Assistant inside the user's own productivity workspace. " +
          "Always answer using the workspace data provided below — reference real task titles, deadlines, priorities and scheduled times. " +
          "Be concise, warm and actionable. Use short markdown-free lists when helpful. Current time: " +
          now +
          "\n\nWORKSPACE DATA:\n" +
          JSON.stringify({
            user: ws.profile.display_name,
            workingHours: { start: ws.profile.work_start, end: ws.profile.work_end },
            tasks: ws.tasks,
            events: ws.events,
            research: ws.research,
          }).slice(0, 60000),
      },
      ...prior,
      { role: "user", content: data.message },
    ]);

    await ctx.supabase.from("chat_messages").insert([
      { user_id: ctx.userId, role: "user", content: data.message },
      { user_id: ctx.userId, role: "assistant", content: reply },
    ]);

    return { reply };
  });
