import { createFileRoute } from "@tanstack/react-router";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
  head: () => ({ meta: [{ title: "Alerts & Tips" }] }),
});

function AlertsPage() {
  const g = useGarden();
  return (
    <div>
      <header className="flex items-center justify-between border-b border-border px-5 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Alerts & Tips</h1>
        <Button variant="outline" size="sm" className="rounded-lg">View All</Button>
      </header>

      <section className="px-5 pt-5">
        <h2 className="text-lg font-bold">Active Alerts</h2>
        <div className="mt-3 space-y-3">
          {g.alerts.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No active alerts. 🎉
            </p>
          )}
          {g.alerts.map((a) => (
            <button
              key={a.id}
              onClick={() => g.dismissAlert(a.id)}
              className="w-full rounded-2xl border border-border bg-card p-4 text-left transition active:scale-[.99]"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
                    a.type === "warning" ? "bg-warning/30" : "bg-info/30"
                  }`}
                >
                  {a.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-bold">{a.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="text-lg font-bold">Care Tips for You</h2>
        <div className="mt-3 space-y-3">
          {g.tips.map((t) => (
            <div key={t.id} className="rounded-2xl border border-primary/30 bg-primary-soft/70 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background text-2xl">
                  {t.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{t.title}</p>
                    <Badge variant="outline" className="border-primary/40 bg-background/60 text-xs text-accent-foreground">
                      {t.category}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-foreground/80">{t.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}