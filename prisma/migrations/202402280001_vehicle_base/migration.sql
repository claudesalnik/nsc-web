-- CreateEnum
CREATE TYPE "AccessStatus" AS ENUM ('IN', 'OUT', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "MembershipTier" AS ENUM ('FOUNDER', 'PREMIUM', 'STANDARD');

-- CreateEnum
CREATE TYPE "OwnerStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- CreateTable
CREATE TABLE "Owner" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(32),
    "city" TEXT,
    "company" TEXT,
    "membershipTag" VARCHAR(64),
    "membershipTier" "MembershipTier" NOT NULL DEFAULT 'PREMIUM',
    "status" "OwnerStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "vin" VARCHAR(32) NOT NULL,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT,
    "color" TEXT,
    "currentStatus" "AccessStatus" NOT NULL DEFAULT 'IN',
    "currentSpotId" TEXT,
    "acquiredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorageSpot" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "size" TEXT,
    "level" TEXT,
    "climate" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorageSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehiclePhoto" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehiclePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleStatusEvent" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "spotId" TEXT,
    "status" "AccessStatus" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "recordedBy" TEXT,

    CONSTRAINT "VehicleStatusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Owner_email_key" ON "Owner"("email");

-- CreateIndex
CREATE INDEX "Owner_fullName_idx" ON "Owner"("fullName");

-- CreateIndex
CREATE INDEX "Owner_membershipTier_idx" ON "Owner"("membershipTier");

-- CreateIndex
CREATE INDEX "Owner_status_idx" ON "Owner"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vin_key" ON "Vehicle"("vin");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_currentSpotId_key" ON "Vehicle"("currentSpotId");

-- CreateIndex
CREATE INDEX "Vehicle_ownerId_idx" ON "Vehicle"("ownerId");

-- CreateIndex
CREATE INDEX "Vehicle_ownerId_currentStatus_idx" ON "Vehicle"("ownerId", "currentStatus");

-- CreateIndex
CREATE INDEX "Vehicle_make_model_idx" ON "Vehicle"("make", "model");

-- CreateIndex
CREATE INDEX "Vehicle_currentStatus_idx" ON "Vehicle"("currentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "StorageSpot_code_key" ON "StorageSpot"("code");

-- CreateIndex
CREATE INDEX "VehiclePhoto_vehicleId_idx" ON "VehiclePhoto"("vehicleId");

-- CreateIndex
CREATE INDEX "VehicleStatusEvent_vehicleId_occurredAt_idx" ON "VehicleStatusEvent"("vehicleId", "occurredAt");

-- CreateIndex
CREATE INDEX "VehicleStatusEvent_spotId_idx" ON "VehicleStatusEvent"("spotId");

-- CreateIndex
CREATE INDEX "VehicleStatusEvent_status_occurredAt_idx" ON "VehicleStatusEvent"("status", "occurredAt");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_currentSpotId_fkey" FOREIGN KEY ("currentSpotId") REFERENCES "StorageSpot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehiclePhoto" ADD CONSTRAINT "VehiclePhoto_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleStatusEvent" ADD CONSTRAINT "VehicleStatusEvent_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleStatusEvent" ADD CONSTRAINT "VehicleStatusEvent_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "StorageSpot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

