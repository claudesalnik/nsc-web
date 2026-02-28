-- Add SCHEDULED status to ConciergeRequestStatus enum
-- This migration adds a new enum value between PENDING and IN_PROGRESS

ALTER TYPE "ConciergeRequestStatus" ADD VALUE 'SCHEDULED' BEFORE 'IN_PROGRESS';
