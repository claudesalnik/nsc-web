# Newcastle Sunday Club Schema Notes

## Overview
- **ORM/Data layer**: Prisma with PostgreSQL (Vercel Postgres ready).
- **Core entities**:
  - `Owner` — club members. Minimal PII plus optional membership meta.
  - `Vehicle` — canonical description + denormalized `currentStatus` and `currentSpotId` for fast dashboards.
  - `StorageSpot` — numbered/named locations inside the facility.
  - `VehiclePhoto` — media assets per vehicle (primary flag enforced in app logic).
  - `VehicleStatusEvent` — append-only history of check-ins/checkouts and moves.

## Design Decisions
1. **Status as enum + log**: `Vehicle.currentStatus` powers fast filters, while `VehicleStatusEvent` captures history (who/when/where). The enum (`IN_STORAGE`, `CHECKED_OUT`) keeps logic simple but can be extended later.
2. **Current spot caching**: `Vehicle.currentSpotId` provides O(1) lookups for dashboards. Historical moves still live in the status table with optional `spotId` references.
3. **Storage spot exclusivity**: `currentSpotId` is `@unique`, preventing double-booked spots at the DB level. If a vehicle is checked out, the field is `NULL`.
4. **Photos without partial unique constraints**: PostgreSQL can’t do partial uniques via Prisma yet, so the “single primary photo” rule is enforced in application logic. Indexing `vehicleId` keeps gallery queries quick.
5. **Seed realism**: `prisma/seed.ts` creates three members, four spots, and five vehicles with mixed statuses and realistic history, ready for demo environments.
6. **Referential safety**: `Vehicle.currentSpot` and `VehicleStatusEvent.spot` now use `onDelete: SetNull` (plus cascading updates) so removing or renaming a spot never blocks writes and automatically frees dependent rows.
7. **Query-ready indexes**: Compound indexes on `(ownerId, currentStatus)` and `(status, occurredAt)` support dashboard filters without table scans.

## Next Steps
- Run `npx prisma migrate dev --name init_schema` to create the first migration.
- Execute `npx prisma db seed` after configuring `package.json` with `prisma/seed.ts` (e.g. `ts-node` or `tsx`).
- Extend `Owner` or `VehicleStatusEvent` with auth user IDs once identity management lands.
