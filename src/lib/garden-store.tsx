import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
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
  healthScore: number;
  moisture: number;
  temperature: number;
  light: number;
  lightsOn: boolean;
  lastWatered: string;
  lightHours: number;
  automations: Automation[];
  alerts: Alert[];
  tips: Tip[];
  waterNow: () => void;
  toggleLights: () => void;
  toggleAutomation: (id: string) => void;
  addAutomation: (a: Omit<Automation, "id" | "enabled">) => void;
  dismissAlert: (id: string) => void;
};

const Ctx = createContext<State | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [moisture, setMoisture] = useState(54);
  const [lightsOn, setLightsOn] = useState(true);
  const [lastWatered, setLastWatered] = useState("2 days ago");
  const [healthScore, setHealthScore] = useState(92);
  const [automations, setAutomations] = useState<Automation[]>([
    { id: "1", name: "Morning Light", description: "Turn on grow lights", time: "7:00 AM", emoji: "🌅", enabled: true },
    { id: "2", name: "Evening Water", description: "Auto-water if soil dry", time: "6:00 PM", emoji: "💧", enabled: true },
    { id: "3", name: "Night Mode", description: "Turn off grow lights", time: "10:00 PM", emoji: "🌙", enabled: true },
    { id: "4", name: "Weekly Feed", description: "Nutrient reminder", time: "Every Sunday", emoji: "🧪", enabled: false },
  ]);
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
    setLastWatered("just now");
    setHealthScore((h) => Math.min(100, h + 1));
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

  const value: State = {
    plantName: "Luna's Planter",
    location: "Indoor Garden",
    healthScore,
    moisture,
    temperature: 23,
    light: 780,
    lightsOn,
    lastWatered,
    lightHours: 6.5,
    automations,
    alerts,
    tips,
    waterNow,
    toggleLights,
    toggleAutomation,
    addAutomation,
    dismissAlert,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGarden() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGarden must be used within GardenProvider");
  return ctx;
}