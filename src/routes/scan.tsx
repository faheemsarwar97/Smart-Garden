import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { scanLeaf, type Diagnosis } from "@/lib/scan.functions";
import { useGarden } from "@/lib/garden-store";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({
  component: ScanPage,
  head: () => ({ meta: [{ title: "Scan Leaf — Smart Garden" }] }),
});

function ScanPage() {
  const scanFn = useServerFn(scanLeaf);
  const g = useGarden();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Diagnosis | null>(null);

  const handleFile = async (file: File) => {
    setResult(null);
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);

    setLoading(true);
    try {
      const res = await scanFn({
        data: {
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
          context: {
            plantName: g.plantName,
            species: g.species,
            moisture: g.moisture,
            temperature: g.temperature,
            light: g.light,
            lightsOn: g.lightsOn,
            lightHours: g.lightHours,
            lastWatered: g.lastWatered,
            healthScore: g.healthScore,
            recentAlerts: g.alerts.map((a) => `${a.title}: ${a.description}`),
          },
        },
      });
      if (res.ok) {
        setResult(res.diagnosis);
        toast.success("Diagnosis ready");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImageUrl(null);
    setResult(null);
  };

  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/" className="text-2xl" aria-label="Back">←</Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leaf Scan</h1>
          <p className="text-xs text-muted-foreground">AI-powered diagnosis & medication</p>
        </div>
      </header>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      <section className="px-5 pt-5">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-dashed border-primary/40 bg-primary-soft/40">
          {imageUrl ? (
            <img src={imageUrl} alt="Leaf preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="text-6xl">🍃</div>
              <p className="font-semibold">Scan a plant leaf</p>
              <p className="text-sm text-muted-foreground">
                Snap a clear, well-lit photo of the affected leaf for an instant diagnosis.
              </p>
            </div>
          )}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-semibold">Analyzing leaf…</p>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button onClick={() => cameraRef.current?.click()} disabled={loading} className="h-14 text-base">
            📷 Camera
          </Button>
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            variant="secondary"
            className="h-14 text-base"
          >
            🖼️ Upload
          </Button>
        </div>
        {imageUrl && !loading && (
          <Button onClick={reset} variant="ghost" className="mt-2 w-full">
            Clear & start over
          </Button>
        )}
      </section>

      {result && <DiagnosisCard d={result} />}
    </div>
  );
}

function DiagnosisCard({ d }: { d: Diagnosis }) {
  const statusColor =
    d.healthStatus === "healthy"
      ? "bg-primary text-primary-foreground"
      : d.healthStatus === "mild"
        ? "bg-info text-info-foreground"
        : d.healthStatus === "moderate"
          ? "bg-warning text-warning-foreground"
          : "bg-destructive text-destructive-foreground";

  return (
    <section className="space-y-4 px-5 pt-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Diagnosis</p>
            <p className="mt-1 text-xl font-bold">{d.diagnosis}</p>
            <p className="mt-1 text-sm text-muted-foreground">{d.plantGuess}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${statusColor}`}>
            {d.healthStatus}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Mini label="Confidence" value={`${Math.round(d.confidence)}%`} />
          <Mini label="Urgency" value={d.urgency} />
        </div>
      </div>

      {d.symptoms.length > 0 && (
        <Block title="🔍 Observed symptoms">
          <ul className="space-y-1.5 text-sm">
            {d.symptoms.map((s, i) => (
              <li key={i} className="flex gap-2"><span>•</span><span>{s}</span></li>
            ))}
          </ul>
        </Block>
      )}

      {d.historyInsight && d.historyInsight.trim().length > 0 && (
        <Block title="🧠 Cross-referenced with your plant history">
          <p className="text-sm leading-relaxed">{d.historyInsight}</p>
          <Link
            to="/chat"
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary"
          >
            💬 Discuss this with the AI companion
          </Link>
        </Block>
      )}

      {d.nutrients.length > 0 && (
        <Block title="🧬 Nutrient analysis">
          <div className="space-y-3">
            {d.nutrients.map((n, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{n.nutrient}</p>
                  <div className="flex gap-1">
                    <Badge
                      className={`capitalize ${
                        n.status === "deficient"
                          ? "bg-destructive text-destructive-foreground"
                          : n.status === "borderline"
                            ? "bg-warning text-warning-foreground"
                            : n.status === "excess"
                              ? "bg-info text-info-foreground"
                              : ""
                      }`}
                    >
                      {n.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">{n.mobility}</Badge>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Pattern: {n.visualPattern}</p>
                <p className="mt-1 text-sm">{n.recommendation}</p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {d.causes.length > 0 && (
        <Block title="🧪 Likely causes">
          <ul className="space-y-1.5 text-sm">
            {d.causes.map((c, i) => (
              <li key={i} className="flex gap-2"><span>•</span><span>{c}</span></li>
            ))}
          </ul>
        </Block>
      )}

      {d.treatments.length > 0 && (
        <Block title="💊 Recommended medication & treatment">
          <div className="space-y-3">
            {d.treatments.map((t, i) => (
              <div key={i} className="rounded-xl border border-border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{t.name}</p>
                  <Badge variant="outline" className="capitalize">{t.type}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.instructions}</p>
              </div>
            ))}
          </div>
        </Block>
      )}

      {d.prevention.length > 0 && (
        <Block title="🛡️ Prevention going forward">
          <ul className="space-y-1.5 text-sm">
            {d.prevention.map((p, i) => (
              <li key={i} className="flex gap-2"><span>•</span><span>{p}</span></li>
            ))}
          </ul>
        </Block>
      )}

      <p className="px-1 pb-2 text-center text-xs text-muted-foreground">
        AI guidance only. For serious infestations, consult a local horticulturist.
      </p>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold capitalize">{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 font-bold">{title}</h3>
      {children}
    </div>
  );
}