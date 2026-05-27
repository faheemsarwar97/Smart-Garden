import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import { useGarden } from "@/lib/garden-store";
import { askGardenAi, type ChatMessage } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
  head: () => ({ meta: [{ title: "Smart Garden — Assistant" }] }),
});

const SUGGESTIONS = [
  "What's the update for today?",
  "Is my plant healthy right now?",
  "Any issues I should fix?",
  "When should I water next?",
];

function ChatPage() {
  const g = useGarden();
  const ask = useServerFn(askGardenAi);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm your garden assistant 🌿 I can see your live dashboard for ${g.plantName}. Ask me about today's status, any issues, watering, or lighting.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({
        data: {
          messages: next,
          context: {
            plantName: g.plantName,
            location: g.location,
            species: g.species,
            healthScore: g.healthScore,
            moisture: g.moisture,
            temperature: g.temperature,
            light: g.light,
            lightsOn: g.lightsOn,
            lightBrightness: g.lightBrightness,
            lastWatered: g.lastWatered,
            lightHours: g.lightHours,
            activeAutomations: g.automations.filter((a) => a.enabled).map((a) => `${a.name} (${a.time})`),
            activeAlerts: g.alerts.map((a) => `${a.title}: ${a.description}`),
          },
        },
      });
      if (res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
      } else {
        toast.error(res.error);
        setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${res.error}` }]);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h1 className="text-xl font-bold">Garden Assistant</h1>
          <p className="text-xs text-muted-foreground">Live dashboard-aware AI · Health {g.healthScore}%</p>
        </div>
        <span className="text-3xl">🤖</span>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card text-card-foreground border border-border rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border bg-card px-4 py-2.5 text-sm">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
              </span>
            </div>
          </div>
        )}

        {messages.length <= 1 && !loading && (
          <div className="pt-2">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-border bg-background px-4 py-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your garden…"
          disabled={loading}
          className="h-11 rounded-full"
        />
        <Button type="submit" disabled={loading || !input.trim()} className="h-11 rounded-full px-5">
          Send
        </Button>
      </form>
    </div>
  );
}