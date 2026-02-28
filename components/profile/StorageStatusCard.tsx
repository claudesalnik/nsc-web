import { MapPin, Thermometer, Clock, Gauge } from "lucide-react";

import type { ProfileStorageStatus } from "@/lib/profile/hub-data";

type Props = {
  storage: ProfileStorageStatus;
};

export function StorageStatusCard({ storage }: Props) {
  const stats = [
    { label: "Zone", value: storage.zone, icon: MapPin },
    { label: "Row", value: storage.section, icon: MapPin },
    { label: "Humidity", value: storage.humidity, icon: Thermometer },
    { label: "Last visit", value: storage.lastVisit ?? "Pending", icon: Clock },
  ];

  return (
    <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">
            Storage spot
          </p>
          <p className="mt-1 font-serif text-5xl font-semibold tracking-[0.25em] text-[var(--text)]">
            {storage.spotLabel}
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(var(--blue-rgb),0.35)] bg-[rgba(var(--blue-rgb),0.08)] px-4 py-3 text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[rgba(var(--text-rgb),0.5)]">
            Status
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--blue)]">
            Ready for arrival
          </p>
          {storage.conciergeEta && (
            <p className="text-xs text-[rgba(var(--text-rgb),0.55)]">
              Concierge: {storage.conciergeEta}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.65)] p-3"
          >
            <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.35em] text-[rgba(var(--text-rgb),0.5)]">
              <Icon className="h-3.5 w-3.5 text-[var(--blue)]" aria-hidden="true" />
              {label}
            </div>
            <p className="mt-1.5 text-base font-semibold text-[var(--text)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Row visualiser pill */}
      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(var(--border-rgb),0.3)] bg-[rgba(var(--surface3-rgb),0.4)] px-4 py-3">
        <Gauge className="h-4 w-4 flex-shrink-0 text-[var(--blue)]" aria-hidden="true" />
        <p className="text-sm text-[rgba(var(--text-rgb),0.7)]">
          Map reference: <span className="font-semibold text-[var(--text)]">{storage.rowLabel}</span>
        </p>
      </div>
    </section>
  );
}
