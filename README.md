# Caplander

An account-ready calendar app built with React 19, TypeScript, Redux Toolkit, and Vite. Plan events across year, month, week, and day views, search your schedule quickly, and receive browser notifications when events are about to start.

**Live demo:** [caplander.netlify.app](https://caplander.netlify.app)

**Author:** Mintum

## Features

- **Calendar views** — Year, Month, Week, and Day views with quick navigation and lazy-loaded routes
- **Event management** — Create, edit, delete, and inspect timed, all-day, and multi-day events with labels, alert offsets, and rich text notes
- **Account and guest modes** — Sign in for API-backed events and labels, or continue anonymously with local `localStorage` persistence
- **Labels and profile** — Manage color-coded labels and account details from the profile page
- **Search and navigation** — Search events from the header and jump straight to the matching date in the active calendar view
- **Notifications** — Browser/service-worker notifications for advance alerts and event start times, with a read/unread notification panel
- **Dark mode** — Toggle light and dark themes from the app header
- **Rich text notes** — Powered by Lexical with bold, italic, lists, links, and code blocks
- **Responsive layout** — Tailwind CSS 4 utility-first styling with SCSS modules for component-scoped editor/button styles

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 8 |
| Routing | React Router v7 with lazy-loaded app/auth routes |
| State | Redux Toolkit + React Redux |
| API | Custom Fetch service with access/refresh token handling |
| Forms | React Hook Form + Yup validation |
| Rich text | Lexical |
| Styling | Tailwind CSS v4 + SCSS Modules |
| Icons | Lucide React |
| Tests | Vitest + Testing Library |

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
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |

## Project Structure

```
src/
├── components/
│   ├── atoms/          # Base UI elements (Button, Input, Badge, …)
│   ├── molecules/      # Composite components (Calendar, buttons, inputs, modal, rich text editor, …)
│   └── organisms/      # Feature-level components (AppHeader, EventModal, DayDrawer, LoadingPage, …)
├── pages/
│   ├── YearView/
│   ├── MonthView/
│   ├── WeekView/
│   ├── DayView/
│   ├── LoginPage/
│   ├── RegisterPage/
│   └── ProfilePage/
├── routes/             # Browser router, route layout, lazy route definitions
├── services/           # API client and auth token lifecycle
├── store/
│   └── slices/         # authSlice, eventSlice, labelSlice, notificationSlice
├── hooks/              # useNotifications, useLabels, useFetchForYear, useSeekDate, useDarkMode
├── test/               # Shared test setup and render helpers
├── types/              # Shared TypeScript interfaces
└── utils/              # Date/calendar/event/auth helpers, cn, scrollLock
```

## Conventions

- Component props interfaces follow the `I<ComponentName>Props` naming pattern.
- Imports use the `app/*` alias (maps to `src/`) — no `../` relative traversal.
- Tailwind CSS important utilities use trailing `!` syntax, e.g. `size-9!` and `hover:bg-surface-container-high!`; do not use `!size-9` or `hover:!bg-surface-container-high`.
- State is colocated as close to its usage as possible; parent-to-child control uses `forwardRef` + `useImperativeHandle`.

See [CLAUDE.md](CLAUDE.md) for full coding conventions.
