# SEO Putera Design System

**Updated:** 2026-06-30  
**Product:** Scalable SEO portfolio gallery  
**Direction:** Swiss Modernism 2.0 / evidence-led editorial

## Core idea

The interface should feel like a precise editorial catalog: white paper on a soft-gray canvas, mathematical grids, oversized typography, thin black rules, and restrained blue/yellow/black accents. Evidence is the visual material.

## Tokens

| Role | Value |
|---|---|
| Blue | `#2458F5` |
| Blue dark | `#1541CF` |
| Yellow | `#FFD91A` |
| Ink | `#090909` |
| Paper | `#FFFFFF` |
| Canvas | `#E9EAEE` |
| Muted text | `#5D5D63` |
| Font | Inter, Helvetica Neue, Arial, sans-serif |
| Desktop grid | 12 columns |
| Max frame | 1280px |

## Layout rules

- Keep the white site frame visibly separated from the gray browser canvas on desktop.
- Use a 12-column grid and strong horizontal rules between major sections.
- Use asymmetric editorial compositions, but return to a simple single column on mobile.
- Preserve generous negative space. Do not fill empty areas with decoration.
- Project cards are generated from `data/projects.json`; one project expands full-width, while multiple projects form a three-column gallery.

## Type rules

- Display headings: Inter 500, tight line-height, `-0.06em` to `-0.075em` tracking.
- Body: Inter 400, 14–17px depending on context.
- Labels: Inter 700, uppercase, 8–10px, increased tracking.
- Avoid monospace as the primary brand font.

## Components

- Buttons are square-edged and use blue, black, white, or yellow states.
- Cards have 1px black borders and stable hover states; no scale-based layout shifts.
- Evidence imagery may be slightly rotated inside a stable container to create an editorial collage.
- All project scores must show their source and date nearby.
- Filter controls must remain real buttons with visible active and focus states.

## Content rules

- Never present a score without its audit source and date.
- Never imply that technical audit scores prove traffic or ranking growth.
- Do not add placeholder projects, invented metrics, or unavailable results.
- Every future project gets its own case-study URL and evidence folder.

## Accessibility and delivery checklist

- Maintain at least WCAG AA contrast.
- Keep keyboard focus visible.
- All meaningful images require descriptive alt text.
- Interactive cards and controls require pointer and hover feedback.
- Respect `prefers-reduced-motion`.
- Verify 375px, 768px, 1024px, and 1440px layouts.
- Confirm no mobile horizontal overflow.
- Confirm every generated project card exists in the static HTML before deployment.
