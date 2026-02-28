import Link from "next/link";
import clsx from "clsx";
import { AlertTriangle, DoorOpen, History, MapPin } from "lucide-react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AccessInfo } from "@/components/AccessInfo";
import { VehicleCard } from "@/components/VehicleCard";
import { getMemberPortalData } from "@/lib/portal/member-data";

const quickActions = [
  { label: "Request pull-up", icon: DoorOpen },
  { label: "Report issue", icon: AlertTriangle },
  { label: "View full history", icon: History },
];

export default async function PortalDashboard() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?session=expired");
  }

  const portal = await getMemberPortalData(session.user.email);
  const storage = portal.hero;

  return (
    <div className="space-y-5">
      <section className="space-y-4">
        <div className="mobile-card border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Storage spot</p>
              <p className="mt-1 text-4xl font-semibold tracking-[0.4em] text-[var(--text)]">{storage.bayLabel}</p>
              <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">{storage.zone} · {storage.section}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.7)] px-4 py-3 text-right">
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-[rgba(var(--text-rgb),0.5)]">Gate code</p>
              <p className="text-2xl font-semibold tracking-[0.4em]">{storage.gateCode}</p>
              <p className="text-xs text-[rgba(var(--text-rgb),0.6)]">Updated via concierge</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-[rgba(var(--text-rgb),0.75)] sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.6)] p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Zone humidity</p>
              <p className="mt-1 text-base font-semibold text-[var(--text)]">{storage.humidity}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.6)] p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Last visit</p>
              <p className="mt-1 text-base font-semibold text-[var(--text)]">{storage.lastVisit ?? "Pending"}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.6)] p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Concierge</p>
              <p className="mt-1 text-base font-semibold text-[var(--text)]">{storage.conciergeEta ?? "On call"}</p>
            </div>
            <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.6)] p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Row map</p>
              <p className="mt-1 flex items-center gap-1 text-base font-semibold text-[var(--text)]">
                <MapPin className="h-4 w-4 text-[var(--blue)]" aria-hidden="true" /> {storage.rowMapLabel}
              </p>
            </div>
          </div>
        </div>

        <AccessInfo {...portal.gate} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Garage status</p>
            <h2 className="text-xl font-semibold text-[var(--text)]">My vehicles</h2>
          </div>
          <Link href="/portal/vehicles" className="text-sm font-semibold text-[var(--blue)]">
            Manage →
          </Link>
        </div>
        <div className="space-y-4">
          {portal.vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} primaryLabel="Details" secondaryLabel="Request pull-up" />
          ))}
        </div>
      </section>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.6)] bg-[rgba(var(--surface2-rgb),0.9)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Live log</p>
            <h3 className="text-lg font-semibold text-[var(--text)]">Access history</h3>
          </div>
          <Link href="/portal/access" className="text-sm font-semibold text-[var(--blue)]">
            Full view
          </Link>
        </div>
        <ul className="space-y-3">
          {portal.accessEvents.map((event) => (
            <li key={event.id} className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.65)] px-4 py-3">
              <div>
                <p className="text-base font-semibold text-[var(--text)]">{event.context}</p>
                <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">{event.meta ?? "Concierge desk"}</p>
                {event.timestamp && <p className="text-xs text-[rgba(var(--text-rgb),0.55)]">{event.timestamp}</p>}
              </div>
              <div
                className={clsx(
                  "flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold uppercase tracking-[0.4em]",
                  event.direction === "IN"
                    ? "bg-[rgba(var(--blue-rgb),0.18)] text-[var(--blue)]"
                    : "bg-[rgba(var(--amber-rgb),0.18)] text-[var(--amber)]"
                )}
              >
                {event.direction}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.92)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Billing</p>
            <h3 className="text-lg font-semibold text-[var(--text)]">Plan snapshot</h3>
          </div>
          <Link href="/portal/billing" className="text-sm font-semibold text-[var(--blue)]">
            View invoices
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.7)] p-3">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Plan</p>
            <p className="mt-1 text-base font-semibold text-[var(--text)]">{portal.billing.planName}</p>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.7)] p-3">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Monthly</p>
            <p className="mt-1 text-base font-semibold text-[var(--text)]">${portal.billing.monthlyAmount.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section className="mobile-card space-y-3 border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.9)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Need something?</p>
          <h3 className="text-lg font-semibold text-[var(--text)]">Quick actions</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <button
              type="button"
              key={action.label}
              className="tappable-area flex items-center gap-3 rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface2-rgb),0.7)] px-4 py-3 text-sm font-semibold text-[var(--text)]"
            >
              <action.icon className="h-5 w-5 text-[var(--blue)]" aria-hidden="true" />
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
