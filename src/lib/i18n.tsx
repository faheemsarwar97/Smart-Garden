import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ur";

const dict = {
  en: {
    // nav
    nav_home: "Home",
    nav_status: "Status",
    nav_chat: "Chat",
    nav_auto: "Auto",
    nav_alerts: "Alerts",
    // home
    app_title: "Smart Garden",
    all_zones: "All zones",
    zones_switch: "zones · tap to switch",
    view_plant_details: "View Plant Details",
    health_score: "Health Score",
    predictive_watering: "Predictive Watering",
    humidity: "humidity",
    next_watering: "Next watering",
    quick_actions: "Quick Actions",
    scan_leaf: "Scan Leaf for Diagnosis",
    growth_timelapse: "Growth Time-Lapse",
    water_now: "Water Now",
    toggle_lights: "Toggle Grow Lights",
    water_saved: "Water Saved",
    vs_traditional: "vs traditional watering",
    precision_events: "precision events",
    todays_activity: "Today's Activity",
    last_watered: "Last Watered",
    light_time: "Light Time",
    hours: "hours",
    // settings
    settings: "Settings",
    notifications: "Notifications",
    enable_notifications: "Enable notifications",
    enable_notifications_sub: "Master toggle for all alerts",
    push_alerts: "Push alerts",
    push_alerts_sub: "Real-time plant warnings",
    weekly_digest: "Weekly email digest",
    weekly_digest_sub: "Summary every Monday",
    preferences: "Preferences",
    units: "Units",
    metric: "Metric",
    imperial: "Imperial",
    away_mode: "Away mode",
    away_mode_sub: "Pause manual reminders while traveling",
    language: "Language",
    language_sub: "Choose your preferred language",
    plant: "Plant",
    tap_edit: "Tap to edit details",
    about: "About",
    version: "Version",
    privacy: "Privacy Policy",
    help: "Help & Support",
    sign_out: "Sign Out",
  },
  ur: {
    nav_home: "ہوم",
    nav_status: "اسٹیٹس",
    nav_chat: "چیٹ",
    nav_auto: "خودکار",
    nav_alerts: "الرٹس",
    app_title: "اسمارٹ گارڈن",
    all_zones: "تمام زون",
    zones_switch: "زون · تبدیل کرنے کے لیے دبائیں",
    view_plant_details: "پودے کی تفصیلات",
    health_score: "صحت کا اسکور",
    predictive_watering: "پیش گوئی شدہ آبپاشی",
    humidity: "نمی",
    next_watering: "اگلی آبپاشی",
    quick_actions: "فوری اعمال",
    scan_leaf: "پتے کی تشخیص اسکین کریں",
    growth_timelapse: "نمو ٹائم لیپس",
    water_now: "ابھی پانی دیں",
    toggle_lights: "گرو لائٹس آن/آف",
    water_saved: "بچایا گیا پانی",
    vs_traditional: "روایتی آبپاشی کے مقابلے",
    precision_events: "درست واقعات",
    todays_activity: "آج کی سرگرمی",
    last_watered: "آخری بار پانی دیا",
    light_time: "روشنی کا وقت",
    hours: "گھنٹے",
    settings: "سیٹنگز",
    notifications: "اطلاعات",
    enable_notifications: "اطلاعات فعال کریں",
    enable_notifications_sub: "تمام الرٹس کا ماسٹر سوئچ",
    push_alerts: "پش الرٹس",
    push_alerts_sub: "پودوں کی ریئل ٹائم وارننگز",
    weekly_digest: "ہفتہ وار ای میل خلاصہ",
    weekly_digest_sub: "ہر پیر کو خلاصہ",
    preferences: "ترجیحات",
    units: "اکائیاں",
    metric: "میٹرک",
    imperial: "امپیریل",
    away_mode: "دور موڈ",
    away_mode_sub: "سفر کے دوران یاد دہانیاں روکیں",
    language: "زبان",
    language_sub: "اپنی پسندیدہ زبان منتخب کریں",
    plant: "پودا",
    tap_edit: "ترمیم کے لیے دبائیں",
    about: "بارے میں",
    version: "ورژن",
    privacy: "رازداری کی پالیسی",
    help: "مدد و سپورٹ",
    sign_out: "سائن آؤٹ",
  },
} as const;

export type TKey = keyof typeof dict["en"];

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved === "en" || saved === "ur") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch {}
  };

  const dir: "ltr" | "rtl" = lang === "ur" ? "rtl" : "ltr";
  const t = (k: TKey) => dict[lang][k] ?? dict.en[k];

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      <div dir={dir} lang={lang}>{children}</div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}