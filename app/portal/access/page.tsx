import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AccessInfo } from "@/components/AccessInfo";
import { getMemberPortalData } from "@/lib/portal/member-data";

const contingencySteps = [
  "If keypad is offline, call concierge — they can buzz the bay remotely.",
  "Secondary keypad located at the loading dock. Use secondary code.",
  "Emergency brake release and booster located behind Row A fire panel.",
];

const equipment = [
  { label: "Battery tenders", status: "Online" },
  { label: "Tire blankets", status: "Pre-heated (off)" },
  { label: "Air / nitrogen", status: "Ready" },
  { label: "Detail bay", status: "Available" },
];

export default async function AccessPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?session=expired");
  }

  const portal = await getMemberPortalData(session.user.email);
  const storage = portal.hero;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Gate-side</p>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Access & instructions</h1>
        <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">Spot, codes, wifi, and contingency steps tuned for bright-sun viewing.</p>
      </header>

      <AccessInfo {...portal.gate} />

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Storage reference</p>
            <h2 className="text-lg font-semibold text-[var(--text)]">Spot {storage.bayLabel}</h2>
          </div>
          <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.7)] px-4 py-3 text-right">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.5)]">Zone</p>
            <p className="text-xl font-semibold text-[var(--text)]">{storage.zone}</p>
            <p className="text-xs text-[rgba(var(--text-rgb),0.6)]">{storage.section}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Row", value: storage.section },
            { label: "Zone", value: storage.zone },
            { label: "Power", value: "20A circuit" },
            { label: "Clearance", value: "9′ 8″" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.65)] p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">{stat.label}</p>
              <p className="mt-1 text-base font-semibold text-[var(--text)]">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface3-rgb),0.92)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Equipment</p>
          <h2 className="text-lg font-semibold text-[var(--text)]">On-site prep</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          {equipment.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface2-rgb),0.75)] p-3">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">{item.label}</p>
              <p className="mt-1 text-base font-semibold text-[var(--text)]">{item.status}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.9)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">If something fails</p>
          <h2 className="text-lg font-semibold text-[var(--text)]">Contingency plan</h2>
        </div>
        <ol className="space-y-3 text-sm text-[rgba(var(--text-rgb),0.85)]">
          {contingencySteps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(var(--border-rgb),0.4)] text-sm font-semibold text-[var(--text)]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
