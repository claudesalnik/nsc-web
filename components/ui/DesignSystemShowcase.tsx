import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import { Logo } from './Logo';

const paletteGroups = [
  {
    title: 'Surfaces & Depth',
    description: 'Base layers that stage cars, photography, and UI chrome.',
    tokens: [
      { label: 'Background', token: '--bg', hex: '#0e0e0e' },
      { label: 'Surface', token: '--surface', hex: '#161616' },
      { label: 'Surface 2', token: '--surface2', hex: '#1e1e1e' },
      { label: 'Surface 3', token: '--surface3', hex: '#1b1b1b' },
      { label: 'Border', token: '--border', hex: '#2a2a2a' },
    ],
  },
  {
    title: 'Accent & Signals',
    description: 'Fiat 500 blue as the hero accent plus semantic states.',
    tokens: [
      { label: 'Blue', token: '--blue', hex: '#7bb7d4' },
      { label: 'Blue Dim', token: '--blue-dim', hex: '#4a8aaa' },
      { label: 'Amber', token: '--amber', hex: '#f5c06d' },
      { label: 'Success', token: '--success', hex: '#4ecba2' },
      { label: 'Warning', token: '--warning', hex: '#f5d084' },
      { label: 'Danger', token: '--danger', hex: '#f26d6d' },
    ],
  },
  {
    title: 'Typography & Ink',
    description: 'Copy colors that keep legibility over charcoal surfaces.',
    tokens: [
      { label: 'Text', token: '--text', hex: '#f0ede8', foreground: true },
      { label: 'Muted', token: '--muted', hex: '#7a7570', foreground: true },
      { label: 'Subtle', token: '--subtle', hex: '#3a3530', foreground: true },
      { label: 'Blue Glow', token: '--blue-glow', hex: 'rgba(123,183,212,0.12)' },
    ],
  },
];

const typographyScale = [
  {
    label: 'Display',
    className: 'nsc-heading nsc-heading--display',
    note: 'Hero headlines',
    copy: 'Newcastle Sunday Club',
  },
  {
    label: 'Heading XL',
    className: 'nsc-heading nsc-heading--xl',
    note: 'Page titles',
    copy: 'Coachbuilt vaults for modern drivers.',
  },
  {
    label: 'Heading LG',
    className: 'nsc-heading nsc-heading--lg',
    note: 'Section anchors',
    copy: 'Membership benefits & rituals.',
  },
  {
    label: 'Heading MD',
    className: 'nsc-heading nsc-heading--md',
    note: 'Card headers',
    copy: 'Dedicated detail crew',
  },
  {
    label: 'Heading SM',
    className: 'nsc-heading nsc-heading--sm',
    note: 'UI micro heads',
    copy: 'Itinerary',
  },
  {
    label: 'Eyebrow',
    className: 'nsc-eyebrow',
    note: 'Label / Pill',
    copy: 'Track Arrival',
  },
  {
    label: 'Lede',
    className: 'nsc-lede',
    note: 'Hero supporting copy',
    copy: 'Members-only storage with concierge logistics, telemetry, and motorsport-grade amenities.',
  },
  {
    label: 'Body',
    className: 'nsc-body',
    note: 'Paragraphs',
    copy: 'Inter 16 / 24 — default body for app flows and descriptions.',
  },
  {
    label: 'Body Small',
    className: 'nsc-body nsc-body--sm',
    note: 'Meta info',
    copy: 'Use for helper text, secondary timestamps, and disclaimers.',
  },
  {
    label: 'Muted',
    className: 'nsc-body nsc-body--muted',
    note: 'Inactive state',
    copy: 'Pairs with ghost buttons and low-emphasis text.',
  },
];

const spacingScale = [
  { token: '--space-1', value: '0.25rem', use: 'Icon gaps, badge spacing' },
  { token: '--space-2', value: '0.5rem', use: 'Button padding (vertical)' },
  { token: '--space-3', value: '0.75rem', use: 'Chip padding, tight stacks' },
  { token: '--space-4', value: '1rem', use: 'Card gutters on mobile' },
  { token: '--space-5', value: '1.5rem', use: 'Default card padding' },
  { token: '--space-6', value: '2rem', use: 'Section padding desktop' },
  { token: '--space-7', value: '3rem', use: 'Hero / major section vertical rhythm' },
  { token: '--space-8', value: '4rem', use: 'Full-bleed hero breathing room' },
];

const buttonVariants = [
  { label: 'Primary CTA', variant: 'primary' as const },
  { label: 'Secondary', variant: 'secondary' as const },
  { label: 'Ghost', variant: 'ghost' as const },
];

const buttonStates = [
  { label: 'Hover (Primary)', variant: 'primary' as const, state: 'hover' },
  { label: 'Active (Secondary)', variant: 'secondary' as const, state: 'active' },
  { label: 'Disabled (Primary)', variant: 'primary' as const, state: 'disabled' },
  { label: 'Disabled (Ghost)', variant: 'ghost' as const, state: 'disabled' },
];

