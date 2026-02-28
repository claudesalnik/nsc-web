export const dynamic = 'force-dynamic';
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarClock, MapPin, Phone, Sparkles } from "lucide-react";

import { auth } from "@/auth";
import { AccessInfo } from "@/components/AccessInfo";
import { getMemberPortalData } from "@/lib/portal/member-data";
import { getVehicleDetailForOwner } from "@/lib/portal/vehicle-detail";

export default async function VehicleDetailPage({ params }: { params: { vehicleId: string } }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?session=expired");
  }

  const portal = await getMemberPortalData(session.user.email);
  const vehicle = await getVehicleDetailForOwner(portal.owner.id, params.vehicleId);

  if (!vehicle) {
    notFound();
  }

  const concierge = portal.profile.concierge;
  const stats = [
    { label: "Spot", value: vehicle.storageSpot?.displayName ?? `Spot ${portal.hero.bayLabel}` },
    { label: "Zone", value: vehicle.storageSpot?.level ?? portal.hero.section },
    { label: "Climate", value: vehicle.storageSpot?.climate ?? portal.hero.zone },
    { label: "VIN", value: vehicle.vinLast4 ? `•••• ${vehicle.vinLast4}` : "On file" },
    { label: "Status", value: vehicle.statusLabel },
    { label: "Last move", value: vehicle.lastMovement ?? "No movement recorded" },
  ];

  return (
    <div className="space-y-6">
      <Link href="/portal/vehicles" className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--blue)]">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to garage
      </Link>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)]">
        <div className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Vehicle</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-3xl font-semibold text-[var(--text)]">
                {vehicle.year} {vehicle.make}
                <span className="text-[rgba(var(--text-rgb),0.7)]"> {vehicle.model}</span>
              </p>
              {vehicle.trim && <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">{vehicle.trim}</p>}
            </div>
            <span className="mobile-chip border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.65)] text-xs">
              {vehicle.statusBadge}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr,2fr]">
          <div className="relative overflow-hidden rounded-3xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.75)]">
            {vehicle.primaryPhoto ? (
              <Image
                src={vehicle.primaryPhoto.url}
                alt={`${vehicle.make} ${vehicle.model}`}
                width={1200}
                height={800}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <div className="flex h-64 items-center justify-center text-sm uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.45)]">
                NSC GARAGE
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-t from-black/70 via-black/0 to-transparent px-6 py-4 text-sm text-white">
              <span className="inline-flex items-center gap-2">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                {vehicle.lastMovement ?? "Movement not logged"}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {vehicle.storageSpot?.displayName ?? `${portal.hero.zone} · ${portal.hero.section}`}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.7)] p-4">
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Concierge</p>
            <p className="text-lg font-semibold text-[var(--text)]">{concierge.label}</p>
            <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">{concierge.statusLine}</p>
            <div className="mt-auto grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={concierge.href}
                className="tappable-area inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(var(--blue-rgb),0.45)] bg-[rgba(var(--blue-rgb),0.15)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text)]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> Request pull-up
              </a>
              <Link
                href={`/portal/access`}
                className="tappable-area inline-flex items-center justify-center gap-2 rounded-2xl border border-[rgba(var(--border-rgb),0.45)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text)]"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" /> Share codes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface3-rgb),0.9)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Vitals</p>
          <h2 className="text-lg font-semibold text-[var(--text)]">Storage & telemetry</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface2-rgb),0.7)] p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">{stat.label}</p>
              <p className="mt-2 text-base font-semibold text-[var(--text)]">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {vehicle.photos.length > 1 && (
        <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface2-rgb),0.95)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Media</p>
              <h2 className="text-lg font-semibold text-[var(--text)]">Condition photos</h2>
            </div>
            <span className="text-sm text-[rgba(var(--text-rgb),0.65)]">{vehicle.photos.length} photos</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {vehicle.photos.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-2xl border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.6)]">
                <Image
                  src={photo.url}
                  alt={photo.caption ?? `${vehicle.make} ${vehicle.model}`}
                  width={800}
                  height={600}
                  className="h-64 w-full object-cover"
                />
                {photo.caption && <figcaption className="px-4 py-2 text-sm text-[rgba(var(--text-rgb),0.7)]">{photo.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {vehicle.timeline.length > 0 && (
        <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.92)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Movement</p>
              <h2 className="text-lg font-semibold text-[var(--text)]">Recent activity</h2>
            </div>
            <span className="text-sm text-[rgba(var(--text-rgb),0.65)]">Auto-logged</span>
          </div>
          <ul className="space-y-3">
            {vehicle.timeline.map((event) => (
              <li key={event.id} className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.65)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{event.label}</p>
                  <p className="text-xs text-[rgba(var(--text-rgb),0.6)]">{event.timestamp}</p>
                  {event.note && <p className="text-xs text-[rgba(var(--text-rgb),0.65)]">{event.note}</p>}
                </div>
                {event.spotLabel && (
                  <span className="rounded-full border border-[rgba(var(--border-rgb),0.45)] px-3 py-1 text-xs uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.75)]">
                    {event.spotLabel}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {vehicle.notes && (
        <section className="mobile-card space-y-3 border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface3-rgb),0.85)]">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Notes</p>
            <h2 className="text-lg font-semibold text-[var(--text)]">Concierge log</h2>
          </div>
          <p className="text-sm text-[rgba(var(--text-rgb),0.8)]">{vehicle.notes}</p>
        </section>
      )}

      <AccessInfo {...portal.gate} />
    </div>
  );
}
