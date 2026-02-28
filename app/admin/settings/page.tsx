export default function AdminSettingsPlaceholder() {
  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
        Controls
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Settings</h1>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface2)' }}>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Billing contacts, access tiers, and automation hooks will live here. Placeholder content keeps navigation functional in the meantime.
        </p>
      </div>
    </div>
  );
}
