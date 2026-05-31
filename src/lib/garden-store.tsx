import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { toast } from "sonner";
import { PLANT_PRESETS, type PlantPreset } from "./plant-presets";
import { ACHIEVEMENTS, type Achievement } from "./achievements";

export type Automation = {
  id: string;
  name: string;
  description: string;
  time: string;
  emoji: string;
  enabled: boolean;
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "warning" | "info";
  emoji: string;
};

export type Tip = {
  id: string;
  title: string;
  body: string;
  category: "Growth" | "Care" | "Environment";
  emoji: string;
};

export type Zone = {
  id: string;
  name: string;
  emoji: string;
  location: string;
  moisture: number;
  temperature: number;
  light: number;
  health: number;
};

export type RuleCondition = {
  metric: "moisture" | "temperature" | "light" | "healthScore";
  op: "<" | ">" | "=";
  value: number;
};
export type RuleAction =
  | { type: "water" }
  | { type: "lights"; on: boolean }
  | { type: "alert"; message: string };
export type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  conditions: RuleCondition[];
  logic: "AND" | "OR";
  actions: RuleAction[];
  lastFired?: number;
};

export type Reading = {
  t: number;
  moisture: number;
  temperature: number;
  light: number;
  health: number;
};

export type AchievementContext = {
  waterCount: number;
  waterSavedMl: number;
  lightHours: number;
  healthScore: number;
  zoneCount: number;
  ruleCount: number;
};

type State = {
  plantName: string;
  location: string;
  species: string;
  plantedOn: string;
  healthScore: number;
  moisture: number;
  temperature: number;
  light: number;
  lightsOn: boolean;
  lightBrightness: number;
  lastWatered: string;
  lightHours: number;
  automations: Automation[];
  alerts: Alert[];
  tips: Tip[];
  settings: Settings;
  zones: Zone[];
  activeZoneId: string;
  rules: Rule[];
  history: Reading[];
  waterCount: number;
  waterSavedMl: number;
  preset: PlantPreset;
  achievements: Achievement[];
  achievementCtx: AchievementContext;
  nextWaterEtaMs: number | null;
  humidityForecast: number;
  weatherSummary: string;
  waterNow: () => void;
  toggleLights: () => void;
  setBrightness: (n: number) => void;
  toggleAutomation: (id: string) => void;
  addAutomation: (a: Omit<Automation, "id" | "enabled">) => void;
  dismissAlert: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  renamePlant: (name: string, location: string) => void;
  applyPreset: (id: string) => void;
  addZone: (z: Omit<Zone, "id">) => void;
  removeZone: (id: string) => void;
  selectZone: (id: string) => void;
  saveRule: (r: Omit<Rule, "id" | "lastFired"> & { id?: string }) => void;
  toggleRule: (id: string) => void;
  removeRule: (id: string) => void;
  exportHistory: (format: "csv" | "json") => void;
};

export type Settings = {
  notifications: boolean;
  pushAlerts: boolean;
  emailDigest: boolean;
  units: "metric" | "imperial";
  theme: "light" | "dark";
  awayMode: boolean;
};

