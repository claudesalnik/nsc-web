// In-memory contact preference store (replaces with DB when Owner model gains contactPrefs column)

export type ContactChannelType = "sms" | "email" | "signal" | "phone";

export type ContactChannel = {
  id: string;
  type: ContactChannelType;
  label: string;
  value: string;
  verified: boolean;
  description?: string;
};

export type ContactPreferences = {
  preferredChannelId: string;
  lastUpdated: string;
  conciergeInstructions: string;
  channels: ContactChannel[];
};

export type ContactPreferenceUpdateInput = {
  preferredChannelId: string;
  channels: { id: string; value: string }[];
  conciergeInstructions?: string;
};

const DEFAULT_PREFS: ContactPreferences = {
  preferredChannelId: "sms-primary",
  lastUpdated: "2026-02-15T08:12:00.000Z",
  conciergeInstructions: "Text first, then call if no reply within 10 minutes.",
  channels: [
    {
      id: "sms-primary",
      type: "sms",
      label: "SMS",
      value: "+1 (530) 555-0091",
      verified: true,
      description: "Goes straight to your phone — fastest reply",
    },
    {
      id: "signal",
      type: "signal",
      label: "Signal",
      value: "+1 (530) 555-2234",
      verified: true,
      description: "Use for track days or when cell coverage is poor",
    },
    {
      id: "email-main",
      type: "email",
      label: "Email",
      value: "",
      verified: true,
      description: "Best for itineraries and confirmations",
    },
    {
      id: "phone-direct",
      type: "phone",
      label: "Direct line",
      value: "+1 (530) 555-2290",
      verified: false,
      description: "Rings garage office — backup only",
    },
  ],
};

const clone = <T>(v: T): T =>
  typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));

const store = new Map<string, ContactPreferences>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function seed(email: string) {
  const key = normalizeEmail(email);
  if (!store.has(key)) {
    store.set(key, clone(DEFAULT_PREFS));
  }
}

export function getContactPreferences(email: string): ContactPreferences {
  seed(email);
  return clone(store.get(normalizeEmail(email))!);
}

export async function updateContactPreferences(
  email: string,
  input: ContactPreferenceUpdateInput,
): Promise<ContactPreferences> {
  seed(email);
  const key = normalizeEmail(email);
  const existing = store.get(key)!;

  const nextChannels = existing.channels.map((ch) => {
    const patch = input.channels.find((c) => c.id === ch.id);
    return patch ? { ...ch, value: patch.value } : ch;
  });

  const updated: ContactPreferences = {
    preferredChannelId: input.preferredChannelId || existing.preferredChannelId,
    conciergeInstructions:
      input.conciergeInstructions?.trim() || existing.conciergeInstructions,
    channels: nextChannels,
    lastUpdated: new Date().toISOString(),
  };

  store.set(key, updated);
  return clone(updated);
}
