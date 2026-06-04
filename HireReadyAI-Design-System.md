# HireReadyAI — Design System & Component Guidelines

A complete reference for building screens that match the HireReadyAI HR-Tech platform. Share this with designers and engineers — every value below is production-ready.

---

## 1. Brand Foundation

| Property | Value |
|---|---|
| Product name | **HireReadyAI** |
| Category | Enterprise HR-Tech / ATS SaaS |
| Tone | Professional, calm, trustworthy, productive |
| Reference peers | Greenhouse, Lever, Ashby, Workable |
| Logo mark | Rounded square `9×9` (`rounded-lg`), filled `--sidebar-primary` (`#468faf`), white bold "H" in display font |
| Wordmark | "HireReadyAI", `font-display`, `17px`, `font-weight: 600`, `tracking-tight`, white on navy sidebar |

---

## 2. Color System (single source of truth)

All colors are defined as **OKLCH** tokens in `src/styles.css` under `:root`. Never hard-code hex values in components — always use the semantic token (`bg-primary`, `text-muted-foreground`, etc.).

### 2.1 Core Palette (hex reference)

| Role | Hex | OKLCH token | Use |
|---|---|---|---|
| Primary | `#01497c` | `--primary` | Main CTAs, links, active nav, primary chart series |
| Primary Hover | `#013a63` | (darken primary) | Hover state for primary buttons |
| Sidebar BG | `#012a4a` | `--sidebar` | Left navigation background |
| Secondary | `#2a6f97` | `--muted-foreground` | Secondary text, secondary chart series |
| Accent | `#468faf` | `--accent` / `--sidebar-primary` | Logo mark, notification dots, focus rings, tertiary CTAs |
| Surface (page) | `#ffffff` | `--background` | Card surfaces, modals |
| Surface (section) | `#eef7fa` | `--secondary` | Page background, search input bg |
| Surface (hover) | `#e7f3f7` | `--muted` | Row hover, subtle hover surfaces |
| Border | `#cfe7f2` | `--border` | All dividers, card borders, input borders |
| Text — primary | `#012a4a` | `--foreground` | Headings, body |
| Text — muted | `#2a6f97` | `--muted-foreground` | Labels, captions, helper text |

### 2.2 Status Colors

| State | Token | Use |
|---|---|---|
| Success | `--success` (`oklch(0.62 0.14 165)`) | Positive deltas, "Hired", success toasts |
| Warning | `--warning` (`oklch(0.78 0.15 75)`) | Bias flags, attention banners |
| Destructive | `--destructive` (`oklch(0.58 0.21 27)`) | Destructive buttons, "Rejected", errors |

### 2.3 Pipeline Stage Colors (ATS-specific)

Each kanban stage owns a color. Use as `border-t-2` on the column and as inline badge backgrounds.

| Stage | Hex | Token |
|---|---|---|
| Applied | `#89c2d9` | `--stage-applied` |
| Screening | `#61a5c2` | `--stage-screening` |
| Interview | `#2c7da0` | `--stage-interview` |
| Assessment | `#2a6f97` | `--stage-assessment` |
| Final Interview | `#01497c` | `--stage-final` |
| Hired | `#468faf` | `--stage-hired` |
| Rejected | `oklch(0.65 0.01 250)` (neutral) | — |

### 2.4 Chart Palette

Use `--chart-1` … `--chart-5` (all in the blue family). Never introduce reds/greens into charts except for explicit success/destructive metrics.

---

## 3. Typography

| Family | Weight loaded | Use |
|---|---|---|
| **Plus Jakarta Sans** | 400 / 500 / 600 / 700 / 800 | All UI text — body + display |
| **Inter** | 400 / 500 / 600 | Fallback only |

CSS variables: `--font-sans` and `--font-display` both resolve to Plus Jakarta Sans.

### 3.1 Type Scale

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| Display XL | `text-3xl` (30px) | 600 | `-0.02em` | Page titles (`h1`) |
| Display L | `text-2xl` (24px) | 600 | `-0.02em` | Section titles |
| Display M | `text-xl` (20px) | 600 | `-0.02em` | Card titles |
| Display S | `text-[17px]` | 600 | `-0.01em` | Wordmark, table headers |
| Body | `text-sm` (14px) | 400/500 | normal | Default body |
| Caption | `text-xs` (12px) | 500 | normal | Labels, pills, helper text |
| Metric | `text-3xl` (30px) | 600 | `-0.02em` | KPI numbers in `Stat` cards |

Rule: every heading uses `font-display`. Body uses default `font-sans`. Never use serif.

---

## 4. Spacing, Radius, Elevation

### 4.1 Spacing scale
Use Tailwind defaults. Common rhythm:
- Card padding: `p-6` (24px)
- Page padding: `px-4 sm:px-8 py-8`
- Section gap: `gap-6`
- Inline gap: `gap-2` to `gap-3`
- Stack between sections: `mb-8`

