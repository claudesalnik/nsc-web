-- AlterTable
ALTER TABLE "Vehicle"
  ADD COLUMN "licensePlate" VARCHAR(16),
  ADD COLUMN "plateState" VARCHAR(16);

-- AlterTable
ALTER TABLE "StorageSpot"
  ADD COLUMN "zone" VARCHAR(32),
  ADD COLUMN "section" VARCHAR(32),
  ADD COLUMN "rowLabel" VARCHAR(32),
  ADD COLUMN "isTransient" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Vehicle_licensePlate_idx" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "StorageSpot_zone_idx" ON "StorageSpot"("zone");

-- CreateIndex
CREATE INDEX "StorageSpot_section_idx" ON "StorageSpot"("section");
