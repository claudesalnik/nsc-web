"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Maximize2, Trash2, X } from "lucide-react";
import { PHOTO_TYPE_LABELS, type VehiclePhoto } from "@/lib/photos";

export type PhotoGalleryProps = {
  photos: VehiclePhoto[];
  canDelete?: boolean;
  onDelete?: (photo: VehiclePhoto) => Promise<void> | void;
  emptyState?: string;
  className?: string;
};

export function PhotoGallery({ photos, canDelete, onDelete, emptyState, className }: PhotoGalleryProps) {
  const [items, setItems] = useState<VehiclePhoto[]>(photos);
  const [lightbox, setLightbox] = useState<VehiclePhoto | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  useEffect(() => setItems(photos), [photos]);

  const sortedPhotos = useMemo(() => [...items].sort((a, b) => (a.uploadedAt > b.uploadedAt ? -1 : 1)), [items]);

  const handleDelete = async (photo: VehiclePhoto) => {
    if (!canDelete) return;
    setDeletingKey(photo.storageKey);

    try {
      if (onDelete) {
        await onDelete(photo);
      } else {
        const response = await fetch(
          `/api/photos/${photo.vehicleId}?key=${encodeURIComponent(photo.storageKey)}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          const message = (await response.json().catch(() => null))?.error ?? "Unable to delete photo";
          throw new Error(message);
        }
      }

      setItems((prev) => prev.filter((item) => item.storageKey !== photo.storageKey));
      if (lightbox?.storageKey === photo.storageKey) {
        setLightbox(null);
      }
    } catch (error) {
      console.error("[PhotoGallery] delete failed", error);
      alert("Failed to delete photo. Try again.");
    } finally {
      setDeletingKey(null);
    }
  };

  if (!sortedPhotos.length) {
    return (
      <div className={clsx("nsc-photo-gallery__empty", className)}>
        <p>{emptyState ?? "No photos yet. Upload an intake set to establish the baseline."}</p>
      </div>
    );
  }

  return (
    <div className={clsx("nsc-photo-gallery", className)}>
      <div className="nsc-photo-grid">
        {sortedPhotos.map((photo) => (
          <div
            key={photo.storageKey}
            role="button"
            tabIndex={0}
            className="nsc-photo-card"
            onClick={() => setLightbox(photo)}
            onKeyDown={(event) => {
              if (event.key === "Enter") setLightbox(photo);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt={photo.filename} loading="lazy" />
            <div className="nsc-photo-card__overlay">
              <span className={clsx("nsc-type-chip", "nsc-type-chip--compact")}>{PHOTO_TYPE_LABELS[photo.type]}</span>
              <div className="nsc-photo-card__actions">
                <Maximize2 size={16} />
                {canDelete && (
                  <button
                    type="button"
                    className="nsc-photo-card__delete"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(photo);
                    }}
                    disabled={deletingKey === photo.storageKey}
                    aria-label={`Delete ${photo.filename}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            <div className="nsc-photo-card__meta">
              <p>{formatTimestamp(photo.uploadedAt)}</p>
              <p>{photo.filename}</p>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div className="nsc-photo-lightbox" role="dialog" aria-modal="true">
          <div className="nsc-photo-lightbox__backdrop" onClick={() => setLightbox(null)} />
          <div className="nsc-photo-lightbox__content">
            <button className="nsc-photo-lightbox__close" onClick={() => setLightbox(null)} aria-label="Close">
              <X size={18} />
            </button>
            <div className="nsc-photo-lightbox__image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightbox.url} alt={lightbox.filename} />
            </div>
            <div className="nsc-photo-lightbox__details">
              <span className="nsc-type-chip nsc-type-chip--compact">{PHOTO_TYPE_LABELS[lightbox.type]}</span>
              <p className="nsc-lightbox-title">{lightbox.filename}</p>
              <p className="nsc-lightbox-sub">Uploaded {formatTimestamp(lightbox.uploadedAt)}</p>
              {canDelete && (
                <button
                  className="nsc-photo-card__delete"
                  onClick={() => handleDelete(lightbox)}
                  disabled={deletingKey === lightbox.storageKey}
                >
                  <Trash2 size={16} /> Delete photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatTimestamp(value: string) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const galleryStyles = `
.nsc-photo-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.nsc-photo-gallery__empty {
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  text-align: center;
  color: var(--muted);
  background: rgba(var(--bg-rgb), 0.6);
}

.nsc-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
}

.nsc-photo-card {
  position: relative;
  border: none;
  padding: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: zoom-in;
  background: var(--surface2);
  border: 1px solid var(--border);
}

.nsc-photo-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
  transition: transform var(--duration-base) var(--easing-soft);
}

.nsc-photo-card:hover img {
  transform: scale(1.02);
}

.nsc-photo-card__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-3);
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.45), transparent 60%);
}

.nsc-photo-card__actions {
  display: flex;
  gap: 8px;
  align-items: center;
  color: var(--text);
}

.nsc-photo-card__delete {
  border: 1px solid rgba(var(--border-rgb), 0.5);
  background: rgba(var(--surface3-rgb), 0.6);
  border-radius: 999px;
  padding: 4px 10px;
  color: var(--amber);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.8rem;
}

.nsc-photo-card__delete:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nsc-photo-card__meta {
  padding: var(--space-3);
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.nsc-photo-card__meta p:first-child {
  font-size: 0.85rem;
  color: var(--muted);
}

.nsc-photo-card__meta p:last-child {
  font-weight: 600;
}

.nsc-photo-lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nsc-photo-lightbox__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
}

.nsc-photo-lightbox__content {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: var(--space-4);
  background: var(--surface2);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  border: 1px solid var(--border);
  max-width: 960px;
  width: min(90vw, 960px);
  box-shadow: var(--shadow-soft);
}

.nsc-photo-lightbox__close {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: rgba(var(--surface3-rgb), 0.6);
  color: var(--text);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.nsc-photo-lightbox__image img {
  width: 100%;
  border-radius: var(--radius-md);
  object-fit: contain;
  max-height: 70vh;
}

.nsc-photo-lightbox__details {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.nsc-lightbox-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.nsc-lightbox-sub {
  color: var(--muted);
}

@media (max-width: 768px) {
  .nsc-photo-lightbox__content {
    grid-template-columns: 1fr;
  }
}
`;

if (typeof document !== "undefined" && !document.getElementById("nsc-photo-gallery-styles")) {
  const tag = document.createElement("style");
  tag.id = "nsc-photo-gallery-styles";
  tag.innerHTML = galleryStyles;
  document.head.appendChild(tag);
}
