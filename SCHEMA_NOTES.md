# Newcastle Sunday Club Schema Notes

## Core Entities

| Model | Purpose | Key Fields |
| --- | --- | --- |
| `Owner` | Members of the club. Lightweight PII + membership metadata. | `fullName`, `email`, `membershipTier`, `status`, `notes` |
| `Vehicle` | Canonical record for every stored vehicle. | `vin`, `year`, `make`, `model`, `trim`, `color`, `currentStatus`, `currentSpotId` |
| `StorageSpot` | Physical slots inside the facility. | `code`, `displayName`, `size`, `level`, `climate` |
| `VehiclePhoto` | Photo gallery per vehicle with primary flag. | `url`, `caption`, `isPrimary` |
| `VehicleStatusEvent` | Append-only log of every check-in/out or move. | `status`, `spotId`, `occurredAt`, `recordedBy` |

## Enums

- `AccessStatus`: `IN`, `OUT`, `MAINTENANCE` — covers day-to-day state plus "vehicle pulled for service". A denormalized copy of the most recent `VehicleStatusEvent.status` lives on the `Vehicle` row for instant filtering.
- `MembershipTier`: `FOUNDER`, `PREMIUM`, `STANDARD` — drives accent colours, permissions, and billing later on.
- `OwnerStatus`: `ACTIVE`, `PENDING`, `SUSPENDED` — gives ops a light-weight hold toggle.

## Relationships & Guarantees

1. **Owner → Vehicle (1:N)**
   - `Vehicle.ownerId` references `Owner.id` with `onDelete: Cascade`, ensuring dangling vehicles cannot exist.
2. **Vehicle ↔ StorageSpot (1:1 optional)**
   - `Vehicle.currentSpotId` is nullable + `@unique`, so a spot can host at most one vehicle.
   - Removing a spot sets `currentSpotId` to `NULL` thanks to `onDelete: SetNull`.
3. **Vehicle → VehiclePhoto (1:N)**
   - Cascades on delete; primary photo enforcement happens in app logic since Prisma/Postgres partial uniques aren’t available yet.
4. **Vehicle → VehicleStatusEvent (1:N)**
   - Every ingress/egress/relocation writes a new event row. Composite indexes on `(vehicleId, occurredAt)` keep timelines fast.
5. **StorageSpot → VehicleStatusEvent (1:N optional)**
   - `spotId` is nullable so we can log OUT events where a vehicle isn’t in a spot.

## Indexing Strategy

- `Owner`: indexes on `fullName`, `membershipTier`, `status` for admin search filters.
- `Vehicle`: compound indexes on `(ownerId, currentStatus)` and `(make, model)` to power owner dashboards and search; unique VIN + unique `currentSpotId` prevent duplicates.
- `VehiclePhoto`: index on `vehicleId` for gallery fetches.
- `VehicleStatusEvent`: `(vehicleId, occurredAt)`, `(spotId)`, `(status, occurredAt)` support history timelines and spot occupancy lookups.

## Seed & Migration Notes

- Initial migration: `prisma/migrations/202402280001_vehicle_base/migration.sql` (created with `npx prisma migrate dev --name vehicle_base`).
- Seed script (`prisma/seed.ts`) fabricates 3 owners, 4 spots, and 5 vehicles with rich photo + status histories so UI work instantly has data.
- Run locally:
  ```bash
  npx prisma migrate deploy
  npx prisma db seed
  ```

## Future Extensions

- Add `StorageZone` / `StorageSpotType` lookup tables once the facility layout is final.
- Tie `Owner` rows back to NextAuth users via `userId` once auth lands.
- Introduce `VehicleDocument` for registration/insurance scans when compliance scope grows.