const statBlocks = [
  { label: 'Storage Bays', value: '148', meta: '+12 reserved for concours clients' },
  { label: 'Avg. Turn Time', value: '18m', meta: 'Request → valet staging' },
  { label: 'Battery Health', value: '98%', meta: 'Fleet trickle charge coverage' },
];

const formFields = [
  {
    label: 'Full Name',
    type: 'text',
    placeholder: 'Ayrton Senna',
    hint: 'Displayed on valet signage',
  },
  {
    label: 'Membership Tier',
    type: 'select',
    options: ['Founders', 'Heritage', 'Track', 'Waiting List'],
    hint: 'Impacts concierge priority + billing cadence',
  },
  {
    label: 'Vehicle Notes',
    type: 'textarea',
    placeholder: 'Detail schedule, fuel type, tire warmers, remote instructions…',
    hint: 'Max 280 characters — surfaces inside the vehicle dossier.',
  },
];

const radiiTokens = [
  { label: 'Radius — sm', token: '--radius-sm', value: '8px' },
  { label: 'Radius — md', token: '--radius-md', value: '14px' },
  { label: 'Radius — lg', token: '--radius-lg', value: '22px' },
  { label: 'Radius — pill', token: '--radius-pill', value: '999px' },
];

const motionTokens = [
  { label: 'Duration Fast', token: '--duration-fast', value: '120ms', use: 'Micro-interactions' },
  { label: 'Duration Base', token: '--duration-base', value: '200ms', use: 'Buttons, cards' },
  { label: 'Easing Soft', token: '--easing-soft', value: 'cubic-bezier(0.4, 0, 0.2, 1)', use: 'Universal easing' },
];

