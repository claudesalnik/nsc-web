"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Check, Copy, KeyRound, MapPin, Phone, Shield, X } from "lucide-react";
import clsx from "clsx";

export type MobileGateQuickViewProps = {
  gateName: string;
  primaryCode: string;
  secondaryCode?: string;
  spotLabel?: string;
  rowLabel?: string;
  validUntil?: string;
  lastRefreshed?: string;
  conciergeHref: string;
};

export const MobileGateQuickView = ({
  gateName,
  primaryCode,
  secondaryCode,
  spotLabel,
  rowLabel,
  validUntil,
  lastRefreshed,
  conciergeHref,
}: MobileGateQuickViewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(primaryCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      setCopiedCode(false);
    }
  }, [primaryCode]);

  const close = () => setIsOpen(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="tappable-area flex w-full items-center justify-between rounded-3xl border border-[rgba(var(--border-rgb),0.4)] bg-[rgba(var(--surface3-rgb),0.8)] px-4 py-3 text-left text-sm text-[rgba(var(--text-rgb),0.85)] shadow-[0_15px_40px_rgba(0,0,0,0.35)]"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="mobile-gate-quick-view"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface2-rgb),0.85)] text-[var(--text)]">
            <KeyRound className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.45em] text-[rgba(var(--text-rgb),0.6)]">Gate quick view</p>
            <p className="text-base font-semibold text-[var(--text)]">Spot {spotLabel ?? "—"}</p>
          </div>
        </div>
        <p className="text-right text-xs text-[rgba(var(--text-rgb),0.6)]">Tap for code</p>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-[rgba(5,10,18,0.72)] backdrop-blur-sm"
            aria-hidden="true"
            onClick={close}
          />
          <section
            id="mobile-gate-quick-view"
            role="dialog"
            aria-modal="true"
            aria-label="Gate quick view"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--bg-rgb),0.97)] px-5 pb-6 pt-4 shadow-[0_-30px_80px_rgba(0,0,0,0.6)]"
            style={{ paddingBottom: `calc(1.25rem + var(--safe-area-bottom))` }}
          >
            <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-[rgba(var(--text-rgb),0.35)]" aria-hidden="true" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">{gateName}</p>
                <p className="mt-2 text-3xl font-semibold tracking-[0.35em] text-[var(--text)]">{primaryCode}</p>
                {validUntil && <p className="text-sm text-[rgba(var(--text-rgb),0.6)]">Valid {validUntil}</p>}
                {lastRefreshed && <p className="text-xs text-[rgba(var(--text-rgb),0.5)]">Updated {lastRefreshed}</p>}
              </div>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(var(--border-rgb),0.4)] text-[rgba(var(--text-rgb),0.7)]"
                aria-label="Close quick view"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 space-y-3 text-sm text-[rgba(var(--text-rgb),0.75)]">
              <div className="flex items-center gap-3 rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.75)] px-4 py-3">
                <Shield className="h-4 w-4 text-[var(--blue)]" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Spot</p>
                  <p className="font-semibold text-[var(--text)]">{spotLabel ?? "Assigned on arrival"}</p>
                  {rowLabel && <p className="text-[0.8rem] text-[rgba(var(--text-rgb),0.6)]">{rowLabel}</p>}
                </div>
              </div>

              {secondaryCode && (
                <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.7)] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.55)]">Secondary / valet</p>
                  <p className="mt-1 text-base font-semibold tracking-[0.35em]">{secondaryCode}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={clsx(
                    "tappable-area inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em]",
                    copiedCode
                      ? "border-[rgba(var(--blue-rgb),0.4)] bg-[rgba(var(--blue-rgb),0.15)] text-[var(--text)]"
                      : "border-[rgba(var(--border-rgb),0.45)] text-[var(--text)]"
                  )}
                >
                  {copiedCode ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  {copiedCode ? "Copied" : "Copy code"}
                </button>
                <Link
                  href="/portal/access"
                  onClick={close}
                  className="tappable-area inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(var(--blue-rgb),0.4)] bg-[rgba(var(--blue-rgb),0.15)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-[var(--text)]"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Full view
                </Link>
              </div>

              <a
                href={conciergeHref}
                className="tappable-area inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(var(--border-rgb),0.4)] px-4 py-3 text-sm font-semibold text-[var(--text)]"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call concierge
              </a>
            </div>

            <div className="sr-only" aria-live="assertive">
              {copiedCode ? "Primary code copied" : "Copy code ready"}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
