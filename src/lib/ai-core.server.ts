const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function callAI(messages: ChatMessage[], model = "google/gemini-3.7-flash") {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({ model, messages }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI is busy right now — please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are exhausted. Add credits in Lovable to continue.");
    throw new Error(`AI request failed (${res.status}). ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "";
}

export function parseJson<T>(raw: string, fallback: T): T {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  if (start === -1) return fallback;
  const candidate = cleaned.slice(start);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const lastBrace = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (lastBrace > 0) {
      try {
        return JSON.parse(candidate.slice(0, lastBrace + 1)) as T;
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
}
