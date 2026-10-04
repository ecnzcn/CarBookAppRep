# CarBook — Roadmap

## v1.0 scope

- [x] Vehicle profile (CRUD)
- [x] Dashboard (real data)
- [x] Timeline (maintenance, repairs, issues, fuel, tire events, inspections)
- [x] Maintenance / repairs / service / inspections, with due-state logic
- [x] Issues (observation tracking, not diagnosis)
- [x] Fuel entries + consumption/cost calculations
- [x] Tires (sets + mount/remove/inspect events)
- [x] Documents (attached to maintenance or issues, stored locally)
- [x] Reminders (date/mileage/repeat)
- [x] Costs (per category, total, per-km)
- [x] Search & filters
- [x] Export/import backup (zip)
- [x] Responsive design (375–1440px), dark mode
- [x] PWA (installable, offline-capable)

## Explicitly out of scope for v1.0

Accounts, cloud sync, multi-user, OBD-II, GPS tracking, AI diagnosis,
automatic vehicle/parts/price lookup APIs, marketplace integrations.

## Future extension points

The architecture leaves room for, without committing to:

- **OBD-II** — a new `services/obdService.ts` reading from a device
  connector, feeding the same `Maintenance`/mileage flows rather than a
  parallel data model.
- **Barcode scanning / VIN decoding** — a input-assist layer in front of
  the existing `VehicleForm`/`vehicleService.create`; doesn't change
  persistence.
- **Automatic vehicle specifications** — a lookup service that pre-fills
  `VehicleInput`, still going through the same validation.
- **AI document extraction / receipt OCR** — a service that turns an
  uploaded `Document` into a draft `Maintenance`/`FuelEntry`, subject to
  the same validation as a manual entry — never bypassing it.
- **Parts catalog / service interval database** — reference data a
  `maintenanceService` helper could consult when suggesting `nextMileage`/
  `nextDate`, without changing the `Maintenance` shape.
- **iCloud sync / native SwiftUI** — the `UI → Features → Services →
  Repositories` layering was chosen so a native client could reimplement
  the top two layers against the same service/repository contracts (or a
  SwiftData-backed repository), keeping calculations and validation in one
  conceptual place.
- **Apple Shortcuts / widgets / Apple Watch** — surface a narrow subset of
  `services/` (e.g. "log a fill-up", "today's dashboard summary") behind a
  small, stable API, without exposing repositories directly.

None of these are implemented in v1.0; they're listed so v1.0's boundaries
(service functions, not page-specific logic) don't have to be redrawn to
support them later.

## Known limitations / deferred polish

- Cost-per-km and fuel consumption require at least two mileage readings
  in the relevant period; with fewer, the app shows "not enough data" by
  design rather than guessing.
- No automated (unit-test-suite) coverage of offline behavior, but it is
  verified: a production build (`npm run build`) is served, loaded once
  online to let the Workbox service worker install, then the network is
  cut and the app is reloaded — data entry and every route still render
  from cache + IndexedDB with zero network requests.
- Backup zips route image attachments into `photos/` and everything else
  into `documents/`, since CarBook has one `Document` entity rather than
  separate photo/document types — see [DATA_MODEL.md](./DATA_MODEL.md).
- Deployment to a public HTTPS test link depends on the environment's
  deployment capabilities; see the note in the project README if none is
  configured here.
