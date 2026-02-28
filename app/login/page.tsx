import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <main style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Back */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: 'var(--muted)', textDecoration: 'none',
          marginBottom: 40,
        }}>
          <ArrowLeft size={12} /> Back
        </Link>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Image
            src="/nsc-logo.jpg"
            alt="Newcastle Sunday Club"
            width={120}
            height={120}
            style={{ filter: 'invert(1)', objectFit: 'contain', margin: '0 auto 16px', display: 'block' }}
            priority
          />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Member Login
          </h1>
        </div>

        {/* Form */}
        <form style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '12px 14px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text)', fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={{
                width: '100%', padding: '12px 14px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 8, color: 'var(--text)', fontSize: 14,
                outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%', padding: '13px',
              background: 'var(--blue)', color: '#0e0e0e',
              border: 'none', borderRadius: 8,
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              marginTop: 4,
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--muted)' }}>
          Access is by invitation only.
        </p>
      </div>
    </main>
  );
}
