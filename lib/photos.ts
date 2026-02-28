export const VEHICLE_PHOTO_TYPES = ["intake", "condition", "event", "general"] as const;

export type VehiclePhotoType = (typeof VEHICLE_PHOTO_TYPES)[number];

export const ACCEPTED_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export type VehiclePhoto = {
  /** Unique identifier derived from the storage key */
  id: string;
  vehicleId: string;
  type: VehiclePhotoType;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  storageKey: string;
  uploadedAt: string;
};

export const PHOTO_TYPE_LABELS: Record<VehiclePhotoType, string> = {
  intake: "Intake",
  condition: "Condition",
  event: "Event",
  general: "General",
};

export function isVehiclePhotoType(value: string | null | undefined): value is VehiclePhotoType {
  if (!value) return false;
  return (VEHICLE_PHOTO_TYPES as readonly string[]).includes(value);
}
