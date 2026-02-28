import Link from 'next/link';

const stats = [
  { label: 'Total Vehicles', value: '84', sub: '+6 this month' },
  { label: 'Active Members', value: '47', sub: '3 pending invites' },
  { label: 'Storage Utilization', value: '92%', sub: '4 open bays' },
  { label: 'Monthly Revenue', value: '$128K', sub: '↑ 8% vs last month' },
];

const activity = [
  { type: 'Check-in', detail: '2020 Porsche GT4 · Bay C12', time: '12 min ago' },
  { type: 'Member', detail: 'Invited: Erika Samuels', time: '1 hr ago' },
  { type: 'Check-out', detail: 'Ferrari F12 · Bay B02', time: '3 hrs ago' },
  { type: 'Check-in', detail: 'Bronco Raptor · Bay A07', time: 'Yesterday' },
  { type: 'Member', detail: 'New registration: Kenzo Lee', time: 'Yesterday' },
];

const quickLinks = [
  { label: 'Vehicles', desc: 'Add, assign bays, audit storage', href: '/admin/vehicles' },
  { label: 'Members', desc: 'Invite, suspend, view fleet', href: '/admin/members' },
  { label: 'Events', desc: 'Drives, socials, RSVPs', href: '/admin/events' },
];

export default function AdminOverviewPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <header>
        <p style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 8 }}>
          Control Center
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 700 }}>Operations overview</h1>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {stats.map((card) => (
          <div
            key={card.label}
            style={{
              padding: '20px 22px',
              borderRadius: 16,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12 }}>{card.label}</p>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{card.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{card.sub}</div>
          </div>
        ))}
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
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'var(--surface2)',
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>Recent activity</h2>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Last 24 hours</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activity.map((item) => (
              <div
                key={`${item.type}-${item.detail}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--muted)', textTransform: 'uppercase' }}>
                    {item.type}
                  </span>
                  <p style={{ fontSize: 15, color: 'var(--text)', marginTop: 6 }}>{item.detail}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderRadius: 18,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Quick links</h2>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '16px 18px',
                textDecoration: 'none',
                color: 'var(--text)',
                transition: 'border 0.2s, transform 0.2s',
                background: 'var(--surface2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
