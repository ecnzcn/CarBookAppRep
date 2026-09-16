# CarBook — Requirements

CarBook is a private, offline-first digital vehicle logbook (PWA) for private vehicle
owners. It replaces the paper "Scheckheft" with a permanent, local digital record.

## Primary goal

At any time, the user must be able to answer:

- What was done to my vehicle?
- When was it done, and at what mileage?
- What did it cost, and where was it done?
- What documents belong to it?
- When is the next maintenance due?
- What are my annual vehicle costs, and what does the vehicle cost per kilometer?

## User stories

### Vehicle profile
- As an owner, I can record my vehicle's make, model, trim, year, engine, fuel type,
  transmission, drivetrain, VIN, plate, mileage, purchase date/price, and notes.
- As an owner with multiple vehicles, I can switch between them from the dashboard.

### Dashboard
- As an owner, I see my vehicle, its current mileage, upcoming/overdue maintenance,
  open issues, this year's costs, and recent activity in one glance.

### Timeline
- As an owner, I see every maintenance, repair, issue, fuel fill-up, tire event, and
  inspection for my vehicle in one chronological history, each with date, mileage,
  title, type, and cost where applicable.

### Maintenance
- As an owner, I can log maintenance/repairs/service/inspection entries with cost,
  workshop, mileage, date, description, notes, and a next-due mileage and/or date.
- As an owner, the app tells me when something is due soon or overdue, using
  whichever of the mileage- or date-based interval is reached first.

### Issues
- As an owner, I can record an observed problem ("Klong beim Einlegen von D") without
  the app attempting to diagnose it. I track its status (open, observing, workshop,
  resolved, dismissed) and severity over time.

### Fuel
- As an owner, I can log fill-ups (date, mileage, liters, price/liter, station).
- The app computes consumption (l/100km), cost/100km, cost/km, and annual fuel
  cost — but only once there are two consecutive odometer readings to derive it
  from. It never invents missing mileage.

### Tires
- As an owner, I can track summer/winter/all-season tire sets (manufacturer, model,
  size, DOT, purchase date/mileage, tread depth, cost) and mount/remove/inspect
  events for each set.

### Documents
- As an owner, I can attach PDFs, photos, invoices, inspection reports, and
  estimates to a maintenance entry or an issue. Everything stays local.

### Reminders
- As an owner, I can set a reminder by date, mileage, or a repeating interval
  (days and/or kilometers), and enable/disable it.

### Costs
- As an owner, I see maintenance, repair, tire, and fuel costs, a total, and a
  cost-per-kilometer figure, broken down by year.

### Search & filters
- As an owner, I can search across maintenance, issues, documents, fuel, and tires,
  and filter by date range, type, cost, and mileage.

### Backup
- As an owner, I can export all of my data (records + documents) as a single
  `CarBook-Backup-YYYY-MM-DD.zip`, and restore it later. Import always shows a
  preview/summary and requires confirmation before writing anything; it never
  silently discards data.

### Offline
- As an owner, once the app has loaded, it keeps working fully offline — viewing
  and editing my vehicle's data never requires a network connection.

## Non-goals for v1.0

No accounts, no cloud sync, no multi-user, no OBD/GPS integration, no AI diagnosis,
no automatic vehicle/parts/price lookups. The architecture should not preclude
adding these later (see [ROADMAP.md](./ROADMAP.md)), but v1.0 does not implement them.

## Quality bar

CarBook should feel like a permanent, trustworthy digital vehicle record — not a
generic CRUD form. The vehicle history (timeline) is the most important screen.
