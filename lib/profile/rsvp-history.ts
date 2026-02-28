export type RsvpStatus = "confirmed" | "waitlisted" | "declined";

export type MemberRsvpEvent = {
  id: string;
  name: string;
  date: string; // ISO
  location: string;
  status: RsvpStatus;
  vehicle?: string;
  role?: string;
  note?: string;
};

// Seed data — replace with Prisma query once Event + Rsvp models are added
const SEED: MemberRsvpEvent[] = [
  {
    id: "rsvp-2603-alpine",
    name: "Alpine Dawn Patrol",
    date: "2026-03-14T07:00:00-08:00",
    location: "North Fork switchbacks",
    status: "confirmed",
    vehicle: "GT4 · Arctic Silver",
    note: "Slot held with concierge staging at 05:45",
  },
  {
    id: "rsvp-2605-carweek",
    name: "Monterey Car Week Preview",
    date: "2026-05-02T16:30:00-07:00",
    location: "NSC · Event Hall",
    status: "waitlisted",
    role: "Panel guest",
    note: "Pending final grid once Ferrari allocation confirmed",
  },
  {
    id: "rsvp-2602-night",
    name: "Sierra Night Run",
    date: "2026-02-07T21:30:00-08:00",
    location: "Auburn → Donner Pass",
    status: "confirmed",
    vehicle: "F12 Berlinetta",
    note: "Requested heated staging + thermal pre-check",
  },
  {
    id: "rsvp-2601-vineyard",
    name: "Vineyard Social",
    date: "2026-01-18T12:00:00-08:00",
    location: "Dry Creek Estate",
    status: "declined",
    note: "Travel week — sent bottle on behalf",
  },
];

export function getMemberRsvpHistory(): MemberRsvpEvent[] {
  return SEED.map((e) => ({ ...e }));
}
