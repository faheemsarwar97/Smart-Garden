import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { toast } from "sonner";

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
  waterNow: () => void;
  toggleLights: () => void;
  setBrightness: (n: number) => void;
  toggleAutomation: (id: string) => void;
  addAutomation: (a: Omit<Automation, "id" | "enabled">) => void;
  dismissAlert: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  renamePlant: (name: string, location: string) => void;
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
    waterNow,
    toggleLights,
    setBrightness,
    toggleAutomation,
    addAutomation,
    dismissAlert,
    updateSettings,
    renamePlant,
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