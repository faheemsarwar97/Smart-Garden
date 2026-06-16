import { createFileRoute, Link } from "@tanstack/react-router";
import { useGarden } from "@/lib/garden-store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Smart Garden" }] }),
});

function SettingsPage() {
  const g = useGarden();
  const s = g.settings;
  const { t, lang, setLang } = useI18n();
  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/" className="text-2xl" aria-label="Back">←</Link>
        <h1 className="text-2xl font-bold tracking-tight">{t("settings")}</h1>
      </header>

      <div className="space-y-6 px-5 pt-5">
        <Group title={t("notifications")}>
          <Row label={t("enable_notifications")} sublabel={t("enable_notifications_sub")}>
            <Switch checked={s.notifications} onCheckedChange={(v) => g.updateSettings({ notifications: v })} />
          </Row>
          <Row label={t("push_alerts")} sublabel={t("push_alerts_sub")}>
            <Switch
              checked={s.pushAlerts && s.notifications}
              disabled={!s.notifications}
              onCheckedChange={(v) => g.updateSettings({ pushAlerts: v })}
            />
          </Row>
          <Row label={t("weekly_digest")} sublabel={t("weekly_digest_sub")}>
            <Switch checked={s.emailDigest} onCheckedChange={(v) => g.updateSettings({ emailDigest: v })} />
          </Row>
        </Group>

        <Group title={t("preferences")}>
          <Row label={t("units")} sublabel={s.units === "metric" ? "°C, lux, %" : "°F, fc, %"}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => g.updateSettings({ units: s.units === "metric" ? "imperial" : "metric" })}
            >
              {s.units === "metric" ? t("metric") : t("imperial")}
            </Button>
          </Row>
          <Row label={t("language")} sublabel={t("language_sub")}>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={lang === "en" ? "default" : "outline"}
                onClick={() => setLang("en")}
              >
                English
              </Button>
              <Button
                size="sm"
                variant={lang === "ur" ? "default" : "outline"}
                onClick={() => setLang("ur")}
              >
                اردو
              </Button>
            </div>
          </Row>
          <Row label={t("away_mode")} sublabel={t("away_mode_sub")}>
            <Switch checked={s.awayMode} onCheckedChange={(v) => g.updateSettings({ awayMode: v })} />
          </Row>
        </Group>

        <Group title={t("plant")}>
          <Link to="/plant" className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{g.plantName}</p>
              <p className="text-xs text-muted-foreground">{t("tap_edit")}</p>
            </div>
            <span className="text-muted-foreground">›</span>
          </Link>
        </Group>

        <Group title={t("about")}>
          <Row label={t("version")}><span className="text-sm text-muted-foreground">1.0.0</span></Row>
          <Row label={t("privacy")}><span className="text-muted-foreground">›</span></Row>
          <Row label={t("help")}><span className="text-muted-foreground">›</span></Row>
        </Group>

        <Button variant="outline" className="w-full">{t("sign_out")}</Button>
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