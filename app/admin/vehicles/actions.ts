'use server';

import { revalidatePath } from 'next/cache';
import { AccessStatus, Prisma } from '@prisma/client';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { serializeVehicle, type AdminVehicle } from '@/app/admin/data/serializers';

const REVALIDATE_PATHS = ['/admin/vehicles', '/admin/members'];

export type VehicleFormInput = {
  id?: string;
  ownerId: string;
  year: number;
  make: string;
  model: string;
  color?: string | null;
  storageSpotId?: string | null;
  status: AccessStatus;
  vin: string;
  photoUrl?: string | null;
  notes?: string | null;
};

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export async function createVehicleAction(payload: VehicleFormInput): Promise<ActionResult<AdminVehicle>> {
  await requireAdmin();
  const data = sanitizeVehiclePayload(payload);

  try {
    const created = await prisma.vehicle.create({
      data: {
        ownerId: data.ownerId,
        vin: data.vin,
        year: data.year,
        make: data.make,
        model: data.model,
        trim: null,
        color: data.color,
        currentStatus: data.status,
        currentSpotId: data.storageSpotId ?? null,
        notes: data.notes,
        statusEvents: {
          create: {
            status: data.status,
            spotId: data.storageSpotId ?? null,
            note: 'Vehicle created via admin dashboard',
          },
        },
      },
      include: baseVehicleInclude,
    });

    if (data.photoUrl) {
      await upsertPrimaryPhoto(created.id, data.photoUrl);
    }

    await revalidateAdminPaths();
    return { ok: true, data: serializeVehicle(created) };
  } catch (error) {
    return { ok: false, error: humanizeError(error) };
  }
}

export async function updateVehicleAction(payload: VehicleFormInput & { id: string }): Promise<ActionResult<AdminVehicle>> {
  await requireAdmin();
  const data = sanitizeVehiclePayload(payload);

  try {
    const updated = await prisma.vehicle.update({
      where: { id: data.id },
      data: {
        ownerId: data.ownerId,
        vin: data.vin,
        year: data.year,
        make: data.make,
        model: data.model,
        color: data.color,
        currentStatus: data.status,
        currentSpotId: data.storageSpotId ?? null,
        notes: data.notes,
      },
      include: baseVehicleInclude,
    });

    if (data.photoUrl) {
      await upsertPrimaryPhoto(updated.id, data.photoUrl);
    }

    await revalidateAdminPaths();
    return { ok: true, data: serializeVehicle(updated) };
  } catch (error) {
    return { ok: false, error: humanizeError(error) };
  }
}

export async function deleteVehicleAction(vehicleId: string): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  try {
    await prisma.vehicle.delete({ where: { id: vehicleId } });
    await revalidateAdminPaths();
    return { ok: true, data: { id: vehicleId } };
  } catch (error) {
    return { ok: false, error: humanizeError(error) };
  }
}

export async function toggleAccessStatusAction(vehicleId: string): Promise<ActionResult<AdminVehicle>> {
  await requireAdmin();
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: baseVehicleInclude,
    });

    if (!vehicle) {
      return { ok: false, error: 'Vehicle not found.' };
    }

    const nextStatus: AccessStatus = vehicle.currentStatus === 'IN' ? 'OUT' : 'IN';
    const nextSpotId = nextStatus === 'OUT' ? null : vehicle.currentSpotId;

    const updated = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        currentStatus: nextStatus,
        currentSpotId: nextSpotId,
      },
      include: baseVehicleInclude,
    });

    await prisma.vehicleStatusEvent.create({
      data: {
        vehicleId,
        status: nextStatus,
        spotId: nextSpotId,
        note: `Status toggled via admin dashboard (${nextStatus}).`,
      },
    });

    await revalidateAdminPaths();
    return { ok: true, data: serializeVehicle(updated) };
  } catch (error) {
    return { ok: false, error: humanizeError(error) };
  }
}

export async function assignVehicleSpotAction({
  vehicleId,
  storageSpotId,
}: {
  vehicleId: string;
  storageSpotId?: string | null;
}): Promise<ActionResult<AdminVehicle>> {
  await requireAdmin();
  try {
    const updated = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        currentSpotId: storageSpotId ?? null,
      },
      include: baseVehicleInclude,
    });

    await prisma.vehicleStatusEvent.create({
      data: {
        vehicleId,
        status: updated.currentStatus,
        spotId: storageSpotId ?? null,
        note: 'Storage spot reassigned via admin dashboard.',
      },
    });

    await revalidateAdminPaths();
    return { ok: true, data: serializeVehicle(updated) };
  } catch (error) {
    return { ok: false, error: humanizeError(error) };
  }
}

function sanitizeVehiclePayload(payload: VehicleFormInput & { id?: string }) {
  return {
    id: payload.id,
    ownerId: payload.ownerId,
    year: Number(payload.year) || new Date().getFullYear(),
    make: payload.make.trim() || 'Unknown',
    model: payload.model.trim() || 'Model',
    color: payload.color?.trim() || null,
    storageSpotId: payload.storageSpotId ? payload.storageSpotId : null,
    status: payload.status ?? 'IN',
    vin: payload.vin.trim() || `VIN-${Date.now()}`,
    photoUrl: payload.photoUrl?.trim() || null,
    notes: payload.notes?.trim() || null,
  } as const;
}

async function upsertPrimaryPhoto(vehicleId: string, url: string) {
  const existing = await prisma.vehiclePhoto.findFirst({
    where: { vehicleId, isPrimary: true },
  });

  if (existing) {
    await prisma.vehiclePhoto.update({
      where: { id: existing.id },
      data: { url },
    });
    return;
  }

  await prisma.vehiclePhoto.create({
    data: {
      vehicleId,
      url,
      isPrimary: true,
    },
  });
}

async function revalidateAdminPaths() {
  await Promise.all(REVALIDATE_PATHS.map((path) => revalidatePath(path)));
}

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== 'admin') {
    throw new Error('UNAUTHORIZED');
  }
}

function humanizeError(error: unknown) {
  if (error instanceof Error) {
    if ('code' in error) {
      const known = error as Prisma.PrismaClientKnownRequestError;
      if (known.code === 'P2002') {
        return 'That VIN or storage spot is already in use.';
      }
    }
    if (error.message === 'UNAUTHORIZED') {
      return 'You are not allowed to modify vehicles.';
    }
    return error.message;
  }
  return 'Something went wrong.';
}

const baseVehicleInclude = {
  owner: true,
  currentSpot: true,
  photos: { orderBy: { createdAt: 'desc' as const } },
  statusEvents: { orderBy: { occurredAt: 'desc' as const }, take: 5 },
} as const;