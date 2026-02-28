'use client';

import { useMemo, useState, useTransition, type ChangeEvent, type FormEvent, type CSSProperties, type ReactNode } from 'react';
import { Building2, Mail, MapPin, Phone, Plus, Search, Users, X } from 'lucide-react';
import type { MembershipTier, OwnerStatus, Vehicle } from '@prisma/client';

type VehicleStatus = Vehicle['currentStatus'];

import type { AdminMember, AdminVehicle, StorageSpotOption } from '@/app/admin/data/serializers';
import { inviteMemberAction, updateMemberProfileAction } from './actions';
import { assignVehicleSpotAction, toggleAccessStatusAction } from '../vehicles/actions';

const tierCopy: Record<MembershipTier, { label: string; tone: string; background: string }> = {
  FOUNDER: {
    label: 'Founder',
    tone: 'var(--amber)',
    background: 'rgba(var(--amber-rgb),0.18)',
  },
  PREMIUM: {
    label: 'Premium',
    tone: 'var(--blue)',
    background: 'rgba(var(--blue-rgb),0.18)',
  },
  STANDARD: {
    label: 'Standard',
    tone: 'var(--muted)',
    background: 'rgba(255,255,255,0.05)',
  },
};

const statusCopy: Record<OwnerStatus, { label: string; tone: string }> = {
  ACTIVE: { label: 'Active', tone: 'var(--success)' },
  PENDING: { label: 'Pending', tone: 'var(--amber)' },
  SUSPENDED: { label: 'Suspended', tone: 'var(--danger)' },
};

type TierFilter = 'ALL' | MembershipTier;

type MembersDashboardProps = {
  initialMembers: AdminMember[];
  initialVehicles: AdminVehicle[];
  storageSpots: StorageSpotOption[];
};

