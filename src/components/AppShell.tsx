import { Link, useLocation, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { GardenProvider } from "@/lib/garden-store";

const tabs = [
  { to: "/", label: "Home", emoji: "🏠" },
  { to: "/status", label: "Status", emoji: "📊" },
  { to: "/chat", label: "Chat", emoji: "💬" },
  { to: "/automations", label: "Auto", emoji: "🤖" },
  { to: "/alerts", label: "Alerts", emoji: "🚨" },
] as const;

export function AppShell() {
  const { pathname } = useLocation();
  return (
    <GardenProvider>
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
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
                      {t.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Toaster position="top-center" />
      </div>
    </GardenProvider>
  );
}