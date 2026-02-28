export const dynamic = 'force-dynamic';
'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ArrowRight, Calendar, GaugeCircle, KeyRound, Lock, Shield, Sparkles, TimerReset } from 'lucide-react';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { Logo } from '@/components/ui/Logo';

const features = [
  {
    icon: '🔐',
    title: 'Private Access',
    description: 'Self-directed entry with biometric verification and live monitoring.',
  },
  {
    icon: '🏎️',
    title: 'Motorsport Ready',
    description: 'Curated bays for classics, homologation specials, and track toys alike.',
  },
  {
    icon: '🧊',
    title: 'Climate Intelligence',
    description: 'Adaptive airflow and storage profiles tuned per vehicle and season.',
  },
  {
    icon: '🎟️',
    title: 'Member Calendar',
    description: 'Guided drives, pit-lane briefings, and late-night wrench sessions.',
  },
];

const membershipPillars = [
  {
    title: 'Discreet by Design',
    copy: 'No public address, no signage — access unlocks only after your dossier is cleared.',
  },
  {
    title: 'Concierge Guardianship',
    copy: 'Fluids, battery tenders, tyre health, and detailing cadence tracked per VIN.',
  },
  {
    title: 'Culture of Sundays',
    copy: 'Drives launch at dawn, espresso bar at 0500, playlists tuned to the rev range.',
  },
];

const telemetryStats = [
  { label: 'Entry latency', value: '< 8s', detail: 'biometric ping → bay unlock' },
  { label: 'Thermal drift', value: '±1.5°F', detail: 'across adaptive pressure zones' },
  { label: 'Camera coverage', value: '360°', detail: 'encrypted feeds, member playback' },
];

const atelierNotes = [
  {
    title: 'Bay Atmospheres',
    body: 'Silica matte floors, anti-static airflow, and programmable cues to wake the cabin softly.',
  },
  {
    title: 'Motorsport Stitching',
    body: 'Grid stripes, FIA-inspired numbering, Fiat 500 blue accents guiding each bay.',
  },
  {
    title: 'Quiet Tech Stack',
    body: 'Telemetry dashboards live on your phone while the hardware disappears into the architecture.',
  },
];

const experienceSteps = [
  {
    title: 'Request the Invitation',
    copy: 'Share your garage story and what you want Sunday mornings to feel like.',
    icon: KeyRound,
  },
  {
    title: 'Curation Call',
    copy: 'We design a bespoke storage and access profile for every vehicle.',
    icon: Sparkles,
  },
  {
    title: 'Seamless Arrival',
    copy: 'Concierge onboarding, Fiat 500 shuttle vibes, and your bay lit on cue.',
    icon: GaugeCircle,
  },
  {
    title: 'Live the Ritual',
    copy: 'Drop in pre-dawn, plan drives, or host fellow members after hours.',
    icon: Shield,
  },
];

const testimonials = [
  {
    quote:
      'Feels like a design house masquerading as a garage. The Fiat 500 pulls up, espresso hits, and you forget the outside world.',
    author: 'Mara V. · Carrera GT + Alpine A110',
  },
  {
    quote:
      'Every sensor ping, every lighting cue, every playlist feels choreographed. NSC turned storage into a ritual.',
    author: 'Julian R. · 512 BBi + Ducati SP',
  },
  {
    quote:
      'It is the only place I trust with my homologation cars. Zero flex, just calm obsession with the details.',
    author: 'Elliot S. · Lancia 037 + Singer DLS',
  },
];

const heroStats = ['24/7 biometric entry', 'Concierge-grade monitoring', 'Climate-aware storage science'];

