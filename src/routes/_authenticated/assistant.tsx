import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAssistant } from "@/lib/ai.functions";
import { useChatHistory } from "@/lib/workspace";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — TaskFlow AI" },
      { name: "description", content: "Chat with an assistant that knows your tasks, calendar and research." },
      { property: "og:title", content: "AI Assistant — TaskFlow AI" },
      { property: "og:description", content: "Ask what's due, what to focus on, or how to reshape your week." },
    ],
  }),
  component: AssistantPage,
});

const SUGGESTIONS = [
  "What should I focus on today?",
  "Summarise my week",
  "Which tasks are at risk of slipping?",
  "Suggest a better order for my afternoon",
];

function AssistantPage() {
  const { data: history = [] } = useChatHistory();
  const ask = useServerFn(askAssistant);
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [history.length, pending]);

  const send = async (message: string) => {
    if (!message.trim() || loading) return;
    setInput("");
    setPending(message);
    setLoading(true);
    try {
      await ask({ data: { message } });
      await qc.invalidateQueries({ queryKey: ["chat"] });
    } catch (e) {
      toast.error((e as Error).message || "The assistant could not reply");
    } finally {
      setPending(null);
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <PageHeader title="AI Assistant" subtitle="Workspace-aware — it reads your real tasks, events and research." />

      <div className="card-surface flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {history.length === 0 && !pending && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Ask me anything about your workspace.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {history.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {pending && (
            <>
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  {pending}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="rounded-2xl bg-muted px-4 py-2.5">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            </>
          )}
          <div ref={bottom} />
        </div>

        <form
          className="flex gap-2 border-t border-border p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your tasks…" />
          <Button type="submit" size="icon" disabled={loading}>
            <Send className="size-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
