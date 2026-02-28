import "server-only";

import { del, list, put, type ListBlobResultBlob } from "@vercel/blob";
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  ACCEPTED_PHOTO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  PHOTO_TYPE_LABELS,
  VEHICLE_PHOTO_TYPES,
  type VehiclePhoto,
  type VehiclePhotoType,
} from "@/lib/photos";

/**
 * Storage providers rely on the following environment variables:
 * - `BLOB_READ_WRITE_TOKEN`: Required for Vercel Blob access. Generate via `vercel storage blobs tokens create`.
 * - `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: Optional fallback to S3 when Blob is unavailable.
 * - `AWS_S3_PUBLIC_URL`: Optional override for public URLs (useful when fronting S3 with CloudFront/custom domains).
 */

const STORAGE_ROOT = "vehicles";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const s3Config = {
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  publicBaseUrl: process.env.AWS_S3_PUBLIC_URL,
};

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!s3Config.bucket || !s3Config.region || !s3Config.accessKeyId || !s3Config.secretAccessKey) {
      throw new Error("S3 credentials are not fully configured.");
    }

    s3Client = new S3Client({
      region: s3Config.region,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.secretAccessKey,
      },
    });
  }

  return s3Client;
}

type UploadPayload = {
  vehicleId: string;
  type: VehiclePhotoType;
  fileBuffer: Buffer;
  filename: string;
  mimeType: string;
};

type ListPayload = {
  vehicleId: string;
  type?: VehiclePhotoType;
};

interface StorageDriver {
  upload(payload: UploadPayload): Promise<VehiclePhoto>;
  list(payload: ListPayload): Promise<VehiclePhoto[]>;
  delete(storageKey: string): Promise<void>;
}

function ensureDriver(): StorageDriver {
  if (BLOB_TOKEN) {
    return vercelBlobDriver;
  }

  if (s3Config.bucket && s3Config.region && s3Config.accessKeyId && s3Config.secretAccessKey) {
    return s3Driver;
  }

  throw new Error(
    "No storage provider configured. Provide either BLOB_READ_WRITE_TOKEN or AWS S3 credentials."
  );
}

const vercelBlobDriver: StorageDriver = {
  async upload({ vehicleId, type, fileBuffer, filename, mimeType }) {
    const pathname = buildStoragePath(vehicleId, type, filename);
    const result = await put(pathname, fileBuffer, {
      access: "public",
      contentType: mimeType,
      token: BLOB_TOKEN,
      addRandomSuffix: false,
    });

    return mapBlobToVehiclePhoto({
      blob: {
        pathname: result.pathname,
        url: result.url,
        uploadedAt: new Date(),
        size: fileBuffer.byteLength,
        contentType: mimeType,
      },
    });
  },

  async list({ vehicleId, type }) {
    const prefix = buildPrefix(vehicleId, type);
    const { blobs } = await list({ token: BLOB_TOKEN, prefix });
    return blobs.map((blob) =>
      mapBlobToVehiclePhoto({
        blob: {
          pathname: blob.pathname,
          url: blob.url,
          uploadedAt: blob.uploadedAt,
          size: blob.size,
          contentType: blob.pathname ? guessMimeFromFilename(blob.pathname) : "application/octet-stream",
        },
      })
    );
  },

  async delete(storageKey) {
    const normalized = normalizeStorageKey(storageKey);
    await del(normalized, { token: BLOB_TOKEN });
  },
};

const s3Driver: StorageDriver = {
  async upload({ vehicleId, type, fileBuffer, filename, mimeType }) {
    const pathname = buildStoragePath(vehicleId, type, filename);
    const client = getS3Client();

    await client.send(
      new PutObjectCommand({
        Bucket: s3Config.bucket,
        Key: pathname,
        Body: fileBuffer,
        ContentType: mimeType,
        ACL: "public-read",
      })
    );

    return mapBlobToVehiclePhoto({
      blob: {
        pathname,
        url: buildS3PublicUrl(pathname),
        uploadedAt: new Date(),
        size: fileBuffer.byteLength,
        contentType: mimeType,
      },
    });
  },

  async list({ vehicleId, type }) {
    const client = getS3Client();
    const prefix = buildPrefix(vehicleId, type);
    const command = new ListObjectsV2Command({
      Bucket: s3Config.bucket,
      Prefix: prefix,
    });

    const response = await client.send(command);
    const contents = response.Contents ?? [];

    return contents
      .filter((object) => Boolean(object.Key) && !object.Key?.endsWith("/"))
      .map((object) =>
        mapBlobToVehiclePhoto({
          blob: {
            pathname: object.Key as string,
            url: buildS3PublicUrl(object.Key as string),
            uploadedAt: object.LastModified ?? new Date(),
            size: object.Size ?? 0,
            contentType: guessMimeFromFilename(object.Key as string),
          },
        })
      );
  },

  async delete(storageKey) {
    const client = getS3Client();
    const normalized = normalizeStorageKey(storageKey);
    await client.send(
      new DeleteObjectCommand({
        Bucket: s3Config.bucket,
        Key: normalized,
      })
    );
  },
};