### 4.2 Radius
- Base `--radius: 0.875rem` (14px)
- Cards: `rounded-2xl` (16px)
- Buttons, inputs, badges: `rounded-lg` (10px)
- Pills: `rounded-full`
- Avatars: `rounded-full`
- Logo mark: `rounded-lg`

### 4.3 Shadows
| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 1px 2px rgba(1,42,74,.04), 0 1px 3px rgba(1,42,74,.06)` | Default on every card |
| `--shadow-lift` | `0 10px 30px -12px rgba(1,42,74,.18)` | Hover state on interactive cards (`.card-lift:hover`) |

No glassmorphism. No heavy gradients. One subtle shadow at rest, one lift on hover.

---

## 5. Layout System

### 5.1 App Shell (authenticated screens)
- **Sidebar**: fixed, `w-64`, `bg-sidebar` (`#012a4a`), full-height, hidden below `lg`.
- **Topbar**: sticky, `h-16`, `bg-background/80 backdrop-blur`, contains search + bell + primary "New Job" CTA.
- **Main**: `lg:pl-64`, content padded `px-4 sm:px-8 py-8`.
- **Page header**: `h1` + optional subtitle on the left, action buttons on the right, `mb-8`.

### 5.2 Grid rhythm
- KPI row: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`
- Dashboard split: `grid grid-cols-1 lg:grid-cols-3 gap-6` (main = `lg:col-span-2`)
- Forms: max width `max-w-3xl`, single column, `space-y-6`

---

## 6. Component Guidelines

> All components import from `src/components/ui-bits.tsx` (custom) or `src/components/ui/*` (shadcn). Colors below are tokens — write `bg-primary`, not `bg-[#01497c]`.

### 6.1 Buttons (`Btn` from `ui-bits.tsx`)

| Variant | Classes | When |
|---|---|---|
| `primary` | `bg-primary text-primary-foreground hover:opacity-90` | Page-level main action (1 per view max) |
| `accent` | `bg-accent text-accent-foreground hover:opacity-90` | Secondary highlighted action |
| `outline` | `border bg-background hover:bg-secondary` | Secondary action, cancel |
| `ghost` | `hover:bg-secondary` | Tertiary, inline, table actions |
| `destructive` | `bg-destructive text-destructive-foreground` | Delete, reject |

Shared: `rounded-lg px-4 py-2.5 text-sm font-medium`, icon size `size-4`, icon gap `gap-2`. Disabled: `opacity-50 cursor-not-allowed`.

### 6.2 Cards (`Card` from `ui-bits.tsx`)
```
<Card lift>              {/* lift adds hover translate + shadow */}
  <h3 className="font-display text-xl">Title</h3>
  <p className="text-sm text-muted-foreground mt-1">Subtitle</p>
  ...
