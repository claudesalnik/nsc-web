import Link from 'next/link';
import { Calendar, ArrowLeft, Lock } from 'lucide-react';

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] px-6 py-20 text-[var(--text)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
          <ArrowLeft size={12} /> Back
        </Link>

        <header className="space-y-2">
          <div className="flex items-center gap-3 text-[var(--blue)]">
            <Calendar size={24} />
            <p className="nsc-eyebrow m-0">Members-only</p>
          </div>
          <h1 className="nsc-heading nsc-heading--lg">Events</h1>
          <p className="nsc-subheading">Members-only drives, meetups, and gatherings.</p>
        </header>

        <div className="nsc-card text-center">
          <Lock size={28} className="mx-auto text-[var(--muted)]" />
          <p className="nsc-body--muted mt-4">Events are visible to members only.</p>
          <Link href="/login" className="nsc-btn nsc-btn--primary mt-6 inline-flex items-center gap-2 text-sm">
            Sign in to view events
          </Link>
        </div>
      </div>
    </main>
  );
}