export default function MembersDashboard({ initialMembers, initialVehicles, storageSpots }: MembersDashboardProps) {
  const [members, setMembers] = useState<AdminMember[]>(() => initialMembers);
  const [fleet, setFleet] = useState<AdminVehicle[]>(() => initialVehicles);
  const [tierFilter, setTierFilter] = useState<TierFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialMembers[0]?.id ?? null);
  const [profileDraft, setProfileDraft] = useState<AdminMember | null>(() => (initialMembers[0] ? { ...initialMembers[0] } : null));
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTier, setInviteTier] = useState<MembershipTier>('PREMIUM');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const vehicleCounts = useMemo(() => {
    const map = new Map<string, number>();
    fleet.forEach((vehicle) => {
      map.set(vehicle.ownerId, (map.get(vehicle.ownerId) ?? 0) + 1);
    });
    return map;
  }, [fleet]);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesTier = tierFilter === 'ALL' ? true : member.membershipTier === tierFilter;
      if (!matchesTier) return false;
      if (!search.trim()) return true;
      const haystack = `${member.fullName} ${member.email} ${member.city ?? ''}`.toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [members, search, tierFilter]);

  const selectedMember = selectedId ? members.find((member) => member.id === selectedId) ?? null : null;
  const selectedVehicles = selectedMember ? fleet.filter((vehicle) => vehicle.ownerId === selectedMember.id) : [];

  const activeMembers = members.filter((member) => member.status === 'ACTIVE').length;
  const premiumShare = members.length
    ? Math.round((members.filter((member) => member.membershipTier !== 'STANDARD').length / members.length) * 100)
    : 0;
  const inStorage = fleet.filter((vehicle) => vehicle.status === 'IN').length;
  const checkedOut = fleet.length - inStorage;
  const assignedSpots = new Set(fleet.map((vehicle) => vehicle.storageSpotId).filter(Boolean)).size;

  const handleSelectMember = (memberId: string) => {
    setSelectedId(memberId);
    const next = members.find((member) => member.id === memberId) ?? null;
    setProfileDraft(next ? { ...next } : null);
    setProfileError(null);
  };

  const handleTierFilter = (value: TierFilter) => setTierFilter(value);

  const handleProfileFieldChange = (key: keyof AdminMember) => (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setProfileDraft((prev) => (prev ? { ...prev, [key]: event.target.value } : prev));
  };

  const handleProfileSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profileDraft) return;
    setProfileError(null);

    startTransition(async () => {
      const payload = {
        id: profileDraft.id,
        fullName: profileDraft.fullName,
        phone: profileDraft.phone ?? undefined,
        city: profileDraft.city ?? undefined,
        company: profileDraft.company ?? undefined,
        membershipTag: profileDraft.membershipTag ?? undefined,
        membershipTier: profileDraft.membershipTier,
        status: profileDraft.status,
        notes: profileDraft.notes ?? undefined,
        joinedAt: profileDraft.joinedAt ? profileDraft.joinedAt.slice(0, 10) : undefined,
      } as const;

      const result = await updateMemberProfileAction(payload);
      if (!result.ok) {
        setProfileError(result.error);
        return;
      }

      setMembers((prev) => prev.map((member) => (member.id === result.data.id ? result.data : member)));
      setProfileDraft({ ...result.data });
      setLastAction(`${result.data.fullName}'s profile updated.`);
    });
  };

  const handleSpotReassignment = (vehicleId: string, spotId: string) => {
    startTransition(async () => {
      const result = await assignVehicleSpotAction({ vehicleId, storageSpotId: spotId || null });
      if (!result.ok) {
        setLastAction(result.error);
        return;
      }
      setFleet((prev) => prev.map((vehicle) => (vehicle.id === result.data.id ? result.data : vehicle)));
      setLastAction(`${result.data.make} ${result.data.model} moved to ${result.data.storageSpotCode ?? 'unassigned'}.`);
    });
  };

  const handleVehicleStatus = (vehicleId: string) => {
    startTransition(async () => {
      const result = await toggleAccessStatusAction(vehicleId);
      if (!result.ok) {
        setLastAction(result.error);
        return;
      }
      setFleet((prev) => prev.map((vehicle) => (vehicle.id === result.data.id ? result.data : vehicle)));
      setLastAction(`${result.data.make} ${result.data.model} marked ${result.data.status === 'IN' ? 'in' : 'out'}.`);
    });
  };

  const handleInviteSubmit = () => {
    if (!inviteEmail.trim()) return;
    startTransition(async () => {
      const result = await inviteMemberAction({ email: inviteEmail, membershipTier: inviteTier });
      if (!result.ok) {
        setLastAction(result.error);
        return;
      }
      setMembers((prev) => [result.data, ...prev]);
      setInviteEmail('');
      setInviteTier('PREMIUM');
      setLastAction(`Invite sent to ${result.data.email}.`);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            Community
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 700 }}>Member roster</h1>
          <p style={{ color: 'var(--muted)', marginTop: 6 }}>Track membership tiers, contact details, and assigned storage.</p>
        </div>
        <div
          style={{
            borderRadius: 16,
            border: '1px solid var(--border)',
            background: 'var(--surface2)',
            padding: 16,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            minWidth: 320,
          }}
        >
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>Invite</p>
            <input
              type="email"
              value={inviteEmail}
              placeholder="newmember@nsc.club"
              onChange={(event) => setInviteEmail(event.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '8px 10px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text)',
              }}
            />
          </div>
          <select
            value={inviteTier}
            onChange={(event) => setInviteTier(event.target.value as MembershipTier)}
            style={{
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              padding: '8px 10px',
            }}
          >
            <option value="PREMIUM">Premium</option>
            <option value="STANDARD">Standard</option>
            <option value="FOUNDER">Founder</option>
          </select>
          <button
            type="button"
            onClick={handleInviteSubmit}
            style={{
              border: 'none',
              background: 'var(--blue)',
              color: 'var(--bg)',
              padding: 10,
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Send invite"
            disabled={isPending}
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <MemberStat label="Active members" primary={`${activeMembers}`} secondary="Invite-only" icon={<Users size={16} />} />
        <MemberStat label="Premium / Founder" primary={`${premiumShare}%`} secondary="Share of roster" icon={<Building2 size={16} />} />
        <MemberStat label="Vehicles in facility" primary={`${inStorage}`} secondary={`${checkedOut} on drives`} icon={<Search size={16} />} />
        <MemberStat label="Assigned bays" primary={`${assignedSpots}`} secondary={`of ${storageSpots.length}`} icon={<MapPin size={16} />} />
      </section>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <section style={{ flex: '0 0 320px', minWidth: 260, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ borderRadius: 18, border: '1px solid var(--border)', background: 'var(--surface2)', padding: 18 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, border: '1px solid var(--border)', padding: '6px 10px' }}>
                <Search size={16} color="var(--muted)" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search member"
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {(['ALL', 'FOUNDER', 'PREMIUM', 'STANDARD'] as const).map((tier) => {
                const active = tierFilter === tier;
                const label = tier === 'ALL' ? 'All' : tierCopy[tier].label;
                return (
                  <button
                    key={tier}
                    onClick={() => handleTierFilter(tier)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 999,
                      border: '1px solid var(--border)',
                      background: active ? 'var(--blue)' : 'transparent',
                      color: active ? 'var(--bg)' : 'var(--muted)',
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto', paddingRight: 6 }}>
              {filteredMembers.map((member) => {
                const count = vehicleCounts.get(member.id) ?? 0;
                const active = member.id === selectedId;
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMember(member.id)}
                    style={{
                      textAlign: 'left',
                      borderRadius: 14,
                      border: active ? '1px solid var(--blue)' : '1px solid var(--border)',
                      background: active ? 'rgba(var(--blue-rgb),0.12)' : 'var(--surface3)',
                      padding: 14,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{member.fullName}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{member.city ?? '—'}</div>
                      </div>
                      <TierBadge tier={member.membershipTier} />
                    </div>
                    <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: 'var(--muted)' }}>{member.email}</span>
                      <span style={{ fontWeight: 600 }}>{count} vehicles</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 11, color: statusCopy[member.status].tone }}>
                      {statusCopy[member.status].label}
                    </div>
                  </button>
                );
              })}
              {filteredMembers.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No members match that search.</div>
              )}
            </div>
          </div>
        </section>

        <section style={{ flex: '1 1 420px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedMember && profileDraft ? (
            <form onSubmit={handleProfileSave} style={{ borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface2)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>Profile</p>
                  <h2 style={{ fontSize: 26, fontWeight: 700 }}>{selectedMember.fullName}</h2>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <TierBadge tier={profileDraft.membershipTier} />
                  <StatusChip status={profileDraft.status} />
                </div>
              </div>

              {profileError && (
                <div style={{
                  borderRadius: 12,
                  border: '1px solid rgba(var(--danger-rgb),0.4)',
                  background: 'rgba(var(--danger-rgb),0.12)',
                  color: 'var(--danger)',
                  padding: 12,
                  fontSize: 13,
                }}>
                  {profileError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <ProfileField icon={<Mail size={16} />} label="Email" value={profileDraft.email} readOnly />
                <ProfileField icon={<Phone size={16} />} label="Phone" value={profileDraft.phone ?? '—'} readOnly />
                <ProfileField icon={<MapPin size={16} />} label="City" value={profileDraft.city ?? '—'} readOnly />
                {selectedMember.company && (
                  <ProfileField icon={<Building2 size={16} />} label="Company" value={selectedMember.company} readOnly />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <label style={profileLabelStyle}>
                  Membership tier
                  <select
                    value={profileDraft.membershipTier}
                    onChange={(event) => setProfileDraft((prev) => (prev ? { ...prev, membershipTier: event.target.value as MembershipTier } : prev))}
                    style={profileInputStyle}
                  >
                    <option value="FOUNDER">Founder</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="STANDARD">Standard</option>
                  </select>
                </label>
                <label style={profileLabelStyle}>
                  Status
                  <select
                    value={profileDraft.status}
                    onChange={(event) => setProfileDraft((prev) => (prev ? { ...prev, status: event.target.value as OwnerStatus } : prev))}
                    style={profileInputStyle}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </label>
                <label style={profileLabelStyle}>
                  Joined
                  <input type="date" value={formatDateInput(profileDraft.joinedAt)} onChange={handleProfileFieldChange('joinedAt')} style={profileInputStyle} />
                </label>
              </div>

              <label style={{ ...profileLabelStyle, display: 'flex', flexDirection: 'column' }}>
                Concierge notes
                <textarea
                  value={profileDraft.notes ?? ''}
                  onChange={handleProfileFieldChange('notes')}
                  rows={4}
                  style={{ ...profileInputStyle, resize: 'vertical', minHeight: 110 }}
                  placeholder="Vehicle quirks, preferred pickup windows..."
                />
              </label>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  type="submit"
                  style={{
                    padding: '11px 22px',
                    borderRadius: 999,
                    border: 'none',
                    background: 'var(--blue)',
                    color: 'var(--bg)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  disabled={isPending}
                >
                  Save profile
                </button>
                <button
                  type="button"
                  onClick={() => setProfileDraft(selectedMember ? { ...selectedMember } : null)}
                  style={{
                    padding: '11px 22px',
                    borderRadius: 999,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              </div>
            </form>
          ) : (
            <div style={{ borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface2)', padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
              Select a member to view profile details.
            </div>
          )}

          <div style={{ borderRadius: 20, border: '1px solid var(--border)', background: 'var(--surface)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>Assignments</p>
                <h3 style={{ fontSize: 20, fontWeight: 600 }}>Storage & movement</h3>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{selectedVehicles.length} vehicles</span>
            </div>

            {selectedVehicles.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {selectedVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    style={{
                      borderRadius: 16,
                      border: '1px solid var(--border)',
                      background: 'var(--surface2)',
                      padding: 16,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 16,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: '1 1 220px' }}>
                      <div style={{ fontWeight: 600 }}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>VIN {vehicle.vin}</div>
                    </div>
                    <div style={{ minWidth: 180 }}>
                      <label style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--muted)', textTransform: 'uppercase' }}>Storage spot</label>
                      <select
                        value={vehicle.storageSpotId ?? ''}
                        onChange={(event) => handleSpotReassignment(vehicle.id, event.target.value)}
                        style={{
                          width: '100%',
                          marginTop: 6,
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: 'var(--surface3)',
                          color: 'var(--text)',
                        }}
                        disabled={isPending}
                      >
                        <option value="">Unassigned</option>
                        {storageSpots.map((spotOption) => (
                          <option key={spotOption.id} value={spotOption.id}>
                            {spotOption.code} · {spotOption.level ?? '—'}
                          </option>
                        ))}
                      </select>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                        {vehicle.storageSpotLevel ?? 'Pending assignment'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <StatusBadge status={vehicle.status} />
                      <button
                        type="button"
                        onClick={() => handleVehicleStatus(vehicle.id)}
                        style={{
                          borderRadius: 999,
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          color: 'var(--text)',
                          padding: '6px 14px',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                        disabled={isPending}
                      >
                        Mark {vehicle.status === 'IN' ? 'out' : 'in'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>This member has no vehicles assigned.</div>
            )}
          </div>
        </section>
      </div>

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
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function TierBadge({ tier }: { tier: MembershipTier }) {
  const meta = tierCopy[tier];
  return (
    <span
      style={{
        padding: '4px 10px',
        borderRadius: 999,
        background: meta.background,
        color: meta.tone,
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {meta.label}
    </span>
  );
}

function StatusChip({ status }: { status: OwnerStatus }) {
  const meta = statusCopy[status];
  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: 999,
        border: `1px solid ${meta.tone}`,
        color: meta.tone,
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 700,
      }}
    >
      {meta.label}
    </span>
  );
}

function StatusBadge({ status }: { status: VehicleStatus }) {
  const tone = status === 'IN' ? 'var(--blue)' : 'var(--amber)';
  const background = status === 'IN' ? 'rgba(var(--blue-rgb),0.16)' : 'rgba(var(--amber-rgb),0.18)';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 12px',
        borderRadius: 999,
        background,
        color: tone,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone }} />
      {status === 'IN' ? 'In storage' : 'Out'}
    </span>
  );
}

function ProfileField({ icon, label, value, readOnly }: { icon: ReactNode; label: string; value: string; readOnly?: boolean }) {
  return (
    <div style={{ borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface3)', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
        {icon}
        {label}
      </div>
      <input value={value} readOnly={readOnly} style={{ width: '100%', border: 'none', background: 'transparent', color: 'var(--text)', fontSize: 14 }} />
    </div>
  );
}

function MemberStat({ label, primary, secondary, icon }: { label: string; primary: string; secondary: string; icon: ReactNode }) {
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon}
        <span style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <span style={{ fontSize: 28, fontWeight: 700 }}>{primary}</span>
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>{secondary}</span>
    </div>
  );
}

const profileLabelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  fontSize: 12,
  color: 'var(--muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.16em',
};

const profileInputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--surface3)',
  color: 'var(--text)',
  fontSize: 14,
};

function formatDateInput(value: string | undefined) {
  if (!value) return '';
  return value.slice(0, 10);
}
