export const dynamic = 'force-dynamic';

import Link from 'next/link';
import type { ConciergeRequestStatus, MembershipTier } from '@prisma/client';

import { prisma } from '@/lib/prisma';

const quickLinks = [
  { label: 'Vehicles', desc: 'Add, assign bays, audit storage', href: '/admin/vehicles' },
  { label: 'Members', desc: 'Invite, suspend, view fleet', href: '/admin/members' },
  { label: 'Events', desc: 'Drives, socials, RSVPs', href: '/admin/events' },
  { label: 'Concierge', desc: 'Battery runs, detailing, errands', href: '/admin/concierge' },
];

const conciergeStatusCopy: Record<ConciergeRequestStatus, { label: string; tone: string }> = {
  PENDING: { label: 'Requested', tone: 'var(--amber)' },
  SCHEDULED: { label: 'Scheduled', tone: 'var(--purple)' },
  IN_PROGRESS: { label: 'In progress', tone: 'var(--blue)' },
  DONE: { label: 'Completed', tone: 'var(--success)' },
};

const tierCopy: Record<MembershipTier, string> = {
  FOUNDER: 'Founder tier',
  PREMIUM: 'Premium tier',
  STANDARD: 'Standard tier',
};

type TimelineItem = {
  id: string;
  type: 'vehicle' | 'member' | 'concierge';
  title: string;
  detail: string;
  meta: string;
  timestamp: number;
};

