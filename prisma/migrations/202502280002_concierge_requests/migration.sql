-- CreateEnum
CREATE TYPE "ConciergeRequestType" AS ENUM ('DETAILING', 'BATTERY_RUN', 'OTHER');

-- CreateEnum
CREATE TYPE "ConciergeRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "ConciergeRequest" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "type" "ConciergeRequestType" NOT NULL,
    "notes" TEXT,
    "requestedDate" TIMESTAMP(3),
    "status" "ConciergeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConciergeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConciergeRequest_memberId_idx" ON "ConciergeRequest"("memberId");

-- CreateIndex
CREATE INDEX "ConciergeRequest_status_idx" ON "ConciergeRequest"("status");

-- CreateIndex
CREATE INDEX "ConciergeRequest_status_requestedDate_idx" ON "ConciergeRequest"("status", "requestedDate");

-- AddForeignKey
ALTER TABLE "ConciergeRequest" ADD CONSTRAINT "ConciergeRequest_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Owner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConciergeRequest" ADD CONSTRAINT "ConciergeRequest_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