export default function Home() {
  const { data: session } = useSession();
  const isAuthed = Boolean(session?.user);

  return (
    <main className="relative min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--bg-rgb),0.85)] px-6 py-5 backdrop-blur-xl md:px-12">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Logo size="sm" />

          {isAuthed ? (
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
              <span className="hidden text-[var(--text)] sm:inline-flex">{session?.user?.email}</span>
              <SignOutButton />
            </div>
          ) : (
            <Link
              href="/login"
              className="nsc-btn nsc-btn--ghost border border-[rgba(var(--border-rgb),0.6)] px-4 py-2 text-xs"
            >
              <Lock size={14} /> Member Login
            </Link>
          )}
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pb-24 pt-36 text-center md:px-12">
        <div className="hero-aurora" aria-hidden />
        <div className="hero-particles" aria-hidden />

        <div className="nsc-badge nsc-badge--glow mb-6 flex items-center gap-2 text-[10px]">
          <Shield size={10} /> Invite Only · Unlisted Coordinates
        </div>

        <p className="tracking-[0.65em] text-xs uppercase text-[var(--muted)]">Newcastle Sunday Club</p>

        <h1 className="nsc-heading nsc-heading--xl text-balance">
          Vehicle storage, staged like a midnight grid walk.
          <span className="block text-[var(--blue)]">Fiat 500 cadence. Motorsport poise.</span>
        </h1>

        <p className="nsc-subheading mx-auto mt-6 text-center">
          A private ritual for collectors who obsess over tire warmers, espresso crema, and the way a V12 echoes off concrete. Every
          bay is choreographed before dawn — lights, climate, soundtrack — so your arrival feels inevitable.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="mailto:invitations@nsc.cars?subject=Request%20Invitation" className="nsc-btn nsc-btn--primary">
            Request Invitation
            <ArrowRight size={16} />
          </Link>
          <Link href="/events" className="nsc-btn nsc-btn--secondary">
            <Calendar size={16} /> Members Events
          </Link>
        </div>

        <div className="mt-12 grid w-full max-w-3xl gap-6 text-left text-xs sm:grid-cols-3">
          {heroStats.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface2-rgb),0.6)] px-4 py-3 text-center text-[var(--muted)]"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="nsc-section">
        <div className="nsc-max-width grid grid-cols-1 gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="nsc-card">
              <div className="text-3xl">{feature.icon}</div>
              <h3 className="mt-4 text-xl font-semibold text-[var(--text)]">{feature.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="nsc-section">
        <div className="nsc-max-width grid grid-cols-1 gap-6 md:grid-cols-3">
          {membershipPillars.map((pillar) => (
            <div key={pillar.title} className="nsc-card nsc-card--ghost">
              <p className="nsc-eyebrow text-[0.7rem]">{pillar.title}</p>
              <p className="mt-3 text-sm text-[var(--muted)]">{pillar.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[rgba(var(--surface2-rgb),0.4)]">
        <div className="nsc-section">
          <div className="nsc-max-width">
            <p className="nsc-eyebrow">The Experience</p>
            <h2 className="nsc-heading nsc-heading--lg mt-3">Designed as a ritual, not a transaction.</h2>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              {experienceSteps.map(({ title, copy, icon: Icon }, index) => (
                <div key={title} className="nsc-card nsc-card--ghost">
                  <div className="mb-4 flex items-center gap-3 text-[var(--blue)]">
                    <span className="text-xs font-semibold uppercase tracking-[0.4em]">{String(index + 1).padStart(2, '0')}</span>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text)]">{title}</h3>
                  <p className="mt-3 text-sm text-[var(--muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="nsc-section">
        <div className="nsc-max-width grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="nsc-card">
            <div className="flex items-center gap-3 text-[var(--blue)]">
              <TimerReset size={16} />
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">Telemetry Snapshot</p>
            </div>
            <h3 className="nsc-heading nsc-heading--md mt-4">Every vehicle has a living dossier.</h3>
            <p className="nsc-subheading mt-4">
              We log fluids, torque specs, tire pressures, and climate preferences. Subtle alerts land in your inbox if anything drifts, ensuring
              you arrive to a car that already feels warm.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {telemetryStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface3-rgb),0.65)] px-4 py-4 text-left"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--text)]">{stat.value}</p>
                  <p className="text-xs text-[var(--muted)]">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="nsc-card nsc-card--ghost">
            <p className="nsc-eyebrow">Atelier Notes</p>
            <div className="mt-6 space-y-6">
              {atelierNotes.map((note) => (
                <div key={note.title}>
                  <h4 className="text-sm font-semibold tracking-[0.2em] text-[var(--text)] uppercase">{note.title}</h4>
                  <p className="mt-2 text-sm text-[var(--muted)]">{note.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="nsc-section">
        <div className="nsc-max-width text-center">
          <p className="nsc-eyebrow">Member Testimonials</p>
          <h2 className="nsc-heading nsc-heading--lg mt-3">Whispers from the pit lane.</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.author} className="nsc-card nsc-card--tight text-left">
                <p className="flex-1 text-sm text-[var(--muted)]">“{testimonial.quote}”</p>
                <span className="mt-6 block text-xs font-medium uppercase tracking-[0.3em] text-[var(--text)]">
                  {testimonial.author}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nsc-section">
        <div className="nsc-max-width">
          <div className="nsc-card text-center">
            <p className="nsc-eyebrow">Invite-Only Club</p>
            <h2 className="nsc-heading nsc-heading--lg mt-3">Ready when your next obsession arrives.</h2>
            <p className="nsc-subheading mx-auto mt-4">
              We limit active bays to keep the experience intimate. Share your collection details to enter the consideration list—our team responds within 24 hours.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="mailto:invitations@nsc.cars?subject=Request%20Invitation" className="nsc-btn nsc-btn--primary">
                Request Invitation
                <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="nsc-btn nsc-btn--secondary">
                Existing Member?
                <Lock size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-8 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Newcastle Sunday Club · Private
      </footer>
    </main>
  );
}