const Ctx = createContext<State | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [moisture, setMoisture] = useState(54);
  const [lightsOn, setLightsOn] = useState(true);
  const [lightBrightness, setLightBrightness] = useState(75);
  // Track watering as a timestamp so "last watered" updates live.
  const [lastWateredAt, setLastWateredAt] = useState<number>(
    () => Date.now() - 2 * 24 * 60 * 60 * 1000,
  );
  // Accumulated light-on hours for today (live, increments while lights are on).
  const [lightHours, setLightHours] = useState<number>(6.5);
  const [now, setNow] = useState<number>(() => Date.now());
  const [plantName, setPlantName] = useState("Luna's Planter");
  const [location, setLocation] = useState("Indoor Garden");
  const [preset, setPreset] = useState<PlantPreset>(PLANT_PRESETS[0]);
  const [waterCount, setWaterCount] = useState(0);
  const [waterSavedMl, setWaterSavedMl] = useState(0);
  // Live weather (Open-Meteo, no API key required). Defaults are deterministic
  // so SSR and first client render match; real values arrive after fetch.
  const [humidityForecast, setHumidityForecast] = useState(55);
  const [weatherSummary, setWeatherSummary] = useState("Fetching weather…");
  const [outdoorTempC, setOutdoorTempC] = useState<number | null>(null);
  const [precipProb, setPrecipProb] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    const codeToText = (c: number): string => {
      if (c === 0) return "Clear sky";
      if ([1, 2].includes(c)) return "Mainly clear";
      if (c === 3) return "Overcast";
      if ([45, 48].includes(c)) return "Foggy";
      if ([51, 53, 55].includes(c)) return "Drizzle";
      if ([61, 63, 65, 80, 81, 82].includes(c)) return "Rain";
      if ([71, 73, 75, 77, 85, 86].includes(c)) return "Snow";
      if ([95, 96, 99].includes(c)) return "Thunderstorm";
      return "Mild";
    };

    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,relative_humidity_2m,weather_code,precipitation` +
          `&hourly=relative_humidity_2m,precipitation_probability&forecast_days=1&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("weather fetch failed");
        const json = await res.json();
        if (cancelled) return;
        const tempC = Math.round(json?.current?.temperature_2m ?? 22);
        const humNow = Math.round(json?.current?.relative_humidity_2m ?? 55);
        const code = Number(json?.current?.weather_code ?? 1);
        const hums: number[] = json?.hourly?.relative_humidity_2m ?? [];
        const pops: number[] = json?.hourly?.precipitation_probability ?? [];
        const avgHum = hums.length
          ? Math.round(hums.slice(0, 12).reduce((a, b) => a + b, 0) / Math.min(12, hums.length))
          : humNow;
        const maxPop = pops.length ? Math.max(...pops.slice(0, 12)) : 0;
        setOutdoorTempC(tempC);
        setHumidityForecast(avgHum);
        setPrecipProb(maxPop);
        setWeatherSummary(`${codeToText(code)}, ${tempC}°C`);
      } catch {
        if (!cancelled) setWeatherSummary("Weather unavailable");
      }
    };

    const start = (lat: number, lon: number) => {
      fetchWeather(lat, lon);
      const id = setInterval(() => fetchWeather(lat, lon), 15 * 60 * 1000);
      return id;
    };

    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          intervalId = start(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          intervalId = start(40.7128, -74.006); // fallback: New York
        },
        { timeout: 5000 },
      );
    } else {
      intervalId = start(40.7128, -74.006);
    }

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
  const [history, setHistory] = useState<Reading[]>([]);
  const [zones, setZones] = useState<Zone[]>([
    { id: "z1", name: "Living Room", emoji: "🛋️", location: "Indoor", moisture: 54, temperature: 23, light: 780, health: 92 },
    { id: "z2", name: "Greenhouse", emoji: "🏡", location: "Backyard", moisture: 68, temperature: 26, light: 1450, health: 88 },
    { id: "z3", name: "Balcony", emoji: "🌇", location: "Outdoor", moisture: 38, temperature: 21, light: 1100, health: 74 },
  ]);
  const [activeZoneId, setActiveZoneId] = useState("z1");
  const [rules, setRules] = useState<Rule[]>([
    {
      id: "r1",
      name: "Heat Stress Misting",
      enabled: true,
      logic: "AND",
      conditions: [
        { metric: "temperature", op: ">", value: 28 },
        { metric: "moisture", op: "<", value: 50 },
      ],
      actions: [{ type: "alert", message: "Misting fan engaged for 5 min" }, { type: "water" }],
    },
    {
      id: "r2",
      name: "Low Light Boost",
      enabled: false,
      logic: "OR",
      conditions: [{ metric: "light", op: "<", value: 400 }],
      actions: [{ type: "lights", on: true }],
    },
  ]);
  const [settings, setSettings] = useState<Settings>({
    notifications: true,
    pushAlerts: true,
    emailDigest: false,
    units: "metric",
    theme: "light",
    awayMode: false,
  });
  const [automations, setAutomations] = useState<Automation[]>([
    { id: "1", name: "Morning Light", description: "Turn on grow lights", time: "7:00 AM", emoji: "🌅", enabled: true },
    { id: "2", name: "Evening Water", description: "Auto-water if soil dry", time: "6:00 PM", emoji: "💧", enabled: true },
    { id: "3", name: "Night Mode", description: "Turn off grow lights", time: "10:00 PM", emoji: "🌙", enabled: true },
    { id: "4", name: "Weekly Feed", description: "Nutrient reminder", time: "Every Sunday", emoji: "🧪", enabled: false },
  ]);

  // Tick every second so derived values (last watered, light hours) update live.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Soil dries slowly over time (~1% per minute) so watering visibly changes things.
  useEffect(() => {
    const id = setInterval(() => {
      setMoisture((m) => Math.max(15, m - 1));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Accumulate light hours while grow lights are on.
  useEffect(() => {
    if (!lightsOn) return;
    const id = setInterval(() => {
      setLightHours((h) => Math.min(24, +(h + 1 / 3600).toFixed(2)));
    }, 1000);
    return () => clearInterval(id);
  }, [lightsOn]);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: "a1", title: "Water Level Low", description: "Reservoir at 32%. Refill recommended.", time: "2 hours ago", type: "warning", emoji: "⚠️" },
    { id: "a2", title: "Grow Light Schedule", description: "Lights will turn on in 30 minutes", time: "30 min", type: "info", emoji: "💡" },
  ]);

  const tips: Tip[] = [
    { id: "t1", title: "Optimal Growth Tip", category: "Growth", emoji: "🌱", body: "Your plant is entering its growth phase. Consider increasing light exposure by 1 hour daily for the next 2 weeks." },
    { id: "t2", title: "Watering Best Practice", category: "Care", emoji: "💧", body: "Water in the morning to reduce evaporation and prevent fungal growth. Your current 7 AM schedule is ideal!" },
    { id: "t3", title: "Temperature Alert", category: "Environment", emoji: "🌡️", body: "Nighttime temps dropping to 18°C. Consider moving your planter away from the window or adding insulation." },
  ];

  const waterNow = useCallback(() => {
    setMoisture((m) => Math.min(100, m + 25));
    setLastWateredAt(Date.now());
    setWaterCount((c) => c + 1);
    // Precision drip ~250ml vs traditional ~1000ml -> 750ml saved per event.
    setWaterSavedMl((ml) => ml + 750);
    toast.success("💧 Watering started", { description: "Pump activated for Luna's Planter" });
  }, []);

  const toggleLights = useCallback(() => {
    setLightsOn((v) => {
      toast(v ? "Grow lights turned off" : "💡 Grow lights turned on");
      return !v;
    });
  }, []);

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((list) => list.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  }, []);

  const addAutomation = useCallback((a: Omit<Automation, "id" | "enabled">) => {
    setAutomations((list) => [...list, { ...a, id: crypto.randomUUID(), enabled: true }]);
    toast.success("Automation created");
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((list) => list.filter((a) => a.id !== id));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const renamePlant = useCallback((name: string, loc: string) => {
    setPlantName(name);
    setLocation(loc);
    toast.success("Plant updated");
  }, []);

  const setBrightness = useCallback((n: number) => setLightBrightness(n), []);

  // Live "x ago" label, recomputed on every tick.
  const lastWatered = useMemo(() => formatAgo(now - lastWateredAt), [now, lastWateredAt]);

  // Health derives from moisture + light state so it reacts to user actions.
  const healthScore = useMemo(() => {
    const moistureScore = 100 - Math.abs(60 - moisture) * 1.2; // ideal ~60%
    const lightScore = lightsOn ? 90 + (lightBrightness - 50) * 0.1 : 70;
    const raw = moistureScore * 0.6 + lightScore * 0.4;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }, [moisture, lightsOn, lightBrightness]);

  // Predictive watering ETA — combines current moisture with live weather:
  // humidity slows drying, heat speeds it up, and a high rain probability
  // pushes the next watering further out (assume nature handles outdoor zones).
  const nextWaterEtaMs = useMemo(() => {
    const target = preset.ranges.moisture[0]; // lower bound of ideal range
    if (moisture <= target) return 0;
    const humidityFactor = Math.max(0.5, 1 - (humidityForecast - 40) / 100);
    const tempC = outdoorTempC ?? 22;
    const heatFactor = (lightsOn ? 1.25 : 1) * (1 + Math.max(0, tempC - 22) * 0.03);
    const rainFactor = Math.max(0.3, 1 - precipProb / 150); // 100% pop ≈ 0.33x drying
    const ratePerMin = 1 * humidityFactor * heatFactor * rainFactor;
    const minsLeft = (moisture - target) / ratePerMin;
    return Math.round(minsLeft * 60_000);
  }, [moisture, preset, humidityForecast, lightsOn, outdoorTempC, precipProb]);

  // Record a sensor history sample every 30s so users can export trends.
  useEffect(() => {
    const id = setInterval(() => {
      setHistory((h) => {
        const next = [
          ...h,
          { t: Date.now(), moisture, temperature: 23, light: 780, health: healthScore },
        ];
        return next.slice(-288); // ~24h at 5min granularity if 30s -> trim to last 288
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [moisture, healthScore]);

  // Rule engine: evaluate rules every 15s, fire actions when conditions met (cooldown 2 min).
  useEffect(() => {
    const evaluate = () => {
      const snap: Record<RuleCondition["metric"], number> = {
        moisture,
        temperature: 23,
        light: 780,
        healthScore,
      };
      setRules((list) =>
        list.map((r) => {
          if (!r.enabled) return r;
          const ok = r.conditions.map((c) => {
            const v = snap[c.metric];
            if (c.op === "<") return v < c.value;
            if (c.op === ">") return v > c.value;
            return Math.abs(v - c.value) < 0.5;
          });
          const fire = r.logic === "AND" ? ok.every(Boolean) : ok.some(Boolean);
          if (!fire) return r;
          if (r.lastFired && Date.now() - r.lastFired < 120_000) return r;
          // Execute actions.
          for (const a of r.actions) {
            if (a.type === "water") waterNow();
            if (a.type === "lights") setLightsOn(a.on);
            if (a.type === "alert") {
              toast("🤖 Rule fired", { description: `${r.name}: ${a.message}` });
            }
          }
          return { ...r, lastFired: Date.now() };
        }),
      );
    };
    const id = setInterval(evaluate, 15_000);
    return () => clearInterval(id);
  }, [moisture, healthScore, waterNow]);

  const applyPreset = useCallback((id: string) => {
    const p = PLANT_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setPreset(p);
    toast.success(`Loaded preset: ${p.name}`, { description: p.notes });
  }, []);

  const addZone = useCallback((z: Omit<Zone, "id">) => {
    setZones((list) => [...list, { ...z, id: crypto.randomUUID() }]);
    toast.success(`Zone "${z.name}" added`);
  }, []);
  const removeZone = useCallback((id: string) => {
    setZones((list) => list.filter((z) => z.id !== id));
  }, []);
  const selectZone = useCallback((id: string) => setActiveZoneId(id), []);

  const saveRule = useCallback((r: Omit<Rule, "id" | "lastFired"> & { id?: string }) => {
    setRules((list) => {
      if (r.id) return list.map((x) => (x.id === r.id ? { ...x, ...r, id: x.id } : x));
      return [...list, { ...r, id: crypto.randomUUID(), enabled: true }];
    });
    toast.success(r.id ? "Rule updated" : "Rule created");
  }, []);
  const toggleRule = useCallback((id: string) => {
    setRules((list) => list.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }, []);
  const removeRule = useCallback((id: string) => {
    setRules((list) => list.filter((r) => r.id !== id));
  }, []);

  const exportHistory = useCallback(
    (format: "csv" | "json") => {
      const rows = history.length
        ? history
        : [{ t: Date.now(), moisture, temperature: 23, light: 780, health: healthScore }];
      let blob: Blob;
      let filename: string;
      if (format === "csv") {
        const header = "timestamp,moisture,temperature,light,health";
        const body = rows
          .map((r) => `${new Date(r.t).toISOString()},${r.moisture},${r.temperature},${r.light},${r.health}`)
          .join("\n");
        blob = new Blob([header + "\n" + body], { type: "text/csv" });
        filename = `garden-history-${Date.now()}.csv`;
      } else {
        blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
        filename = `garden-history-${Date.now()}.json`;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} samples`);
    },
    [history, moisture, healthScore],
  );

  const achievementCtx: AchievementContext = {
    waterCount,
    waterSavedMl,
    lightHours,
    healthScore,
    zoneCount: zones.length,
    ruleCount: rules.length,
  };

  const value: State = {
    plantName,
    location,
    species: "Pothos (Epipremnum aureum)",
    plantedOn: "March 14, 2025",
    healthScore,
    moisture,
    temperature: 23,
    light: 780,
    lightsOn,
    lightBrightness,
    lastWatered,
    lightHours,
    automations,
    alerts,
    tips,
    settings,
    zones,
    activeZoneId,
    rules,
    history,
    waterCount,
    waterSavedMl,
    preset,
    achievements: ACHIEVEMENTS,
    achievementCtx,
    nextWaterEtaMs,
    humidityForecast,
    weatherSummary,
    waterNow,
    toggleLights,
    setBrightness,
    toggleAutomation,
    addAutomation,
    dismissAlert,
    updateSettings,
    renamePlant,
    applyPreset,
    addZone,
    removeZone,
    selectZone,
    saveRule,
    toggleRule,
    removeRule,
    exportHistory,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGarden() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGarden must be used within GardenProvider");
  return ctx;
}

function formatAgo(ms: number): string {
  if (ms < 5_000) return "just now";
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const days = Math.floor(hr / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}