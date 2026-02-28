# nsc-9 — Vehicle database schema final notes

## What changed
- Reviewed existing Prisma schema, notes, and seed data; seed script already creates realistic owners, spots, vehicles, photos, and status history.
- Added referential safety to `Vehicle.currentSpot` and `VehicleStatusEvent.spot` relations using `onDelete: SetNull` with cascading updates so removing or renaming spots never blocks writes and auto-nullifies stale pointers.
- Introduced compound indexes on `Vehicle(ownerId, currentStatus)` for fast owner-focused filters and on `VehicleStatusEvent(status, occurredAt)` to speed historical status queries.

## Follow-ups
- Run `npx prisma migrate dev --name init_schema` and `npx prisma db seed` once database env vars are configured.
