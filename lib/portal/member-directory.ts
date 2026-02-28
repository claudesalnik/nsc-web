import type { AccessInfoProps } from "@/components/AccessInfo";

export type MemberDirectoryEntry = {
  userEmail: string;
  ownerEmail?: string;
  preferredName: string;
  fullName: string;
  memberId: string;
  tier: string;
  memberSince: string;
  membershipTagline?: string;
  profileContacts: { label: string; value: string }[];
  notifications: string[];
  concierge: {
    label: string;
    phone: string;
    href: string;
    statusLine: string;
  };
  storage: {
    spotLabel: string;
    zone: string;
    section: string;
    humidity: string;
    rowMapLabel: string;
    conciergeEta?: string;
    gate: AccessInfoProps;
  };
  billing: {
    planName: string;
    description: string;
    monthlyAmount: number;
    currency: string;
    nextChargeDate: string;
    invoices: {
      id: string;
      date: string;
      description: string;
      amount: number;
      status: "paid" | "pending";
      downloadUrl?: string;
    }[];
  };
};

const DIRECTORY: Record<string, MemberDirectoryEntry> = {
  "member@nsc.com": {
    userEmail: "member@nsc.com",
    ownerEmail: "member@nsc.com",
    preferredName: "Oleg",
    fullName: "Oleg Lebedev",
    memberId: "MEM-017",
    tier: "Founding — North Bay",
    memberSince: "2023",
    membershipTagline: "North Bay · Spot A17",
    profileContacts: [
      { label: "Primary", value: "+1 (415) 555-0091" },
      { label: "Backup", value: "+1 (415) 555-2234" },
      { label: "Email", value: "member@nsc.com" },
    ],
    notifications: ["Gate movement", "Climate variance", "Concierge updates"],
    concierge: {
      label: "Concierge",
      phone: "+1 (415) 555-0901",
      href: "tel:+14155550901",
      statusLine: "Gate secure · Last sweep 02:14",
    },
    storage: {
      spotLabel: "A17",
      zone: "North Bay",
      section: "Row A",
      humidity: "36% humidity",
      rowMapLabel: "Aisle 1",
      conciergeEta: "On site in 8 min",
      gate: {
        gateName: "North Bay Gate A",
        code: "7329 · A",
        secondaryCode: "2046 · ✶",
        validUntil: "Today · 23:59",
        lastRefreshed: "2 minutes ago",
        humidity: "36% humidity",
        wifi: { ssid: "NSC Members", password: "northbay-73" },
        instructions: [
          "Stop at call box — say 'Member 17'",
          "Enter primary code 7329 · A",
          "Follow concierge lights to Row A",
          "Ping concierge when departing",
        ],
        contacts: [
          { label: "Gate concierge", value: "+1 415 555 0901" },
          { label: "Detail bay", value: "+1 415 555 1180" },
        ],
        notes: "Thermal cameras show no activity for the last 6 hours.",
      },
    },
    billing: {
      planName: "North Bay — Premium",
      description: "Dedicated bay, climate telemetry, concierge pull-ups included.",
      monthlyAmount: 825,
      currency: "USD",
      nextChargeDate: "2026-03-01",
      invoices: [
        {
          id: "inv-2402",
          date: "2026-02-01",
          description: "Monthly Storage — North Bay A",
          amount: 825,
          status: "paid",
        },
        {
          id: "inv-2401",
          date: "2026-01-01",
          description: "Monthly Storage — North Bay A",
          amount: 825,
          status: "paid",
        },
        {
          id: "inv-2312",
          date: "2025-12-01",
          description: "Monthly Storage — North Bay A",
          amount: 825,
          status: "paid",
        },
        {
          id: "inv-2311",
          date: "2025-11-01",
          description: "Monthly Storage — North Bay A",
          amount: 825,
          status: "pending",
        },
      ],
    },
  },
};

export function getMemberProfile(email?: string | null): MemberDirectoryEntry | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return DIRECTORY[normalized] ?? null;
}
