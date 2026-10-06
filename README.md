# 🌱 Smart Garden

> Intelligent Plant Monitoring & Care Dashboard | AI-Powered Garden Assistant | Real-Time Health Tracking

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Open%20Source-blue?style=flat-square)](#license)

<div align="center">
  <p><strong>Take the guesswork out of plant care with smart monitoring, predictive insights, and AI recommendations.</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>

---

## ✨ Overview

**Smart Garden** is a production-ready dashboard application for modern plant care. Whether managing a single houseplant or a complete indoor garden, Smart Garden provides real-time health monitoring, predictive watering recommendations, and an AI-powered assistant to help you make informed care decisions.

Built for precision plant management with a focus on sustainability and ease of use.

---

## 🎯 Features

### 📊 Dashboard & Monitoring
- **Real-time Plant Health Score** — Visual indicator of overall plant wellness
- **Live Environmental Metrics** — Moisture %, Temperature °C, Light Levels (lux)
- **Quick-Glance Overview** — All critical info on one screen
- **Multi-Zone Support** — Manage multiple garden zones seamlessly

### 🤖 AI-Powered Assistant
- **Context-Aware Chat** — AI reads your live dashboard data
- **Smart Recommendations** — Get watering and care advice
- **Natural Language** — Ask questions in plain English
- **Instant Answers** — Powered by server-side AI functions

### 💧 Smart Watering
- **Predictive Watering** — AI predicts when to water based on soil & weather
- **One-Tap Watering** — Manual water now button for quick action
- **Water Usage Tracking** — See liters saved vs. traditional methods
- **ETA Countdown** — Know exactly when next watering is due

### ☀️ Lighting Control
- **Grow Light Management** — Toggle grow lights on/off
- **Brightness Adjustment** — Fine-tune light intensity (0-100%)
- **Light Hour Tracking** — Monitor daily light exposure
- **Preset Configurations** — Species-specific light presets

### 🔔 Alerts & Automation
- **Smart Alerts** — Get notified of plant health issues
- **Automation Rules** — Set up automatic actions and schedules
- **Status Page** — Monitor all active alerts and conditions
- **Rules Engine** — Create custom care routines

### 📈 Growth & Insights
- **Growth Timelapse** — Capture and track plant growth over time
- **Achievement Badges** — Celebrate milestones and care goals
- **Activity Log** — See today's care events and history
- **Analytics Dashboard** — Long-term health trends

### 🌿 Plant Management
- **Plant Presets** — 20+ plant species with ideal ranges
  - Moisture, Temperature, Light, Light Hours
  - Auto-configure for optimal care
- **Custom Plant Setup** — Name, location, planting date
- **Species Info** — Care notes and requirements
- **Photo Scanning** — AI leaf health analysis

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ or **Bun** 1.0+
- npm, yarn, or Bun

### Installation

```bash
# Clone the repository
git clone https://github.com/faheemsarwar97/Smart-Garden.git
cd Smart-Garden

# Install dependencies
npm install
# or with Bun
bun install
```

### Run Locally

```bash
# Start development server
npm run dev
# or with Bun
bun run dev
```

The app opens at `http://localhost:5173`

### Production Build

```bash
npm run build       # Build for production
npm run preview     # Preview production build
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|---------------|
| **UI Framework** | React 19 • TypeScript 5.8 |
| **Build Tool** | Vite 7 • Tailwind CSS 4 |
| **Routing** | TanStack Router 1.168 |
| **State & Data** | TanStack Query 5.83 |
| **Components** | Radix UI • shadcn/ui Pattern |
| **Forms** | React Hook Form • Zod |
| **Charts** | Recharts 2.15 |
| **Notifications** | Sonner |
| **Backend** | Cloudflare Workers • Nitro |
| **Package Manager** | Bun |
| **Code Quality** | ESLint 9 • Prettier 3 |

---

## 📁 Project Structure

```
Smart-Garden/
├── src/
│   ├── components/
│   │   └── ui/                    # Radix UI-based components
│   ├── hooks/                     # Custom React hooks
│   ├── lib/
│   │   ├── garden-store.ts        # Global garden state
│   │   ├── i18n.ts                # Internationalization
│   │   ├── chat.functions.ts      # AI assistant logic
│   │   └── plant-presets.ts       # 20+ plant configs
│   ├── routes/                    # Page components
│   │   ├── __root.tsx             # Root layout
│   │   ├── index.tsx              # Dashboard home
│   │   ├── plant.tsx              # Plant details & config
│   │   ├── chat.tsx               # AI assistant
│   │   ├── scan.tsx               # Leaf health scan
│   │   ├── growth.tsx             # Growth tracking
│   │   ├── alerts.tsx             # Alert management
│   │   ├── automations.tsx        # Automation rules
│   │   ├── zones.tsx              # Multi-zone management
│   │   ├── status.tsx             # Health status overview
│   │   ├── achievements.tsx       # Badges & milestones
│   │   ├── rules.tsx              # Advanced rules
│   │   └── settings.tsx           # App settings
│   ├── router.tsx                 # Router config
│   ├── server.ts                  # Server setup
│   ├── start.ts                   # App entry point
│   └── styles.css                 # Global styles
├── public/                        # Static assets
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript config
├── wrangler.jsonc                 # Cloudflare config
├── components.json                # UI components registry
└── package.json
```

---

## 🏗️ Architecture

### State Management
- **Garden Store** (`lib/garden-store.ts`) — Single source of truth for all garden data
- **useGarden() Hook** — Access garden state anywhere in the app
- **TanStack Query** — Server state sync and caching

### Routing
- **File-based Routes** — TanStack Router auto-generates routes
- **Nested Layouts** — Shared header/nav across pages
- **Type-Safe Links** — Compile-time route safety

### Internationalization
- **useI18n() Hook** — Multi-language support built-in
- **Translation Keys** — Semantic, readable translation strings

### AI Integration
- **Server Functions** — `askGardenAi()` runs on backend
- **Context-Aware** — AI has access to live plant metrics
- **Real-time Streaming** — Chat updates in real-time

---

## 🎨 Key Screens

| Screen | Purpose |
|--------|---------|
| **Home Dashboard** | Plant overview, health score, quick actions |
| **Plant Details** | Species config, light controls, presets |
| **Garden Assistant** | AI chat with context-aware recommendations |
| **Growth Timelapse** | Photo-based growth tracking |
| **Leaf Scanner** | AI-powered plant health analysis |
| **Alerts** | Notifications and warning management |
| **Automations** | Schedule rules and auto-actions |
| **Zones** | Manage multiple garden areas |
| **Status** | System health and condition overview |
| **Achievements** | Badges and care milestones |
| **Settings** | App preferences and configuration |

---

## 💡 Usage Examples

### Check Plant Health
1. Open dashboard
2. View health score and live metrics
3. See predictive watering countdown

### Get AI Recommendations
1. Go to **Garden Assistant**
2. Ask: "Is my plant healthy?" or "When should I water?"
3. Receive contextual AI advice

### Configure Plant Species
1. Navigate to **Plant Details**
2. Select from 20+ plant presets
3. Auto-configures ideal ranges for moisture, temp, light

### Set Up Automations
1. Go to **Automations**
2. Create new automation rule
3. Define schedule and action

---

## 🔐 Security & Performance

- **TypeScript Strict Mode** — Type safety throughout
- **Server-Side Rendering Ready** — TanStack Start integration
- **Edge Deployment** — Optimized for Cloudflare Workers
- **Responsive Design** — Mobile-first approach
- **Fast Load Times** — Vite + optimized bundle

---

## 📊 Language Composition

- TypeScript: **97.7%**
- CSS: **1.9%**
- JavaScript: **0.4%**

---

## 🚀 Deployment

### Cloudflare Workers
The project includes `wrangler.jsonc` for edge deployment:

```bash
wrangler deploy
```

### Traditional Hosting
```bash
npm run build
# Deploy dist/ to your hosting provider
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Quality
- Run `npm run lint` for ESLint checks
- Run `npm run format` for Prettier formatting
- Ensure TypeScript types are correct

---

## 🗺️ Roadmap

- [ ] Real IoT sensor integration (moisture probes, temp sensors)
- [ ] Plant image recognition API
- [ ] Advanced analytics dashboards
- [ ] Export data (CSV, PDF reports)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] REST API backend
- [ ] Dark mode theme
- [ ] Multi-language support enhancement
- [ ] Community plant database

