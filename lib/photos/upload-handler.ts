import { isVehiclePhotoType, type VehiclePhoto, type VehiclePhotoType } from '@/lib/photos';
import { PHOTO_MIME_WHITELIST, PHOTO_STORAGE_LIMIT_BYTES, uploadVehiclePhoto } from '@/lib/storage';

const FILE_FIELD_KEYS = ['photos', 'photo', 'files'] as const;

export class PhotoUploadError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'PhotoUploadError';
    this.status = status;
  }
}

type UploadOptions = {
  vehicleIdOverride?: string;
};

export async function processPhotoUpload(formData: FormData, options: UploadOptions = {}): Promise<VehiclePhoto[]> {
  const formVehicleId = coerceVehicleId(formData.get('vehicleId'));
  const vehicleId = options.vehicleIdOverride ?? formVehicleId;

  if (options.vehicleIdOverride && formVehicleId && formVehicleId !== options.vehicleIdOverride) {
    throw new PhotoUploadError('Vehicle ID mismatch between path and payload.');
  }

  if (!vehicleId) {
    throw new PhotoUploadError('vehicleId is required.');
  }

  const fallbackType = resolveType(formData.get('type'), 'general');
  const perFileTypes = formData.getAll('types[]').map((value) => (typeof value === 'string' ? value : null));

  const files = collectFiles(formData);
  if (!files.length) {
    throw new PhotoUploadError('At least one photo is required.');
  }

  const uploaded: VehiclePhoto[] = [];

  for (const [index, file] of files.entries()) {
    validateFile(file);
    const typeCandidate = perFileTypes[index];
    const desiredType = isVehiclePhotoType(typeCandidate ?? '') ? (typeCandidate as VehiclePhotoType) : fallbackType;

    try {
      const photo = await uploadVehiclePhoto({ vehicleId, type: desiredType, file });
      uploaded.push(photo);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload photo.';
      const status = message.toLowerCase().includes('unsupported') || message.toLowerCase().includes('exceeds') ? 400 : 500;
      throw new PhotoUploadError(message, status);
    }
  }

  return uploaded;
}

function collectFiles(formData: FormData): File[] {
  const files: File[] = [];

  const appendEntry = (entry: FormDataEntryValue) => {
    if (entry instanceof File && entry.size > 0) {
      files.push(entry);
    }
  };

  for (const key of FILE_FIELD_KEYS) {
    const entries = formData.getAll(key);
    if (entries.length) {
      entries.forEach(appendEntry);
    }
  }

  return files;
}

function validateFile(file: File) {
  if (file.size > PHOTO_STORAGE_LIMIT_BYTES) {
    throw new PhotoUploadError(`File "${file.name}" exceeds the 10MB limit.`);
  }

  if (file.type && !(PHOTO_MIME_WHITELIST as readonly string[]).includes(file.type)) {
    throw new PhotoUploadError(`Unsupported file format for "${file.name}".`);
  }
}

function coerceVehicleId(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function resolveType(value: FormDataEntryValue | null, fallback: VehiclePhotoType): VehiclePhotoType {
  if (typeof value === 'string' && isVehiclePhotoType(value)) {
    return value;
  }
  return fallback;
}
