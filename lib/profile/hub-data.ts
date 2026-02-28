import { cache } from "react";

import { getMemberPortalData } from "@/lib/portal/member-data";
import { getContactPreferences, type ContactPreferences } from "@/lib/profile/contact-preferences";
import { getMemberRsvpHistory, type MemberRsvpEvent } from "@/lib/profile/rsvp-history";
import type { VehicleCardData } from "@/components/VehicleCard";

export type ProfileStorageStatus = {
  spotLabel: string;
  section: string;
  zone: string;
  humidity: string;
  rowLabel: string;
  gateCode: string;
  conciergeEta?: string;
  lastVisit?: string;
};

export type MemberProfileHubData = {
  member: {
    name: string;
    fullName: string;
    tier: string;
    memberSince: string;
    tagline: string;
    memberId: string;
    concierge: {
      label: string;
      phone: string;
      href: string;
      statusLine: string;
    };
  };
  storage: ProfileStorageStatus;
  stats: {
    stored: number;
    checkedOut: number;
    total: number;
  };
  vehicles: VehicleCardData[];
  contactPreferences: ContactPreferences;
  rsvpHistory: MemberRsvpEvent[];
};

export const getMemberProfileHubData = cache(
  async (userEmail: string): Promise<MemberProfileHubData> => {
    const portal = await getMemberPortalData(userEmail);
    const contactPreferences = getContactPreferences(userEmail);
    const rsvpHistory = getMemberRsvpHistory();

    const profile = portal.profile;

    return {
      member: {
        name: profile.preferredName ?? profile.fullName,
        fullName: profile.fullName,
        tier: profile.tier,
        memberSince: profile.memberSince,
        memberId: profile.memberId,
        tagline: profile.membershipTagline ?? profile.tier,
        concierge: profile.concierge,
      },
      storage: {
        spotLabel: portal.hero.bayLabel,
        section: portal.hero.section,
        zone: portal.hero.zone,
        humidity: portal.hero.humidity,
        rowLabel: portal.hero.rowMapLabel,
        gateCode: portal.hero.gateCode,
        conciergeEta: portal.hero.conciergeEta,
        lastVisit: portal.hero.lastVisit,
      },
      stats: portal.stats,
      vehicles: portal.vehicles,
      contactPreferences,
      rsvpHistory,
    };
  },
);
