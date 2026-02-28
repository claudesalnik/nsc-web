export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { ShieldCheck, Star } from "lucide-react";

import { auth } from "@/auth";
import { getMemberProfileHubData } from "@/lib/profile/hub-data";
import { VehicleCard } from "@/components/VehicleCard";
import { ContactPreferencesPanel } from "@/components/profile/ContactPreferencesPanel";
import { RsvpHistoryList } from "@/components/profile/RsvpHistoryList";
import { StorageStatusCard } from "@/components/profile/StorageStatusCard";

const TIER_BADGES: Record<string, string> = {
  FOUNDER: "border-[rgba(var(--amber-rgb),0.5)] bg-[rgba(var(--amber-rgb),0.12)] text-[var(--amber)]",
  PREMIUM: "border-[rgba(var(--blue-rgb),0.5)] bg-[rgba(var(--blue-rgb),0.12)] text-[var(--blue)]",
  STANDARD: "border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.65)] text-[rgba(var(--text-rgb),0.7)]",
};

export default async function MemberProfileHub() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login?session=expired");

  const hub = await getMemberProfileHubData(session.user.email);

  const tierClass =
    TIER_BADGES[hub.member.tier.toUpperCase()] ?? TIER_BADGES["STANDARD"];

  const memberDetails = [
    { label: "Member ID", value: hub.member.memberId },
    { label: "Tier", value: hub.member.tier },
    { label: "Member since", value: hub.member.memberSince },
    { label: "Spot", value: `Spot ${hub.storage.spotLabel}` },
    { label: "Fleet stored", value: hub.stats.stored.toString() },
    { label: "Fleet total", value: hub.stats.total.toString() },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">
          Member hub
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text)]">
          {hub.member.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`mobile-chip ${tierClass}`}>
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            {hub.member.tier}
          </span>
          <span className="mobile-chip border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.5)] text-[rgba(var(--text-rgb),0.65)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--blue)]" aria-hidden="true" />
            {hub.member.tagline}
          </span>
        </div>
      </header>

      {/* ─── Identity card ─── */}
      <section className="mobile-card grid grid-cols-2 gap-3 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)] sm:grid-cols-3">
        {memberDetails.map((d) => (
          <div
            key={d.label}
            className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.65)] p-3"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">
              {d.label}
            </p>
            <p className="mt-1 text-base font-semibold text-[var(--text)]">
              {d.value}
            </p>
          </div>
        ))}
      </section>

      {/* ─── Storage status ─── */}
      <StorageStatusCard storage={hub.storage} />

      {/* ─── Vehicles on file ─── */}
      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">
            Vehicles on file
          </p>
          <h2 className="text-lg font-semibold text-[var(--text)]">
            {hub.stats.total} vehicle{hub.stats.total !== 1 ? "s" : ""}
          </h2>
        </div>
        <div className="space-y-4">
          {hub.vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              primaryLabel="Details"
              secondaryLabel="Request pull-up"
            />
          ))}
          {hub.vehicles.length === 0 && (
            <div className="mobile-card border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.5)] text-center text-sm text-[rgba(var(--text-rgb),0.5)]">
              No vehicles on file — contact your concierge to add one.
            </div>
          )}
        </div>
      </section>

      {/* ─── Contact preferences (interactive) ─── */}
      <ContactPreferencesPanel prefs={hub.contactPreferences} />

      {/* ─── RSVP history ─── */}
      <RsvpHistoryList events={hub.rsvpHistory} />

      {/* ─── Concierge footer ─── */}
      <section className="mobile-card flex flex-wrap items-center justify-between gap-4 border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.85)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">
            {hub.member.concierge.label}
          </p>
          <p className="mt-1 text-xl font-semibold text-[var(--text)]">
            {hub.member.concierge.phone}
          </p>
          <p className="text-sm text-[rgba(var(--text-rgb),0.6)]">
            {hub.member.concierge.statusLine}
          </p>
        </div>
        <a
          href={hub.member.concierge.href}
          className="tappable-area inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--blue-rgb),0.5)] bg-[rgba(var(--blue-rgb),0.15)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--blue)]"
        >
          Call concierge
        </a>
      </section>
    </div>
  );
}
