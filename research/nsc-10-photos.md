# NSC-10 — Photo Upload System

## What shipped
- Replaced the vehicles photo API (`/api/vehicles/[vehicleId]/photos`) with a Prisma-backed handler.
  - Accepts `multipart/form-data`, validates mime + size, and can save to remote storage when credentials exist.
  - When no blob/S3 creds are configured, uploads are persisted to `public/uploads/<vehicleId>/<type>/...` and Prisma records are created so the UI can continue to poll.
  - GET/DELETE now try the real storage first, but always fall back to Prisma + the local filesystem so the flow works in dev.
- Added a reusable Prisma client (`lib/prisma.ts`).
- Updated the `PhotoUpload` client component so it targets `/api/vehicles/:id/photos` by default and works cleanly on mobile.
- Created an admin vehicle detail page (`/admin/vehicles/[id]`) that surfaces owner + storage metadata and embeds the uploader for intake photos.
- Added a quick “Details” link to the admin table so the new page is discoverable.
- Dropped a `.gitkeep` inside `public/uploads/` so the folder exists for local testing.

## Follow-ups / ideas
- Wire the new Prisma photo records into the gallery component so deletions/listing use the same source of truth everywhere.
- Replace the mock owner/storage data with real queries once the admin app is connected to the production database.
- Add optimistic UI for uploads so photos appear instantly in the gallery without waiting for a refetch.
