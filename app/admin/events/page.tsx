export default function AdminEventsPlaceholder() {
  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 12, letterSpacing: '0.18em', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
        Programming
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>Events management</h1>
      <div style={{ padding: 24, borderRadius: 16, border: '1px solid var(--border)', background: 'var(--surface2)' }}>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
          Admin tooling for events, RSVP tracking, and run sheets is coming next. For now, coordinate via the shared Notion doc.
        </p>
      </div>
    </div>
  );
}