</Card>
```
Defaults: `rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]`. Always border + shadow. Never both heavy shadow and saturated border.

### 6.3 Stat / KPI cards (`Stat`)
- Label: `text-sm text-muted-foreground`
- Value: `text-3xl font-display font-semibold tracking-tight`
- Delta: `text-xs font-medium`, success green if `▲`, destructive red if `▼`
- Icon container: `size-10 rounded-lg bg-secondary text-primary`

### 6.4 Pills / Badges (`Pill`)
`rounded-full border px-2.5 py-0.5 text-xs font-medium`, with these tones:
- `neutral` — `bg-secondary text-foreground/80 border-border`
- `accent` — `bg-accent/10 text-accent border-accent/20`
- `success` — `bg-success/10 text-success border-success/20`
- `warning` — `bg-warning/15 text-[#8a5a00] border-warning/30`
- `danger` — `bg-destructive/10 text-destructive border-destructive/20`

### 6.5 Inputs
- Height `h-10`, `rounded-lg`, `border bg-background`, `px-3 text-sm`
- Placeholder: `placeholder:text-muted-foreground`
- Focus: `focus:ring-2 focus:ring-ring/30` (uses accent)
- Search input variant: `bg-secondary/50` with left `Search` icon at `size-4 text-muted-foreground`

### 6.6 Sidebar Navigation
- Item base: `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium`
- Idle: `text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white`
- Active: `bg-sidebar-accent text-white` + trailing `size-1.5 rounded-full bg-sidebar-primary` dot
- Icon: `size-4`

### 6.7 Topbar
- Search: `h-10 w-full max-w-md rounded-lg border bg-secondary/50 pl-9 pr-3 text-sm`
- Bell: `grid size-10 place-items-center rounded-lg border bg-background`, accent dot `size-2 bg-accent` at top-right
- Primary CTA: `bg-primary text-primary-foreground rounded-lg px-4 py-2.5`

### 6.8 Avatars
- `size-9 rounded-full bg-primary/10 text-primary text-sm font-medium`, initials fallback
- User chip in sidebar: avatar + name (white) + role (`text-sidebar-foreground/60`)

### 6.9 Score Ring (`ScoreRing`)
- SVG ring, stroke width 4
- Color logic: `≥80` → success, `≥60` → accent, else warning
- Center label: `font-display text-sm font-semibold`

### 6.10 Pipeline Columns (Kanban)
- Column: `bg-secondary/60 rounded-2xl border border-t-2` where `border-t-color` = the stage token
- Column header: stage name + count badge in stage color
- Candidate card inside: white `Card`, with `lift`, showing name, role, `ScoreRing`, and stage-colored badge

### 6.11 Tables
- Header row: `text-xs uppercase tracking-wide text-muted-foreground bg-secondary/50`
- Row: `border-b border-border hover:bg-muted`
- Cell padding: `px-4 py-3 text-sm`
- Status cell uses `Pill`

### 6.12 Charts (Recharts)
- Stroke: `var(--chart-1)` for primary series, `var(--chart-3)` for secondary
- Fill: gradient from `var(--chart-1)` at 30% opacity to transparent
- Grid: `stroke="var(--border)" strokeDasharray="3 3"`
- Axis text: `fill="var(--muted-foreground)" fontSize={12}`
- Tooltip: white card, `border`, `shadow-[var(--shadow-card)]`, `rounded-lg`, `text-sm`

### 6.13 Tabs
- List: `bg-secondary rounded-lg p-1`
- Trigger idle: `text-muted-foreground`
- Trigger active: `bg-background text-foreground shadow-[var(--shadow-card)]`

### 6.14 Modals / Dialogs
- `bg-card rounded-2xl border shadow-[var(--shadow-lift)] p-6 max-w-lg`
- Overlay: `bg-foreground/40 backdrop-blur-sm`
- Title `font-display text-xl font-semibold`, body `text-sm text-muted-foreground`

### 6.15 Toasts
- Success: `bg-success/10 border-success/30 text-success`
- Error: `bg-destructive/10 border-destructive/30 text-destructive`
- Default: `bg-card border text-foreground shadow-[var(--shadow-lift)]`

---

## 7. Iconography
- Library: **lucide-react** only.
- Default size: `size-4` (16px) inline, `size-5` (20px) in headers, `size-10` container with `size-5` icon for feature blocks.
- Color: inherit (`currentColor`). Use `text-primary` on accent containers, `text-muted-foreground` on inline meta.

---

## 8. Motion
- Duration: `0.18s` default, `0.24s` for entrances.
- Easing: `ease` for hover, `cubic-bezier(0.16,1,0.3,1)` for entrances.
- Card hover: `translateY(-2px)` + swap to `--shadow-lift` + border tint toward accent.
- Avoid parallax, large bouncing springs, glassmorphism.

---

## 9. Accessibility
- Body text contrast: `#012a4a` on white = 14.5:1 ✅
- Muted text contrast: `#2a6f97` on white = 5.1:1 ✅ (use only for ≥14px)
- Primary button text: white on `#01497c` = 8.9:1 ✅
- Focus ring: always visible — `ring-2 ring-ring/30` (accent) on inputs/buttons.
- Hit target ≥ 40×40px.

---

## 10. Page Templates

### 10.1 Dashboard
1. Page header (title + "New Job" CTA)
2. KPI row — 4 `Stat` cards
3. Two-column grid: main chart card (col-span-2) + activity feed card
4. Secondary row: pipeline summary + tasks

### 10.2 List / Index (Jobs, Candidates)
1. Page header + filters row (search input + status pills + sort)
2. Table inside a `Card`
3. Pagination footer in muted text

### 10.3 Detail (Candidate, Job)
1. Header card: avatar + name + role + `ScoreRing` + action buttons
2. Tabs (CV, Tests, Interviews, Notes)
3. Two-column body: main content + meta sidebar

### 10.4 Kanban (Pipeline)
1. Page header + filter pills
2. Horizontal scroll row of stage columns (see 6.10)

### 10.5 Auth (Login / Apply)
1. Centered card, `max-w-md`, `rounded-2xl`
2. Logo mark + wordmark at top
3. Role toggle (HR / Applicant) as segmented control
4. Primary CTA full width

---

## 11. Do / Don't

✅ Do
- Use semantic tokens (`bg-primary`, `text-muted-foreground`).
- Keep one primary CTA per view.
- Use `lift` on cards that are clickable.
- Use stage colors for anything pipeline-related.
- Pair every status with both a color and an icon/label.

❌ Don't
- Hard-code hex values in components.
- Mix more than 2 accent colors per screen.
- Use gradients beyond chart fills.
- Use serifs, script fonts, or Inter for headings.
- Use glassmorphism, neumorphism, or heavy drop shadows.
- Re-color the sidebar — it is always `--sidebar` navy.

---

## 12. File Reference

| File | Purpose |
|---|---|
| `src/styles.css` | All design tokens, fonts, base layer |
| `src/components/ui-bits.tsx` | `Card`, `Stat`, `Pill`, `Avatar`, `ScoreRing`, `Btn` |
| `src/components/ui/*` | shadcn primitives (button, input, dialog, tabs…) |
| `src/components/layout/AppShell.tsx` | Sidebar + topbar + page header |
| `src/routes/__root.tsx` | Font imports, meta, root shell |

---

*Version 1.0 — HireReadyAI Design System*
