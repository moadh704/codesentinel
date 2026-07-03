# CodeSentinel Design System

## Philosophy
Premium dark UI inspired by Linear.app — clean, minimal, focused. No AI slop, no generic gradients, no pill buttons, no heavy shadows on dark.

## Color Palette
- **Background**: `#0A0B0D`
- **Cards**: `#111214`
- **Card Hover**: `#16181C`
- **Border**: `rgba(255, 255, 255, 0.06)`
- **Text Primary**: `#E6E7EA`
- **Text Dim**: `#9CA0A8`
- **Accent**: `#7C5CFF` (primary purple)
- **Success**: `#22C55E`
- **Warning**: `#F59E0B`
- **Danger**: `#EF4444`
- **Info**: `#3B82F6`

## Typography
- **Headings**: Bricolage Grotesque (variable, 600-700 weight)
- **Body**: DM Sans (400-500 weight)
- Monospace for code: JetBrains Mono or system ui-monospace

## Spacing & Radii
- Button radius: `8px`
- Card radius: `12px`
- Base spacing unit: `8px` (use multiples: 4, 8, 12, 16, 24, 32, 48)
- No drop shadows on cards (subtle border + hover lift instead)

## Components
- Buttons: Solid accent or subtle ghost. No pills. `px-5 py-2.5 text-sm font-medium rounded-[8px]`
- Cards: `bg-[#111214] border border-white/5 rounded-[12px]`
- Inputs: Clean, `bg-[#0A0B0D] border border-white/10 focus:border-[#7C5CFF]`
- Badges: Small, rounded-[6px], uppercase tracking-wider text-[10px] font-mono for severity
- Tabs: Underline style, active accent color

## Animations
- Subtle: `transition-all duration-200 ease-out`
- No excessive motion. Use for hover states, loading spinners only.
- Count-up stats: GSAP or simple requestAnimationFrame

## Icons
- lucide-vue-next (consistent stroke width 2)

## Charts
- ApexCharts with custom dark theme matching palette (no default colors)

## Code Highlighting
- shiki (VS Code themes, prefer dark+ or github-dark)

## Forbidden
- No Inter font
- No uniform card grids without purpose
- No generic hero gradients
- No pill-shaped buttons or tabs
- No heavy box-shadows (use subtle ring or border instead)
