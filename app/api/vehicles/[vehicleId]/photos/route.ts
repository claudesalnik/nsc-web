export const runtime = "nodejs";

import { promises as fs } from "node:fs";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import {
  ACCEPTED_PHOTO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  isVehiclePhotoType,
  type VehiclePhoto,
  type VehiclePhotoType,
} from "@/lib/photos";
import {
  deleteVehiclePhoto as deleteRemotePhoto,
  listVehiclePhotos as listRemotePhotos,
  uploadVehiclePhoto,
} from "@/lib/storage";
import { prisma } from "@/lib/prisma";

const uploadRoot = path.join(process.cwd(), "public", "uploads");
const hasBlobCreds = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const hasS3Creds = Boolean(
  process.env.AWS_S3_BUCKET && process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY,
);
const canUseRemoteStorage = hasBlobCreds || hasS3Creds;

const LOCAL_ALLOWED_FIELDS = ["photos", "photo", "files", "image", "file"] as const;

type RouteContext = { params: Promise<{ vehicleId: string }> };

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function getVehicleId(context: RouteContext) {
  const { vehicleId } = await context.params;
  return vehicleId;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const vehicleId = await getVehicleId(context);

  if (canUseRemoteStorage) {
    try {
      const photos = await listRemotePhotos(vehicleId);
      return NextResponse.json({ photos });
    } catch (error) {
      console.warn("[nsc/photos] Remote list failed, falling back to DB", error);
    }
  }

  try {
    const records = await prisma.vehiclePhoto.findMany({
      where: { vehicleId },
      orderBy: { createdAt: "desc" },
    });

    const photos: VehiclePhoto[] = [];
    for (const record of records) {
      const localPhoto = await mapRecordToLocalPhoto(record);
      if (localPhoto) {
        photos.push(localPhoto);
      }
    }

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("[nsc/photos] Failed to list local photos", error);
    return jsonError("Failed to load photos.", 500);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const vehicleId = await getVehicleId(context);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    console.error("[nsc/photos] Unable to parse form data", error);
    return jsonError("Malformed upload payload.");
  }

  const files = collectFiles(formData);
  if (!files.length) {
    return jsonError("At least one photo is required.");
  }

  const fallbackType = resolveType(formData.get("type"));
  const uploaded: VehiclePhoto[] = [];

  for (const file of files) {
    const desiredType = resolveType(file.typeGuess ?? fallbackType);

    const validationError = validateUpload(file.file);
    if (validationError) {
      return jsonError(validationError);
    }

    try {
      const photo = await persistPhoto({ vehicleId, file: file.file, type: desiredType });
      uploaded.push(photo);
    } catch (error) {
      console.error("[nsc/photos] Upload failed", error);
      return jsonError("Failed to upload photo.", 500);
    }
  }

  return NextResponse.json({ photos: uploaded }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const vehicleId = await getVehicleId(context);
  const storageKey = request.nextUrl.searchParams.get("key");

  if (!storageKey) {
    return jsonError("Missing storage key to delete.");
  }

  if (!storageKey.includes(`/${vehicleId}/`) && !storageKey.startsWith(`${vehicleId}/`)) {
    return jsonError("Storage key does not match vehicle.");
  }

  if (canUseRemoteStorage) {
    try {
      await deleteRemotePhoto(storageKey);
    } catch (error) {
      console.warn("[nsc/photos] Remote delete failed, trying local fallback", error);
    }
  }

  try {
    await deleteLocalRecordAndFile(storageKey);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[nsc/photos] Local delete failed", error);
    return jsonError("Failed to delete photo.", 500);
  }
}

function collectFiles(formData: FormData) {
  const files: { file: File; typeGuess?: VehiclePhotoType }[] = [];

  for (const field of LOCAL_ALLOWED_FIELDS) {
    for (const entry of formData.getAll(field)) {
      if (entry instanceof File && entry.size > 0) {
        files.push({ file: entry });
      }
    }
  }

  return files;
}

function resolveType(value: FormDataEntryValue | null): VehiclePhotoType {
  if (typeof value === "string" && isVehiclePhotoType(value)) {
    return value;
  }

  return "general";
}

function validateUpload(file: File): string | null {
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return `File "${file.name}" exceeds the ${Math.round(MAX_PHOTO_SIZE_BYTES / 1024 / 1024)}MB limit.`;
  }

  if (file.type && !(ACCEPTED_PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return `Unsupported file format for "${file.name}".`;
  }

  return null;
}

async function persistPhoto({
  vehicleId,
  file,
  type,
}: {
  vehicleId: string;
  file: File;
  type: VehiclePhotoType;
}): Promise<VehiclePhoto> {
  const payload = canUseRemoteStorage ? await uploadViaRemote({ vehicleId, file, type }) : await uploadLocally({ vehicleId, file, type });
  const record = await prisma.vehiclePhoto.create({
    data: {
      vehicleId,
      url: payload.url,
      isPrimary: false,
    },
  });

  return { ...payload, id: record.id, uploadedAt: record.createdAt.toISOString() };
}

async function uploadViaRemote({
  vehicleId,
  file,
  type,
}: {
  vehicleId: string;
  file: File;
  type: VehiclePhotoType;
}): Promise<VehiclePhoto> {
  try {
    const photo = await uploadVehiclePhoto({ vehicleId, type, file });
    return photo;
  } catch (error) {
    console.warn("[nsc/photos] Remote upload failed, using local fallback", error);
    return uploadLocally({ vehicleId, file, type });
  }
}

async function uploadLocally({
  vehicleId,
  file,
  type,
}: {
  vehicleId: string;
  file: File;
  type: VehiclePhotoType;
}): Promise<VehiclePhoto> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const inferredMime = file.type || guessMimeFromFilename(file.name);
  const sanitized = sanitizeFilename(file.name || `upload-${Date.now()}`);
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}-${sanitized}`;
  const relativeDir = path.join("uploads", vehicleId, type);
  const storageKey = path.posix.join(relativeDir.replace(/\\/g, "/"), uniqueName);
  const absoluteDir = path.join(uploadRoot, vehicleId, type);
  const absoluteFile = path.join(absoluteDir, uniqueName);

  await fs.mkdir(absoluteDir, { recursive: true });
  await fs.writeFile(absoluteFile, buffer);

  const publicUrl = `/${storageKey}`;

  return {
    id: storageKey,
    vehicleId,
    type,
    filename: uniqueName,
    url: publicUrl,
    mimeType: inferredMime,
    size: buffer.byteLength,
    storageKey,
    uploadedAt: new Date().toISOString(),
  };
}

async function mapRecordToLocalPhoto(record: { id: string; url: string; vehicleId: string; createdAt: Date }) {
  const segments = record.url.replace(/^\//, "").split("/");
  if (segments.length < 4) {
    return null;
  }

  const [, vehicleId, maybeType, ...rest] = segments;
  const type = isVehiclePhotoType(maybeType) ? maybeType : "general";
  const filename = rest.join("/");
  const storageKey = segments.join("/");
  const localPath = path.join(process.cwd(), "public", storageKey);
  let size = 0;

  try {
    const stats = await fs.stat(localPath);
    size = stats.size;
  } catch (error) {
    console.warn("[nsc/photos] Missing local file", storageKey, error);
  }

  return {
    id: record.id,
    vehicleId,
    type,
    filename,
    url: record.url,
    mimeType: guessMimeFromFilename(filename),
    size,
    storageKey,
    uploadedAt: record.createdAt.toISOString(),
  } as VehiclePhoto;
}

async function deleteLocalRecordAndFile(storageKey: string) {
  const normalized = storageKey.replace(/^\//, "");

  await prisma.vehiclePhoto.deleteMany({ where: { url: `/${normalized}` } });

  const absolute = path.join(process.cwd(), "public", normalized);
  try {
    await fs.unlink(absolute);
  } catch (error) {
    // No-op if the file was already removed.
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

function guessMimeFromFilename(filename: string) {
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".webp")) return "image/webp";
  if (filename.endsWith(".jpeg")) return "image/jpeg";
  if (filename.endsWith(".jpg")) return "image/jpeg";
  return "application/octet-stream";
}