export default async function AdminOverviewPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalVehicles,
    inStorage,
    assignedSpots,
    totalSpots,
    activeMembers,
    pendingMembers,
    conciergePending,
    conciergeInProgress,
    conciergeDoneToday,
    statusEvents,
    recentMembers,
    conciergeActivity,
    unassignedVehicles,
    pendingInvitesList,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { currentStatus: 'IN' } }),
    prisma.vehicle.count({ where: { currentSpotId: { not: null } } }),
    prisma.storageSpot.count({ where: { isTransient: false } }),
    prisma.owner.count({ where: { status: 'ACTIVE' } }),
    prisma.owner.count({ where: { status: 'PENDING' } }),
    prisma.conciergeRequest.count({ where: { status: 'PENDING' } }),
    prisma.conciergeRequest.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.conciergeRequest.count({ where: { status: 'DONE', updatedAt: { gte: startOfToday } } }),
    prisma.vehicleStatusEvent.findMany({
      orderBy: { occurredAt: 'desc' },
      take: 5,
      include: {
        vehicle: {
          select: {
            id: true,
            year: true,
            make: true,
            model: true,
            owner: { select: { fullName: true } },
          },
        },
        spot: { select: { code: true } },
      },
    }),
    prisma.owner.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, fullName: true, email: true, membershipTier: true, createdAt: true },
    }),
    prisma.conciergeRequest.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 3,
      include: {
        member: { select: { fullName: true } },
        vehicle: { select: { make: true, model: true } },
      },
    }),
    prisma.vehicle.findMany({
      where: { currentSpotId: null },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        year: true,
        make: true,
        model: true,
        vin: true,
        owner: { select: { fullName: true } },
        currentStatus: true,
      },
    }),
    prisma.owner.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, fullName: true, email: true, membershipTier: true, createdAt: true },
    }),
  ]);

  const checkedOut = totalVehicles - inStorage;
  const utilization = totalSpots ? Math.min(100, Math.round((assignedSpots / totalSpots) * 100)) : 0;
  const availableBays = totalSpots ? Math.max(0, totalSpots - assignedSpots) : 0;
  const conciergeTotal = conciergePending + conciergeInProgress;

  const timeline: TimelineItem[] = [
    ...statusEvents.map((event) => ({
      id: `status-${event.id}`,
      type: 'vehicle' as const,
      title: event.status === 'IN' ? 'Check-in' : event.status === 'OUT' ? 'Check-out' : 'Maintenance',
      detail: `${event.vehicle.year} ${event.vehicle.make} ${event.vehicle.model}`,
      meta: `${event.vehicle.owner.fullName} · ${event.spot?.code ? `Bay ${event.spot.code}` : 'No bay assigned'}`,
      timestamp: event.occurredAt.getTime(),
    })),
    ...recentMembers.map((member) => ({
      id: `member-${member.id}`,
      type: 'member' as const,
      title: 'Member joined',
      detail: member.fullName,
      meta: `${member.email} · ${tierCopy[member.membershipTier]}`,
      timestamp: member.createdAt.getTime(),
    })),
    ...conciergeActivity.map((request) => ({
      id: `concierge-${request.id}`,
      type: 'concierge' as const,
      title: `${conciergeStatusCopy[request.status].label} concierge` as const,
      detail: request.vehicle ? `${request.vehicle.make} ${request.vehicle.model}` : 'Vehicle TBD',
      meta: `${request.member.fullName} · ${request.status.toLowerCase()}`,
      timestamp: request.updatedAt.getTime(),
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <header>
        <p style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
          Control Center
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 700 }}>Operations overview</h1>
            <p style={{ color: 'var(--muted)', marginTop: 6 }}>Live inventory, member health, and concierge load pulled right from the data layer.</p>
          </div>
          <Link
            href="/admin/vehicles"
            style={{
              borderRadius: 999,
              border: '1px solid var(--border)',
              padding: '10px 18px',
              textDecoration: 'none',
              color: 'var(--text)',
              fontSize: 13,
              background: 'rgba(var(--surface2-rgb),0.85)',
            }}
          >
            Go to vehicles ↗
          </Link>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
        }}
      >
        <SummaryCard
          label="Total vehicles"
          primary={`${totalVehicles}`}
          secondary={`${inStorage} in facility · ${checkedOut} out`}
        />
        <SummaryCard
          label="Active members"
          primary={`${activeMembers}`}
          secondary={`${pendingMembers} pending invite${pendingMembers === 1 ? '' : 's'}`}
        />
        <SummaryCard
          label="Storage utilization"
          primary={`${utilization}%`}
          secondary={`${assignedSpots}/${totalSpots || '?'} bays filled · ${availableBays} open`}
        />
        <SummaryCard
          label="Concierge queue"
          primary={`${conciergeTotal} live`}
          secondary={`${conciergePending} waiting · ${conciergeInProgress} rolling · ${conciergeDoneToday} closed today`}
        />
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 24,
        }}
      >
        <div
          style={{
            borderRadius: 22,
            border: '1px solid var(--border)',
            background: 'var(--surface2)',
            padding: 26,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>Recent activity</p>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>Vehicle movement & roster updates</h2>
            </div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Last synced · {new Date().toLocaleTimeString()}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {timeline.length ? (
              timeline.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>No activity logged yet.</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>Watchlist</p>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>Needs bay assignment</h3>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{unassignedVehicles.length} vehicles</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {unassignedVehicles.length ? (
                unassignedVehicles.map((vehicle) => (
                  <Link
                    key={vehicle.id}
                    href={`/admin/vehicles/${vehicle.id}`}
                    style={{
                      borderRadius: 14,
                      border: '1px solid rgba(var(--border-rgb),0.7)',
                      padding: 14,
                      textDecoration: 'none',
                      color: 'var(--text)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      background: 'rgba(var(--surface2-rgb),0.7)',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{vehicle.owner.fullName} · VIN {vehicle.vin}</div>
                    <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)' }}>
                      {vehicle.currentStatus === 'IN' ? 'Waiting for intake' : 'Out · assign on return'}
                    </span>
                  </Link>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>All vehicles have bays assigned.</div>
              )}
            </div>
          </div>

          <div
            style={{
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>Invites</p>
                <h3 style={{ fontSize: 18, fontWeight: 600 }}>Pending onboarding</h3>
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{pendingInvitesList.length} awaiting</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingInvitesList.length ? (
                pendingInvitesList.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      borderRadius: 14,
                      border: '1px solid rgba(var(--border-rgb),0.6)',
                      padding: 14,
                      background: 'rgba(var(--surface2-rgb),0.7)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{member.fullName || member.email}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{member.email}</div>
                    <span style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue)' }}>
                      {tierCopy[member.membershipTier]}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>Invited {formatRelativeTime(new Date(member.createdAt))}</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: 28, color: 'var(--muted)' }}>No outstanding invites.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          borderRadius: 22,
          border: '1px solid var(--border)',
          background: 'var(--surface2)',
          padding: 26,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase' }}>Navigation</p>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Jump to tooling</h2>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Most used modules</span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '18px 20px',
                textDecoration: 'none',
                color: 'var(--text)',
                background: 'var(--surface)',
                transition: 'border 0.2s, transform 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{link.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{link.desc}</div>
                </div>
                <span style={{ fontSize: 20 }}>↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, primary, secondary }: { label: string; primary: string; secondary: string }) {
  return (
    <div
      style={{
        padding: '20px 22px',
        borderRadius: 18,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <p style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>{label}</p>
      <div style={{ fontSize: 30, fontWeight: 700 }}>{primary}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{secondary}</div>
    </div>
  );
}

function ActivityRow({ item }: { item: TimelineItem }) {
  const accent =
    item.type === 'vehicle' ? 'var(--blue)'
      : item.type === 'member' ? 'var(--amber)'
        : 'var(--success)';

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: '14px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ width: 10, marginTop: 6 }}>
        <span style={{ display: 'block', width: 8, height: 8, borderRadius: '50%', background: accent }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</p>
            <p style={{ fontSize: 15, color: 'var(--text)' }}>{item.detail}</p>
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{formatRelativeTime(new Date(item.timestamp))}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{item.meta}</p>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date) {
  const diffSeconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.round(diffMonths / 12);
  return `${diffYears}y ago`;
}