---

## 📝 License

This project is open source. To distribute or publish publicly, consider adding an appropriate license:
- MIT (permissive, recommended)
- Apache 2.0
- GPL 3.0

---

## 🙋 Support & Questions

- **Found a bug?** Open an [issue](https://github.com/faheemsarwar97/Smart-Garden/issues)
- **Have a feature idea?** Start a [discussion](https://github.com/faheemsarwar97/Smart-Garden/discussions)
- **Need help?** Check the [wiki](https://github.com/faheemsarwar97/Smart-Garden/wiki) (coming soon)

---

## 🙌 Acknowledgments

- [React](https://react.dev) — UI library
- [Vite](https://vitejs.dev) — Lightning-fast build tool
- [Tailwind CSS](https://tailwindcss.com) — Utility-first CSS
- [TanStack](https://tanstack.com) — Router & Query
- [Radix UI](https://www.radix-ui.com) — Primitives
- [Recharts](https://recharts.org) — Data visualization
- [Cloudflare](https://cloudflare.com) — Edge computing

---

## 👨‍💻 Author

**Muhammad Faheem Sarwar**

- GitHub: [@faheemsarwar97](https://github.com/faheemsarwar97)
- Repository: [Smart-Garden](https://github.com/faheemsarwar97/Smart-Garden)

---

<div align="center">
  <p><strong>Built with 💚 for plant lovers and developers</strong></p>
  <p>If you find this project helpful, please consider giving it a ⭐</p>
</div>
