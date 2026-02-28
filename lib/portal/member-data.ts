import { cache } from "react";
import { AccessStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { VehicleCardData } from "@/components/VehicleCard";
import type { VehicleWithRelations } from "@/types/db";
import { getMemberProfile, type MemberDirectoryEntry } from "./member-directory";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const VEHICLE_STATUS_MAP: Record<AccessStatus, VehicleCardData["status"]> = {
  IN: "stored",
  OUT: "checked-out",
  MAINTENANCE: "prep",
};

const formatDateTime = (value?: Date | string | null) => {
  if (!value) return undefined;
  try {
    return dateTimeFormatter.format(new Date(value));
  } catch {
    return undefined;
  }
};

const formatTime = (value?: Date | string | null) => {
  if (!value) return undefined;
  try {
    return timeFormatter.format(new Date(value));
  } catch {
    return undefined;
  }
};

const formatDate = (value?: Date | string | null) => {
  if (!value) return undefined;
  try {
    return dateFormatter.format(new Date(value));
  } catch {
    return undefined;
  }
};

type AccessEvent = {
  id: string;
  timestamp?: string;
  context: string;
  meta?: string | null;
  direction: "IN" | "OUT";
};

export type MemberPortalData = {
  profile: MemberDirectoryEntry;
  owner: Awaited<ReturnType<typeof prisma.owner.findUnique>>;
  vehicles: VehicleCardData[];
  hero: {
    bayLabel: string;
    section: string;
    zone: string;
    humidity: string;
    gateCode: string;
    rowMapLabel: string;
    lastVisit?: string;
    conciergeEta?: string;
  };
  gate: MemberDirectoryEntry["storage"]["gate"];
  accessEvents: AccessEvent[];
  billing: MemberDirectoryEntry["billing"];
  stats: {
    stored: number;
    checkedOut: number;
    total: number;
  };
};

function mapVehicleToCard(vehicle: VehicleWithRelations, profile: MemberDirectoryEntry): VehicleCardData {
  const latestEvent = vehicle.statusEvents?.[0];
  const primaryPhoto = vehicle.photos?.find((photo) => photo.isPrimary) ?? vehicle.photos?.[0];

  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    trim: vehicle.trim ?? undefined,
    imageUrl: primaryPhoto?.url ?? undefined,
    status: VEHICLE_STATUS_MAP[vehicle.currentStatus] ?? "stored",
    statusDetail: latestEvent?.note ?? undefined,
    storageUnit: vehicle.currentSpot?.displayName ?? `${profile.storage.zone} · ${profile.storage.section}`,
    lastMovement: formatDateTime(latestEvent?.occurredAt),
    battery: vehicle.currentStatus === AccessStatus.IN ? "Maintainer" : "External",
    fuel: vehicle.currentStatus === AccessStatus.IN ? "⅘ tank" : "Track fill",
    plate: vehicle.licensePlate ?? undefined,
  };
}

function mapAccessEvent(event: { id: string; occurredAt: Date; vehicle: { make: string; model: string }; note: string | null; status: AccessStatus; spot?: { displayName: string | null } | null }): AccessEvent {
  return {
    id: event.id,
    timestamp: formatTime(event.occurredAt) ?? formatDate(event.occurredAt),
    context: `${event.vehicle.make} ${event.vehicle.model}`.trim(),
    meta: event.note ?? event.spot?.displayName ?? null,
    direction: event.status === "IN" ? "IN" : "OUT",
  };
}

export const getMemberPortalData = cache(async (userEmail: string): Promise<MemberPortalData> => {
  const profile = getMemberProfile(userEmail);

  if (!profile) {
    throw new Error(`No member profile found for ${userEmail}`);
  }

  const ownerEmail = profile.ownerEmail ?? profile.userEmail;

  const owner = await prisma.owner.findUnique({
    where: { email: ownerEmail },
    include: {
      vehicles: {
        include: {
          owner: true,
          currentSpot: true,
          photos: true,
          statusEvents: { orderBy: { occurredAt: "desc" }, take: 3 },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!owner) {
    throw new Error(`No owner record found for ${ownerEmail}`);
  }

  const vehicleStatusEvents = await prisma.vehicleStatusEvent.findMany({
    where: { vehicle: { ownerId: owner.id } },
    include: {
      vehicle: { select: { make: true, model: true } },
      spot: { select: { displayName: true } },
    },
    orderBy: { occurredAt: "desc" },
    take: 8,
  });

  const vehicles = owner.vehicles.map((vehicle) => mapVehicleToCard(vehicle, profile));
  const stored = vehicles.filter((vehicle) => vehicle.status === "stored").length;
  const checkedOut = vehicles.filter((vehicle) => vehicle.status === "checked-out").length;

  const firstSpot = owner.vehicles.find((vehicle) => vehicle.currentSpot)?.currentSpot;
  const lastVisit = vehicleStatusEvents[0]?.occurredAt;

  return {
    profile,
    owner,
    vehicles,
    hero: {
      bayLabel: firstSpot?.code ?? profile.storage.spotLabel,
      section: firstSpot?.section ?? profile.storage.section,
      zone: firstSpot?.zone ?? profile.storage.zone,
      humidity: firstSpot?.climate ?? profile.storage.humidity,
      gateCode: profile.storage.gate.code,
      rowMapLabel: firstSpot?.rowLabel ?? profile.storage.rowMapLabel,
      lastVisit: formatDateTime(lastVisit),
      conciergeEta: profile.storage.conciergeEta,
    },
    gate: profile.storage.gate,
    accessEvents: vehicleStatusEvents.map(mapAccessEvent),
    billing: profile.billing,
    stats: {
      stored,
      checkedOut,
      total: vehicles.length,
    },
  };
});
