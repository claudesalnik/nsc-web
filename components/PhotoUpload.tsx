"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { AlertTriangle, CheckCircle2, Image as ImageIcon, Loader2, Trash2, UploadCloud } from "lucide-react";
import {
  ACCEPTED_PHOTO_MIME_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  PHOTO_TYPE_LABELS,
  VEHICLE_PHOTO_TYPES,
  type VehiclePhoto,
  type VehiclePhotoType,
} from "@/lib/photos";
import { Button } from "@/components/ui/Button";

const ACCEPT_ATTRIBUTE = ACCEPTED_PHOTO_MIME_TYPES.join(",");
const MAX_MB = Math.round(MAX_PHOTO_SIZE_BYTES / 1024 / 1024);
const ACCEPTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const DEFAULT_TITLE = "Upload photos";
const DEFAULT_SUBTITLE = "Drag in multiple angles. Intake shots show the full vehicle, condition shots zoom into particulars.";
const DEFAULT_EYEBROW = "Vehicle imagery";

export type PhotoUploadProps = {
  vehicleId: string;
  defaultType?: VehiclePhotoType;
  allowedTypes?: VehiclePhotoType[];
  hideTypePicker?: boolean;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  uploadEndpoint?: string;
  onUploaded?: (photos: VehiclePhoto[]) => void;
};

type UploadStatus = "pending" | "uploading" | "done" | "error";

type UploadEntry = {
  id: string;
  file: File;
  previewUrl: string;
  type: VehiclePhotoType;
  progress: number;
  status: UploadStatus;
  error?: string;
  uploadedPhoto?: VehiclePhoto;
};