export function DesignSystemShowcase() {
  return (
    <section className="nsc-section" id="tokens">
      <div className="nsc-max-width space-y-16">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="nsc-eyebrow">Foundation</p>
            <span className="nsc-body--muted text-sm">
              All colors + spacing resolve to CSS variables in <code className="font-mono text-xs">globals.css</code>.
            </span>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {paletteGroups.map((group) => (
              <Card key={group.title} className="space-y-4">
                <div>
                  <p className="nsc-eyebrow">{group.title}</p>
                  <p className="nsc-body--sm">{group.description}</p>
                </div>
                <div className="space-y-3">
                  {group.tokens.map((token) => (
                    <div key={token.token} className="flex items-center gap-4">
                      <div
                        className="h-12 w-12 rounded-[14px] border border-[rgba(var(--border-rgb),0.35)]"
                        style={{
                          background: token.foreground ? 'rgba(var(--surface-rgb), 0.7)' : `var(${token.token})`,
                        }}
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--text)]">{token.label}</p>
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{token.token}</p>
                        <p className="text-xs text-[var(--muted)]">{token.hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2" id="typography">
          <Card className="space-y-6">
            <div>
              <p className="nsc-eyebrow">Typography scale</p>
              <p className="nsc-body--sm">Playfair for display, Inter for copy. Keep serif usage above 24px.</p>
            </div>
            <div className="space-y-4">
              {typographyScale.map((sample) => (
                <div key={sample.label}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted)]">{sample.label}</p>
                    <span className="nsc-body--sm">{sample.note}</span>
                  </div>
                  <p className={sample.className}>{sample.copy}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="space-y-6">
            <div>
              <p className="nsc-eyebrow">Spacing & motion</p>
              <p className="nsc-body--sm">Use even multiples of the space scale to keep rhythm consistent.</p>
            </div>
            <div className="space-y-4">
              {spacingScale.map((space) => (
                <div key={space.token} className="nsc-card nsc-card--tight bg-transparent p-0 shadow-none">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{space.token}</p>
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{space.value}</p>
                      <p className="nsc-body--sm">{space.use}</p>
                    </div>
                    <div
                      className="h-2 rounded-full bg-[rgba(var(--blue-rgb),0.35)]"
                      style={{ width: `calc(var(${space.token}) * 14)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {radiiTokens.map((radius) => (
                <div key={radius.token} className="rounded-[var(--radius-md)] border border-[rgba(var(--border-rgb),0.6)] p-4">
                  <p className="text-sm font-semibold">{radius.label}</p>
                  <p className="nsc-body--sm">{radius.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{radius.token}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {motionTokens.map((motion) => (
                <div key={motion.token} className="rounded-[var(--radius-md)] border border-[rgba(var(--border-rgb),0.6)] p-4">
                  <p className="text-sm font-semibold">{motion.label}</p>
                  <p className="nsc-body--sm">{motion.value}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">{motion.use}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2" id="components">
          <Card className="space-y-6">
            <div>
              <p className="nsc-eyebrow">Buttons & badges</p>
              <p className="nsc-body--sm">Uppercase, pill silhouettes, and glow reserved for CTAs.</p>
            </div>
            <div className="space-y-3">
              <span className="nsc-body--sm">Core variants</span>
              <div className="flex flex-wrap gap-3">
                {buttonVariants.map((button) => (
                  <div key={button.label} className="flex flex-col gap-2">
                    <Button variant={button.variant}>{button.label}</Button>
                    <p className="text-xs text-[var(--muted)] text-center">{button.variant}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <span className="nsc-body--sm">State reference</span>
              <div className="flex flex-wrap gap-3">
                {buttonStates.map((state) => (
                  <div key={state.label} className="flex flex-col gap-2">
                    <Button
                      variant={state.variant}
                      data-state={state.state}
                      disabled={state.state === 'disabled'}
                    >
                      {state.label}
                    </Button>
                    <p className="text-xs text-[var(--muted)] text-center">{state.state}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge>Default badge</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="glow">Glow</Badge>
            </div>
          </Card>

          <Card className="space-y-6">
            <div>
              <p className="nsc-eyebrow">Cards & brand</p>
              <p className="nsc-body--sm">Use cards for feature blocks, stats, and imagery.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="nsc-card--tight">
                <p className="nsc-eyebrow">Default</p>
                <p className="nsc-body">Surface 2 + hover glow. Ideal for hero modules.</p>
              </Card>
              <Card className="nsc-card--ghost">
                <p className="nsc-eyebrow">Ghost</p>
                <p className="nsc-body">Transparent shell to layer over photography.</p>
              </Card>
              <Card className="nsc-card--tight space-y-3">
                <p className="nsc-eyebrow">Stat block</p>
                <div className="nsc-stat">
                  <span className="nsc-stat__label">Humidity</span>
                  <span className="nsc-stat__value">48%</span>
                  <span className="nsc-stat__meta">Climate-controlled vault 02</span>
                </div>
              </Card>
              <Card className="nsc-card--tight flex items-center justify-center">
                <Logo size="md" />
              </Card>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2" id="forms">
          <Card className="space-y-6">
            <div>
              <p className="nsc-eyebrow">Form inputs</p>
              <p className="nsc-body--sm">Inputs live on Surface 3 with crisp borders + accent focus.</p>
            </div>
            <div className="space-y-5">
              {formFields.map((field) => (
                <div key={field.label} className="nsc-form-group">
                  <label className="nsc-input-label" htmlFor={field.label}>{field.label}</label>
                  {field.type === 'text' && (
                    <input id={field.label} className="nsc-input" placeholder={field.placeholder} />
                  )}
                  {field.type === 'select' && (
                    <select id={field.label} className="nsc-input">
                      {field.options?.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      id={field.label}
                      className="nsc-input"
                      rows={4}
                      placeholder={field.placeholder}
                    />
                  )}
                  <p className="nsc-input-hint">{field.hint}</p>
                </div>
              ))}
              <div className="nsc-form-group">
                <label className="nsc-input-label" htmlFor="vin-input">
                  VIN / Chassis ID
                </label>
                <input
                  id="vin-input"
                  className="nsc-input nsc-input--invalid"
                  placeholder="ZFF87CNAXG0214501"
                  aria-invalid="true"
                />
                <p className="nsc-input-hint text-[#f26d6d]">Needs 17 characters.</p>
              </div>
            </div>
          </Card>

          <Card className="space-y-6">
            <div>
              <p className="nsc-eyebrow">Toggles & telemetry</p>
              <p className="nsc-body--sm">Binary controls mimic paddle clicks — fast, decisive.</p>
            </div>
            <div className="space-y-4">
              {['on', 'off', 'disabled'].map((state) => (
                <div key={state} className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[rgba(var(--border-rgb),0.5)] p-4">
                  <button
                    type="button"
                    className="nsc-toggle"
                    data-state={state === 'off' ? undefined : state}
                    aria-pressed={state === 'on'}
                    disabled={state === 'disabled'}
                  >
                    <span className="nsc-toggle__thumb" />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text)]">
                      {state === 'on'
                        ? 'Climate cradle'
                        : state === 'off'
                          ? 'Valet staging'
                          : 'Auto-billing'}
                    </p>
                    <p className="nsc-body--sm">
                      {state === 'on'
                        ? 'Maintains battery + tire warmth.'
                        : state === 'off'
                          ? 'Queues the car without sending driver ETA.'
                          : 'Disabled when handled via finance team.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {statBlocks.map((stat) => (
                <div key={stat.label} className="nsc-stat">
                  <span className="nsc-stat__label">{stat.label}</span>
                  <span className="nsc-stat__value">{stat.value}</span>
                  <span className="nsc-stat__meta">{stat.meta}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
