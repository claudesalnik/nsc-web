export const dynamic = 'force-dynamic';
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { ArrowLeft, Loader2, Mail, ShieldHalf, Unlock, Sparkles, Info } from 'lucide-react';

const ERROR_COPY: Record<string, string> = {
  INVALID_PASSWORD: 'Invalid email or password. Double-check the invite details.',
  NOT_INVITED: 'This email is not on the invite roster. Contact concierge@nsc.cars.',
  INVITE_PENDING: 'Your invite is pending activation. Concierge will notify you shortly.',
  MISSING_CREDENTIALS: 'We need both email and password to verify your membership.',
  CredentialsSignin: 'Invalid email or password. Double-check the invite details.',
  default: 'Unable to sign you in right now. Please retry or contact concierge.',
};

const SESSION_COPY: Record<string, string> = {
  expired: 'Your session quietly timed out. Sign in again to resume where you left off.',
};

const INVITE_HIGHLIGHTS = [
  'Membership is curated. There is no public application flow.',
  'Credentials are issued by the concierge team after storage approval.',
  'Each member receives personal access — sharing logins is disabled.',
];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/portal';
  const nextError = searchParams.get('error');
  const sessionStatus = searchParams.get('session');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inviteCopy = useMemo(() => INVITE_HIGHLIGHTS, []);
  const sessionNotice = sessionStatus ? SESSION_COPY[sessionStatus] ?? null : null;
  const displayedError = formError || (nextError ? ERROR_COPY[nextError] || ERROR_COPY.default : null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!email.trim() || !password.trim()) {
      setFormError(ERROR_COPY.MISSING_CREDENTIALS);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await signIn('credentials', {
        email: email.trim(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (response?.error) {
        setFormError(ERROR_COPY[response.error] || ERROR_COPY.default);
        setIsSubmitting(false);
        return;
      }

      router.push(callbackUrl);
    } catch (error) {
      console.error('Sign-in failed', error);
      setFormError(ERROR_COPY.default);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(161,227,255,0.15),_transparent_55%)]" />
        <div className="absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#5dd4ff]/10 blur-3xl" />
        <div className="absolute bottom-0 h-72 w-full bg-gradient-to-t from-[#010101] via-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.15fr,0.85fr]">
          <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
              <span className="inline-flex items-center gap-2">
                <Sparkles size={14} />
                Invite Only
              </span>
              <span>Since 2012</span>
            </div>

            <div className="mt-10 flex flex-col gap-6">
              <Image
                src="/nsc-logo.jpg"
                alt="Newcastle Sunday Club"
                width={120}
                height={120}
                className="h-20 w-20 object-contain invert"
                priority
              />

              <div>
                <p className="text-sm uppercase tracking-[0.5em] text-white/60">Member Portal</p>
                <h1 className="mt-3 text-3xl font-semibold">Newcastle Sunday Club</h1>
                <p className="mt-4 text-base text-white/70">
                  Storage, concierge, and private circuit access for people who care about the last 5% of detail. Access is granted once
                  we approve your vehicle residency plan.
                </p>
              </div>

              <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                  <Info size={14} />
                  Invite Policy
                </div>
                <ul className="space-y-3 text-sm text-white/75">
                  {inviteCopy.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-white/60" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 text-xs uppercase tracking-[0.3em] text-white/60 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-3xl font-semibold text-white">24/7</p>
                  <p className="mt-1 text-[0.6rem]">on-site security</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="text-3xl font-semibold text-white">04</p>
                  <p className="mt-1 text-[0.6rem]">private lounges</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4 rounded-[32px] border border-white/10 bg-black/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/60 transition hover:text-white"
            >
              <ArrowLeft size={12} /> Back to nsc.cars
            </Link>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.6em] text-white/60">Credentialed Access</p>
              <h2 className="text-2xl font-semibold">Member Sign In</h2>
              <p className="text-sm text-white/70">Use the password issued in your welcome packet. Magic links arrive later this spring.</p>
            </div>

            {sessionNotice ? (
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs text-white/80" aria-live="polite">
                {sessionNotice}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5" noValidate>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Email
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-4">
                  <Mail size={16} className="text-white/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                Password
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-4">
                  <Unlock size={16} className="text-white/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </label>

              {displayedError ? (
                <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-100" aria-live="assertive">
                  {displayedError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldHalf size={16} />}
                {isSubmitting ? 'Checking credentials…' : 'Sign In'}
              </button>
            </form>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs text-white/70">
              Access is issued manually. Email <a href="mailto:concierge@nsc.cars" className="font-semibold text-white">concierge@nsc.cars</a> or call your concierge for credential resets.
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
