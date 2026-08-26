# Landing Page Overrides

> **PROJECT:** Quincenalia
> **Generated:** 2026-08-25 18:27:51
> **Page Type:** Landing / Marketing

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** 1200px (standard)
- **Layout:** Full-width sections, centered content

### Spacing Overrides

- No overrides — use Master spacing

### Color Overrides

Keep the existing Quincenalia brand on this page. Do **not** apply the Master teal palette here — it would break Navbar, CTAs and the rest of the product.

| Role | Hex | Usage |
|------|-----|--------|
| Brand primary | `#CFB8FC` | Buttons, dots, highlights |
| On primary | `#2D2150` | Text on primary |
| Burgundy | `#783046` | FAQ, legal accents |
| Warm surface | `#E8DAD9` | Contact band |
| Ink | `#0F172A` | Headings |
| Muted text | `#475569` | Body |

Glass overlays on the hero use `rgba(255,255,255,0.12)` + `backdrop-blur-md`, with a dark scrim strong enough for white text ≥4.5:1.

### Typography Overrides

- **All landing type:** GT Walsheim (headings, body, stats, CTAs)
- Fallback: Outfit, already loaded for visitors without a local GT Walsheim license
- Scoped to `.landing-page` so dashboards keep Poppins/Outfit

### Component Overrides

- No overrides — use Master component specs

---

## Page-Specific Components

- `TrustStrip` — value prop + 4 proof stats immediately after the hero
- Hero pause/play control and skip-to-content cue (`#valor`)
- Zone carousel with previous/next + keyboard arrows

---

## Recommendations

- Effects: Realistic shadows (layers), depth (perspective), texture details (noise, grain), realistic animations (300-500ms)
