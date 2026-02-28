'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  Wrench,
  BatteryCharging,
  MoreHorizontal,
  CalendarDays,
  User,
  Car,
  GripVertical,
} from 'lucide-react';

type ConciergeStatus = 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'DONE';
type RequestType = 'DETAILING' | 'BATTERY_RUN' | 'OTHER';

type ConciergeRequest = {
  id: string;
  type: RequestType;
  notes: string | null;
  requestedDate: string | null;
  status: ConciergeStatus;
  createdAt: string;
  member: { id: string; fullName: string; email: string };
  vehicle: { year: number; make: string; model: string; color: string | null } | null;
};

const TYPE_META: Record<RequestType, { label: string; icon: React.ElementType }> = {
  DETAILING: { label: 'Detailing', icon: Wrench },
  BATTERY_RUN: { label: 'Battery run', icon: BatteryCharging },
  OTHER: { label: 'Other', icon: MoreHorizontal },
};

const COLUMNS: { id: ConciergeStatus; label: string; icon: React.ElementType; accent: string; accentRgb: string }[] =
  [
    { id: 'PENDING', label: 'Requested', icon: Clock, accent: 'var(--amber)', accentRgb: 'var(--amber-rgb)' },
    { id: 'SCHEDULED', label: 'Scheduled', icon: CalendarDays, accent: 'var(--purple)', accentRgb: 'var(--purple-rgb)' },
    { id: 'IN_PROGRESS', label: 'In progress', icon: Play, accent: 'var(--blue)', accentRgb: 'var(--blue-rgb)' },
    { id: 'DONE', label: 'Done', icon: CheckCircle2, accent: 'var(--success)', accentRgb: 'var(--success-rgb)' },
  ];

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function RequestCard({
  request,
  onDragStart,
}: {
  request: ConciergeRequest;
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const { label: typeLabel, icon: TypeIcon } = TYPE_META[request.type];

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, request.id)}
      className="group cursor-grab rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface2-rgb),0.92)] p-4 space-y-3 active:cursor-grabbing active:opacity-60 hover:border-[rgba(var(--blue-rgb),0.35)] transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <TypeIcon className="h-4 w-4 flex-none text-[var(--blue)]" aria-hidden="true" />
          <span className="font-semibold text-[var(--text)] text-sm">{typeLabel}</span>
        </div>
        <GripVertical className="h-4 w-4 flex-none text-[rgba(var(--text-rgb),0.25)] group-hover:text-[rgba(var(--text-rgb),0.45)]" />
      </div>

      {/* Member */}
      <div className="flex items-center gap-2 text-xs text-[rgba(var(--text-rgb),0.6)]">
        <User className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
        <span className="truncate">{request.member.fullName}</span>
      </div>

      {/* Vehicle */}
      {request.vehicle && (
        <div className="flex items-center gap-2 text-xs text-[rgba(var(--text-rgb),0.55)]">
          <Car className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          <span className="truncate">
            {request.vehicle.year} {request.vehicle.make} {request.vehicle.model}
            {request.vehicle.color && ` · ${request.vehicle.color}`}
          </span>
        </div>
      )}

      {/* Requested date */}
      {request.requestedDate && (
        <div className="flex items-center gap-2 text-xs text-[rgba(var(--text-rgb),0.55)]">
          <CalendarDays className="h-3.5 w-3.5 flex-none" aria-hidden="true" />
          <span>{formatDate(request.requestedDate)}</span>
        </div>
      )}

      {/* Notes */}
      {request.notes && (
        <p className="rounded-xl bg-[rgba(var(--surface3-rgb),0.8)] px-3 py-2 text-xs text-[rgba(var(--text-rgb),0.6)] line-clamp-3">
          {request.notes}
        </p>
      )}

      <p className="text-[0.65rem] text-[rgba(var(--text-rgb),0.35)]">
        Submitted {formatDate(request.createdAt)}
      </p>
    </div>
  );
}

export function ConciergeKanban({ initialRequests }: { initialRequests: ConciergeRequest[] }) {
  const [requests, setRequests] = useState<ConciergeRequest[]>(initialRequests);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ConciergeStatus | null>(null);
  const [updating, setUpdating] = useState<Set<string>>(new Set());
  const dragIdRef = useRef<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    dragIdRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverColumn(null);
    dragIdRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: ConciergeStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, columnId: ConciergeStatus) => {
      e.preventDefault();
      const id = dragIdRef.current;
      if (!id) return;

      const request = requests.find((r) => r.id === id);
      if (!request || request.status === columnId) {
        setDragOverColumn(null);
        setDraggingId(null);
        return;
      }

      // Optimistic update
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: columnId } : r))
      );
      setDragOverColumn(null);
      setDraggingId(null);
      dragIdRef.current = null;

      setUpdating((prev) => new Set(prev).add(id));
      try {
        const res = await fetch(`/api/concierge/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: columnId }),
        });
        if (!res.ok) {
          // Revert on failure
          setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: request.status } : r))
          );
        }
      } catch {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: request.status } : r))
        );
      } finally {
        setUpdating((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [requests]
  );

  const columnRequests = (col: ConciergeStatus) => requests.filter((r) => r.status === col);
  const totalCount = requests.length;

  return (
    <div className="space-y-2">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[rgba(var(--text-rgb),0.5)]">
        <span>{totalCount} total request{totalCount !== 1 ? 's' : ''}</span>
        {COLUMNS.map((col) => {
          const count = columnRequests(col.id).length;
          return (
            <span key={col.id} className="flex items-center gap-1.5">
              <col.icon className="h-3.5 w-3.5" style={{ color: col.accent }} />
              {count} {col.label.toLowerCase()}
            </span>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => {
          const cards = columnRequests(col.id);
          const isOver = dragOverColumn === col.id;
          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => handleDrop(e, col.id)}
              onDragEnd={handleDragEnd}
              className={[
                'flex flex-col rounded-3xl border p-4 transition-all min-h-[320px]',
                isOver
                  ? 'border-[rgba(var(--blue-rgb),0.5)] bg-[rgba(var(--blue-rgb),0.06)]'
                  : 'border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface-rgb),0.5)]',
              ].join(' ')}
            >
              {/* Column header */}
              <div className="mb-4 flex items-center gap-2">
                <col.icon
                  className="h-4 w-4 flex-none"
                  style={{ color: col.accent }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-sm text-[var(--text)]">{col.label}</span>
                <span
                  className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ color: col.accent, background: `rgba(${col.accentRgb}, 0.15)` }}
                >
                  {cards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-3">
                {cards.length === 0 && (
                  <div
                    className={[
                      'flex h-20 items-center justify-center rounded-2xl border-2 border-dashed text-xs text-[rgba(var(--text-rgb),0.3)] transition-all',
                      isOver
                        ? 'border-[rgba(var(--blue-rgb),0.4)]'
                        : 'border-[rgba(var(--border-rgb),0.3)]',
                    ].join(' ')}
                  >
                    Drop here
                  </div>
                )}
                {cards.map((req) => (
                  <div
                    key={req.id}
                    className={[
                      'transition-opacity',
                      draggingId === req.id ? 'opacity-40' : 'opacity-100',
                      updating.has(req.id) ? 'pointer-events-none opacity-60' : '',
                    ].join(' ')}
                  >
                    <RequestCard request={req} onDragStart={handleDragStart} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
