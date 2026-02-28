import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DesignSystemShowcase } from '@/components/ui/DesignSystemShowcase';

const heroStats = [
  { label: 'Color Tokens', value: '24', meta: 'Surfaces, accents, semantic states' },
  { label: 'Typography Styles', value: '10', meta: 'Display → helper text' },
  { label: 'Core Components', value: '6', meta: 'Buttons, cards, badges, forms' },
];

const guardrails = [
  'Blue glow reserved for CTAs + hero cards',
  'Serif only on headings ≥ 24px',
  'Use Surface 3 for interactive controls',
  'Spacing locked to --space scale (no 13px margins)',
];

export default function DesignSystemPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="nsc-section border-b border-[rgba(var(--border-rgb),0.6)] pt-24" id="overview">
        <div className="nsc-max-width grid gap-10 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Badge variant="glow">NSC-2</Badge>
            <div className="space-y-4">
              <p className="nsc-eyebrow">Design System</p>
              <h1 className="nsc-heading nsc-heading--display">Fiat blue over carbon velvet.</h1>
              <p className="nsc-lede">
                The Newcastle Sunday Club system keeps every surface disciplined: deep charcoal shells, Fiat 500
                light-blue accents, premium typography, and motorsport-grade interactions. This page is the visual
                spec — tokens, typography, components, and states — so product, design, and engineering stay synced.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="nsc-stat">
                  <p className="nsc-stat__label">{stat.label}</p>
                  <p className="nsc-stat__value">{stat.value}</p>
                  <p className="nsc-stat__meta">{stat.meta}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="space-y-4">
            <p className="nsc-eyebrow">Guardrails</p>
            <ul className="space-y-3">
              {guardrails.map((rule) => (
                <li key={rule} className="flex gap-3 text-sm">
                  <span className="text-[var(--blue)]">•</span>
                  <span className="nsc-body">{rule}</span>
                </li>
              ))}
            </ul>
            <div className="nsc-divider" />
            <div className="space-y-2">
              <p className="text-sm font-semibold">Usage</p>
              <p className="nsc-body--sm">
                Reference this page when building new flows. Copy tokens directly into Tailwind via the `nsc` theme
                namespace or apply utilities like `.nsc-input`, `.nsc-btn`, and `.nsc-card`.
              </p>
            </div>
          </Card>
        </div>
      </section>

      <DesignSystemShowcase />
    </main>
  );
}
