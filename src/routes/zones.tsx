import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/zones")({
  component: ZonesPage,
  head: () => ({ meta: [{ title: "Zones" }] }),
});

function ZonesPage() {
  const g = useGarden();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌿");
  const [loc, setLoc] = useState("Indoor");

  const submit = () => {
    if (!name.trim()) return;
    g.addZone({
      name, emoji, location: loc,
      moisture: 50 + Math.round(Math.random() * 20),
      temperature: 21 + Math.round(Math.random() * 6),
      light: 500 + Math.round(Math.random() * 800),
      health: 75 + Math.round(Math.random() * 20),
    });
    setName(""); setEmoji("🌿"); setLoc("Indoor");
    setOpen(false);
  };

  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/" className="text-2xl" aria-label="Back">←</Link>
        <h1 className="text-2xl font-bold tracking-tight">Zones</h1>
      </header>

      <section className="px-5 pt-5">
        <p className="text-sm text-muted-foreground">
          Manage multiple planters or rooms from one dashboard.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {g.zones.map((z) => {
            const active = z.id === g.activeZoneId;
            return (
              <button
                key={z.id}
                onClick={() => g.selectZone(z.id)}
                className={`relative rounded-2xl border-2 p-4 text-left transition ${
                  active ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{z.emoji}</span>
                  {active && <span className="text-xs font-bold text-primary">ACTIVE</span>}
                </div>
                <p className="mt-2 font-bold">{z.name}</p>
                <p className="text-xs text-muted-foreground">{z.location}</p>
                <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
                  <span>💧 {z.moisture}%</span>
                  <span>🌡️ {z.temperature}°</span>
                  <span>☀️ {z.light}</span>
                  <span>❤️ {z.health}%</span>
                </div>
                {g.zones.length > 1 && (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); g.removeZone(z.id); }}
                    className="absolute right-2 top-2 text-xs text-muted-foreground"
                  >✕</span>
                )}
              </button>
            );
          })}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 w-full rounded-2xl">+ Add Zone</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Zone</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kitchen Herbs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Emoji</Label>
                  <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={loc} onChange={(e) => setLoc(e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="mt-6 rounded-2xl bg-primary-soft p-5 text-center">
          <p className="text-3xl">🗺️</p>
          <p className="mt-2 font-bold">Unified Dashboard</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tap a zone to make it active. All automations and rules apply to the active zone.
          </p>
        </div>
      </section>
    </div>
  );
}