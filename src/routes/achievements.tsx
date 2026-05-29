import { createFileRoute, Link } from "@tanstack/react-router";
import { useGarden } from "@/lib/garden-store";

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
  head: () => ({ meta: [{ title: "Achievements" }] }),
});

function AchievementsPage() {
  const g = useGarden();
  const savedL = (g.waterSavedMl / 1000).toFixed(2);
  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/" className="text-2xl" aria-label="Back">←</Link>
        <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
      </header>

      <section className="px-5 pt-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat emoji="💧" label="Water Saved" value={`${savedL} L`} />
          <Stat emoji="🚿" label="Waterings" value={String(g.waterCount)} />
          <Stat emoji="☀️" label="Light Hours" value={`${g.lightHours.toFixed(1)}h`} />
          <Stat emoji="❤️" label="Health" value={`${g.healthScore}%`} />
        </div>

        <h2 className="mt-6 text-lg font-bold">Milestones</h2>
        <div className="mt-3 space-y-3">
          {g.achievements.map((a) => {
            const p = a.progress(g.achievementCtx);
            const pct = Math.min(100, (p / a.goal) * 100);
            const done = p >= a.goal;
            return (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 ${
                  done ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${done ? "bg-background" : "bg-muted"}`}>
                    {done ? "🏆" : a.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between">
                      <p className="font-bold">{a.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(p)} / {a.goal} {a.unit}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-3xl">{emoji}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}