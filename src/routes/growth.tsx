import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGarden } from "@/lib/garden-store";
import { analyzeGrowth, type GrowthAnalysis } from "@/lib/growth.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/growth")({
  component: GrowthPage,
  head: () => ({ meta: [{ title: "Growth Tracking — Smart Garden" }] }),
});

type Frame = { id: string; dataUrl: string; takenAt: number };
const STORAGE_KEY = "smart-garden-growth-frames-v1";

function loadFrames(): Frame[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Frame[]) : [];
  } catch {
    return [];
  }
}

function saveFrames(frames: Frame[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(frames));
  } catch {
    toast.error("Storage full — remove old photos to add more.");
  }
}

function downscale(file: File, max = 720): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unsupported"));
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

function GrowthPage() {
  const g = useGarden();
  const analyze = useServerFn(analyzeGrowth);
  const [frames, setFrames] = useState<Frame[]>(() => loadFrames());
  const [playing, setPlaying] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GrowthAnalysis | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => saveFrames(frames), [frames]);

  // Time-lapse playback
  useEffect(() => {
    if (!playing || frames.length < 2) return;
    const id = setInterval(() => {
      setPlayIndex((i) => (i + 1) % frames.length);
    }, 600);
    return () => clearInterval(id);
  }, [playing, frames.length]);

  const addFrame = async (file: File) => {
    try {
      const dataUrl = await downscale(file);
      setFrames((list) =>
        [...list, { id: crypto.randomUUID(), dataUrl, takenAt: Date.now() }].sort(
          (a, b) => a.takenAt - b.takenAt,
        ),
      );
      toast.success("Photo added");
    } catch {
      toast.error("Could not read image");
    }
  };

  const removeFrame = (id: string) => {
    setFrames((list) => list.filter((f) => f.id !== id));
    setAnalysis(null);
  };

  const clearAll = () => {
    if (!confirm("Delete all growth photos?")) return;
    setFrames([]);
    setAnalysis(null);
  };

  const runAnalysis = async () => {
    if (frames.length < 2) {
      toast.error("Add at least 2 photos to analyze growth.");
      return;
    }
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const payload = frames.map((f) => ({
        imageBase64: f.dataUrl.split(",")[1],
        takenAt: f.takenAt,
      }));
      const res = await analyze({
        data: { frames: payload, plantName: g.plantName, species: g.species },
      });
      if (res.ok) {
        setAnalysis(res.analysis);
        toast.success("Growth analysis ready");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const current = frames[playIndex];
  const daysSpan =
    frames.length >= 2
      ? Math.max(
          0,
          (frames[frames.length - 1].takenAt - frames[0].takenAt) / 86_400_000,
        )
      : 0;

  return (
    <div>
      <header className="flex items-center gap-3 border-b border-border px-5 py-5">
        <Link to="/" className="text-2xl" aria-label="Back">←</Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Growth Time-Lapse</h1>
          <p className="text-xs text-muted-foreground">
            {frames.length} photos · {daysSpan.toFixed(1)} day span
          </p>
        </div>
      </header>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && addFrame(e.target.files[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && addFrame(e.target.files[0])}
      />

      <section className="px-5 pt-5">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-dashed border-primary/40 bg-primary-soft/40">
          {current ? (
            <img src={current.dataUrl} alt="Growth frame" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="text-6xl">📸</div>
              <p className="font-semibold">Capture growth over time</p>
              <p className="text-sm text-muted-foreground">
                Take a photo every few days. The app aligns them into a time-lapse and AI estimates canopy & biomass change.
              </p>
            </div>
          )}
          {current && (
            <div className="absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
              {new Date(current.takenAt).toLocaleDateString()} · {playIndex + 1}/{frames.length}
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button onClick={() => cameraRef.current?.click()} className="h-14 text-base">
            📷 Capture
          </Button>
          <Button onClick={() => fileRef.current?.click()} variant="secondary" className="h-14 text-base">
            🖼️ Upload
          </Button>
        </div>

        {frames.length >= 2 && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => {
                setPlaying((p) => !p);
                if (!playing) setPlayIndex(0);
              }}
            >
              {playing ? "⏸ Pause" : "▶ Play time-lapse"}
            </Button>
            <Button onClick={runAnalysis} disabled={analyzing} className="h-12">
              {analyzing ? "Analyzing…" : "🌱 Analyze growth"}
            </Button>
          </div>
        )}
      </section>

      {analysis && (
        <section className="space-y-4 px-5 pt-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Growth analysis</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge className="capitalize">{analysis.growthStage}</Badge>
              <Badge variant="outline" className="capitalize">{analysis.healthTrend}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric label="Canopy" value={`${analysis.canopyCoverChange > 0 ? "+" : ""}${analysis.canopyCoverChange.toFixed(0)}%`} />
              <Metric label="Biomass" value={`${analysis.biomassChange > 0 ? "+" : ""}${analysis.biomassChange.toFixed(0)}%`} />
              <Metric label="Height" value={`${analysis.heightChange > 0 ? "+" : ""}${analysis.heightChange.toFixed(0)}%`} />
            </div>
          </div>
          {analysis.observations.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 font-bold">🔍 Observations</h3>
              <ul className="space-y-1.5 text-sm">
                {analysis.observations.map((o, i) => (
                  <li key={i} className="flex gap-2"><span>•</span><span>{o}</span></li>
                ))}
              </ul>
            </div>
          )}
          {analysis.recommendations.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 font-bold">💡 Recommendations</h3>
              <ul className="space-y-1.5 text-sm">
                {analysis.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2"><span>•</span><span>{r}</span></li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {frames.length > 0 && (
        <section className="px-5 pt-6 pb-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-bold">Photo timeline</h3>
            <button onClick={clearAll} className="text-xs text-destructive">Clear all</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {frames.map((f, i) => (
              <button
                key={f.id}
                onClick={() => {
                  setPlaying(false);
                  setPlayIndex(i);
                }}
                className={`group relative aspect-square overflow-hidden rounded-xl border ${
                  i === playIndex ? "border-primary ring-2 ring-primary/40" : "border-border"
                }`}
              >
                <img src={f.dataUrl} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-1 left-1 rounded bg-background/80 px-1 text-[10px]">
                  {new Date(f.takenAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFrame(f.id);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-background/90 px-1.5 text-[10px] opacity-0 group-hover:opacity-100"
                  role="button"
                >✕</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}