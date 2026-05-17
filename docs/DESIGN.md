# Organic Studio Design

## Overview

**The Pitch:** A tactile, sensory-focused Pomodoro browser extension that grounds digital work in analog warmth. It trades stressful digital counters for a sweeping, physical-feeling clock face that visualizes time as a tangible resource.

**Design Direction:** Analog desk object meets modern UI. Embossed paper textures, soft matte plastic aesthetics, and a color palette inspired by ink, clay, and flora.

**Inspired by:** Braun physical clocks, high-end stationery, and the "Calm Technology" movement.

---

## The Three Pillars (Themes)

FlowState features three distinct colorways, each rooted in a natural environment. These themes are applied to the core "Organic Studio" aesthetic (Paper backgrounds, Tactile shadows).

### 1. Forest (Default)
*Inspiration: Moss, pine needles, and morning mist.*
- **Aesthetic:** Grounding and focused.
- **Primary Color:** Sage Green (`#8A9A86`).

### 2. Ocean
*Inspiration: Deep water, slate, and sea foam.*
- **Aesthetic:** Calm and fluid.
- **Primary Color:** Dusty Blue (`#7A90A4`).

### 3. Sunset
*Inspiration: Clay, terracotta, and evening light.*
- **Aesthetic:** Warm and energizing.
- **Primary Color:** Terracotta (`#C17767`).

---

## Screens

- **Timer (Focus Mode):** Main sweeping clock face tracking deep work.
- **Timer (Break Mode):** Relaxed state visualizer with organic ambient indicators.
- **Task Log:** Physical receipt-style list of completed sessions.
- **Settings:** Embossed slider controls for duration and theme selection.

---

## Key Flows

**Start a Focus Session:** User begins a deep work block.
1. User is on Timer (Focus Mode) -> sees stationary clock face with "25:00" embossed.
2. User clicks Main Dial -> Dial physically depresses, shadow shifts, sweeping animation begins.
3. Clock ticks down, progress ring organically fills in the theme's **Primary Color**.

**Log a Completed Session:** Transition from focus to break.
1. User is on Timer (Focus Mode) -> timer hits 0:00, emits soft chime.
2. UI crossfades to Timer (Break Mode) -> A secondary accent (Amber/Gold) sweeps in, prompting the break.
3. Session is automatically logged as a "seed" in the Task Log.

---

<details>
<summary>Design System</summary>

## Color Palette & Tokens

The system uses a shared "Surface" foundation across all themes, with theme-specific "Primary" accents.

### Shared Foundation (Light Mode - Paper & Clay)
- **Background:** `#F9F6F0` (Paper texture)
- **Surface:** `#F1EDE4` (Raised physical elements, dials)
- **Text (Ink):** `#2D2B2A` (Dark ink body text)
- **Muted (Graphite):** `#8C8885` (Secondary text, debossed lines)
- **Shadow (Ambient):** `4px 6px 12px rgba(45, 43, 42, 0.08), -4px -4px 10px rgba(255, 255, 255, 0.7)`
- **Shadow (Pressed):** `inset 3px 3px 6px rgba(45, 43, 42, 0.1), inset -2px -2px 4px rgba(255, 255, 255, 0.6)`

### Shared Foundation (Dark Mode - Espresso & Bark)
- **Background:** `#1A1817` (Espresso)
- **Surface:** `#262322` (Matte dark wood)
- **Text (Parchment):** `#EAE6E1` (Soft parchment)
- **Muted (Bark):** `#8A8580` (Faded bark)
- **Shadow (Ambient):** `4px 6px 12px rgba(0, 0, 0, 0.4), -2px -2px 8px rgba(255, 255, 255, 0.05)`
- **Shadow (Pressed):** `inset 4px 4px 8px rgba(0, 0, 0, 0.5), inset -2px -2px 4px rgba(255, 255, 255, 0.03)`

### Theme Accents (Primary)
| Theme | Light Accent | Dark Accent |
|---|---|---|
| **Forest** | `#8A9A86` (Sage) | `#3A5A40` (Forest) |
| **Ocean** | `#7A90A4` (Dusty Blue) | `#2B3A4A` (Navy) |
| **Sunset** | `#C17767` (Terracotta) | `#D48C45` (Amber) |

## Typography

- **Headings:** Fraunces, 600, 24px (Italicized for active states)
- **Timer Display:** Karla, 300, 56px (Tabular lining enabled)
- **Body:** Karla, 400, 15px
- **Small text:** Karla, 600, 12px (Uppercase, 1.2px letter-spacing)
- **Buttons:** Karla, 600, 14px

## Elevation & Shapes

- **Radius:** `16px` for cards, `50%` for dials/buttons.
- **Tactile Depth:** Buttons "depress" rather than scale on click (swapping Ambient shadow for Pressed shadow).

</details>

---

<details>
<summary>Screen Specifications</summary>

### Timer (Focus Mode)
**Layout:** Target 380x580px (Max) / 320x480px (Min).
**Key Elements:**
- **Mode Label:** 12px Karla, Uppercase, centered at top (`--color-muted`). Reads "FOCUS".
- **Main Dial:** 220px diameter circle, centered. Ambient shadow applied.
- **Timer Display:** 56px Karla, centered inside the dial.
- **Progress Ring:** 4px SVG stroke, Theme Primary.

### Task Log
**Layout:** Vertical scrolling list with receipt-style aesthetics.
**Interactions:** Items fade into a soft mask at the top and bottom of the scrolling area.

### Settings
**Layout:** Stacked range inputs with custom tactile thumbs and a neomorphic theme toggle.

</details>

---

## Reference
`design-reference/`