export function PhotoUpload({
  vehicleId,
  defaultType = "general",
  allowedTypes,
  hideTypePicker,
  className,
  eyebrow = DEFAULT_EYEBROW,
  title = DEFAULT_TITLE,
  description = DEFAULT_SUBTITLE,
  uploadEndpoint,
  onUploaded,
}: PhotoUploadProps) {
  const defaultEndpoint = `/api/vehicles/${vehicleId}/photos`;
  const resolvedEndpoint = uploadEndpoint ?? defaultEndpoint;
  const availableTypes = useMemo<VehiclePhotoType[]>(() => {
    if (allowedTypes?.length) {
      const deduped = Array.from(new Set(allowedTypes));
      return deduped.length ? (deduped as VehiclePhotoType[]) : [...VEHICLE_PHOTO_TYPES];
    }
    return [...VEHICLE_PHOTO_TYPES];
  }, [allowedTypes]);

  const initialType = useMemo<VehiclePhotoType>(() => {
    if (allowedTypes?.length && !allowedTypes.includes(defaultType)) {
      return allowedTypes[0];
    }
    if (availableTypes.includes(defaultType)) {
      return defaultType;
    }
    return availableTypes[0] ?? "general";
  }, [allowedTypes, availableTypes, defaultType]);

  const [currentType, setCurrentType] = useState<VehiclePhotoType>(initialType);
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCurrentType(initialType);
  }, [initialType]);

  useEffect(() => {
    return () => {
      entries.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
    };
  }, [entries]);

  const startUpload = useCallback(
    (entry: UploadEntry) => {
      setEntries((prev) =>
        prev.map((item) => (item.id === entry.id ? { ...item, status: "uploading", progress: 5 } : item))
      );

      uploadViaXHR({
        vehicleId,
        entry,
        endpoint: resolvedEndpoint,
        onProgress: (progress) =>
          setEntries((prev) => prev.map((item) => (item.id === entry.id ? { ...item, progress } : item))),
      })
        .then((photo) => {
          setEntries((prev) =>
            prev.map((item) =>
              item.id === entry.id
                ? { ...item, status: "done", progress: 100, uploadedPhoto: photo, error: undefined }
                : item
            )
          );
          onUploaded?.([photo]);
        })
        .catch((error: Error) => {
          setEntries((prev) =>
            prev.map((item) =>
              item.id === entry.id
                ? { ...item, status: "error", error: error.message, progress: 0 }
                : item
            )
          );
        });
    },
    [onUploaded, resolvedEndpoint, vehicleId]
  );

  const queueFiles = useCallback(
    (files: FileList | File[]) => {
      const array = Array.from(files);
      const acceptedEntries: UploadEntry[] = [];
      const effectiveType = availableTypes.includes(currentType) ? currentType : availableTypes[0];

      array.forEach((file) => {
        if (!isAllowedFile(file)) return;
        if (file.size > MAX_PHOTO_SIZE_BYTES) return;

        const entry: UploadEntry = {
          id: `${file.name}-${file.lastModified}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          type: effectiveType,
          status: "pending",
          progress: 0,
        };

        acceptedEntries.push(entry);
      });

      if (!acceptedEntries.length) return;

      setEntries((prev) => [...acceptedEntries, ...prev]);
      acceptedEntries.forEach(startUpload);
    },
    [availableTypes, currentType, startUpload]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragActive(false);
      if (event.dataTransfer.files?.length) {
        queueFiles(event.dataTransfer.files);
        event.dataTransfer.clearData();
      }
    },
    [queueFiles]
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const entry = prev.find((item) => item.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const hasUploads = entries.length > 0;
  const showTypePicker = !hideTypePicker && availableTypes.length > 1;

  const typeButtons = useMemo(() => {
    if (!showTypePicker) return null;

    return availableTypes.map((type) => (
      <button
        key={type}
        type="button"
        className={clsx("nsc-type-chip", type === currentType && "nsc-type-chip--active")}
        onClick={() => setCurrentType(type)}
      >
        {PHOTO_TYPE_LABELS[type]}
      </button>
    ));
  }, [availableTypes, currentType, showTypePicker]);

  return (
    <section className={clsx("nsc-photo-upload", className)}>
      <div className="nsc-photo-upload__head">
        <div>
          <p className="nsc-eyebrow">{eyebrow}</p>
          <h3 className="nsc-heading nsc-heading--lg">{title}</h3>
          <p className="nsc-body--muted">{description}</p>
        </div>
        {typeButtons && <div className="nsc-type-chip-group">{typeButtons}</div>}
      </div>

      <div
        className={clsx("nsc-photo-upload__dropzone", isDragActive && "nsc-photo-upload__dropzone--active")}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragActive(false);
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          hidden
          multiple
          onChange={(event) => {
            if (event.target.files) {
              queueFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
        <UploadCloud size={32} className="nsc-photo-upload__icon" />
        <div>
          <p className="nsc-drop-title">Drop photos here or click to browse</p>
          <p className="nsc-drop-sub">JPEG · PNG · WEBP — {MAX_MB}MB max per photo</p>
        </div>
        <Button type="button" variant="secondary">
          Browse files
        </Button>
      </div>

      {hasUploads ? (
        <ul className="nsc-upload-list">
          {entries.map((entry) => (
            <li key={entry.id} className="nsc-upload-row">
              <div className="nsc-upload-thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.previewUrl} alt={entry.file.name} />
              </div>
              <div className="nsc-upload-meta">
                <div className="nsc-upload-meta__top">
                  <div>
                    <p className="nsc-upload-name">{entry.file.name}</p>
                    <p className="nsc-upload-desc">
                      {formatSize(entry.file.size)} · {PHOTO_TYPE_LABELS[entry.type]}
                    </p>
                  </div>
                  <span className="nsc-type-chip nsc-type-chip--compact">{PHOTO_TYPE_LABELS[entry.type]}</span>
                </div>
                <div className="nsc-upload-progress">
                  <div className="nsc-upload-progress__bar" style={{ width: `${entry.progress}%` }} />
                </div>
                <div className="nsc-upload-status">
                  <StatusIcon status={entry.status} />
                  <p>
                    {entry.status === "uploading" && "Uploading"}
                    {entry.status === "pending" && "Waiting"}
                    {entry.status === "done" && "Uploaded"}
                    {entry.status === "error" && entry.error}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="nsc-upload-remove"
                onClick={() => removeEntry(entry.id)}
                aria-label="Remove photo"
                disabled={entry.status === "uploading"}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="nsc-photo-upload__empty">
          <ImageIcon size={20} />
          <p>No uploads yet. Start with a clean, well-lit intake shot.</p>
        </div>
      )}
    </section>
  );
}

type XhrUploadParams = {
  vehicleId: string;
  entry: UploadEntry;
  endpoint: string;
  onProgress: (progress: number) => void;
};

function uploadViaXHR({ vehicleId, entry, endpoint, onProgress }: XhrUploadParams): Promise<VehiclePhoto> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.responseType = "json";

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = xhr.response;
        if (response?.photos?.length) {
          const photo = response.photos[0] as VehiclePhoto;
          resolve(photo);
        } else if (response?.photo) {
          resolve(response.photo as VehiclePhoto);
        } else {
          reject(new Error("Upload completed but no photo returned."));
        }
      } else {
        const message = xhr.response?.error ?? "Upload failed.";
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Network error. Please retry."));

    const formData = new FormData();
    formData.append("vehicleId", vehicleId);
    formData.append("photos", entry.file);
    formData.append("types[]", entry.type);
    formData.append("type", entry.type);
    xhr.send(formData);
  });
}

function StatusIcon({ status }: { status: UploadStatus }) {
  if (status === "uploading" || status === "pending") {
    return <Loader2 size={16} className="nsc-status-icon nsc-status-icon--spinning" />;
  }

  if (status === "done") {
    return <CheckCircle2 size={16} className="nsc-status-icon nsc-status-icon--success" />;
  }

  if (status === "error") {
    return <AlertTriangle size={16} className="nsc-status-icon nsc-status-icon--error" />;
  }

  return null;
}

function formatSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function isAllowedFile(file: File) {
  if (file.type && (ACCEPTED_PHOTO_MIME_TYPES as readonly string[]).includes(file.type)) {
    return true;
  }

  const lower = file.name?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

const styles = `
.nsc-photo-upload {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(var(--surface3-rgb), 0.8), rgba(var(--surface2-rgb), 0.4));
  padding: var(--space-5);
  box-shadow: var(--shadow-soft);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.nsc-photo-upload__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-4);
}

.nsc-type-chip-group {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.nsc-type-chip {
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(var(--border-rgb), 0.6);
  background: rgba(var(--surface3-rgb), 0.4);
  color: var(--muted);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all var(--duration-base) var(--easing-soft);
}

.nsc-type-chip--active {
  border-color: rgba(var(--blue-rgb), 0.8);
  color: var(--text);
  background: var(--blue-glow);
}

.nsc-type-chip--compact {
  padding: 4px 10px;
  font-size: 0.75rem;
}

.nsc-photo-upload__dropzone {
  border: 1px dashed rgba(var(--blue-rgb), 0.4);
  border-radius: var(--radius-lg);
  background: rgba(var(--bg-rgb), 0.9);
  padding: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  cursor: pointer;
  transition: border-color var(--duration-base) var(--easing-soft),
    transform var(--duration-base) var(--easing-soft);
}

.nsc-photo-upload__dropzone--active {
  border-color: rgba(var(--blue-rgb), 1);
  transform: translateY(-2px);
}

.nsc-photo-upload__icon {
  color: var(--blue);
}

.nsc-drop-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.nsc-drop-sub {
  font-size: 0.9rem;
  color: var(--muted);
}

.nsc-upload-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0;
  padding: 0;
}

.nsc-upload-row {
  display: flex;
  gap: var(--space-3);
  align-items: stretch;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(var(--border-rgb), 0.6);
  background: rgba(var(--surface2-rgb), 0.9);
}

.nsc-upload-thumb {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(var(--border-rgb), 0.4);
}

.nsc-upload-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nsc-upload-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nsc-upload-meta__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
}

.nsc-upload-name {
  font-weight: 600;
}

.nsc-upload-desc {
  color: var(--muted);
  font-size: 0.85rem;
}

.nsc-upload-progress {
  width: 100%;
  height: 5px;
  border-radius: var(--radius-pill);
  background: rgba(var(--text-rgb), 0.12);
}

.nsc-upload-progress__bar {
  height: 100%;
  border-radius: inherit;
  background: var(--grad-blue);
  transition: width 150ms ease;
}

.nsc-upload-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--muted);
}

.nsc-upload-remove {
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  height: 32px;
  width: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color var(--duration-base) var(--easing-soft),
    background var(--duration-base) var(--easing-soft);
}

.nsc-upload-remove:hover:not(:disabled) {
  color: var(--text);
  background: rgba(var(--text-rgb), 0.12);
}

.nsc-upload-remove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nsc-status-icon {
  color: var(--muted);
}

.nsc-status-icon--spinning {
  animation: spin 1s linear infinite;
}

.nsc-status-icon--success {
  color: var(--blue);
}

.nsc-status-icon--error {
  color: var(--amber);
}

.nsc-photo-upload__empty {
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
  color: var(--muted);
  background: rgba(var(--bg-rgb), 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById("nsc-photo-upload-styles")) {
  const styleTag = document.createElement("style");
  styleTag.id = "nsc-photo-upload-styles";
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}
