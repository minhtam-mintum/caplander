# Calendar Task Planner

A calendar and event management app built with React 19, TypeScript, and Vite. Supports four calendar views, event creation with rich text notes, label tagging, and browser push notifications.

**Live demo:** [caplander.netlify.app](https://caplander.netlify.app)

**Author:** Mintum

## Features

- **Four calendar views** — Year, Month, Week, and Day
- **Event management** — Create, edit, and delete events with title, date, start/end times, label, and rich text notes
- **Labels** — Categorize events with custom color-coded labels
- **Push notifications** — Browser notifications fire before events based on a configurable alert offset
- **Persistent storage** — Events are saved to `localStorage` and survive page reloads
- **Rich text notes** — Powered by Lexical with bold, italic, lists, links, and code blocks
- **Responsive layout** — Tailwind CSS 4 utility-first styling with SCSS modules for component-scoped styles

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router v7 (lazy-loaded views) |
| State | Redux Toolkit + React Redux |
| Forms | React Hook Form + Yup validation |
| Rich text | Lexical |
| Styling | Tailwind CSS v4 + SCSS Modules |
| Icons | Lucide React |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/
│   ├── atoms/          # Base UI elements (Button, Input, Badge, …)
│   ├── molecules/      # Composite components (Calendar, Modal, TimePicker, …)
│   └── organisms/      # Feature-level components (AppHeader, EventModal, NotificationPanel, …)
├── pages/
│   ├── YearView/
│   ├── MonthView/
│   ├── WeekView/
│   └── DayView/
├── store/
│   └── slices/         # eventSlice, notificationSlice
├── hooks/              # useNotifications, useLabels
├── types/              # Shared TypeScript interfaces
└── utils/              # Date/calendar helpers, cn, scrollLock
```

## Conventions

- Component props interfaces follow the `I<ComponentName>Props` naming pattern.
- Imports use the `app/*` alias (maps to `src/`) — no `../` relative traversal.
- State is colocated as close to its usage as possible; parent-to-child control uses `forwardRef` + `useImperativeHandle`.

See [CLAUDE.md](CLAUDE.md) for full coding conventions.
