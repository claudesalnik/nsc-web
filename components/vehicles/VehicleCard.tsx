"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronUp, MapPin, Tag } from "lucide-react";
import clsx from "clsx";

type VehicleDetail = {
  label: string;
  value: string;
};

type VehicleCardProps = {
  vehicle: {
    id?: string;
    year: number | string;
    make: string;
    model: string;
    status?: "stored" | "out";
    storageSpot?: string;
    thumbnailUrl?: string;
    color?: string;
    vin?: string;
    details?: VehicleDetail[];
    tags?: string[];
    lastMovement?: string;
  };
  className?: string;
  defaultExpanded?: boolean;
};

const statusCopy: Record<NonNullable<VehicleCardProps["vehicle"]["status"]>, { label: string; badge: string }> = {
  stored: {
    label: "Stored on site",
    badge: "border-[rgba(var(--blue-rgb),0.45)] bg-[rgba(var(--blue-rgb),0.12)] text-[var(--blue)]",
  },
  out: {
    label: "Checked out",
    badge: "border-[rgba(var(--amber-rgb),0.5)] bg-[rgba(var(--amber-rgb),0.12)] text-[var(--amber)]",
  },
};

export const VehicleCard = ({ vehicle, className = "", defaultExpanded = false }: VehicleCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { year, make, model, status = "stored", storageSpot, thumbnailUrl, color, vin, details = [], tags = [], lastMovement } = vehicle;

  const accent = statusCopy[status];

  return (
    <article
      className={clsx(
        "group flex flex-col gap-4 rounded-3xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface2-rgb),0.85)] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:border-[rgba(var(--blue-rgb),0.35)] hover:shadow-[0_35px_90px_rgba(6,16,25,0.75)] sm:p-5",
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[rgba(var(--border-rgb),0.4)] bg-gradient-to-br from-[rgba(var(--surface3-rgb),0.9)] to-[rgba(var(--surface-rgb),0.6)] md:w-48">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={`${year} ${make} ${model}`}
              fill
              sizes="(max-width: 768px) 100vw, 200px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.45)]">
              NSC
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.5)]">#{vehicle.id ?? "GARAGE"}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-sm uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.45)]">{year}</span>
            <div className="h-1 w-8 rounded-full bg-[rgba(var(--text-rgb),0.15)]" aria-hidden="true" />
            <p className="text-xl font-semibold leading-tight sm:text-2xl">
              {make}
              <span className="text-[rgba(var(--text-rgb),0.7)]"> {model}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            {storageSpot && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.55)] px-3 py-1 text-[rgba(var(--text-rgb),0.8)]">
                <MapPin className="h-3.5 w-3.5 text-[var(--blue)]" aria-hidden="true" />
                {storageSpot}
              </span>
            )}
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                accent.badge
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {accent.label}
            </span>
          </div>

          {(color || vin || lastMovement) && (
            <dl className="grid grid-cols-2 gap-3 text-xs text-[rgba(var(--text-rgb),0.75)] sm:text-sm">
              {color && (
                <div>
                  <dt className="text-[rgba(var(--text-rgb),0.45)]">Color</dt>
                  <dd className="font-medium text-[var(--text)]">{color}</dd>
                </div>
              )}
              {vin && (
                <div>
                  <dt className="text-[rgba(var(--text-rgb),0.45)]">VIN</dt>
                  <dd className="font-mono text-[0.8rem] text-[rgba(var(--text-rgb),0.85)]">{vin}</dd>
                </div>
              )}
              {lastMovement && (
                <div className="col-span-2">
                  <dt className="text-[rgba(var(--text-rgb),0.45)]">Last movement</dt>
                  <dd className="font-medium text-[var(--text)]">{lastMovement}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.5)] px-3 py-1 text-xs uppercase tracking-wide text-[rgba(var(--text-rgb),0.75)]"
            >
              <Tag className="h-3 w-3 text-[var(--blue)]" aria-hidden="true" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {details.length > 0 && (
        <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.45)]">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[rgba(var(--text-rgb),0.85)]"
            aria-expanded={expanded}
          >
            <span>Vehicle details</span>
            {expanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          </button>
          <div
            className={clsx(
              "grid grid-cols-1 gap-4 px-4 pb-4 text-sm text-[rgba(var(--text-rgb),0.75)] transition-[max-height,opacity] duration-300 ease-out",
              expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            {expanded &&
              details.map((detail) => (
                <div key={`${detail.label}-${detail.value}`} className="border-t border-[rgba(var(--border-rgb),0.35)] pt-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.45)]">{detail.label}</p>
                  <p className="mt-1 text-base text-[var(--text)]">{detail.value}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </article>
  );
};
