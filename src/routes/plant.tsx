import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useGarden } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/plant")({
  component: PlantDetailsPage,
  head: () => ({ meta: [{ title: "Plant Details" }] }),
});

function PlantDetailsPage() {
  const g = useGarden();
  const [name, setName] = useState(g.plantName);
  const [loc, setLoc] = useState(g.location);

  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/" className="text-2xl" aria-label="Back">←</Link>
        <h1 className="text-2xl font-bold tracking-tight">Plant Details</h1>
      </header>

      <section className="px-5 pt-5">
        <div className="rounded-2xl bg-primary-soft p-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-background text-5xl shadow-sm">
            🌿
          </div>
          <p className="mt-3 text-lg font-bold">{g.plantName}</p>
          <p className="text-sm text-muted-foreground">{g.species}</p>
          <p className="mt-1 text-xs text-muted-foreground">Planted {g.plantedOn}</p>
        </div>
      </section>

      <section className="space-y-4 px-5 pt-6">
        <h2 className="text-base font-bold">Identity</h2>
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div>
            <Label htmlFor="pn">Plant name</Label>
            <Input id="pn" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="loc">Location</Label>
            <Input id="loc" value={loc} onChange={(e) => setLoc(e.target.value)} />
          </div>
          <Button className="w-full" onClick={() => g.renamePlant(name, loc)}>
            Save changes
          </Button>
        </div>

        <h2 className="pt-2 text-base font-bold">Light Control</h2>
        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Grow lights</p>
              <p className="text-xs text-muted-foreground">{g.lightsOn ? "Currently on" : "Currently off"}</p>
            </div>
            <Button size="sm" variant={g.lightsOn ? "default" : "outline"} onClick={g.toggleLights}>
              {g.lightsOn ? "On" : "Off"}
            </Button>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Brightness</Label>
              <span className="text-sm font-semibold text-primary">{g.lightBrightness}%</span>
            </div>
            <Slider
              value={[g.lightBrightness]}
              max={100}
              step={5}
              onValueChange={(v) => g.setBrightness(v[0])}
              disabled={!g.lightsOn}
            />
          </div>
        </div>

        <h2 className="pt-2 text-base font-bold">Current Readings</h2>
        <div className="grid grid-cols-3 gap-2">
          <Mini emoji="💧" label="Moisture" value={`${g.moisture}%`} />
          <Mini emoji="🌡️" label="Temp" value={`${g.temperature}°C`} />
          <Mini emoji="☀️" label="Light" value={`${g.light} lux`} />
        </div>
      </section>
    </div>
  );
}

function Mini({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border bg-card py-3">
      <span className="text-2xl">{emoji}</span>
      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}