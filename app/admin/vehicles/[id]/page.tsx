import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PhotoUpload } from '@/components/PhotoUpload';
import { prisma } from '@/lib/prisma';

type PageParams = { params: { id: string } };

export default async function VehicleDetailPage({ params }: PageParams) {
  const { id } = params;
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      owner: true,
      currentSpot: true,
    },
  });

  if (!vehicle) {
    notFound();
  }

  const primaryPhoto = await prisma.vehiclePhoto.findFirst({
    where: { vehicleId: id },
    orderBy: { isPrimary: 'desc' },
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
            Vehicle detail
          </p>
          <h1 style={{ fontSize: 34, fontWeight: 700 }}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>VIN {vehicle.vin}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Link
            href="/admin/vehicles"
            style={{
              border: '1px solid var(--border)',
              borderRadius: 999,
              padding: '10px 16px',
              textDecoration: 'none',
              color: 'var(--muted)',
              fontSize: 13,
            }}
          >
            ← Back to list
          </Link>
          <div
            style={{
              borderRadius: 12,
              border: '1px solid rgba(var(--border-rgb), 0.7)',
              padding: '10px 16px',
              background: 'rgba(var(--surface-rgb), 0.9)',
              minWidth: 180,
            }}
          >
            <p style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.12em', color: 'var(--muted)', marginBottom: 4 }}>Storage</p>
            <p style={{ fontWeight: 600 }}>{vehicle.currentSpot?.code ?? 'Unassigned'}</p>
            <p style={{ color: 'var(--muted)', fontSize: 12 }}>{vehicle.currentSpot?.level ?? 'Assign a bay'}</p>
          </div>
        </div>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <InfoCard label="Owner" primary={vehicle.owner.fullName} secondary={vehicle.owner.email} />
        <InfoCard label="Status" primary={vehicle.currentStatus === 'IN' ? 'In storage' : 'Checked out'} secondary={vehicle.notes ?? 'Awaiting intake notes.'} />
        <InfoCard label="Color" primary={vehicle.color ?? '—'} secondary="Paint / finish" />
        {primaryPhoto && <InfoCard label="Primary photo" primary={primaryPhoto.caption ?? 'Primary'} secondary={primaryPhoto.url} />}
      </section>

      <PhotoUpload
        vehicleId={vehicle.id}
        eyebrow="Intake imagery"
        title="Capture current condition"
        description="Drag glare-free shots to keep a paper trail before every checkout."
      />
    </div>
  );
}

function InfoCard({ label, primary, secondary }: { label: string; primary: string; secondary?: string }) {
  return (
    <div
      style={{
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'rgba(var(--surface2-rgb), 0.9)',
        padding: 20,
      }}
    >
      <p style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 600 }}>{primary}</p>
      {secondary ? <p style={{ color: 'var(--muted)', marginTop: 4 }}>{secondary}</p> : null}
    </div>
  );
}
