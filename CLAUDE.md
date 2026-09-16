Project

This project is a private, offline-first vehicle management PWA called “CarBook”.

The application is a digital vehicle logbook and vehicle history system.

Its purpose is to store:

* vehicle information
* maintenance
* repairs
* vehicle issues
* mileage
* fuel entries
* tire history
* costs
* documents
* reminders

The application is designed primarily for private vehicle owners.

⸻

Primary Goal

The application must provide a complete, easy-to-use digital vehicle record.

The user should be able to answer:

* What was done to my vehicle?
* When was it done?
* At what mileage?
* What did it cost?
* Where was it done?
* What documents belong to it?
* When is the next maintenance due?
* What are my annual vehicle costs?
* What does my vehicle cost per kilometer?

⸻

Technology

Use:

* TypeScript
* React
* Vite
* Dexie.js
* IndexedDB
* CSS
* Service Worker
* Web App Manifest

Do not introduce unnecessary dependencies.

This is a PWA.

Do not implement SwiftUI in v1.0.

The architecture must remain suitable for a future native SwiftUI implementation.

⸻

Architecture

Use:

UI
→ Features
→ Services
→ Repositories
→ IndexedDB

React components must never directly access IndexedDB.

Business logic belongs in services.

Repositories own persistence.

⸻

Data Model

Vehicle

* id
* manufacturer
* model
* series
* year
* engine
* fuelType
* transmission
* drivetrain
* vin
* licensePlate
* currentMileage
* purchaseDate
* purchasePrice
* notes
* createdAt
* updatedAt

Maintenance

* id
* vehicleId
* date
* mileage
* type
* title
* description
* cost
* workshop
* nextMileage
* nextDate
* notes
* createdAt
* updatedAt

Issue

* id
* vehicleId
* title
* description
* date
* mileage
* status
* severity
* notes
* resolvedAt
* updatedAt

FuelEntry

* id
* vehicleId
* date
* mileage
* liters
* pricePerLiter
* totalCost
* station
* notes

TireSet

* id
* vehicleId
* season
* manufacturer
* model
* size
* dot
* purchaseDate
* purchaseMileage
* treadDepth
* notes
* createdAt

TireEvent

* id
* tireSetId
* date
* mileage
* action
* notes

Document

* id
* vehicleId
* maintenanceId
* issueId
* filename
* mimeType
* createdAt
* blob/reference

Reminder

* id
* vehicleId
* title
* dueDate
* dueMileage
* repeatIntervalDays
* repeatIntervalMileage
* enabled
* notes

⸻

Dashboard

The dashboard is the primary entry point.

Show:

* vehicle
* current mileage
* upcoming maintenance
* overdue maintenance
* open issues
* annual costs
* recent activity

The dashboard must be useful at a glance.

⸻

Timeline

The vehicle history timeline is a core feature.

Display events chronologically:

* maintenance
* repairs
* issues
* fuel
* tire events
* inspections

Each event should display:

* date
* mileage
* title
* type
* cost where applicable

⸻

Maintenance

Support:

* maintenance entries
* repairs
* service entries
* next mileage
* next date
* workshop
* costs
* descriptions
* notes
* attached documents

⸻

Maintenance Status

Support:

* OK
* due soon
* overdue

Support both:

* mileage-based intervals
* date-based intervals

For combined intervals, the first reached condition determines the due state.

⸻

Issues

Vehicle issues are separate from completed repairs.

Example:

“Klong when selecting D”

An issue can have:

* title
* description
* date
* mileage
* status
* severity
* notes

Statuses:

* open
* observing
* workshop
* resolved
* dismissed

Do not automatically diagnose vehicle issues.

The app records user observations.

⸻

Costs

Calculate:

* annual costs
* maintenance costs
* repair costs
* tire costs
* fuel costs
* other costs
* total costs
* cost per kilometer

All calculations must be deterministic and testable.

⸻

Fuel

Calculate:

* liters
* price per liter
* total cost
* consumption
* cost per 100 km
* cost per km
* annual fuel costs

Only calculate consumption when sufficient mileage data exists.

Never invent missing mileage.

⸻

Tires

Support:

* summer
* winter
* all-season

Store:

* manufacturer
* model
* size
* DOT
* purchase date
* purchase mileage
* tread depth

Track tire mounting/removal events.

⸻

Documents

Support attachments such as:

* PDF
* images
* invoices
* inspection reports
* estimates

Documents must remain locally stored.

⸻

PWA

The application must:

* be installable
* use a valid manifest
* contain icons
* support standalone mode
* use HTTPS in deployment
* provide offline caching
* work without network connectivity after initial load

⸻

Privacy

v1.0 must not include:

* authentication
* cloud database
* analytics
* tracking
* advertising
* external vehicle APIs

Vehicle data stays local.

⸻

Backup

Implement export/import.

Preferred:

CarBook-Backup-YYYY-MM-DD.zip

Include:

data.json
documents/
photos/

Import must:

* validate schema
* detect malformed data
* show import summary
* require confirmation
* never silently discard data

⸻

UI

Design:

* modern
* minimal
* premium
* calm
* mobile-first
* iPhone optimized
* clear typography
* generous spacing
* rounded cards
* subtle borders
* dark mode

Do not copy proprietary Apple UI.

Use familiar interaction patterns without cloning Apple’s design.

⸻

Responsive

Test:

375px
390px
430px
768px
1024px
1440px

Mobile:

bottom navigation.

Desktop:

sidebar navigation.

⸻

Testing

Test:

* vehicle CRUD
* maintenance CRUD
* issue CRUD
* fuel calculations
* mileage calculations
* cost calculations
* maintenance due dates
* maintenance due mileage
* overdue state
* timeline sorting
* tire events
* document persistence
* export
* import
* offline functionality

⸻

Development Rules

Before changes:

1. inspect repository
2. read CLAUDE.md
3. inspect architecture
4. reuse existing code
5. avoid unnecessary dependencies

Work incrementally.

After meaningful changes:

* run TypeScript checks
* run tests
* run build

Never knowingly leave the project in a broken build state.

⸻

Scope v1.0

Implement:

* vehicle profile
* dashboard
* timeline
* maintenance
* repairs
* issues
* mileage
* costs
* fuel
* tires
* documents
* reminders
* search
* filters
* export/import
* responsive design
* dark mode
* PWA
* offline support

Do not implement:

* cloud sync
* accounts
* multi-user
* automatic vehicle APIs
* AI diagnosis
* OBD integration
* GPS tracking
* automatic parts lookup
* automatic price lookup
* marketplace integrations

⸻

Future Extensions

Architecture should allow:

* OBD-II
* barcode scanning
* VIN decoding
* automatic vehicle specifications
* AI document extraction
* receipt OCR
* parts catalog
* service interval database
* iCloud synchronization
* native SwiftUI
* Apple Shortcuts
* widgets
* Apple Watch

Do not implement these in v1.0.

⸻

Quality Priorities

Prioritize:

1. Data integrity
2. Reliability
3. Simple data entry
4. Excellent timeline
5. Clear cost calculations
6. Offline functionality
7. Mobile UX
8. Maintainable architecture

The application should feel like a permanent digital vehicle record, not a generic CRUD application.
