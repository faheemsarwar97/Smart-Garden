import { createFileRoute } from "@tanstack/react-router";
import { useGarden } from "@/lib/garden-store";

export const Route = createFileRoute("/status")({
  component: StatusPage,
  head: () => ({ meta: [{ title: "Plant Status" }] }),
});

function StatusPage() {
  const g = useGarden();
  const metrics = [
    { label: "Soil Moisture", value: g.moisture, unit: "%", emoji: "💧", min: 40, max: 70 },
    { label: "Temperature", value: g.temperature, unit: "°C", emoji: "🌡️", min: 18, max: 26 },
    { label: "Light Level", value: g.light, unit: " lux", emoji: "☀️", min: 500, max: 1000 },
    { label: "Health Score", value: g.healthScore, unit: "%", emoji: "❤️", min: 70, max: 100 },
  ];
  return (
    <div>
      <header className="border-b border-border px-5 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Plant Status</h1>
        <p className="text-sm text-muted-foreground">Live readings from {g.plantName}</p>
      </header>
      <section className="space-y-3 px-5 pt-5">
        {metrics.map((m) => {
          const inRange = m.value >= m.min && m.value <= m.max;
          return (
            <div key={m.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{m.emoji}</span>
                  <div>
                    <p className="font-semibold">{m.label}</p>
                    <p className="text-xs text-muted-foreground">Optimal: {m.min}–{m.max}{m.unit}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">{m.value}{m.unit}</p>
                  <p className={`text-xs font-medium ${inRange ? "text-primary" : "text-warning-foreground"}`}>
                    {inRange ? "In range" : "Check"}
                  </p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full ${inRange ? "bg-primary" : "bg-warning"}`}
                  style={{ width: `${Math.min(100, (m.value / (m.max * 1.2)) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl bg-primary-soft p-5 text-center">
          <p className="text-3xl">🌿</p>
          <p className="mt-2 font-semibold">Your plant is thriving</p>
          <p className="mt-1 text-sm text-muted-foreground">
            All vital metrics are within healthy ranges. Keep up the great care!
          </p>
        </div>
      </section>
    </div>
  );
}