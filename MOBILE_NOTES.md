# Mobile Optimization Notes

## Goals & Palette
- Optimized for outdoor, on-site usage (bright sun, gloves, limited attention).
- Dark luxury base (`#0e0e0e`) with the Fiat 500-inspired light blue (`var(--blue)`) reserved for focus / actions.
- Minimum hit target of 48px enforced via `--mobile-hit-target` + `.tappable-area` utility.

## Breakpoints
- `lg (1024px)` is the turning point between mobile shell + bottom nav and desktop shell.
- `ResponsiveLayout` uses a `matchMedia('(max-width: 1023px)')` listener to switch shells client-side without hydration flicker.
- Supporting utilities in `app/mobile.css` hide `.desktop-only` at `<=768px` for denser pages.

## Layout System
- `ResponsiveLayout` pairs a dedicated mobile stack (safe-area aware padding, sticky bottom nav) with a desktop flex shell + optional sidebar/header slots.
- `MobileNav` hugs the safe area (`env(safe-area-inset-bottom)`) and exposes the four primary flows: Home → Vehicles → Access → Profile.
- `mobile-card` / `mobile-touch-card` classes provide consistent rounded geometry, border contrast, and motion tuning.

## Components
- `components/VehicleCard.tsx`: phone-first, high-contrast cards with big typography, vitals grid, status-aware glow, and dual CTA buttons. Props allow overrides for telemetry + actions.
- `components/AccessInfo.tsx`: glare-resistant access card with 4-digit code display, tap-to-copy feedback, Wi-Fi + contact tiles, and ordered instructions.

## Accessibility
- All tappable elements meet 48px touch targets.
- Keyboard focus rings reuse the Fiat blue for visibility on dark backgrounds.
- Semantics: status chips announce via text, instructions rendered as ordered list, copy feedback exposed through `aria-live`.
- Reduced motion users skip heavy transitions via `prefers-reduced-motion` in `mobile.css`.

## Safe Areas & Outdoor Handling
- `app/mobile.css` defines `--safe-area-*` variables used in `ResponsiveLayout` + `MobileNav` to avoid iOS home indicator overlap.
- Code / instruction cards rely on uppercase tracking + thick letter spacing for quick legibility at the gate.
- Contrast ratios > 7:1 for primary text on card backgrounds (checked against WCAG AA for dark mode).
