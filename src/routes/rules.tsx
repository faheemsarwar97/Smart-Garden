import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useGarden, type RuleCondition, type RuleAction } from "@/lib/garden-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/rules")({
  component: RulesPage,
  head: () => ({ meta: [{ title: "IFTTT Rules" }] }),
});

const METRICS: RuleCondition["metric"][] = ["moisture", "temperature", "light", "healthScore"];
const OPS: RuleCondition["op"][] = ["<", ">", "="];

function RulesPage() {
  const g = useGarden();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [conds, setConds] = useState<RuleCondition[]>([{ metric: "moisture", op: "<", value: 40 }]);
  const [actions, setActions] = useState<RuleAction[]>([{ type: "water" }]);

  const reset = () => {
    setName(""); setLogic("AND");
    setConds([{ metric: "moisture", op: "<", value: 40 }]);
    setActions([{ type: "water" }]);
  };

  const save = () => {
    if (!name.trim()) return;
    g.saveRule({ name, logic, conditions: conds, actions, enabled: true });
    reset();
    setOpen(false);
  };

  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/automations" className="text-2xl" aria-label="Back">←</Link>
        <h1 className="text-2xl font-bold tracking-tight">If/Then Rules</h1>
      </header>

      <section className="px-5 pt-5">
        <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 p-4">
          <p className="text-sm">
            🧩 Build custom recipes that fire when sensor conditions match. Rules check every 15 seconds.
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Active Rules</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="rounded-full">+ New Rule</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New IFTTT Rule</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Rule name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Heatwave Misting" />
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-bold">IF</p>
                    <div className="flex gap-1">
                      {(["AND", "OR"] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLogic(l)}
                          className={`rounded-md px-2 py-1 text-xs ${logic === l ? "bg-primary text-primary-foreground" : "bg-background"}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {conds.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select
                          value={c.metric}
                          onChange={(e) => {
                            const next = [...conds];
                            next[i] = { ...c, metric: e.target.value as RuleCondition["metric"] };
                            setConds(next);
                          }}
                          className="h-9 flex-1 rounded-md border border-border bg-background px-2 text-sm"
                        >
                          {METRICS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                          value={c.op}
                          onChange={(e) => {
                            const next = [...conds];
                            next[i] = { ...c, op: e.target.value as RuleCondition["op"] };
                            setConds(next);
                          }}
                          className="h-9 w-14 rounded-md border border-border bg-background text-center"
                        >
                          {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                        <Input
                          type="number"
                          className="w-20"
                          value={c.value}
                          onChange={(e) => {
                            const next = [...conds];
                            next[i] = { ...c, value: Number(e.target.value) };
                            setConds(next);
                          }}
                        />
                        <button
                          onClick={() => setConds(conds.filter((_, j) => j !== i))}
                          className="px-2 text-muted-foreground"
                          aria-label="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConds([...conds, { metric: "moisture", op: "<", value: 40 }])}
                    >
                      + Add condition
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <p className="mb-2 text-sm font-bold">THEN</p>
                  <div className="space-y-2">
                    {actions.map((a, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select
                          value={a.type}
                          onChange={(e) => {
                            const t = e.target.value as RuleAction["type"];
                            const next = [...actions];
                            next[i] =
                              t === "water" ? { type: "water" } :
                              t === "lights" ? { type: "lights", on: true } :
                              { type: "alert", message: "Custom alert" };
                            setActions(next);
                          }}
                          className="h-9 flex-1 rounded-md border border-border bg-background px-2 text-sm"
                        >
                          <option value="water">💧 Water now</option>
                          <option value="lights">💡 Toggle lights</option>
                          <option value="alert">🚨 Send alert</option>
                        </select>
                        {a.type === "lights" && (
                          <Switch
                            checked={a.on}
                            onCheckedChange={(v) => {
                              const next = [...actions];
                              next[i] = { type: "lights", on: v };
                              setActions(next);
                            }}
                          />
                        )}
                        {a.type === "alert" && (
                          <Input
                            className="w-32"
                            value={a.message}
                            onChange={(e) => {
                              const next = [...actions];
                              next[i] = { type: "alert", message: e.target.value };
                              setActions(next);
                            }}
                          />
                        )}
                        <button
                          onClick={() => setActions(actions.filter((_, j) => j !== i))}
                          className="px-2 text-muted-foreground"
                        >✕</button>
                      </div>
                    ))}
                    <Button size="sm" variant="outline" onClick={() => setActions([...actions, { type: "alert", message: "Check plant" }])}>
                      + Add action
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={save}>Save Rule</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mt-3 space-y-3">
          {g.rules.length === 0 && (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No rules yet. Create your first recipe above.
            </p>
          )}
          {g.rules.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{r.name}</p>
                    <Badge variant="outline" className="text-xs">{r.logic}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                    {r.conditions.map((c, i) => (
                      <span key={i} className="rounded-md bg-muted px-2 py-0.5 font-mono">
                        {c.metric} {c.op} {c.value}
                      </span>
                    ))}
                    <span className="text-muted-foreground">→</span>
                    {r.actions.map((a, i) => (
                      <span key={i} className="rounded-md bg-primary-soft px-2 py-0.5">
                        {a.type === "water" && "💧 water"}
                        {a.type === "lights" && `💡 lights ${a.on ? "on" : "off"}`}
                        {a.type === "alert" && `🚨 ${a.message}`}
                      </span>
                    ))}
                  </div>
                  {r.lastFired && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last fired {Math.round((Date.now() - r.lastFired) / 1000)}s ago
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Switch checked={r.enabled} onCheckedChange={() => g.toggleRule(r.id)} />
                  <button
                    onClick={() => g.removeRule(r.id)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}