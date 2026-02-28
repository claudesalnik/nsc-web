"use client";

import { useState, useTransition } from "react";
import { Check, MessageCircle, Mail, Phone, Zap, Pencil, X, Save } from "lucide-react";
import clsx from "clsx";

import type { ContactPreferences, ContactChannel, ContactChannelType } from "@/lib/profile/contact-preferences";
import { updateContactPreferencesAction } from "@/app/portal/profile/actions";

const CHANNEL_ICONS: Record<ContactChannelType, React.ElementType> = {
  sms: MessageCircle,
  signal: Zap,
  email: Mail,
  phone: Phone,
};

type Props = {
  prefs: ContactPreferences;
};

export function ContactPreferencesPanel({ prefs }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [localPrefs, setLocalPrefs] = useState<ContactPreferences>(prefs);
  const [dirty, setDirty] = useState<ContactPreferences>(prefs);
  const [saved, setSaved] = useState(false);

  function handlePreferredChange(id: string) {
    setDirty((prev) => ({ ...prev, preferredChannelId: id }));
  }

  function handleValueChange(id: string, value: string) {
    setDirty((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) => (ch.id === id ? { ...ch, value } : ch)),
    }));
  }

  function handleInstructionsChange(text: string) {
    setDirty((prev) => ({ ...prev, conciergeInstructions: text }));
  }

  function handleCancel() {
    setDirty(localPrefs);
    setEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const result = await updateContactPreferencesAction({
          preferredChannelId: dirty.preferredChannelId,
          channels: dirty.channels.map((ch) => ({ id: ch.id, value: ch.value })),
          conciergeInstructions: dirty.conciergeInstructions,
        });
        if (result.success) {
          setLocalPrefs(result.data);
          setDirty(result.data);
          setEditing(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }
      } catch {
        // Surface error in a future iteration
      }
    });
  }

  const display = editing ? dirty : localPrefs;
  const preferred = display.channels.find((ch) => ch.id === display.preferredChannelId);

  return (
    <section className="mobile-card space-y-5 border-[rgba(var(--border-rgb),0.55)] bg-[rgba(var(--surface2-rgb),0.95)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.5em] text-[rgba(var(--text-rgb),0.55)]">
            Contact channel
          </p>
          <h2 className="text-lg font-semibold text-[var(--text)]">
            How to reach you
          </h2>
          {preferred && !editing && (
            <p className="mt-1 text-sm text-[rgba(var(--text-rgb),0.65)]">
              Preferred:{" "}
              <span className="font-semibold text-[var(--blue)]">
                {preferred.label} · {preferred.value || "—"}
              </span>
            </p>
          )}
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="tappable-area inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--border-rgb),0.45)] bg-[rgba(var(--surface3-rgb),0.7)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[rgba(var(--text-rgb),0.8)] transition hover:border-[rgba(var(--blue-rgb),0.4)] hover:text-[var(--text)]"
          >
            {saved ? (
              <>
                <Check className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden="true" />
                Saved
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="tappable-area inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--border-rgb),0.45)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[rgba(var(--text-rgb),0.65)]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className="tappable-area inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--blue-rgb),0.5)] bg-[rgba(var(--blue-rgb),0.15)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--blue)] transition disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Channel list */}
      <ul className="space-y-3">
        {display.channels.map((ch) => {
          const Icon = CHANNEL_ICONS[ch.type] ?? Phone;
          const isPreferred = ch.id === display.preferredChannelId;
          return (
            <li
              key={ch.id}
              className={clsx(
                "rounded-2xl border p-4 transition",
                isPreferred
                  ? "border-[rgba(var(--blue-rgb),0.45)] bg-[rgba(var(--blue-rgb),0.08)]"
                  : "border-[rgba(var(--border-rgb),0.35)] bg-[rgba(var(--surface3-rgb),0.55)]",
              )}
            >
              <div className="flex items-start gap-3">
                {/* Preferred toggle (edit mode only) */}
                {editing ? (
                  <button
                    type="button"
                    onClick={() => handlePreferredChange(ch.id)}
                    aria-label={`Set ${ch.label} as preferred`}
                    className={clsx(
                      "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition",
                      isPreferred
                        ? "border-[var(--blue)] bg-[var(--blue)]"
                        : "border-[rgba(var(--border-rgb),0.6)]",
                    )}
                  >
                    {isPreferred && (
                      <span className="h-2 w-2 rounded-full bg-[#061019]" />
                    )}
                  </button>
                ) : (
                  <div
                    className={clsx(
                      "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
                      isPreferred
                        ? "border-[var(--blue)] bg-[var(--blue)]"
                        : "border-[rgba(var(--border-rgb),0.4)]",
                    )}
                  >
                    {isPreferred && (
                      <span className="h-2 w-2 rounded-full bg-[#061019]" />
                    )}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={clsx(
                        "h-4 w-4 flex-shrink-0",
                        isPreferred ? "text-[var(--blue)]" : "text-[rgba(var(--text-rgb),0.55)]",
                      )}
                      aria-hidden="true"
                    />
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[rgba(var(--text-rgb),0.65)]">
                      {ch.label}
                    </span>
                    {ch.verified && (
                      <span className="rounded-full border border-[rgba(var(--success-rgb),0.4)] bg-[rgba(var(--success-rgb),0.12)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[var(--success)]">
                        Verified
                      </span>
                    )}
                    {isPreferred && (
                      <span className="rounded-full border border-[rgba(var(--blue-rgb),0.4)] bg-[rgba(var(--blue-rgb),0.15)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[var(--blue)]">
                        Preferred
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <input
                      type="text"
                      value={ch.value}
                      onChange={(e) => handleValueChange(ch.id, e.target.value)}
                      placeholder="Enter value…"
                      className="nsc-input mt-2 text-sm"
                    />
                  ) : (
                    <p className="mt-1 text-base font-semibold text-[var(--text)]">
                      {ch.value || <span className="text-[rgba(var(--text-rgb),0.4)]">—</span>}
                    </p>
                  )}

                  {ch.description && (
                    <p className="mt-1 text-xs text-[rgba(var(--text-rgb),0.5)]">
                      {ch.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Concierge instructions */}
      <div className="rounded-2xl border border-[rgba(var(--border-rgb),0.3)] bg-[rgba(var(--surface3-rgb),0.45)] p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-[rgba(var(--text-rgb),0.5)]">
          Concierge note
        </p>
        {editing ? (
          <textarea
            value={display.conciergeInstructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            rows={2}
            className="nsc-input mt-2 resize-none text-sm"
          />
        ) : (
          <p className="mt-2 text-sm text-[rgba(var(--text-rgb),0.8)] italic">
            &ldquo;{display.conciergeInstructions}&rdquo;
          </p>
        )}
        {!editing && (
          <p className="mt-2 text-xs text-[rgba(var(--text-rgb),0.4)]">
            Updated{" "}
            {new Intl.DateTimeFormat("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(new Date(display.lastUpdated))}
          </p>
        )}
      </div>
    </section>
  );
}
