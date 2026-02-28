'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, Wrench, BatteryCharging, MoreHorizontal } from 'lucide-react';

type Vehicle = { id: string; year: number; make: string; model: string };

const REQUEST_TYPES = [
  {
    value: 'DETAILING',
    label: 'Detailing',
    description: 'Full interior & exterior detail',
    icon: Wrench,
  },
  {
    value: 'BATTERY_RUN',
    label: 'Battery run',
    description: 'Start & run to maintain charge',
    icon: BatteryCharging,
  },
  {
    value: 'OTHER',
    label: 'Other',
    description: 'Custom service request',
    icon: MoreHorizontal,
  },
] as const;

type RequestType = (typeof REQUEST_TYPES)[number]['value'];

export function ConciergeRequestForm({ vehicles }: { vehicles: Vehicle[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [vehicleId, setVehicleId] = useState('');
  const [notes, setNotes] = useState('');
  const [requestedDate, setRequestedDate] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedType) return;
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch('/api/concierge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: selectedType,
            vehicleId: vehicleId || undefined,
            notes: notes || undefined,
            requestedDate: requestedDate || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? 'Something went wrong. Please try again.');
          return;
        }

        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setSelectedType(null);
          setVehicleId('');
          setNotes('');
          setRequestedDate('');
          router.refresh();
        }, 2500);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  if (submitted) {
    return (
      <div className="mobile-card flex flex-col items-center gap-3 py-10 text-center border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)]">
        <CheckCircle2 className="h-10 w-10 text-[var(--success)]" />
        <p className="text-lg font-semibold text-[var(--text)]">Request submitted</p>
        <p className="text-sm text-[rgba(var(--text-rgb),0.6)]">
          Your concierge team will confirm shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mobile-card space-y-5 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)]">
      <div>
        <p className="text-xs uppercase tracking-[0.45em] text-[rgba(var(--text-rgb),0.5)]">Service type</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {REQUEST_TYPES.map(({ value, label, description, icon: Icon }) => {
            const active = selectedType === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedType(value)}
                className={[
                  'flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition-all',
                  active
                    ? 'border-[var(--blue)] bg-[rgba(var(--blue-rgb),0.1)] text-[var(--text)]'
                    : 'border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.6)] text-[rgba(var(--text-rgb),0.75)] hover:border-[rgba(var(--blue-rgb),0.4)]',
                ].join(' ')}
              >
                <Icon
                  className={`h-5 w-5 ${active ? 'text-[var(--blue)]' : 'text-[rgba(var(--text-rgb),0.5)]'}`}
                  aria-hidden="true"
                />
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-[rgba(var(--text-rgb),0.55)]">{description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {vehicles.length > 0 && (
        <div>
          <label
            htmlFor="vehicleId"
            className="block text-xs uppercase tracking-[0.45em] text-[rgba(var(--text-rgb),0.5)]"
          >
            Vehicle (optional)
          </label>
          <select
            id="vehicleId"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="nsc-input mt-2 w-full"
          >
            <option value="">All vehicles / not specified</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.year} {v.make} {v.model}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label
          htmlFor="requestedDate"
          className="block text-xs uppercase tracking-[0.45em] text-[rgba(var(--text-rgb),0.5)]"
        >
          Preferred date (optional)
        </label>
        <input
          id="requestedDate"
          type="date"
          value={requestedDate}
          onChange={(e) => setRequestedDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="nsc-input mt-2 w-full"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-xs uppercase tracking-[0.45em] text-[rgba(var(--text-rgb),0.5)]"
        >
          Notes (optional)
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any special instructions or details…"
          className="nsc-input mt-2 w-full resize-none"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-[rgba(var(--danger-rgb),0.1)] px-4 py-2.5 text-sm text-[var(--danger)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!selectedType || isPending}
        className="nsc-btn nsc-btn--primary nsc-btn--full disabled:opacity-50"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </span>
        ) : (
          'Submit request'
        )}
      </button>
    </form>
  );
}
