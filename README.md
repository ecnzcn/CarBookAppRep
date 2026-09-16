# CarBook

A private, offline-first vehicle logbook and history PWA. See [CLAUDE.md](./CLAUDE.md) for the
full product spec, and [docs/](./docs) for requirements, architecture, data model, and roadmap.

## Features

Vehicle profile, dashboard, timeline (maintenance, repairs, issues, fuel, tire events,
inspections), maintenance with due-date/mileage tracking, issue tracking, fuel consumption
calculations, tire sets & events, documents attached to maintenance/issues, reminders, cost
breakdowns with a chart, search & filters, zip export/import backup, dark mode, and full offline
support as an installable PWA.

## Stack

TypeScript, React, Vite, Dexie.js (IndexedDB), react-router-dom, fflate (zip backups),
vite-plugin-pwa.

## Development

```sh
npm install
npm run dev        # start the dev server
npm run typecheck  # TypeScript project check
npm test           # run the test suite
npm run build      # production build (includes PWA service worker)
```

## Architecture

```
UI → Features → Services → Repositories → IndexedDB
```

React components never touch IndexedDB directly — business logic lives in `src/services`, persistence lives in `src/repositories`.
