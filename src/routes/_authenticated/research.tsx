import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { runResearch, type ResearchResult } from "@/lib/ai.functions";
import { useResearch, useSaveResearch, useCreateTask } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/research")({
  head: () => ({
    meta: [
      { title: "AI Research — TaskFlow AI" },
      { name: "description", content: "Turn any topic or pasted text into a structured briefing you can act on." },
      { property: "og:title", content: "AI Research — TaskFlow AI" },
      { property: "og:description", content: "Summaries, key points, insights and recommendations in seconds." },
    ],
  }),
  component: ResearchPage,
});

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="card-surface p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((i, k) => (
          <li key={k} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const run = useServerFn(runResearch);
  const save = useSaveResearch();
  const createTask = useCreateTask();
  const { data: history = [] } = useResearch();

  const go = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic or question");
      return;
    }
    setLoading(true);
    try {
      setResult(await run({ data: { topic, context } }));
    } catch (e) {
      toast.error((e as Error).message || "Research failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="AI Research" subtitle="Ask a question or paste material — get a structured briefing." />

      <div className="card-surface grid gap-3 p-5">
        <Input placeholder="Topic or question…" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Textarea
          rows={5}
          placeholder="Optional: paste text, notes or an article to summarise…"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={go} disabled={loading}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
            Research
          </Button>
          {result && (
            <>
              <Button
                variant="outline"
                onClick={async () => {
                  await save.mutateAsync({
                    topic: result.topic,
                    summary: result.summary,
                    key_points: result.key_points,
                    insights: result.insights,
                    recommendations: result.recommendations,
                    questions: result.questions,
                  });
                  toast.success("Saved to research history");
                }}
              >
                <Save className="mr-2 size-4" /> Save
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  for (const r of result.recommendations.slice(0, 5)) {
                    await createTask.mutateAsync({ title: r, category: "Other", priority: "medium" });
                  }
                  toast.success("Recommendations added to your tasks");
                }}
              >
                Turn into tasks
              </Button>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="card-surface p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold">Summary</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{result.summary}</p>
          </div>
          <List title="Key points" items={result.key_points} />
          <List title="Insights" items={result.insights} />
          <List title="Recommendations" items={result.recommendations} />
          <List title="Questions to explore" items={result.questions} />
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-base font-semibold">Research history</h2>
          <div className="card-surface divide-y divide-border">
            {history.map((h) => (
              <button
                key={h.id}
                onClick={() =>
                  setResult({
                    topic: h.topic,
                    summary: h.summary ?? "",
                    key_points: h.key_points,
                    insights: h.insights,
                    recommendations: h.recommendations,
                    questions: h.questions,
                  })
                }
                className="block w-full p-4 text-left hover:bg-accent/50"
              >
                <p className="text-sm font-medium">{h.topic}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{h.summary}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
