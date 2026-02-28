import { AccessStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { VehicleWithRelations } from "@/types/db";

const timelineFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const STATUS_LABELS: Record<AccessStatus, string> = {
  IN: "Stored on site",
  OUT: "Checked out",
  MAINTENANCE: "Maintenance",
};

const STATUS_BADGES: Record<AccessStatus, string> = {
  IN: "IN",
  OUT: "OUT",
  MAINTENANCE: "PREP",
};

export type VehicleTimelineEvent = {
  id: string;
  timestamp: string;
  label: string;
  note?: string | null;
  spotLabel?: string | null;
};

export type VehicleMedia = {
  id: string;
  url: string;
  caption?: string | null;
  isPrimary: boolean;
};

export type VehicleDetail = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  color?: string | null;
  vinLast4?: string;
  status: AccessStatus;
  statusLabel: string;
  statusBadge: string;
  statusDetail?: string;
  lastMovement?: string;
  storageSpot?: {
    code: string;
    displayName: string;
    level?: string | null;
    climate?: string | null;
  };
  photos: VehicleMedia[];
  primaryPhoto?: VehicleMedia;
  timeline: VehicleTimelineEvent[];
  notes?: string | null;
};

const formatDateTime = (value?: Date | null) => {
  if (!value) return undefined;
  try {
    return timelineFormatter.format(value);
  } catch {
    return undefined;
  }
};

const mapVehicleDetail = (vehicle: VehicleWithRelations): VehicleDetail => {
  const vinLast4 = vehicle.vin ? vehicle.vin.slice(-6).toUpperCase() : undefined;
  const photos = vehicle.photos
    .map<VehicleMedia>((photo) => ({
      id: photo.id,
      url: photo.url,
      caption: photo.caption,
      isPrimary: photo.isPrimary,
    }))
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));

  const timeline: VehicleTimelineEvent[] = vehicle.statusEvents.map((event) => ({
    id: event.id,
    timestamp: formatDateTime(event.occurredAt) ?? "",
    label: `${STATUS_LABELS[event.status]}${event.spot?.displayName ? ` · ${event.spot.displayName}` : ""}`,
    note: event.note,
    spotLabel: event.spot?.displayName ?? undefined,
  }));

  return {
    id: vehicle.id,
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    color: vehicle.color,
    vinLast4,
    status: vehicle.currentStatus,
    statusLabel: STATUS_LABELS[vehicle.currentStatus],
    statusBadge: STATUS_BADGES[vehicle.currentStatus],
    statusDetail: vehicle.statusEvents[0]?.note ?? undefined,
    lastMovement: formatDateTime(vehicle.statusEvents[0]?.occurredAt),
    storageSpot: vehicle.currentSpot
      ? {
          code: vehicle.currentSpot.code,
          displayName: vehicle.currentSpot.displayName,
          level: vehicle.currentSpot.level,
          climate: vehicle.currentSpot.climate,
        }
      : undefined,
    photos,
    primaryPhoto: photos[0],
    timeline,
    notes: vehicle.notes,
  };
};

export async function getVehicleDetailForOwner(ownerId: string, vehicleId: string): Promise<VehicleDetail | null> {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      ownerId,
    },
    include: {
      currentSpot: true,
      photos: { orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }] },
      statusEvents: {
        include: { spot: true },
        orderBy: { occurredAt: "desc" },
        take: 12,
      },
    },
  });

  if (!vehicle) {
    return null;
  }

  return mapVehicleDetail(vehicle);
}
