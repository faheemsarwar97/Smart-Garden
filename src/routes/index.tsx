import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({ meta: [{ title: "Smart Garden — Home" }] }),
});

function Index() {
  const g = useGarden();
  const { t } = useI18n();
  const activeZone = g.zones.find((z) => z.id === g.activeZoneId);
  const eta = formatEta(g.nextWaterEtaMs);
  return (
    <div>
      <header className="flex items-center justify-between border-b border-border px-5 py-5">
        <h1 className="text-2xl font-bold tracking-tight">{t("app_title")}</h1>
        <div className="flex items-center gap-3 text-2xl">
          <Link to="/achievements" aria-label="Achievements">🏆</Link>
          <Link to="/alerts" aria-label="Alerts">🔔</Link>
          <Link to="/settings" aria-label="Settings">⚙️</Link>
        </div>
      </header>

      <section className="px-5 pt-4">
        <Link
          to="/zones"
          className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeZone?.emoji ?? "🗺️"}</span>
            <div>
              <p className="text-sm font-bold">{activeZone?.name ?? t("all_zones")}</p>
              <p className="text-[11px] text-muted-foreground">{g.zones.length} {t("zones_switch")}</p>
            </div>
          </div>
          <span className="text-muted-foreground">›</span>
        </Link>
      </section>

      <section className="px-5 pt-5">
        <div className="rounded-2xl border border-primary/20 bg-primary-soft/60 p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-background text-3xl shadow-sm">🌿</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold leading-tight">{g.plantName}</h2>
              <p className="text-sm text-muted-foreground">{g.location}</p>
            </div>
            <Link to="/plant" className="rounded-lg border border-primary/40 px-3 py-2 text-center text-xs font-medium text-foreground">
              {t("view_plant_details")}
            </Link>
          </div>

          <div className="mt-5 rounded-xl bg-background/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{t("health_score")}</span>
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

      <section className="px-5 pt-5">
        <div className="rounded-2xl border border-info/40 bg-info/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              <div>
                <p className="text-sm font-bold">{t("predictive_watering")}</p>
                <p className="text-xs text-muted-foreground">
                  {g.weatherSummary} · {g.humidityForecast}% {t("humidity")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("next_watering")}</p>
              <p className="font-bold text-primary">{eta}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-8">
        <h3 className="text-lg font-bold">{t("quick_actions")}</h3>
        <div className="mt-4 space-y-3">
          <Link
            to="/scan"
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent-foreground/80 text-lg font-semibold text-primary-foreground shadow-md"
          >
            <span className="text-2xl">🔬</span> {t("scan_leaf")}
          </Link>
          <Link
            to="/growth"
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-card text-lg font-semibold text-foreground shadow-sm"
          >
            <span className="text-2xl">📸</span> {t("growth_timelapse")}
          </Link>
          <Button onClick={g.waterNow} className="h-16 w-full rounded-2xl text-lg font-semibold shadow-md">
            <span className="mr-2 text-2xl">💧</span> {t("water_now")}
          </Button>
          <Button
            onClick={g.toggleLights}
            variant="secondary"
            className="h-16 w-full rounded-2xl text-lg font-semibold"
          >
            <span className="mr-2 text-2xl">{g.lightsOn ? "☀️" : "🌙"}</span>
            {t("toggle_lights")}
          </Button>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-base font-bold">💧 {t("water_saved")}</h3>
          <p className="mt-1 text-3xl font-bold text-primary">
            {(g.waterSavedMl / 1000).toFixed(2)} L
          </p>
          <p className="text-xs text-muted-foreground">
            {t("vs_traditional")} · {g.waterCount} {t("precision_events")}
          </p>
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-base font-bold">{t("todays_activity")}</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("last_watered")}</p>
              <p className="font-semibold">{g.lastWatered}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("light_time")}</p>
              <p className="font-semibold">{g.lightHours} {t("hours")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatEta(ms: number | null): string {
  if (ms === null) return "—";
  if (ms <= 0) return "Now";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `in ${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return `in ${h}h ${m}m`;
  const d = Math.floor(h / 24);
  return `in ${d}d ${h % 24}h`;
}

function Stat({ emoji, value }: { emoji: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-background/70 py-3">
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
