import type {
  MembershipTier,
  Owner,
  OwnerStatus,
  StorageSpot,
  Vehicle,
} from '@prisma/client';

import type { VehicleWithRelations } from '@/types/db';

type VehicleStatus = Vehicle['currentStatus'];

export type AdminVehicle = {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  color?: string | null;
  status: VehicleStatus;
  storageSpotId: string | null;
  storageSpotCode: string | null;
  storageSpotLevel: string | null;
  storageSpotSize: string | null;
  vin: string;
  photoUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminMember = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  company?: string | null;
  membershipTag?: string | null;
  membershipTier: MembershipTier;
  status: OwnerStatus;
  notes?: string | null;
  joinedAt: string;
  vehiclesOwned: number;
};

export type StorageSpotOption = {
  id: string;
  code: string;
  displayName: string;
  level: string | null;
  size: string | null;
  climate: string | null;
};

export function serializeVehicle(record: VehicleWithRelations): AdminVehicle {
  const primaryPhoto = record.photos?.find((photo) => photo.isPrimary) ?? record.photos?.[0];

  return {
    id: record.id,
    ownerId: record.ownerId,
    ownerName: record.owner.fullName,
    ownerEmail: record.owner.email,
    year: record.year,
    make: record.make,
    model: record.model,
    trim: record.trim,
    color: record.color,
    status: record.currentStatus,
    storageSpotId: record.currentSpotId ?? null,
    storageSpotCode: record.currentSpot?.code ?? null,
    storageSpotLevel: record.currentSpot?.level ?? null,
    storageSpotSize: record.currentSpot?.size ?? null,
    vin: record.vin,
    photoUrl: primaryPhoto?.url,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function serializeVehicleLite(vehicle: Vehicle): AdminVehicle {
  return {
    id: vehicle.id,
    ownerId: vehicle.ownerId,
    ownerName: '',
    ownerEmail: '',
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim,
    color: vehicle.color,
    status: vehicle.currentStatus,
    storageSpotId: vehicle.currentSpotId ?? null,
    storageSpotCode: null,
    storageSpotLevel: null,
    storageSpotSize: null,
    vin: vehicle.vin,
    createdAt: vehicle.createdAt.toISOString(),
    updatedAt: vehicle.updatedAt.toISOString(),
  };
}

export function serializeMember(owner: Owner, vehiclesOwned: number): AdminMember {
  return {
    id: owner.id,
    fullName: owner.fullName,
    email: owner.email,
    phone: owner.phone,
    city: owner.city,
    company: owner.company,
    membershipTag: owner.membershipTag,
    membershipTier: owner.membershipTier,
    status: owner.status,
    notes: owner.notes,
    joinedAt: owner.joinedAt.toISOString(),
    vehiclesOwned,
  };
}

export function serializeSpot(spot: StorageSpot): StorageSpotOption {
  return {
    id: spot.id,
    code: spot.code,
    displayName: spot.displayName,
    level: spot.level ?? null,
    size: spot.size ?? null,
    climate: spot.climate ?? null,
  };
}
