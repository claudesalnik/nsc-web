# Newcastle Sunday Club — Design System (NSC-2)

Fiat 500 heritage blues wrapped in a dark luxury motorsport shell. This system consolidates the visual language across palette, typography, spacing, and UI components so every screen feels intentional and premium.

---

## 1. Design Tokens

| Category | Token | Value | Notes |
| --- | --- | --- | --- |
| **Surfaces** | `--bg` | `#0e0e0e` | Deep charcoal background
|  | `--surface` | `#161616` | Primary panel
|  | `--surface2` | `#1e1e1e` | Elevated elements (cards)
|  | `--surface3` | `#1b1b1b` | Buttons, inputs
| **Borders** | `--border` | `#2a2a2a` | Default hairline
| **Accent Blues** | `--blue` | `#7bb7d4` | Fiat 500 inspired hero
|  | `--blue-dim` | `#4a8aaa` | Muted hover/outline
|  | `--blue-deep` | `#1d2f3a` | Dark gradient stop
|  | `--blue-glow` | `rgba(123,183,212,0.12)` | Ambient glow fill
| **Support** | `--amber` | `#f5c06d` | Contrast accent for metrics/pills
| **Typography Colors** | `--text` | `#f0ede8` | Primary copy
|  | `--muted` | `#7a7570` | Secondary copy
|  | `--subtle` | `#3a3530` | Dividers, subtle icons
| **Fonts** | `--font-sans` | Inter stack | Body/UI
|  | `--font-serif` | Playfair Display stack | Headlines
| **Radii** | `--radius-sm` | `8px` | Badges, chips
|  | `--radius-md` | `14px` | Inputs, secondary cards
|  | `--radius-lg` | `22px` | Feature cards
|  | `--radius-pill` | `999px` | Buttons, badges
| **Shadows** | `--shadow-soft` | `0 20px 35px rgba(0,0,0,0.45)` | Depth
|  | `--shadow-glow` | `0 0 35px rgba(123,183,212,0.25)` | Accent glow
| **Spacing Scale** | `--space-1` → `--space-7` | `0.25rem → 3rem` | See section 2
| **Motion** | `--duration-fast` | `120ms`
|  | `--duration-base` | `200ms`
|  | `--easing-soft` | `cubic-bezier(0.4, 0, 0.2, 1)`
| **Gradients** | `--grad-blue` | `linear-gradient(135deg, rgba(123,183,212,0.95) 0%, rgba(74,138,170,0.9) 40%, rgba(18,28,35,0.9) 100%)` |

---

## 2. Spacing Scale

| Token | Rem | Usage |
| --- | --- | --- |
| `--space-1` | 0.25 | Tight icon spacing, badge gaps
| `--space-2` | 0.5 | Button vertical padding, small gaps
| `--space-3` | 0.75 | Badge horizontal padding, chips
| `--space-4` | 1 | Section gutters on mobile
| `--space-5` | 1.5 | Card padding base
| `--space-6` | 2 | Section padding desktop, hero breathing room
| `--space-7` | 3 | Feature hero padding / stacked section spacing

---

## 3. Typography

### Font Stack Decision
- **Body/UI:** Inter (modern, legible, already shipped in the app)
- **Headlines:** Playfair Display (serif accent with high contrast to sell the luxury coachbuilt vibe)
- Implementation: Imported via Google Fonts in `globals.css` and exposed as `--font-sans` & `--font-serif` tokens so components can swap families via CSS vars without Tailwind utilities.

### Scale & Utilities
| Utility Class | Description | Specs |
| --- | --- | --- |
| `.nsc-eyebrow` | Track/section labels | Inter, 0.8rem, 0.2em tracking, uppercase, muted tone |
| `.nsc-heading.nsc-heading--xl` | Hero headlines | Playfair, clamp(2.5rem–3.75rem), 1.1 line-height |
| `.nsc-heading.nsc-heading--lg` | Section headlines | Playfair, clamp(1.75rem–2.5rem), 1.2 line-height |
| `.nsc-subheading` | Supporting copy | Inter, 1rem, muted color, 60ch max |
| `.nsc-body` | Default body | Inter, 1rem, `--text` |
| `.nsc-body--muted` | Secondary body | Inter, 1rem, `--muted` |

Guidelines:
- Pair `.nsc-eyebrow` + `.nsc-heading` + `.nsc-subheading` for a complete hero stack.
- Keep serif usage to display sizes only; avoid long-form body copy in Playfair for readability.

---

## 4. Component Patterns & Utilities

### Cards (`.nsc-card`)
- Surface: `--surface2`
- Border: `1px solid --border` with hover lift/glow
- Variants: `.nsc-card--ghost` (transparent, subtle border), `.nsc-card--tight` (compact padding)
- Use for feature blocks, stat callouts, image frames.

### Badges (`.nsc-badge`)
- Pill silhouette with uppercase microcopy
- Variants: default solid, `.nsc-badge--outline`, `.nsc-badge--glow`
- Colors tied to blue glow or neutral outlines; use for status tags, filters, car spec chips.

### Buttons (`.nsc-btn`)
- Base style uppercase, pill radius, letter spacing for motorsport tech feel.
- Variants mapped in `Button.tsx`:
  - `primary`: gradient blue, glow shadow, used for CTAs
  - `secondary`: subtle surface panel with understated border
  - `ghost`: transparent for inline actions over dark backgrounds
- `.nsc-btn--full` provides responsive full-width behavior.

### Logo Wrapper (`.nsc-logo`)
- Keeps NSC badge padded on dark surface with inset border + drop shadow.
- `.nsc-logo__image` ensures the white-on-dark asset gets a soft shadow lift.

---

## 5. React Base Components (`components/ui`)

| Component | Purpose | Notes |
| --- | --- | --- |
| `Button` | CTA + actions | Variants: `primary`, `secondary`, `ghost`; optional `fullWidth` prop |
| `Card` | Layout container | Variants: `default`, `ghost`, `tight` |
| `Badge` | Status/tag | Variants: `solid`, `outline`, `glow` |
| `Logo` | Brand lockup | Sizes: `sm`, `md`, `lg`; wraps `/public/nsc-logo.jpg` in `.nsc-logo` frame |

All components lean on the global utility classes instead of Tailwind helpers to keep styling centralized in CSS variables.

---

## 6. Brand Guidelines

1. **Palette Balance** — keep bright blue touches to 15–20% of any composition. Surfaces stay near-black, with warm grays for body copy.
2. **Lighting** — combine `--shadow-soft` + `--shadow-glow` only on hero cards and CTA buttons to preserve hierarchy.
3. **Motion** — limit transitions to transform/box-shadow/opacity using `--duration-base`; avoid long ease-outs to keep interactions snappy like a shift paddle click.
4. **Imagery** — whenever the NSC logo is used, wrap it in the `Logo` component or `.nsc-logo` utility to maintain padding, border, and drop shadow consistency.
5. **Typography Discipline** — Inter for anything under 24px; Playfair reserved for `.nsc-heading` utilities.
6. **Layout Rhythm** — sections should breathe with multiples of `--space-6`. Stack cards with `--space-4` gutters; never butt components directly against the viewport edges.

This design system is the single source of truth. Any new component should draw from these tokens/utilities first before adding bespoke styles.
