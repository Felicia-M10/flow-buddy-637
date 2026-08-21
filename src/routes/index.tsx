import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, CalendarDays, CheckSquare, MessageSquare, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaskFlow AI — One AI workspace for tasks, plans & focus" },
      {
        name: "description",
        content:
          "TaskFlow AI unites task management, an AI planner, research assistant, chatbot, calendar and productivity analytics in one calm purple workspace.",
      },
      { property: "og:title", content: "TaskFlow AI — One AI productivity workspace" },
      {
        property: "og:description",
        content: "Plan your day, research faster and track focus — all on one shared set of tasks.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: CheckSquare, title: "Task management", body: "Priorities, deadlines, categories, tags and recurring work." },
  { icon: Sparkles, title: "AI planner", body: "Turns your real tasks into a realistic day or week schedule." },
  { icon: Search, title: "AI research", body: "Structured briefings with key points, insights and next questions." },
  { icon: MessageSquare, title: "AI assistant", body: "A chatbot that knows your tasks, calendar and research." },
  { icon: CalendarDays, title: "Calendar", body: "Scheduled blocks and events in one connected timeline." },
  { icon: BarChart3, title: "Productivity", body: "Completion rate, streaks and category breakdowns." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <span className="font-semibold tracking-tight">TaskFlow AI</span>
        </div>
        <Button asChild variant="ghost">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        <section className="py-16 text-center md:py-24">
          <p className="mx-auto w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            One integrated AI productivity workspace
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Everything you plan, research and finish — in one calm place.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            TaskFlow AI connects your tasks, calendar, AI planner, research and assistant to a single shared
            workspace, so every part of your day stays in sync.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Get started free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">Open workspace</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card-surface p-6">
              <Icon className="size-5 text-primary" />
              <h2 className="mt-4 text-base font-semibold">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
