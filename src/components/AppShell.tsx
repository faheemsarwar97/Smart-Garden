import { Link, useLocation, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { GardenProvider } from "@/lib/garden-store";
import { I18nProvider, useI18n, type TKey } from "@/lib/i18n";

const tabs = [
  { to: "/", labelKey: "nav_home", emoji: "🏠" },
  { to: "/status", labelKey: "nav_status", emoji: "📊" },
  { to: "/chat", labelKey: "nav_chat", emoji: "💬" },
  { to: "/automations", labelKey: "nav_auto", emoji: "🤖" },
  { to: "/alerts", labelKey: "nav_alerts", emoji: "🚨" },
] as const satisfies ReadonlyArray<{ to: string; labelKey: TKey; emoji: string }>;

export function AppShell() {
  return (
    <I18nProvider>
      <GardenProvider>
        <AppShellInner />
      </GardenProvider>
    </I18nProvider>
  );
}

function AppShellInner() {
  const { pathname } = useLocation();
  const { t } = useI18n();
  return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col rounded-3xl border border-border bg-background shadow-2xl ring-1 ring-border/50">
        <main className="flex-1 pb-24">
          <Outlet />
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-background/95 backdrop-blur">
          <ul className="grid grid-cols-5">
            {tabs.map((t) => {
              const active = pathname === t.to;
              return (
                <li key={t.to}>
                  <Link
                    to={t.to}
                    className="flex flex-col items-center gap-1 py-3 text-xs"
                  >
                    <span className={`text-2xl leading-none transition ${active ? "scale-110" : "opacity-60 grayscale"}`}>
                      {t.emoji}
                    </span>
                    <span className={active ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {/* labelKey lookup */}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Toaster position="top-center" />
      </div>
  );
}