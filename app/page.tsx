'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Lock, Calendar, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px',
        background: 'linear-gradient(to bottom, rgba(14,14,14,0.95), transparent)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/nsc-logo.jpg"
            alt="Newcastle Sunday Club"
            width={80}
            height={80}
            style={{ filter: 'invert(1)', objectFit: 'contain' }}
            priority
          />
        </div>
        <Link href="/login" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 18px', borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--text)', fontSize: 13, fontWeight: 500,
          textDecoration: 'none', transition: 'border-color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <Lock size={12} />
          Member Login
        </Link>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(123,183,212,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 20,
          border: '1px solid var(--blue)',
          background: 'var(--blue-glow)',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
          color: 'var(--blue)', marginBottom: 32,
        }}>
          <MapPin size={10} /> Newcastle, CA
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 8vw, 72px)',
          fontWeight: 700, lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--text)',
          marginBottom: 24, maxWidth: 800,
        }}>
          Your vehicles.<br />
          <span style={{ color: 'var(--blue)' }}>Protected.</span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--muted)', lineHeight: 1.6,
          maxWidth: 480, marginBottom: 48,
        }}>
          Private vehicle storage for the discerning collector. 
          Gated, climate-aware, self-serve access — for members only.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/login" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 10,
            background: 'var(--blue)', color: '#0e0e0e',
            fontWeight: 700, fontSize: 15, textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}>
            Member Portal <ArrowRight size={16} />
          </Link>
          <Link href="/events" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)', fontWeight: 500, fontSize: 15,
            textDecoration: 'none',
          }}>
            <Calendar size={15} /> Events
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {[
            { icon: '🔐', title: 'Gated Access', desc: 'Self-serve entry 24/7. Your schedule, your rules.' },
            { icon: '🏎️', title: 'All Vehicles Welcome', desc: 'Motorcycles to supercars, boats to RVs. We\'ve seen it all.' },
            { icon: '📋', title: 'Member Portal', desc: 'Manage your vehicles, access history, and billing in one place.' },
            { icon: '🎉', title: 'Members Events', desc: 'Exclusive drives, meetups, and events for the community.' },
          ].map(f => (
            <div key={f.title} style={{
              padding: '28px 24px', borderRadius: 16,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Fiat hero divider */}
      <section style={{
        padding: '60px 24px', textAlign: 'center',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        margin: '0 0 80px',
      }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Membership by invitation only — Newcastle, California
        </p>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px', textAlign: 'center',
        borderTop: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>
          © {new Date().getFullYear()} Newcastle Sunday Club · Private
        </p>
      </footer>
    </main>
  );
}
