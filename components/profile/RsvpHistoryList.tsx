"use client";

import clsx from "clsx";
import { CalendarCheck, Clock, MapPin, Car } from "lucide-react";

import type { MemberRsvpEvent, RsvpStatus } from "@/lib/profile/rsvp-history";

const STATUS_META: Record<
  RsvpStatus,
  { label: string; chip: string; dot: string }
> = {
  confirmed: {
    label: "Confirmed",
    chip: "border-[rgba(var(--success-rgb),0.4)] bg-[rgba(var(--success-rgb),0.12)] text-[var(--success)]",
    dot: "bg-[var(--success)]",
  },
  waitlisted: {
    label: "Waitlisted",
    chip: "border-[rgba(var(--amber-rgb),0.4)] bg-[rgba(var(--amber-rgb),0.12)] text-[var(--amber)]",
    dot: "bg-[var(--amber)]",
  },
  declined: {
    label: "Declined",
    chip: "border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.6)] text-[rgba(var(--text-rgb),0.5)]",
    dot: "bg-[rgba(var(--muted-rgb),0.5)]",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
});

type Props = {
  events: MemberRsvpEvent[];
};

export function RsvpHistoryList({ events }: Props) {
  if (events.length === 0) {
    return (
      <section className="mobile-card space-y-4 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.9)]">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Events</p>
          <h2 className="text-lg font-semibold text-[var(--text)]">RSVP history</h2>
        </div>
        <p className="text-sm text-[rgba(var(--text-rgb),0.5)]">No events on file yet.</p>
      </section>
    );
  }

  return (
    <section className="mobile-card space-y-5 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.9)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Events</p>
          <h2 className="text-lg font-semibold text-[var(--text)]">RSVP history</h2>
        </div>
        <span className="text-sm text-[rgba(var(--text-rgb),0.5)]">{events.length} events</span>
      </div>

      <ul className="space-y-3">
        {events.map((event) => {
          const meta = STATUS_META[event.status];
          const eventDate = new Date(event.date);
          const isPast = eventDate < new Date();

          return (
            <li
              key={event.id}
              className={clsx(
                "rounded-2xl border p-4 transition",
                isPast
                  ? "border-[rgba(var(--border-rgb),0.3)] bg-[rgba(var(--surface3-rgb),0.45)]"
                  : "border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.65)]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "inline-block h-2 w-2 flex-shrink-0 rounded-full",
                        meta.dot,
                      )}
                      aria-hidden="true"
                    />
                    <h3
                      className={clsx(
                        "text-base font-semibold leading-tight",
                        isPast
                          ? "text-[rgba(var(--text-rgb),0.65)]"
                          : "text-[var(--text)]",
                      )}
                    >
                      {event.name}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[rgba(var(--text-rgb),0.55)]">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {dateFormatter.format(eventDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                      {event.location}
                    </span>
                    {event.vehicle && (
                      <span className="flex items-center gap-1">
                        <Car className="h-3.5 w-3.5" aria-hidden="true" />
                        {event.vehicle}
                      </span>
                    )}
                    {event.role && (
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        {event.role}
                      </span>
                    )}
                  </div>

                  {event.note && (
                    <p className="text-xs italic text-[rgba(var(--text-rgb),0.45)]">
                      {event.note}
                    </p>
                  )}
                </div>

                <span
                  className={clsx(
                    "mobile-chip flex-shrink-0 text-[0.7rem]",
                    meta.chip,
                  )}
                >
                  {meta.label}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
