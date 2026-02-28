import { NextRequest, NextResponse } from "next/server";
import { isVehiclePhotoType, type VehiclePhotoType } from "@/lib/photos";
import { deleteVehiclePhoto, listVehiclePhotos } from "@/lib/storage";

type RouteContext = { params: Promise<{ vehicleId: string }> };

async function getVehicleId(context: RouteContext) {
  const { vehicleId } = await context.params;
  return vehicleId;
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest, context: RouteContext) {
  const vehicleId = await getVehicleId(context);
  const typeParam = request.nextUrl.searchParams.get("type");

  if (typeParam && !isVehiclePhotoType(typeParam)) {
    return jsonError("Invalid photo type filter.");
  }

  try {
    const photos = await listVehiclePhotos(vehicleId, typeParam as VehiclePhotoType | undefined);
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("[nsc/photos] GET failed", error);
    return jsonError("Failed to load photos.", 500);
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const vehicleId = await getVehicleId(context);
  const storageKey = request.nextUrl.searchParams.get("key");

  if (!storageKey) {
    return jsonError("Missing storage key to delete.");
  }

  if (!storageKey.includes(`/${vehicleId}/`)) {
    return jsonError("Storage key does not match vehicle.");
  }

  try {
    await deleteVehiclePhoto(storageKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[nsc/photos] Delete failed", error);
    return jsonError("Failed to delete photo.", 500);
  }
}
