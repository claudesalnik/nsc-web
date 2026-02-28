# NSC Prisma Schema Notes

## Design Highlights

- **Ownership-first model:** `Owner` records hold the canonical membership data (linking back to auth via `userId`). Email and userId are unique, making lookups predictable regardless of identity provider.
- **Vehicle-spot pairing:** Vehicles keep the foreign key for their assigned `StorageSpot`, enforcing a one-to-one relationship (each spot may host at most one vehicle). Spot occupancy is tracked explicitly for quick filtering while still derivable from the relation.
- **Rich media trail:** Vehicles store quick-reference photo URLs inline, while the `Photo` model captures auditable uploads with type metadata, uploader, and timestamps.
- **Access logging:** `AccessEvent` ties both the vehicle and the owner to every in/out movement. Composite indexes on `(vehicleId, timestamp)` and `timestamp` accelerate the most common queries (recent activity, vehicle history).
- **Status-aware storage:** Enums (`VehicleStatus`, `PhotoType`, `AccessEventType`, `MembershipTier`) reduce magic strings and map cleanly to UI filters.
- **Cascade safety:** Deleting a vehicle automatically removes dependent photos and access logs, keeping the database tidy without orphan records.
- **Seed realism:** The seed script populates 3 members, 5 hero cars, and 10 spots with believable metadata so UI development and dashboards have meaningful sample data out of the box.
