"use client";

import { useCallback, useState } from "react";
import clsx from "clsx";
import { Copy, Check, Phone, Shield, Waves, Wifi } from "lucide-react";

type Contact = {
  label: string;
  value: string;
  href?: string;
};

export type AccessInfoProps = {
  gateName: string;
  code: string;
  validUntil?: string;
  lastRefreshed?: string;
  secondaryCode?: string;
  wifi?: { ssid: string; password: string };
  humidity?: string;
  instructions?: string[];
  contacts?: Contact[];
  notes?: string;
  className?: string;
};

export const AccessInfo = ({
  gateName,
  code,
  validUntil,
  lastRefreshed,
  secondaryCode,
  wifi,
  humidity,
  instructions = [],
  contacts = [],
  notes,
  className,
}: AccessInfoProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        setCopied(false);
      }
    },
    []
  );

  return (
    <section
      className={clsx(
        "mobile-card relative overflow-hidden border-[rgba(var(--border-rgb),0.65)] bg-[rgba(5,10,18,0.95)] text-[var(--text)]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(149,191,214,0.25),transparent_60%)] opacity-80" aria-hidden="true" />
      <div className="relative flex flex-col gap-5">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">Gate Access</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">{gateName}</h2>
            {validUntil && <p className="text-sm text-[rgba(var(--text-rgb),0.65)]">Valid through {validUntil}</p>}
          </div>
          <span className="mobile-chip border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.65)] text-xs text-[rgba(var(--text-rgb),0.7)]">
            <Shield className="mr-1 h-4 w-4 text-[var(--blue)]" aria-hidden="true" />
            Encrypted
          </span>
        </header>

        <div className="rounded-3xl border border-[rgba(var(--blue-rgb),0.4)] bg-[rgba(var(--blue-rgb),0.12)] p-5 text-center">
          <p className="text-xs uppercase tracking-[0.8em] text-[rgba(var(--text-rgb),0.6)]">Primary code</p>
          <p className="nsc-code-display mt-3">{code}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-[rgba(var(--text-rgb),0.6)]">
            {lastRefreshed && <span>Updated {lastRefreshed}</span>}
            {humidity && (
              <span className="inline-flex items-center gap-1">
                <Waves className="h-3.5 w-3.5" aria-hidden="true" />
                {humidity}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleCopy(code)}
            className="tappable-area mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(var(--blue-rgb),0.55)] bg-[rgba(var(--blue-rgb),0.2)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-[var(--text)] sm:min-w-[220px]"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" aria-hidden="true" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" aria-hidden="true" /> Tap to copy
              </>
            )}
          </button>
        </div>

        {secondaryCode && (
          <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.6)] px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.5)]">Secondary / valet</p>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-xl font-semibold tracking-[0.4em]">{secondaryCode}</span>
              <button
                type="button"
                onClick={() => handleCopy(secondaryCode)}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.4em] text-[var(--blue)]"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {(wifi || contacts.length > 0) && (
          <div className="mobile-grid-2 text-sm">
            {wifi && (
              <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.65)] p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.5)]">
                  <Wifi className="h-4 w-4 text-[var(--blue)]" aria-hidden="true" /> Wi-Fi
                </div>
                <p className="mt-2 text-base font-semibold">{wifi.ssid}</p>
                <p className="text-xs text-[rgba(var(--text-rgb),0.65)]">Pass: {wifi.password}</p>
              </div>
            )}
            {contacts.length > 0 && (
              <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.65)] p-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.5)]">
                  <Phone className="h-4 w-4 text-[var(--blue)]" aria-hidden="true" /> Contacts
                </div>
                <ul className="mt-2 space-y-1.5">
                  {contacts.map((contact) => (
                    <li key={`${contact.label}-${contact.value}`}>
                      <a
                        href={contact.href ?? `tel:${contact.value}`}
                        className="flex items-center justify-between gap-3 text-sm text-[var(--text)]"
                      >
                        <span>{contact.label}</span>
                        <span className="text-[rgba(var(--text-rgb),0.7)]">{contact.value}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {instructions.length > 0 && (
          <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.55)] p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.5)]">On-site steps</p>
            <ol className="mt-3 space-y-3 text-sm text-[rgba(var(--text-rgb),0.85)]">
              {instructions.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(var(--border-rgb),0.4)] text-xs font-semibold text-[rgba(var(--text-rgb),0.8)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {notes && (
          <div className="rounded-2xl border border-dashed border-[rgba(var(--border-rgb),0.5)] bg-[rgba(var(--surface3-rgb),0.45)] px-4 py-3 text-sm text-[rgba(var(--text-rgb),0.75)]">
            {notes}
          </div>
        )}
      </div>
      <div className="sr-only" aria-live="polite">
        {copied ? "Code copied" : "Copy button ready"}
      </div>
    </section>
  );
};
