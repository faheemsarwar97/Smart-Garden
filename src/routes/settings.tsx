import { createFileRoute, Link } from "@tanstack/react-router";
import { useGarden } from "@/lib/garden-store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Smart Garden" }] }),
});

function SettingsPage() {
  const g = useGarden();
  const s = g.settings;
  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/" className="text-2xl" aria-label="Back">←</Link>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </header>

      <div className="space-y-6 px-5 pt-5">
        <Group title="Notifications">
          <Row label="Enable notifications" sublabel="Master toggle for all alerts">
            <Switch checked={s.notifications} onCheckedChange={(v) => g.updateSettings({ notifications: v })} />
          </Row>
          <Row label="Push alerts" sublabel="Real-time plant warnings">
            <Switch
              checked={s.pushAlerts && s.notifications}
              disabled={!s.notifications}
              onCheckedChange={(v) => g.updateSettings({ pushAlerts: v })}
            />
          </Row>
          <Row label="Weekly email digest" sublabel="Summary every Monday">
            <Switch checked={s.emailDigest} onCheckedChange={(v) => g.updateSettings({ emailDigest: v })} />
          </Row>
        </Group>

        <Group title="Preferences">
          <Row label="Units" sublabel={s.units === "metric" ? "°C, lux, %" : "°F, fc, %"}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => g.updateSettings({ units: s.units === "metric" ? "imperial" : "metric" })}
            >
              {s.units === "metric" ? "Metric" : "Imperial"}
            </Button>
          </Row>
          <Row label="Away mode" sublabel="Pause manual reminders while traveling">
            <Switch checked={s.awayMode} onCheckedChange={(v) => g.updateSettings({ awayMode: v })} />
          </Row>
        </Group>

        <Group title="Plant">
          <Link to="/plant" className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{g.plantName}</p>
              <p className="text-xs text-muted-foreground">Tap to edit details</p>
            </div>
            <span className="text-muted-foreground">›</span>
          </Link>
        </Group>

        <Group title="About">
          <Row label="Version"><span className="text-sm text-muted-foreground">1.0.0</span></Row>
          <Row label="Privacy Policy"><span className="text-muted-foreground">›</span></Row>
          <Row label="Help & Support"><span className="text-muted-foreground">›</span></Row>
        </Group>

        <Button variant="outline" className="w-full">Sign Out</Button>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card px-4">
        {children}
      </div>
    </section>
  );
}

function Row({ label, sublabel, children }: { label: string; sublabel?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
      {children}
    </div>
  );
}