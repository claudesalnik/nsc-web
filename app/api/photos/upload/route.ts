import { NextRequest, NextResponse } from "next/server";
import { isVehiclePhotoType, type VehiclePhotoType } from "@/lib/photos";
import {
  PHOTO_MIME_WHITELIST,
  PHOTO_STORAGE_LIMIT_BYTES,
  uploadVehiclePhoto,
} from "@/lib/storage";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function coerceVehicleId(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function resolveType(value: FormDataEntryValue | null, fallback: VehiclePhotoType): VehiclePhotoType {
  if (typeof value !== "string") return fallback;
  return isVehiclePhotoType(value) ? value : fallback;
}

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[nsc/photos/upload] Failed to read form data", error);
    return jsonError("Malformed upload payload.");
  }

  const vehicleId = coerceVehicleId(formData.get("vehicleId"));
  if (!vehicleId) {
    return jsonError("vehicleId is required.");
  }

  const fallbackType = resolveType(formData.get("type"), "general");
  const perFileTypes = formData.getAll("types[]").map((value) => (typeof value === "string" ? value : null));

  const files: File[] = [];
  const appendFile = (entry: FormDataEntryValue) => {
    if (entry instanceof File && entry.size > 0) {
      files.push(entry);
    }
  };

  formData.getAll("photos").forEach(appendFile);
  formData.getAll("photo").forEach(appendFile);
  formData.getAll("files").forEach(appendFile);

  if (!files.length) {
    return jsonError("At least one photo is required.");
  }

  const uploaded = [];

  for (const [index, file] of files.entries()) {
    const typeCandidate = perFileTypes[index];
    const desiredType = isVehiclePhotoType(typeCandidate ?? "") ? (typeCandidate as VehiclePhotoType) : fallbackType;

    if (file.size > PHOTO_STORAGE_LIMIT_BYTES) {
      return jsonError(`File "${file.name}" exceeds the 10MB limit.`);
    }

    if (file.type && !(PHOTO_MIME_WHITELIST as readonly string[]).includes(file.type)) {
      return jsonError(`Unsupported file format for "${file.name}".`);
    }

    try {
      const photo = await uploadVehiclePhoto({ vehicleId, type: desiredType, file });
      uploaded.push(photo);
    } catch (error) {
      console.error("[nsc/photos/upload] Upload failed", error);
      const message = error instanceof Error ? error.message : "Failed to upload photo.";
      const status = message.toLowerCase().includes("unsupported") || message.toLowerCase().includes("exceeds") ? 400 : 500;
      return jsonError(message, status);
    }
  }

  return NextResponse.json({ photos: uploaded }, { status: 201 });
}
