---
name: Organic Studio
colors:
  surface: '#F1EDE4'
  surface-dim: '#d3dec9'
  surface-bright: '#f2fde8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#ecf7e2'
  surface-container: '#e7f1dd'
  surface-container-high: '#e1ecd7'
  surface-container-highest: '#dbe6d2'
  on-surface: '#151e11'
  on-surface-variant: '#3d4b36'
  inverse-surface: '#2a3325'
  inverse-on-surface: '#e9f4df'
  outline: '#6c7b64'
  outline-variant: '#bbcbb1'
  surface-tint: '#126e00'
  primary: '#126e00'
  on-primary: '#ffffff'
  primary-container: '#3ce619'
  on-primary-container: '#0f6100'
  inverse-primary: '#3ae416'
  secondary: '#615e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e4dfdb'
  on-secondary-container: '#65625f'
  tertiary: '#884c5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffb3c6'
  on-tertiary-container: '#7b4252'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#79ff59'
  primary-fixed-dim: '#3ae416'
  on-primary-fixed: '#022100'
  on-primary-fixed-variant: '#0b5300'
  secondary-fixed: '#e7e1de'
  secondary-fixed-dim: '#cbc5c2'
  on-secondary-fixed: '#1d1b19'
  on-secondary-fixed-variant: '#494644'
  tertiary-fixed: '#ffd9e1'
  tertiary-fixed-dim: '#fdb2c5'
  on-tertiary-fixed: '#370a1b'
  on-tertiary-fixed-variant: '#6c3546'
  background: '#f2fde8'
  on-background: '#151e11'
  surface-variant: '#dbe6d2'
  paper: '#F9F6F0'
  ink: '#2D2B2A'
  muted: '#8C8885'
  backdrop: '#E5E5E5'
typography:
  display-timer:
    fontFamily: Karla
    fontSize: 56px
    fontWeight: '300'
    lineHeight: '1'
    letterSpacing: -0.02em
  headline-label:
    fontFamily: Karla
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 1.2px
  body-standard:
    fontFamily: Karla
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-nav:
    fontFamily: Karla
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 2.5rem
  section-gap: 2rem
  icon-padding: 0.75rem
---

## Brand & Style
The brand identity is centered on **Organic Tactility**, blending a soft, paper-like aesthetic with modern neomorphic interactions. It targets professionals and students seeking a "low-anxiety" productivity environment. The style is a hybrid of **Minimalism** and **Tactile Neomorphism**, using soft shadows and light-driven depth rather than heavy color blocks or flat lines. The emotional response should be one of calm, focus, and physical presence, as if interacting with high-end stationary or a premium analog timer.

## Colors
The palette is rooted in warm, natural neutrals that mimic physical materials.
- **Primary**: A vibrant, "living" green used exclusively for active progress indicators and success states.
- **Surface (Paper & Ink)**: The background uses a creamy `#F9F6F0` (Paper), while interactive surfaces use a slightly deeper `#F1EDE4` to create contrast without harsh lines.
- **Typography (Ink & Muted)**: High-priority information uses `#2D2B2A` (Ink), while secondary labels and icons use `#8C8885` (Muted) to maintain a soft visual hierarchy.
- **Functional**: The background backdrop (outside the main container) is a neutral `#E5E5E5` to make the "Paper" UI pop.

## Typography
The system uses **Karla** exclusively to leverage its quirky yet professional grotesque character. 
- **Timer Display**: Uses a light weight with tabular numbers to prevent horizontal "jumping" during countdowns.
- **Labels**: Small caps and generous letter spacing (1.2px) are used for secondary headers to evoke a clean, architectural feel.
- **Consistency**: All text remains in the neutral "Ink" or "Muted" tones; color is never applied to typography to maintain the minimalist focus.

## Layout & Spacing
The layout follows a **Fixed Container** model, optimized for a 320x480px extension window. 
- **Rhythm**: A 4px baseline grid governs all spacing.
- **Structure**: Content is vertically centered with large internal margins (40px on sides) to create an "airy" feel.
- **Navigation**: The footer icons are distributed using `justify-between` with wide horizontal padding (40px) to ensure touch/click targets are isolated and intentional.

## Elevation & Depth
Depth is created through **Neomorphic shadows** rather than Z-index stacking.
- **Default State**: Elements like the central dial use an "Ambient" shadow: a combination of a soft dark shadow (bottom-right) and a crisp white highlight (top-left) to simulate a surface protruding from the paper.
- **Pressed/Active State**: Elements use "Pressed" (inset) shadows to simulate physical depression into the surface.
- **Container**: The main app window uses a "shadow-2xl" (large ambient drop shadow) to separate the entire interface from the browser background.

## Shapes
The shape language is primarily **Circular and Soft**.
- **Interactive Dials**: Perfect circles are used for primary actions to reinforce the analog "stopwatch" metaphor.
- **Containers**: The main window uses a 0.5rem (rounded-lg) radius.
- **Hover States**: Navigation icons use a full-circle background (`rounded-full`) on hover to maintain the soft, organic theme.

## Components
- **The Dial**: A neomorphic circular button. It features a light-weight timer text in the center and a thin 4px SVG progress ring on its outer edge. In active states, the ring fills with the Primary Green.
- **Navigation Icons**: Minimalist Material Symbols (Outlined). Default color is `muted`. Hover states trigger a `surface` colored circular background and transition the icon to `ink`.
- **Toggle Controls**: All switches and toggles should use the "Pressed" inset shadow state when active, rather than a color change, to stay consistent with the tactile metaphor.
- **Cards/Sections**: Use the `paper` color for the background and `surface` for any internal cards or nested elements to create subtle depth levels.