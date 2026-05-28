import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({ meta: [{ title: "Smart Garden — Home" }] }),
});

function Index() {
  const g = useGarden();
  return (
    <div>
      <header className="flex items-center justify-between border-b border-border px-5 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Smart Garden</h1>
        <div className="flex items-center gap-3 text-2xl">
          <Link to="/alerts" aria-label="Alerts">🔔</Link>
          <Link to="/settings" aria-label="Settings">⚙️</Link>
        </div>
      </header>

      <section className="px-5 pt-5">
        <div className="rounded-2xl border border-primary/20 bg-primary-soft/60 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-background text-3xl shadow-sm">🌿</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold leading-tight">{g.plantName}</h2>
              <p className="text-sm text-muted-foreground">{g.location}</p>
            </div>
            <Link to="/plant" className="rounded-lg border border-primary/40 px-3 py-2 text-center text-xs font-medium text-foreground">
              View Plant<br />Details
            </Link>
          </div>

          <div className="mt-5 rounded-xl bg-background/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Health Score</span>
              <span className="text-lg font-bold text-primary">{g.healthScore}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${g.healthScore}%` }} />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat emoji="💧" value={`${g.moisture}%`} />
            <Stat emoji="🌡️" value={`${g.temperature}°C`} />
            <Stat emoji="☀️" value={`${g.light} lux`} />
          </div>
        </div>
      </section>

      <section className="px-5 pt-8">
        <h3 className="text-lg font-bold">Quick Actions</h3>
        <div className="mt-4 space-y-3">
          <Link
            to="/scan"
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent-foreground/80 text-lg font-semibold text-primary-foreground shadow-md"
          >
            <span className="text-2xl">🔬</span> Scan Leaf for Diagnosis
          </Link>
          <Link
            to="/growth"
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-card text-lg font-semibold text-foreground shadow-sm"
          >
            <span className="text-2xl">📸</span> Growth Time-Lapse
          </Link>
          <Button onClick={g.waterNow} className="h-16 w-full rounded-2xl text-lg font-semibold shadow-md">
            <span className="mr-2 text-2xl">💧</span> Water Now
          </Button>
          <Button
            onClick={g.toggleLights}
            variant="secondary"
            className="h-16 w-full rounded-2xl text-lg font-semibold"
          >
            <span className="mr-2 text-2xl">{g.lightsOn ? "☀️" : "🌙"}</span>
            Toggle Grow Lights
          </Button>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-base font-bold">Today's Activity</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Last Watered</p>
              <p className="font-semibold">{g.lastWatered}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Light Time</p>
              <p className="font-semibold">{g.lightHours} hours</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ emoji, value }: { emoji: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-background/70 py-3">
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
