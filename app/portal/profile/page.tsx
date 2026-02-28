import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getMemberPortalData } from "@/lib/portal/member-data";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?session=expired");
  }

  const portal = await getMemberPortalData(session.user.email);

  const membershipDetails = [
    { label: "Member ID", value: portal.profile.memberId },
    { label: "Tier", value: portal.profile.tier },
    { label: "Member since", value: portal.profile.memberSince },
    { label: "Spot", value: `Spot ${portal.hero.bayLabel}` },
    { label: "Concierge", value: portal.profile.concierge.phone },
    { label: "Key fobs", value: "2 active" },
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Profile</p>
        <h1 className="text-2xl font-semibold text-[var(--text)]">Membership</h1>
        <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">Contact info, notification preferences, and concierge notes.</p>
      </header>

      <section className="mobile-card grid grid-cols-1 gap-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)] sm:grid-cols-2">
        {membershipDetails.map((detail) => (
          <div key={detail.label} className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.65)] p-3">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">{detail.label}</p>
            <p className="mt-1 text-base font-semibold text-[var(--text)]">{detail.value}</p>
          </div>
        ))}
      </section>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface3-rgb),0.9)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Contacts</p>
          <h2 className="text-lg font-semibold text-[var(--text)]">Reach you how?</h2>
        </div>
        <div className="space-y-3">
          {portal.profile.profileContacts.map((contact) => (
            <div key={contact.label} className="flex items-center justify-between rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface2-rgb),0.7)] px-4 py-3 text-sm">
              <span className="text-[rgba(var(--text-rgb),0.65)]">{contact.label}</span>
              <span className="font-semibold text-[var(--text)]">{contact.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface2-rgb),0.9)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Notifications</p>
          <h2 className="text-lg font-semibold text-[var(--text)]">When to ping you</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {portal.profile.notifications.map((item) => (
            <span key={item} className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.7)] px-4 py-2 text-sm text-[var(--text)]">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
