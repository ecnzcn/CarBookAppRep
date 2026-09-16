# CarBook — Architecture

## Layering

```
UI (React components / pages)
  → Features        (feature-scoped pages & components; own the routes)
    → Services       (business logic, validation, calculations)
      → Repositories (persistence — the only layer that talks to Dexie)
        → Dexie → IndexedDB
```

Rules that keep this holding together:

- **React components never touch IndexedDB or Dexie directly.** They call a
  service (for a write / calculation) or read live data via a repository
  through `useLiveQuery` (from `dexie-react-hooks`) so the UI reacts to
  changes without manual refetch plumbing.
- **Repositories** (`src/repositories/*.ts`) are the only place `db.<table>`
  is touched. Each repository is a small factory function
  (`createXRepository(database = defaultDb)`) returning plain CRUD methods,
  so tests can inject an isolated in-memory database
  (`fake-indexeddb`) instead of the shared one.
- **Services** (`src/services/*.ts`) own validation, id/timestamp
  generation, and any domain calculation (maintenance due-state, fuel
  consumption, cost aggregation, timeline merging). Calculations are written
  as pure functions over plain data wherever possible, so they're testable
  without touching the database at all.
- **Features** (`src/features/<name>/*`) are route-level pages plus the
  small components only that feature needs. Shared, cross-feature UI lives
  in `src/ui`.

This mirrors a typical native app's Model-View-ViewModel-ish separation
closely enough that a future SwiftUI client could reuse the same services/
repositories conceptually (persistence swapped for e.g. SwiftData) without
reshaping the domain logic.

## Data flow example

Adding a maintenance entry:

1. `MaintenanceFormPage` collects input, calls `maintenanceService.create(input)`.
2. `maintenanceService` validates the input, stamps `id`/`createdAt`/`updatedAt`,
   and — if the entry's mileage is higher than the vehicle's known mileage —
   asks `vehicleService` to bump the vehicle's `currentMileage` (never
   inventing a reading, only recording the highest one actually logged).
3. `maintenanceService` calls `maintenanceRepository.add(record)`.
4. `maintenanceRepository` writes to `db.maintenance` (Dexie/IndexedDB).
5. Any page with a `useLiveQuery` over maintenance (dashboard, timeline,
   costs) re-renders automatically — Dexie's live query tracks the table.

## Client-side only, offline-first

There is no backend. Every table lives in IndexedDB via Dexie
(`src/db/db.ts`). The Vite PWA plugin (`vite-plugin-pwa`) generates a
manifest and a Workbox service worker that precaches the app shell, so the
app keeps working fully offline after the first load. Backups are plain
files (a zip with `data.json` + `documents/`) the user controls — there is
no server-side storage to synchronize with.

## Testing

- Pure calculation services (`maintenanceStatus`, `costService`,
  `fuelService`, `timelineService`) are unit-tested directly, no database
  involved.
- Repository/service pairs that touch persistence are tested against a
  fresh `CarBookDatabase` instance backed by `fake-indexeddb`, one per test,
  so tests never share state.
- UI is smoke-tested manually in a real browser at each target breakpoint
  (see [DATA_MODEL.md](./DATA_MODEL.md) is data; UI verification is ad hoc
  via the `run` workflow, not part of the automated suite).

## Directory map

```
src/
  db/            Dexie database + shared entity types
  repositories/  one file per entity, Dexie CRUD only
  services/      business logic + calculations
  features/      route-level pages, grouped by feature
  ui/            shared layout (AppShell, nav) and small components
```
