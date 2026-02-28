'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Clock, Loader2, CheckCircle2, Play, CalendarDays } from 'lucide-react';

type ConciergeStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'DONE';

type Request = {
  id: string;
  type: 'DETAILING' | 'BATTERY_RUN' | 'OTHER';
  notes: string | null;
  requestedDate: string | null;
  status: ConciergeStatus;
  createdAt: string;
  vehicle: { year: number; make: string; model: string } | null;
};

const TYPE_LABEL: Record<Request['type'], string> = {
  DETAILING: 'Detailing',
  BATTERY_RUN: 'Battery run',
  OTHER: 'Other',
};

const STATUS_META: Record<
  ConciergeStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  PENDING: { label: 'Requested', color: 'var(--amber)', icon: Clock },
  SCHEDULED: { label: 'Scheduled', color: 'var(--purple)', icon: CalendarDays },
  IN_PROGRESS: { label: 'In progress', color: 'var(--blue)', icon: Play },
  DONE: { label: 'Done', color: 'var(--success)', icon: CheckCircle2 },
};

export function ConciergeRequestList({ initialRequests }: { initialRequests: Request[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/concierge/${id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">
          Your requests
        </p>
        <span className="rounded-full bg-[rgba(var(--blue-rgb),0.15)] px-2 py-0.5 text-xs font-semibold text-[var(--blue)]">
          {initialRequests.length}
        </span>
      </div>

      <ul className="space-y-3">
        {initialRequests.map((req) => {
          const meta = STATUS_META[req.status];
          const StatusIcon = meta.icon;
          return (
            <li
              key={req.id}
              className="mobile-card flex items-start justify-between gap-4 border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface2-rgb),0.9)]"
            >
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--text)]">
                    {TYPE_LABEL[req.type]}
                  </span>
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      color: meta.color,
                      background: `rgba(var(--${req.status === 'PENDING' ? 'amber' : req.status === 'SCHEDULED' ? 'purple' : req.status === 'IN_PROGRESS' ? 'blue' : 'success'}-rgb), 0.15)`,
                    }}
                  >
                    <StatusIcon className="h-3 w-3" aria-hidden="true" />
                    {meta.label}
                  </span>
                </div>
                {req.vehicle && (
                  <p className="text-xs text-[rgba(var(--text-rgb),0.6)]">
                    {req.vehicle.year} {req.vehicle.make} {req.vehicle.model}
                  </p>
                )}
                {req.requestedDate && (
                  <p className="text-xs text-[rgba(var(--text-rgb),0.55)]">
                    Requested for {new Date(req.requestedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
                {req.notes && (
                  <p className="text-xs text-[rgba(var(--text-rgb),0.5)] truncate">{req.notes}</p>
                )}
                <p className="text-xs text-[rgba(var(--text-rgb),0.4)]">
                  Submitted {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>

              {req.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => handleDelete(req.id)}
                  disabled={deletingId === req.id}
                  className="flex-none rounded-xl border border-[rgba(var(--danger-rgb),0.3)] bg-[rgba(var(--danger-rgb),0.08)] p-2 text-[var(--danger)] transition hover:bg-[rgba(var(--danger-rgb),0.18)] disabled:opacity-50"
                  aria-label="Cancel request"
                >
                  {deletingId === req.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
