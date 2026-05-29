import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useGarden } from "@/lib/garden-store";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/automations")({
  component: AutomationsPage,
  head: () => ({ meta: [{ title: "Automations" }] }),
});

function AutomationsPage() {
  const g = useGarden();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("08:00");
  const [emoji, setEmoji] = useState("⏰");

  const submit = () => {
    if (!name.trim()) return;
    g.addAutomation({ name, description, time, emoji });
    setName(""); setDescription(""); setTime("08:00"); setEmoji("⏰");
    setOpen(false);
  };

  return (
    <div>
      <header className="flex items-center justify-between border-b border-border px-5 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full px-4">+ Create New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Automation</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="n">Name</Label>
                <Input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Morning Mist" />
              </div>
              <div>
                <Label htmlFor="d">Description</Label>
                <Input id="d" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Spray leaves" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="t">Time</Label>
                  <Input id="t" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="e">Emoji</Label>
                  <Input id="e" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <section className="px-5 pt-5">
        <Link
          to="/rules"
          className="mb-4 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary-soft/60 p-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧩</span>
            <div>
              <p className="font-bold">Custom If/Then Rules</p>
              <p className="text-xs text-muted-foreground">
                Build sensor-driven recipes that fire automatically
              </p>
            </div>
          </div>
          <span className="text-muted-foreground">›</span>
        </Link>

        <h2 className="text-lg font-bold">Active Schedules</h2>
        <p className="text-sm text-muted-foreground">Manage your routines</p>

        <div className="mt-4 space-y-3">
          {g.automations.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-2xl">
                  {a.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{a.name}</p>
                  <p className="text-sm text-muted-foreground">{a.description}</p>
                  <p className="mt-1 text-sm">⏰ {a.time}</p>
                </div>
                <Switch checked={a.enabled} onCheckedChange={() => g.toggleAutomation(a.id)} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-primary-soft p-6 text-center">
          <p className="text-4xl">🤖</p>
          <p className="mt-3 font-bold">Smart Automation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            AI learns your plant's needs and adjusts schedules automatically.
          </p>
        </div>
      </section>
    </div>
  );
}