function buildS3PublicUrl(pathname: string): string {
  if (s3Config.publicBaseUrl) {
    return `${s3Config.publicBaseUrl.replace(/\/$/, "")}/${pathname}`;
  }

  return `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${pathname}`;
}

function buildPrefix(vehicleId: string, type?: VehiclePhotoType) {
  return type ? `${STORAGE_ROOT}/${vehicleId}/${type}/` : `${STORAGE_ROOT}/${vehicleId}/`;
}

function mapBlobToVehiclePhoto({
  blob,
}: {
  blob: Pick<ListBlobResultBlob, "pathname" | "url" | "uploadedAt" | "size"> & { contentType?: string };
}): VehiclePhoto {
  const normalizedPath = blob.pathname.replace(/^\//, "");
  const segments = normalizedPath.split("/");

  if (segments.length < 4 || segments[0] !== STORAGE_ROOT) {
    throw new Error(`Unexpected storage path: ${blob.pathname}`);
  }

  const vehicleId = segments[1];
  const typeSegment = segments[2];
  const filename = segments.slice(3).join("/");
  const type = (VEHICLE_PHOTO_TYPES as readonly string[]).includes(typeSegment)
    ? (typeSegment as VehiclePhotoType)
    : "general";

  return {
    id: normalizedPath,
    storageKey: normalizedPath,
    vehicleId,
    type,
    filename,
    url: blob.url,
    mimeType: blob.contentType ?? guessMimeFromFilename(filename),
    size: blob.size,
    uploadedAt: new Date(blob.uploadedAt).toISOString(),
  };
}

function buildStoragePath(vehicleId: string, type: VehiclePhotoType, filename: string) {
  const safeVehicleId = vehicleId.trim();
  const timestamp = Date.now();
  const safeFilename = sanitizeFilename(filename);
  return `${STORAGE_ROOT}/${safeVehicleId}/${type}/${timestamp}-${safeFilename}`;
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

function normalizeStorageKey(storageKey: string) {
  if (storageKey.startsWith("http")) {
    try {
      const url = new URL(storageKey);
      return url.pathname.replace(/^\//, "");
    } catch {
      throw new Error("Invalid storage key URL provided.");
    }
  }

  return storageKey.replace(/^\//, "");
}

function ensureMimeType(value?: string) {
  if (!value) return "application/octet-stream";
  return value;
}

function assertPhotoType(value: string): asserts value is VehiclePhotoType {
  if (!(VEHICLE_PHOTO_TYPES as readonly string[]).includes(value)) {
    throw new Error(`Unsupported photo type: ${value}`);
  }
}

function assertMimeType(mimeType: string) {
  if (!(ACCEPTED_PHOTO_MIME_TYPES as readonly string[]).includes(mimeType)) {
    throw new Error(
      `Unsupported file type. Allowed: ${ACCEPTED_PHOTO_MIME_TYPES.join(", ")}`
    );
  }
}

async function fileToBuffer(file: File | Blob): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function uploadVehiclePhoto({
  vehicleId,
  type,
  file,
}: {
  vehicleId: string;
  type: VehiclePhotoType;
  file: File | Blob;
}): Promise<VehiclePhoto> {
  assertPhotoType(type);

  const filename = "name" in file && file.name ? file.name : `upload-${Date.now()}`;
  const mimeType = ensureMimeType(file.type) || guessMimeFromFilename(filename);
  const size = "size" in file ? file.size : 0;

  if (size > MAX_PHOTO_SIZE_BYTES) {
    throw new Error(`File exceeds the 10MB limit (${(MAX_PHOTO_SIZE_BYTES / 1024 / 1024).toFixed(0)}MB).`);
  }

  assertMimeType(mimeType);

  const fileBuffer = await fileToBuffer(file);
  const driver = ensureDriver();
  return driver.upload({ vehicleId, type, fileBuffer, filename, mimeType });
}

export async function listVehiclePhotos(
  vehicleId: string,
  type?: VehiclePhotoType
): Promise<VehiclePhoto[]> {
  const driver = ensureDriver();
  if (type) {
    assertPhotoType(type);
  }

  const photos = await driver.list({ vehicleId, type });
  return photos.sort((a, b) => (a.uploadedAt > b.uploadedAt ? -1 : 1));
}

export async function deleteVehiclePhoto(storageKey: string): Promise<void> {
  const driver = ensureDriver();
  await driver.delete(storageKey);
}

export const PHOTO_STORAGE_LIMIT_BYTES = MAX_PHOTO_SIZE_BYTES;
export const PHOTO_MIME_WHITELIST = ACCEPTED_PHOTO_MIME_TYPES;
export const PHOTO_TYPE_BADGES = PHOTO_TYPE_LABELS;
