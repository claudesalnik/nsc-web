# NSC Prisma Schema

The Newcastle Sunday Club data model focuses on a clean separation between members, their vehicles, and the facility floor plan. Prisma targets PostgreSQL / Vercel Postgres.

## Models

### Owner
- Canonical member profile.
- Required: `fullName`, `email` (unique), `membershipTier`, `status`.
- Optional metadata: `phone`, `city`, `company`, `membershipTag`, free-form `notes`.
- Relations:
  - `vehicles` — one-to-many vehicles per owner.
  - `conciergeRequests` — optional concierge workflow (future).

### Vehicle
- Represents a single stored vehicle.
- Fields: `vin` (unique), `year`, `make`, `model`, `trim?`, `color?`, `licensePlate?`, `plateState?`, `notes?`.
- Denormalized status cache: `currentStatus: AccessStatus` (`IN | OUT | MAINTENANCE`).
- `currentSpotId` keeps a nullable pointer to `StorageSpot`; `@unique` enforces one vehicle per spot.
- Relations: `owner`, `currentSpot`, `photos`, `statusEvents`, `conciergeRequests`.

### StorageSpot
- Single parking/garage bay.
- Fields: `code` (unique human-friendly identifier), `displayName`, `size?`, `level?`, `climate?`, `zone?`, `section?`, `rowLabel?`, `isTransient`, `notes?`.
- Relation: optional `vehicle` (back-reference from `Vehicle.currentSpot`) and `statusEvents`.

### VehiclePhoto
- Stores photo gallery entries.
- Fields: `url`, `caption?`, `isPrimary` flag.
- Relation: belongs to `Vehicle`.

### VehicleStatusEvent
- Append-only history of `AccessStatus` transitions.
- Fields: `status`, `spotId?`, `occurredAt`, `note?`, `recordedBy?`.
- Relations: belongs to `Vehicle`; optional link to a `StorageSpot`.

## Enums
- `AccessStatus`: `IN`, `OUT`, `MAINTENANCE`.
- `MembershipTier`: `FOUNDER`, `PREMIUM`, `STANDARD`.
- `OwnerStatus`: `ACTIVE`, `PENDING`, `SUSPENDED`.

## Migration Workflow
1. Update `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <change>` locally to generate SQL under `prisma/migrations/`.
3. Commit the schema + migration.
4. Run `npx prisma generate` if the client is used outside Next.js server components.

## Seed Data
`prisma/seed.ts` wipes and repopulates Owners, StorageSpots, Vehicles, Photos, and StatusEvents with realistic demo data:

```bash
npx prisma db seed
```

It creates:
- 3 members (Founder, Premium, Standard tiers)
- 4 named storage spots
- 5 hero vehicles with mixed status (`IN`, `OUT`, `MAINTENANCE`)
- Photos + status history per vehicle

This seed is safe for local dev only (it truncates tables before inserting).
