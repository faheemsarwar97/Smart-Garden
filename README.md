# Smart Garden

A modern smart gardening dashboard for monitoring plant health, automations, alerts, and watering recommendations in one place.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Wrangler-orange?style=for-the-badge&logo=cloudflare)](https://developers.cloudflare.com/workers)

Smart Garden is a responsive web application designed for plant enthusiasts and home growers who want a clear view of their garden health. It provides real-time monitoring, quick actions, predictive watering guidance, and an AI-powered assistant to help users make better care decisions.

## Features

- Plant health overview with live metrics
- Moisture, temperature, and light monitoring
- Predictive watering insights
- Plant detail management and presets
- Grow light controls and brightness adjustments
- Automations and alert management
- Garden zones and tracking
- AI-powered garden assistant
- Growth and achievement tracking
- Clean, mobile-friendly dashboard UI

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router
- TanStack Query
- Radix UI
- Recharts
- Cloudflare Workers / Wrangler
- ESLint + Prettier

## Project Structure

```text
Smart-Garden/
├── src/
│   ├── components/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── plant.tsx
│   │   ├── status.tsx
│   │   ├── scan.tsx
│   │   ├── chat.tsx
│   │   ├── alerts.tsx
│   │   ├── automations.tsx
│   │   ├── growth.tsx
│   │   ├── achievements.tsx
│   │   ├── zones.tsx
│   │   ├── rules.tsx
│   │   ├── settings.tsx
│   │   └── ...
│   ├── router.tsx
│   ├── routeTree.gen.ts
│   ├── server.ts
│   ├── start.ts
│   ├── styles.css
│   └── ...
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc
├── components.json
├── eslint.config.js
├── .prettierrc
├── .prettierignore
├── .gitignore
├── bun.lock
└── README.md
```

## Key Screens and Views

The app includes a set of route-based dashboard screens such as:

- Home dashboard
- Plant details
- Garden status
- Growth tracking
- Alerts and notifications
- Automation rules
- Garden assistant chat
- Zones management
- Settings
- Achievements

## Local Development

### Prerequisites

- Node.js 18+
- Bun or npm

### Install dependencies

```bash
npm install
```

or

```bash
bun install
```

### Start the app

```bash
npm run dev
```

or

```bash
bun run dev
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Available Scripts

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run format
```

## Architecture Overview

The application follows a modular frontend architecture built with modern React patterns:

- Route-based screens under `src/routes`
- Reusable UI primitives under `src/components/ui`
- Shared logic and utilities under `src/lib`
- Server actions and app bootstrap in `src/server.ts` and `src/start.ts`
- Global styling via `src/styles.css`

## AI Assistant

The app includes a garden assistant experience powered by server-side AI functions. It uses current garden context such as health score, soil moisture, temperature, and active automations to answer user questions and provide recommendations.

## Deployment

This project is configured for a Cloudflare-based deployment setup using `wrangler.jsonc`, making it suitable for a lightweight edge-hosted frontend deployment workflow.

## Roadmap

Planned enhancements may include:

- real sensor integrations
- plant database and recognition
- richer analytics dashboards
- mobile-first refinements
- notification integrations
- expanded AI recommendations

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

This project is currently provided as an open-source codebase without a specific license file. If you plan to distribute or publish it publicly, consider adding an appropriate license such as MIT.

## Author

Muhammad Faheem Sarwar

- GitHub: https://github.com/faheemsarwar97
- Repository: https://github.com/faheemsarwar97/Smart-Garden

## Acknowledgements

- React
- Vite
- Tailwind CSS
- TanStack
- Radix UI
- Cloudflare Workers
