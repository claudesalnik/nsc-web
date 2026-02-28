'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, useTransition, type FormEvent, type ChangeEvent, type CSSProperties } from 'react';
import { PencilLine, Plus, Trash2, X } from 'lucide-react';
import type { Vehicle } from '@prisma/client';
type VehicleStatus = Vehicle['currentStatus'];

import type { AdminVehicle, StorageSpotOption } from '@/app/admin/data/serializers';
import {
  createVehicleAction,
  deleteVehicleAction,
  toggleAccessStatusAction,
  updateVehicleAction,
  type VehicleFormInput,
} from './actions';

export type MemberOption = {
  id: string;
  name: string;
  email: string;
};

type VehiclesDashboardProps = {
  initialVehicles: AdminVehicle[];
  members: MemberOption[];
  storageSpots: StorageSpotOption[];
};

type VehicleDraft = {
  id?: string;
  ownerId: string;
  year: string;
  make: string;
  model: string;
  color: string;
  storageSpotId: string;
  status: VehicleStatus;
  vin: string;
  photoUrl: string;
  notes: string;
};

type StatusFilter = 'ALL' | VehicleStatus;

const statusMeta: Record<VehicleStatus, { label: string; tone: string; background: string }> = {
  IN: {
    label: 'In storage',
    tone: 'var(--blue)',
    background: 'rgba(var(--blue-rgb),0.16)',
  },
  OUT: {
    label: 'Checked out',
    tone: 'var(--amber)',
    background: 'rgba(var(--amber-rgb),0.18)',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    tone: 'var(--muted)',
    background: 'rgba(100,100,100,0.15)',
  },
};

