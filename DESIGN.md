# CodeSentinel Design System

**Goal**: Premium, calm, high-signal dark interface inspired by Linear. Built for a security code review tool — clarity and trust matter more than decoration.

This document is the single source of truth for colors, spacing, components, and constraints. It is used by both humans and AI agents when building UI.

---

## Core Principles

- **Low cognitive load** — every pixel should help the user understand security issues faster.
- **Depth without noise** — use color, borders, and subtle state changes instead of shadows or heavy effects.
- **Consistency over novelty** — reuse patterns. New components must justify their existence.
- **Own your components** — shadcn-vue components are copied into the codebase and customized. We control them.
- **Dark-first** — this is a dark-only product for the foreseeable future. All decisions optimize for `#0A0B0D`.

---

## Design Tokens

All tokens are defined as CSS variables and consumed via Tailwind.

### Recommended CSS Variables (put in `client/src/styles/tokens.css`)

```css
:root {
  /* Base surfaces */
  --background: #0A0B0D;
  --card: #111214;
  --card-hover: #16181C;
  --border: rgba(255, 255, 255, 0.06);

  /* Text */
  --text-primary: #E6E7EA;
  --text-dim: #9CA0A8;
  --text-muted: #6B7280;

  /* Brand */
  --primary: #7C5CFF;
  --primary-hover: #6B4FE0;
  --primary-foreground: #FFFFFF;

  /* Feedback */
  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;

  /* Functional */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Focus */
  --ring: #7C5CFF;
  --ring-offset: #0A0B0D;
}

/* Dark is default and only theme for now */
.dark {
  /* same as :root for now — we can extend later */
}
```

### Tailwind Config Extension (excerpt)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        card: {
          DEFAULT: 'var(--card)',
          hover: 'var(--card-hover)',
        },
        border: 'var(--border)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          foreground: 'var(--primary-foreground)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        info: 'var(--info)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      fontFamily: {
        heading: ['Bricolage Grotesque', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
}
```

---

## Color Usage Rules

| Token          | Usage                                      | Never use for          |
|----------------|--------------------------------------------|------------------------|
| `--background` | Page background                            | Cards, modals          |
| `--card`       | Cards, panels, popovers                    | Text, icons            |
| `--primary`    | Primary CTAs, active states, accents       | Error states           |
| `--success`    | Positive / resolved issues                 | Warnings               |
| `--danger`     | Critical / destructive actions             | Success states         |
| `--text-dim`   | Secondary text, labels, help text          | Primary content        |

**Elevation in dark mode**:
- Level 0: Page background (`--background`)
- Level 1: Cards (`--card` + subtle border)
- Level 2: Hover / selected / modals (`--card-hover` + stronger border or ring)
- Never use `box-shadow` for elevation. Use border + background change only.

---

## Typography

- **Headings**: Bricolage Grotesque, 600–700 weight. Use for page titles, section headers, card titles.
- **Body**: DM Sans, 400–500 weight. Default for all UI text.
- **Code / Data**: JetBrains Mono or system monospace. Used in editors, vulnerability snippets, logs.
- Never use Inter.

Recommended Tailwind classes:
- `font-heading text-2xl font-semibold tracking-tight`
- `font-body text-sm text-text-dim`

---

## Spacing, Radii & Layout

- Base unit: `8px` (use 4, 8, 12, 16, 24, 32, 48 px)
- Button radius: `8px` (`rounded-md`)
- Card radius: `12px` (`rounded-lg`)
- Input / small elements: `6px` (`rounded-sm`)
- Consistent inner padding on cards: `p-6` or `p-5`
- Gaps between cards / sections: multiples of 16px or 24px

**Layout rule**: Prefer vertical rhythm and clear grouping over dense grids. Use generous whitespace around important security findings.

---

## Components

### Buttons
- Primary: `bg-primary text-primary-foreground hover:bg-primary-hover rounded-md px-5 py-2.5 text-sm font-medium`
- Ghost / Secondary: `hover:bg-card-hover border border-white/10 text-text-primary`
- Never: pill shapes (`rounded-full`), heavy shadows, gradient backgrounds.

### Cards
```html
<div class="bg-card border border-white/5 rounded-lg p-6 hover:bg-card-hover transition-colors">
```
- Hover state is subtle background change + border intensification if needed.
- No `shadow-*` classes on cards.

### Inputs & Textareas
- `bg-background border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/30 rounded-md`
- Monospace for code input areas.
- Clear error state using `--danger` on border + small text below.

### Badges (Severity, Status, Type)
- Small, uppercase, mono: `text-[10px] font-mono tracking-[0.5px] px-2 py-0.5 rounded-sm`
- Critical: `bg-danger/10 text-danger border border-danger/20`
- High: `bg-warning/10 text-warning border border-warning/20`
- etc.

### Tabs
- Underline style only. Active tab gets `--primary` color + underline.
- No background pills or segmented controls unless justified.

### Tables (Scan History, etc.)
- Clean, minimal borders.
- Hover row: subtle `bg-card-hover`.
- Sticky header with `bg-card`.

### Loading States
- Use subtle skeleton or spinner. Never block the whole UI with heavy loaders.
- For AI analysis: progress indicator + estimated time if possible.

---

## Motion & Interaction

- Default transition: `transition-all duration-200 ease-out`
- Only animate what needs attention (hover, focus, loading, result appearance).
- No bouncy springs, no long entrance animations on page load.
- Count-up numbers: use lightweight solution (requestAnimationFrame or small GSAP if already in project).

---

## Code Highlighting & Data

- Use **shiki** with a dark VS Code theme (e.g. `github-dark`, `dark-plus`).
- Vulnerable code snippets and fix suggestions must be clearly differentiated (different background or border).
- Line numbers should be subtle.

---

## What We Never Do (Strict)

- **No pill buttons or tabs** — they feel playful and reduce perceived seriousness.
- **No heavy drop shadows** on dark backgrounds — they create noise and false depth.
- **No Inter font** anywhere.
- **No generic hero gradients** or decorative blobs.
- **No uniform dense card grids** without clear visual hierarchy or grouping.
- **No low-contrast text** (maintain at least 4.5:1 for body text).
- **No excessive motion** or decorative animations.
- **No "AI slop" aesthetics** — no unnecessary glows, glassmorphism, or trendy effects that don't serve the security review task.

If something feels "cool but not necessary", it probably violates the above.

---

## Accessibility & Trust

- High contrast by default.
- All interactive elements have clear focus rings using `--ring`.
- Error states are unambiguous (color + icon + text).
- Security findings are presented with clear severity, location, and actionable fix — never buried.

---

## How to Extend This System

1. Add new token to CSS variables first.
2. Extend Tailwind config.
3. Update this `DESIGN.md`.
4. Only then create or modify components.
5. When using shadcn-vue, customize the copied component to follow the rules above instead of keeping defaults.

---

**This document wins in case of conflict with "it looks nice in Figma" or "modern trends".**

Last updated: July 2026