---
name: Peruvian Heritage System
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#5d3f3c'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#926e6b'
  outline-variant: '#e7bdb9'
  surface-tint: '#c0001a'
  primary: '#ad0017'
  on-primary: '#ffffff'
  primary-container: '#d91023'
  on-primary-container: '#ffecea'
  inverse-primary: '#ffb3ad'
  secondary: '#485f84'
  on-secondary: '#ffffff'
  secondary-container: '#bbd3fd'
  on-secondary-container: '#445a7f'
  tertiary: '#64513d'
  on-tertiary: '#ffffff'
  tertiary-container: '#7e6954'
  on-tertiary-container: '#ffeddc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad6'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#410003'
  on-primary-fixed-variant: '#930011'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#b0c7f1'
  on-secondary-fixed: '#001b3c'
  on-secondary-fixed-variant: '#30476a'
  tertiary-fixed: '#f9dec3'
  tertiary-fixed-dim: '#dcc2a9'
  on-tertiary-fixed: '#261909'
  on-tertiary-fixed-variant: '#554430'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 80px
---

## Brand & Style

This design system is a modern digital extension of the "Marca Perú" identity, designed to showcase Peru as a premier global destination. The brand personality is **vibrant, hospitable, and sophisticated**, bridging the gap between ancient cultural depth and contemporary luxury.

The visual style follows a **Modern / Cultural** aesthetic. It prioritizes high-impact editorial photography and intentional whitespace to allow the rich colors of Peruvian landscapes and textiles to shine. The UI uses soft, organic shapes that mirror the iconic spiral of the Nazca lines, creating a sense of movement and warmth. The overall emotional response should be one of discovery and "Gusto"—a celebration of flavor, sight, and heritage.

## Colors

The palette is anchored by **Marca Perú Red**, a high-energy primary color used for key actions and brand presence. 

- **Primary (#D91023):** Used for primary buttons, active states, and brand iconography.
- **Secondary (#1D3557):** A deep, Pacific blue used for typography, heavy headers, and grounding elements, providing a premium contrast to the red.
- **Tertiary (#E6CCB2):** An Andean earth tone used for subtle backgrounds, dividers, and decorative "pampa" elements.
- **Surface & Neutral:** We use a crisp white (#FFFFFF) for primary surfaces and a "Mist" grey (#F8F9FA) for secondary containers to maintain a light, airy feel.
- **Semantic:** Success is represented by a jungle green, while warnings utilize an inca gold.

## Typography

The typography strategy balances character with utility. 

**Plus Jakarta Sans** is used for headlines. Its slightly rounded terminals and geometric structure echo the fluid, circular motifs of Peruvian iconography while remaining distinctly modern. 

**Manrope** is the workhorse for body text and UI labels. It offers exceptional legibility at small sizes and a clean, professional tone that balances the expressive nature of the headlines.

For mobile devices, display and large headline sizes scale down to prevent awkward line breaks, ensuring that the "premium editorial" feel remains intact on smaller screens. Use uppercase styles for `label-sm` to create a clear information hierarchy in metadata and small captions.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model with generous safe areas to evoke a sense of "open horizons."

- **Mobile:** A 4-column grid with 20px outer margins and 16px gutters.
- **Desktop:** A 12-column grid centered in a max-width container (1440px), with 80px margins to provide a premium, gallery-like whitespace.

The spacing rhythm is based on an 8px baseline. Use `lg` (40px) and `xl` (64px) spacing for vertical sectioning to prevent the UI from feeling cluttered. Elements should "breathe," especially when paired with high-quality destination imagery.

## Elevation & Depth

To maintain a "Welcoming and Premium" feel, depth is created through **Ambient Shadows** and **Tonal Layers** rather than harsh borders.

- **Level 1 (Cards/Inputs):** A very soft, diffused shadow (0px 4px 20px) with a subtle secondary color tint (Deep Blue at 4% opacity). This makes cards feel like they are floating gently above the Andes-clay background.
- **Level 2 (Modals/Navigation):** More pronounced elevation using a 12% opacity shadow to create clear focus.
- **Surface Tinting:** Use the Tertiary Earth Tone at 5-10% opacity for container backgrounds to distinguish them from the pure white page background without relying on lines.
- **Imagery Depth:** Apply a subtle dark gradient overlay (bottom-to-top) on images where text is placed to ensure legibility while maintaining the visual impact of the landscape.

## Shapes

The shape language is **Organic and Rounded**. 

We use a 16px (1rem) standard radius for all primary containers and cards. This large radius feels friendly and echoes the curves found in the Brand Peru spiral. 

- **Buttons & Chips:** Use a full pill-shape (radius-xl) to emphasize a modern, touch-friendly interface.
- **Images:** All hero and gallery images must feature rounded corners to match the UI containers, softening the overall visual impact.
- **Icons:** Use "Rounded" or "Soft" icon sets (e.g., Lucide or Material Symbols Rounded) to ensure stylistic harmony with the typography and containers.

## Components

### Buttons
- **Primary:** Marca Perú Red fill with white text. Pill-shaped. Subtle shadow on hover.
- **Secondary:** Deep Blue outline with Deep Blue text. Used for secondary navigation.
- **Ghost:** No fill or border, only text in Deep Blue or Red. Used for "View All" or minor actions.

### Cards (The "Destination" Card)
The core component of the app. Features a large image (16:9 or 4:5 ratio), 16px rounded corners, and a white footer containing the destination name in `headline-md` and a small location tag in `label-sm`.

### Chips
Used for categories like "Gastronomy," "History," or "Adventure." Pill-shaped with a light Tertiary fill and Deep Blue text. Active states switch to a Primary Red fill.

### Input Fields
Soft grey (#F1F3F5) background with no border, 12px rounded corners, and a 2px Marca Perú Red border appearing only on focus.

### Lists
Lists should be highly visual. Each list item should include a small 48x48px thumbnail with 8px rounding, centered vertically with the text content.

### Navigation Bar
A clean, white bottom bar for mobile with active icons highlighted in Primary Red. Use clear, descriptive labels in `label-sm`.