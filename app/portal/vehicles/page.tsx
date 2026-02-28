import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { VehicleCard } from "@/components/VehicleCard";
import { getMemberPortalData } from "@/lib/portal/member-data";

export default async function VehiclesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?session=expired");
  }

  const portal = await getMemberPortalData(session.user.email);

  const fleetStats = [
    { label: "Stored", value: portal.stats.stored.toString() },
    { label: "Checked out", value: portal.stats.checkedOut.toString() },
    { label: "Fleet", value: portal.stats.total.toString() },
    { label: "Concierge", value: portal.profile.concierge.statusLine.split(" · ")[0] ?? "On site" },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Garage</p>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Vehicles</h1>
          <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">Status, vitals, and pull-up requests built for phone-in-hand use.</p>
        </header>
        <div className="mobile-card grid grid-cols-1 gap-3 border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface2-rgb),0.95)] sm:grid-cols-2 lg:grid-cols-4">
          {fleetStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.65)] p-3">
              <p className="text-[0.6rem] uppercase tracking-[0.45em] text-[rgba(var(--text-rgb),0.55)]">{stat.label}</p>
              <p className="mt-1 text-xl font-semibold text-[var(--text)]">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="mobile-card space-y-3 border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.9)]">
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Filters</p>
          <div className="flex gap-2 overflow-x-auto">
            {[
              { label: "All", value: "all" },
              { label: "Stored", value: "stored" },
              { label: "Checked out", value: "checked-out" },
              { label: "Prep", value: "prep" },
            ].map((filter, index) => (
              <button
                key={filter.value}
                type="button"
                className={`tappable-area whitespace-nowrap rounded-2xl border px-4 py-2 text-sm font-semibold ${
                  index === 0
                    ? "border-[rgba(var(--blue-rgb),0.5)] bg-[rgba(var(--blue-rgb),0.15)] text-[var(--text)]"
                    : "border-[rgba(var(--border-rgb),0.45)] text-[rgba(var(--text-rgb),0.75)]"
                }`}
                aria-pressed={index === 0}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {portal.vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} primaryLabel="Details" secondaryLabel="Request pull-up" />
          ))}
        </div>
      </section>
    </div>
  );
}
