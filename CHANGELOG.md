# Rover Website UX/UI Refresh Changelog

## What was changed
- Shifted the shared theme from dark to a clean white/light foundation while preserving Rover’s orange accent and industrial-modern tone.
- Updated global design tokens in `styles/theme.css`:
  - White primary page background and light section/card surfaces.
  - Dark readable body text for scanability.
  - Light translucent header treatment and softer card shadows.
- Reworked the homepage hero visual in `index.html` to include an animated manufacturing operations graphic:
  - Live production lanes (Cutting, Assembly, QA, Pack/Ship).
  - Animated conveyor movement and in-flight part motion.
  - Live-style KPI strip for operational credibility.
- Preserved previous conversion and structure improvements (clearer value proposition, CTA hierarchy, role-aware messaging, mobile nav behavior) while adapting them to the new light visual direction.

## Why it was changed
- You requested a white background experience and animated application graphics showing manufacturing tasks.
- The light theme improves readability and makes information hierarchy easier to scan for buyers.
- The new hero animation provides an immediate, visual “operations in motion” story instead of a static mock.

## Pages most improved
- `index.html` (white/light hero, animated manufacturing operations visual, refined premium presentation).
- `styles/theme.css` (site-wide color system pivot to white background and readable contrast).

## Recommended next-step improvements
1. Add similar animated task visuals to ERP and industry landing pages for consistency.
2. Add a reduced-motion fallback toggle tied to `prefers-reduced-motion` for all decorative animations.
3. Replace placeholder KPI values with live or approved proof metrics once available.
4. Normalize logo source references to remove optional missing PNG fallback requests.
