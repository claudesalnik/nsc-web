"use client";

import Image from "next/image";
import clsx from "clsx";
import { BatteryCharging, Clock, MapPin, ShieldCheck, Gauge, AlertTriangle } from "lucide-react";

export type VehicleStatus = "stored" | "checked-out" | "inbound" | "prep";

const STATUS_META: Record<VehicleStatus, { label: string; chip: string; glow: string }> = {
  stored: {
    label: "Stored on site",
    chip: "border-[rgba(var(--blue-rgb),0.55)] bg-[rgba(var(--blue-rgb),0.12)] text-[var(--blue)]",
    glow: "shadow-[0_15px_45px_rgba(24,52,68,0.7)]",
  },
  "checked-out": {
    label: "Checked out",
    chip: "border-[rgba(var(--amber-rgb),0.5)] bg-[rgba(var(--amber-rgb),0.14)] text-[var(--amber)]",
    glow: "shadow-[0_15px_45px_rgba(96,52,6,0.65)]",
  },
  inbound: {
    label: "Inbound",
    chip: "border-[rgba(var(--text-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.7)] text-[rgba(var(--text-rgb),0.9)]",
    glow: "shadow-[0_15px_45px_rgba(19,28,34,0.7)]",
  },
  prep: {
    label: "In prep",
    chip: "border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.85)] text-[rgba(var(--text-rgb),0.85)]",
    glow: "shadow-[0_15px_45px_rgba(10,10,10,0.55)]",
  },
};

type QuickFact = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export type VehicleCardProps = {
  vehicle: {
    id?: string;
    name?: string;
    year?: number | string;
    make: string;
    model: string;
    trim?: string;
    plate?: string;
    imageUrl?: string;
    status?: VehicleStatus;
    statusDetail?: string;
    storageUnit?: string;
    lastMovement?: string;
    battery?: string;
    fuel?: string;
    vitals?: QuickFact[];
    alerts?: string[];
  };
  className?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryLabel?: string;
  secondaryLabel?: string;
};

const defaultVitals = (vehicle: VehicleCardProps["vehicle"]): QuickFact[] => {
  const facts: QuickFact[] = [];

  if (vehicle.storageUnit) {
    facts.push({ label: "Unit", value: vehicle.storageUnit, icon: MapPin });
  }

  if (vehicle.battery) {
    facts.push({ label: "Battery", value: vehicle.battery, icon: BatteryCharging });
  }

  if (vehicle.fuel) {
    facts.push({ label: "Fuel", value: vehicle.fuel, icon: Gauge });
  }

  if (vehicle.lastMovement) {
    facts.push({ label: "Last move", value: vehicle.lastMovement, icon: Clock });
  }

  return facts;
};

export type VehicleCardData = VehicleCardProps["vehicle"];

export const VehicleCard = ({
  vehicle,
  className,
  onPrimaryAction,
  onSecondaryAction,
  primaryLabel = "Open details",
  secondaryLabel = "Request access",
}: VehicleCardProps) => {
  const {
    make,
    model,
    year,
    trim,
    plate,
    imageUrl,
    status = "stored",
    statusDetail,
    alerts = [],
    vitals,
  } = vehicle;

  const meta = STATUS_META[status];
  const factList = vitals && vitals.length > 0 ? vitals : defaultVitals(vehicle);

  return (
    <article
      className={clsx(
        "mobile-touch-card relative overflow-hidden",
        meta.glow,
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.75rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.5)]">{year ?? "Vehicle"}</p>
            <p className="text-2xl font-semibold leading-tight text-[var(--text)]">
              {make}
              <span className="text-[rgba(var(--text-rgb),0.7)]"> {model}</span>
            </p>
            {trim && <p className="text-sm text-[rgba(var(--text-rgb),0.6)]">{trim}</p>}
          </div>
          <div className="text-right">
            <span className={clsx("mobile-chip justify-end", meta.chip)}>{meta.label}</span>
            {statusDetail && (
              <p className="mt-2 text-xs text-[rgba(var(--text-rgb),0.65)]">{statusDetail}</p>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-gradient-to-br from-[rgba(var(--surface3-rgb),0.9)] to-[rgba(var(--surface-rgb),0.55)]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`${make} ${model}`}
              width={640}
              height={360}
              className="h-48 w-full object-cover"
              loading="lazy"
              sizes="(min-width: 1024px) 640px, 100vw"
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-sm uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.45)]">
              NSC GARAGE
            </div>
          )}
          {plate && (
            <div className="absolute bottom-3 right-3 rounded-xl border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(0,0,0,0.6)] px-3 py-1 text-xs font-semibold tracking-widest text-[rgba(var(--text-rgb),0.75)]">
              {plate}
            </div>
          )}
        </div>

        {factList.length > 0 && (
          <dl className="mobile-grid-auto">
            {factList.map((fact) => (
              <div key={`${fact.label}-${fact.value}`} className="rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.65)] p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.45)]">
                  {fact.icon && <fact.icon className="h-3.5 w-3.5 text-[var(--blue)]" aria-hidden="true" />}
                  {fact.label}
                </div>
                <p className="mt-2 text-base font-semibold text-[var(--text)]">{fact.value}</p>
              </div>
            ))}
          </dl>
        )}

        {alerts.length > 0 && (
          <div className="rounded-2xl border border-[rgba(var(--amber-rgb),0.4)] bg-[rgba(var(--amber-rgb),0.15)] p-3 text-sm text-[var(--text)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.65)]">
              <AlertTriangle className="h-4 w-4 text-[var(--amber)]" aria-hidden="true" /> Alerts
            </div>
            <ul className="mt-2 space-y-1">
              {alerts.map((alert) => (
                <li key={alert} className="flex gap-2 text-sm text-[rgba(var(--text-rgb),0.85)]">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--blue)]" aria-hidden="true" />
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="tappable-area w-full rounded-2xl border border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface3-rgb),0.75)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]"
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            onClick={onSecondaryAction}
            className="tappable-area w-full rounded-2xl border border-[rgba(var(--blue-rgb),0.5)] bg-[rgba(var(--blue-rgb),0.15)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--blue)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue)]"
          >
            {secondaryLabel}
          </button>
        </div>
      </div>
    </article>
  );
};