export default function VehiclesDashboard({ initialVehicles, members, storageSpots }: VehiclesDashboardProps) {
  const defaultOwner = members[0]?.id ?? '';
  const defaultSpot = storageSpots[0]?.id ?? '';

  const [vehicles, setVehicles] = useState<AdminVehicle[]>(() => initialVehicles);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formDraft, setFormDraft] = useState<VehicleDraft>(() => emptyDraft(defaultOwner, defaultSpot));
  const [pendingDeletion, setPendingDeletion] = useState<AdminVehicle | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesStatus = statusFilter === 'ALL' ? true : vehicle.status === statusFilter;
      if (!matchesStatus) return false;

      if (!search.trim()) return true;
      const haystack = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.ownerName} ${vehicle.ownerEmail} ${vehicle.storageSpotCode ?? ''}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [vehicles, search, statusFilter]);

  const storedCount = vehicles.filter((vehicle) => vehicle.status === 'IN').length;
  const checkedOutCount = vehicles.length - storedCount;
  const occupancy = vehicles.length ? Math.round((storedCount / vehicles.length) * 100) : 0;

  const openCreateForm = () => {
    setFormMode('CREATE');
    setFormDraft(emptyDraft(defaultOwner, defaultSpot));
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (vehicle: AdminVehicle) => {
    setFormMode('EDIT');
    setFormDraft({
      id: vehicle.id,
      ownerId: vehicle.ownerId,
      year: String(vehicle.year),
      make: vehicle.make,
      model: vehicle.model,
      color: vehicle.color ?? '',
      storageSpotId: vehicle.storageSpotId ?? '',
      status: vehicle.status,
      vin: vehicle.vin,
      photoUrl: vehicle.photoUrl ?? '',
      notes: vehicle.notes ?? '',
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormChange = (key: keyof VehicleDraft) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormDraft((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const payload: VehicleFormInput = {
      ownerId: formDraft.ownerId || defaultOwner,
      year: Number(formDraft.year) || new Date().getFullYear(),
      make: formDraft.make,
      model: formDraft.model,
      color: formDraft.color,
      storageSpotId: formDraft.storageSpotId ? formDraft.storageSpotId : null,
      status: formDraft.status,
      vin: formDraft.vin,
      photoUrl: formDraft.photoUrl,
      notes: formDraft.notes,
    };

    startTransition(async () => {
      const result = formMode === 'CREATE'
        ? await createVehicleAction(payload)
        : await updateVehicleAction({ ...payload, id: formDraft.id! });

      if (!result.ok) {
        setFormError(result.error);
        return;
      }

      if (formMode === 'CREATE') {
        setVehicles((prev) => [result.data, ...prev]);
        setLastAction(`${result.data.year} ${result.data.make} ${result.data.model} added.`);
      } else {
        setVehicles((prev) => prev.map((vehicle) => (vehicle.id === result.data.id ? result.data : vehicle)));
        setLastAction(`${result.data.year} ${result.data.make} ${result.data.model} updated.`);
      }

      setFormOpen(false);
    });
  };

  const handleToggleStatus = (vehicleId: string) => {
    startTransition(async () => {
      const result = await toggleAccessStatusAction(vehicleId);
      if (!result.ok) {
        setLastAction(result.error);
        return;
      }
      setVehicles((prev) => prev.map((vehicle) => (vehicle.id === vehicleId ? result.data : vehicle)));
      setLastAction(`${result.data.year} ${result.data.make} ${result.data.model} marked ${result.data.status === 'IN' ? 'in' : 'out'}.`);
    });
  };

  const handleDelete = () => {
    if (!pendingDeletion) return;
    const target = pendingDeletion;
    startTransition(async () => {
      const result = await deleteVehicleAction(target.id);
      if (!result.ok) {
        setLastAction(result.error);
        return;
      }
      setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== target.id));
      setPendingDeletion(null);
      setLastAction(`${target.year} ${target.make} ${target.model} archived.`);
    });
  };

  const climateSpots = countSpots(storageSpots, 'Climate');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            Inventory
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Vehicle storage</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Monitor assignments, intake new vehicles, and respond to concierge requests.</p>
        </div>
        <button
          onClick={openCreateForm}
          style={{
            padding: '12px 20px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--blue)',
            color: 'var(--bg)',
            fontWeight: 600,
            fontSize: 13,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
          Add vehicle
        </button>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        <StatCard label="Total vehicles" primary={`${vehicles.length}`} secondary={`${checkedOutCount} out of facility`} />
        <StatCard label="In storage" primary={`${storedCount}`} secondary={`${occupancy}% utilization`} />
        <StatCard label="Checked out" primary={`${checkedOutCount}`} secondary="Active concierge jobs" />
        <StatCard label="Climate bays" primary={`${climateSpots}`} secondary="Premium allocation" />
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <div
          style={{
            display: 'inline-flex',
            border: '1px solid var(--border)',
            borderRadius: 999,
            padding: 4,
            background: 'var(--surface)',
            gap: 4,
          }}
        >
          {(['ALL', 'IN', 'OUT'] as const).map((status) => {
            const active = statusFilter === status;
            const label = status === 'ALL' ? 'All' : status === 'IN' ? 'In' : 'Out';
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: active ? 'var(--blue)' : 'transparent',
                  color: active ? 'var(--bg)' : 'var(--muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <input
          type="search"
          placeholder="Search owner, VIN, or bay"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{
            flex: 1,
            minWidth: 220,
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: 14,
          }}
        />
      </div>

      <div style={{ borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--surface2)' }}>
            <tr>
              {['Vehicle', 'Owner', 'Storage spot', 'Status', 'Actions'].map((header) => (
                <th
                  key={header}
                  style={{
                    textAlign: 'left',
                    padding: '14px 18px',
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => (
              <tr key={vehicle.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 64,
                        height: 48,
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.04)',
                        background: 'linear-gradient(135deg, rgba(var(--surface2-rgb),0.9), rgba(var(--surface3-rgb),0.9))',
                        position: 'relative',
                      }}
                    >
                      {vehicle.photoUrl ? (
                        <Image
                          src={vehicle.photoUrl}
                          alt={`${vehicle.year} ${vehicle.make}`}
                          fill
                          sizes="(max-width: 600px) 120px, 80px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 11,
                            letterSpacing: '0.2em',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                          }}
                        >
                          NSC
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {vehicle.year} {vehicle.make}
                      </div>
                      <div style={{ color: 'var(--muted)', fontSize: 13 }}>{vehicle.model}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{vehicle.vin}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 18px' }}>
                  <div style={{ fontWeight: 600 }}>{vehicle.ownerName}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{vehicle.ownerEmail}</div>
                </td>
                <td style={{ padding: '16px 18px' }}>
                  <div style={{ fontWeight: 600 }}>{vehicle.storageSpotCode ?? 'Unassigned'}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{vehicle.storageSpotLevel ?? 'Assign bay'}</div>
                </td>
                <td style={{ padding: '16px 18px' }}>
                  <StatusBadge status={vehicle.status} />
                </td>
                <td style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(vehicle.id)}
                      style={{
                        borderRadius: 999,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        color: 'var(--text)',
                        padding: '6px 14px',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                      disabled={isPending}
                    >
                      Mark {vehicle.status === 'IN' ? 'Out' : 'In'}
                    </button>
                    <Link
                      href={`/admin/vehicles/${vehicle.id}`}
                      style={{
                        borderRadius: 999,
                        border: '1px solid rgba(255,255,255,0.12)',
                        padding: '6px 14px',
                        fontSize: 12,
                        color: 'var(--text)',
                        textDecoration: 'none',
                        background: 'rgba(255,255,255,0.04)',
                      }}
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEditForm(vehicle)}
                      style={{
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: 10,
                        color: 'var(--text)',
                        padding: 8,
                        cursor: 'pointer',
                        display: 'inline-flex',
                      }}
                    >
                      <PencilLine size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeletion(vehicle)}
                      style={{
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(242,109,109,0.1)',
                        borderRadius: 10,
                        color: 'var(--danger)',
                        padding: 8,
                        cursor: 'pointer',
                        display: 'inline-flex',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredVehicles.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>
                  Nothing matches that search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            justifyContent: 'flex-end',
            zIndex: 50,
          }}
          onClick={() => setFormOpen(false)}
        >
          <div
            style={{
              width: 'min(520px, 100%)',
              height: '100%',
              background: 'var(--surface2)',
              borderLeft: '1px solid var(--border)',
              padding: 28,
              overflowY: 'auto',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {formMode === 'CREATE' ? 'Intake' : 'Update'}
                </p>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>
                  {formMode === 'CREATE' ? 'Add vehicle' : 'Edit vehicle'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {formError && (
                <div style={{
                  borderRadius: 12,
                  border: '1px solid rgba(var(--danger-rgb),0.4)',
                  background: 'rgba(var(--danger-rgb),0.12)',
                  color: 'var(--danger)',
                  padding: 12,
                  fontSize: 13,
                }}>
                  {formError}
                </div>
              )}

              <div style={formSectionStyle}>
                <label style={labelStyle}>
                  Owner
                  <select value={formDraft.ownerId} onChange={handleFormChange('ownerId')} style={inputStyle}>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={labelStyle}>
                  Storage spot
                  <select value={formDraft.storageSpotId} onChange={handleFormChange('storageSpotId')} style={inputStyle}>
                    <option value="">Unassigned</option>
                    {storageSpots.map((spot) => (
                      <option key={spot.id} value={spot.id}>
                        {spot.code} · {spot.level ?? '—'}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={labelStyle}>
                  Status
                  <select value={formDraft.status} onChange={handleFormChange('status')} style={inputStyle}>
                    <option value="IN">In storage</option>
                    <option value="OUT">Checked out</option>
                  </select>
                </label>
              </div>

              <div style={formSectionStyle}>
                <label style={labelStyle}>
                  Year
                  <input type="number" value={formDraft.year} onChange={handleFormChange('year')} style={inputStyle} />
                </label>
                <label style={labelStyle}>
                  Make
                  <input type="text" value={formDraft.make} onChange={handleFormChange('make')} style={inputStyle} />
                </label>
                <label style={labelStyle}>
                  Model
                  <input type="text" value={formDraft.model} onChange={handleFormChange('model')} style={inputStyle} />
                </label>
                <label style={labelStyle}>
                  Color
                  <input type="text" value={formDraft.color} onChange={handleFormChange('color')} style={inputStyle} />
                </label>
                <label style={labelStyle}>
                  VIN / chassis
                  <input type="text" value={formDraft.vin} onChange={handleFormChange('vin')} style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)' }} />
                </label>
                <label style={labelStyle}>
                  Photo URL
                  <input type="url" value={formDraft.photoUrl} onChange={handleFormChange('photoUrl')} placeholder="https://" style={inputStyle} />
                </label>
              </div>

              <label style={{ ...labelStyle, display: 'flex', flexDirection: 'column' }}>
                Concierge notes
                <textarea
                  value={formDraft.notes}
                  onChange={handleFormChange('notes')}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                  placeholder="Battery tender, cover preference, fueling instructions..."
                />
              </label>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                <button
                  type="submit"
                  style={{
                    padding: '12px 28px',
                    borderRadius: 999,
                    border: 'none',
                    background: 'var(--blue)',
                    color: 'var(--bg)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  disabled={isPending}
                >
                  {formMode === 'CREATE' ? 'Save vehicle' : 'Update vehicle'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  style={{
                    padding: '12px 28px',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pendingDeletion && (
        <div
          role="alertdialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 60,
          }}
        >
          <div style={{ width: 'min(420px, 90%)', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface2)', padding: 28 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Archive vehicle?</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
              {pendingDeletion.year} {pendingDeletion.make} {pendingDeletion.model} will be removed from the admin dashboard.
              Storage bay {pendingDeletion.storageSpotCode ?? 'Unassigned'} becomes available immediately.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => setPendingDeletion(null)}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Keep vehicle
              </button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 12,
                  border: '1px solid rgba(var(--danger-rgb),0.4)',
                  background: 'rgba(var(--danger-rgb),0.15)',
                  color: 'var(--danger)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                disabled={isPending}
              >
                Archive now
              </button>
            </div>
          </div>
        </div>
      )}

      {lastAction && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: 'var(--surface2)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: 'var(--shadow-soft)',
            zIndex: 80,
          }}
        >
          <span style={{ fontSize: 13 }}>{lastAction}</span>
          <button
            onClick={() => setLastAction(null)}
            style={{ border: 'none', background: 'transparent', color: 'var(--muted)', cursor: 'pointer' }}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 12px',
        borderRadius: 999,
        background: meta.background,
        color: meta.tone,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.tone }} />
      {meta.label}
    </span>
  );
}

function StatCard({ label, primary, secondary }: { label: string; primary: string; secondary: string }) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: '1px solid var(--border)',
        background: 'var(--surface2)',
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span style={{ fontSize: 12, letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700 }}>{primary}</span>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{secondary}</span>
    </div>
  );
}

const formSectionStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 14,
};

const labelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  color: 'var(--muted)',
};

const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontSize: 14,
};

function emptyDraft(defaultOwner: string, defaultSpot: string): VehicleDraft {
  return {
    ownerId: defaultOwner,
    year: String(new Date().getFullYear()),
    make: '',
    model: '',
    color: '',
    storageSpotId: defaultSpot,
    status: 'IN',
    vin: '',
    photoUrl: '',
    notes: '',
  };
}

function countSpots(spots: StorageSpotOption[], climate: string) {
  return spots.filter((spot) => spot.climate === climate).length;
}
