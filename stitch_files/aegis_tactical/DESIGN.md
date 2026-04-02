# Design System Strategy: Tactical Intelligence & Precision

## 1. Overview & Creative North Star
**Creative North Star: "The Kinetic Monolith"**

This design system is engineered to transform raw geospatial data into actionable intelligence. We are moving away from the "web app" aesthetic and toward "high-tech instrumentation." The layout rejects the standard 12-column bootstrap grid in favor of **Intentional Asymmetry**. By utilizing heavy-weighted data modules balanced against expansive, airy map views, we create a sense of tactical focus. The interface should feel less like a website and more like a specialized piece of military hardware: cold, precise, and unfailingly responsive.

## 2. Color & Atmospheric Depth
Our palette is rooted in the "Deep Void" of space and tactical night-vision. 

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. They clutter the technical "noise" of the data. Instead, define boundaries through **Surface Layering**:
- Use `surface_container_lowest` (#0d0e12) for the global background.
- Use `surface_container` (#1f1f24) for primary utility panels.
- Use `surface_bright` (#38393e) for active selection highlights.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of high-grade polymers. An inner data readout component should sit as a `surface_container_high` (#292a2e) element nested within a `surface_container_low` (#1a1b20) frame. This creates a "machined" look where elements appear to be physically inset or extruded from the dashboard.

### Signature Textures & The "Glass & Gradient" Rule
To achieve a premium, cutting-edge feel:
- **Instrumentation Glow:** Active status indicators and Primary CTAs must utilize a subtle linear gradient from `primary` (#ffffff) to `secondary` (#7bd6d1).
- **Tactical Glass:** Floating overlays (e.g., coordinate tooltips or quick-action HUDs) must use a backdrop-blur of 12px-20px combined with `surface_variant` at 40% opacity. This prevents the map data from being completely lost while maintaining legibility.

## 3. Typography: Technical Authority
We use a high-contrast typographic scale to separate "Data" from "Interface."

- **Display & Headlines (Space Grotesk):** These are used for high-level mission headers and sector titles. The wide, geometric stance of Space Grotesk provides a futuristic, authoritative tone.
- **Labels & Data (Inter/Mono):** While the system input specifies Inter for body, all **numerical data, coordinates, and timestamps** must be forced into a monospace-styled technical treatment (utilizing `label-sm` and `label-md`).
- **Hierarchy:** Use `display-lg` for critical count-downs or threat levels. Use `body-sm` for secondary metadata. Never center-align text in a data module; use hard-left or hard-right alignment to emphasize the "grid" of the machine.

## 4. Elevation & Depth: Tonal Layering
In a war room environment, shadows are distracting. We use light, not darkness, to define elevation.

- **The Layering Principle:** Instead of drop shadows, use **inner glows**. A 1px `outline_variant` (#3c4948) at 20% opacity on the top and left edges of a container simulates a physical bezel catching light.
- **Ambient Shadows:** For "Global Modals" only, use a shadow with a 40px blur, 0% offset, and a color of `on_primary_container` (#00716b) at 5% opacity. This creates a "cyan hue" ambient glow rather than a muddy grey shadow.
- **The "Ghost Border":** For container containment, use `outline` (#859491) at 10% opacity. This ensures the eye tracks the container edge without adding visual weight to the layout.

## 5. Components: High-Tech Instrumentation

### Buttons: The "Trigger" Pattern
- **Primary:** Full `primary` (#ffffff) fill with `on_primary` (#003734) text. On hover, apply a `secondary_container` (#007774) outer glow (blur 8px).
- **Tertiary:** No background, `outline` border at 20%. On hover, the border opacity jumps to 100%.

### Data Chips: Status Indicators
- **Alert Chips:** Use `on_tertiary_container` (#c31f29) for text with a `surface_container_highest` background. No rounded corners (`0px`).
- **Active Track:** A 2px pulse animation using the `primary_fixed_dim` (#3cdcd1) color to indicate real-time signal processing.

### Input Fields: Monolith Style
- **Text Inputs:** Use `surface_container_lowest`. Forbid rounded corners. Use a 1px bottom-border only of `primary` when focused.
- **Labels:** Always use `label-sm` in `on_surface_variant` (#bacac7), positioned above the input in all-caps for a "blueprint" feel.

### Cards & Lists: The Separation Rule
- **No Dividers:** Prohibit horizontal lines between list items. Use a 0.4rem (`spacing-2`) vertical gap. 
- **Zebra Layering:** Use alternating background shifts between `surface_container_low` and `surface_container` to define list rows.

### Custom Component: The "HUD Coordinate Overlay"
- A floating, glassmorphic container with a `secondary` (#7bd6d1) 2px "corner bracket" detail in each of the four corners. This emphasizes the "targeting" nature of geospatial intelligence.

## 6. Do’s and Don’ts

### Do:
- **Embrace the Zero-Radius:** Every corner must be `0px`. This system is about sharpness and military precision.
- **Use Micro-Animations:** Data points should "flicker" or "slide" into view with 150ms ease-out transitions to simulate a high-speed processor.
- **Leverage Asymmetry:** Place a large map module next to a very narrow, dense column of scrolling data logs to create a professional, "expert-user" layout.

### Don't:
- **Don't use Rounded Corners:** Ever. It breaks the "tactical" illusion.
- **Don't use Soft Shadows:** They feel "consumer-tech." Use tonal shifts or subtle glows instead.
- **Don't use Center-Alignment:** It feels editorial or decorative. This is a tool; keep data hard-aligned to its container grid.
- **Don't use 100% White Text:** Except for primary buttons. Use `on_surface` (#e3e2e8) to reduce eye strain in dark "war room" environments.