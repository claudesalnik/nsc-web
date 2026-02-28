import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { PortalChrome } from "@/components/portal/PortalChrome";
import { getMemberPortalData } from "@/lib/portal/member-data";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?session=expired");
  }

  const portal = await getMemberPortalData(session.user.email);

  const memberName = portal.profile.fullName || portal.profile.preferredName;
  const heroSubtitle = portal.hero.lastVisit ? `Last access ${portal.hero.lastVisit}` : portal.profile.tier;

  return (
    <PortalChrome
      memberName={memberName}
      memberSubtitle={portal.profile.membershipTagline ?? portal.profile.tier}
      spotLabel={portal.hero.bayLabel}
      concierge={{
        label: portal.profile.concierge.label,
        value: portal.profile.concierge.phone,
        href: portal.profile.concierge.href,
        statusLine: portal.profile.concierge.statusLine,
      }}
      hero={{
        locationLabel: portal.gate.gateName,
        title: `Spot ${portal.hero.bayLabel} — Ready for arrival`,
        subtitle: heroSubtitle,
      }}
      quickAccess={{
        gateName: portal.gate.gateName,
        primaryCode: portal.gate.code,
        secondaryCode: portal.gate.secondaryCode,
        validUntil: portal.gate.validUntil,
        lastRefreshed: portal.gate.lastRefreshed,
        spotLabel: portal.hero.bayLabel,
        rowLabel: portal.hero.section,
      }}
    >
      {children}
    </PortalChrome>
  );
}
