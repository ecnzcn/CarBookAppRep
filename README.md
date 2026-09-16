# CarBook

A private, offline-first vehicle logbook and history PWA. See [CLAUDE.md](./CLAUDE.md) for the full product and architecture spec.

## Stack

TypeScript, React, Vite, Dexie.js (IndexedDB).

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
