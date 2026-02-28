import Link from 'next/link';
import { Calendar, ArrowLeft, Lock } from 'lucide-react';

export default function EventsPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--muted)', textDecoration: 'none', marginBottom: 40,
        }}>
          <ArrowLeft size={12} /> Back
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <Calendar size={22} color="var(--blue)" />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>Events</h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 48 }}>
          Members-only drives, meetups, and gatherings.
        </p>

        {/* Placeholder — will populate from DB */}
        <div style={{
          padding: '48px 32px', borderRadius: 16,
          background: 'var(--surface)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <Lock size={28} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>
            Events are visible to members only.
          </p>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 22px', borderRadius: 8,
            background: 'var(--blue)', color: '#0e0e0e',
            fontWeight: 600, fontSize: 13, textDecoration: 'none',
          }}>
            Sign in to view events
          </Link>
        </div>
      </div>
    </main>
  );
}
