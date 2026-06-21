# Bundle Builder

**Test ID: 41091** — Frontend Take-Home (React)

A multi-step **bundle builder** with a **live review panel** beside it. Shoppers
assemble a home-security system through a 4-step accordion (cameras → plan →
sensors → extra protection) while a "Your security system" panel updates live
with line items, quantities, totals, savings, and persistence.

The whole UI is **data-driven** from a single JSON file — there is no hard-coded
per-product markup. It behaves like a real shop: every product can be added,
removed, recoloured, and re-quantified from both the card and the summary.

---

## Tech stack

| Area        | Choice                                              |
| ----------- | --------------------------------------------------- |
| Framework   | React 18 + TypeScript                               |
| Build tool  | Vite 5                                              |
| Styling     | CSS Modules + CSS custom properties (design tokens) |
| State       | A single custom hook (`useBundleBuilder`)           |
| Persistence | `localStorage` (no backend)                         |
| Icons       | Design PNGs with an inline-SVG fallback             |

No state-management or UI libraries were added — the app ships with only
`react` / `react-dom` as runtime dependencies.

---

## Getting started

> Requires **Node 18+** and npm.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build to /dist
npm run preview  # serve the production build locally
npm run typecheck # TypeScript only, no emit
```

It builds and runs from a clean clone. (If a partial `node_modules/` is present
from an interrupted install, delete it and run `npm install` again.)

---

## Project structure

```
src/
  components/
    Accordion/        AccordionStep        – one collapsible step + its product grid
    BundleBuilder/    BundleBuilder        – left column, renders the 4 steps
    Button/           Button               – reusable button (primary/secondary/ghost)
    ProductCard/      ProductCard          – data-driven product card
    QuantityStepper/  QuantityStepper      – reusable +/- stepper (cards AND review)
    ReviewItem/       ReviewItem           – one review-panel line + extra rows
    ReviewPanel/      ReviewPanel          – right column "Your security system"
    VariantSelector/  VariantSelector      – color chips with per-variant state
    icons/            Icons                – step icons (image + SVG fallback)
  data/
    bundle-products.json                   – the single source of truth
  hooks/
    useBundleBuilder.ts                    – all builder state + derived data
  types/
    bundle.ts                              – domain types
  utils/
    bundleState.ts                         – seed + localStorage load/save
    pricing.ts                             – selection + money math (no math in JSX)
    format.ts                              – currency formatting
  styles/
    variables.css                          – design tokens (colors, radii, spacing, type)
    global.css                             – resets + base styles
public/
  assets/                                  – product, variant, and icon images
  fonts/                                   – Gilroy font files
```

---

## How it works

### Data-driven rendering

Everything renders from `src/data/bundle-products.json`: the steps, the products
(title, description, image, price, compare-at price, variants + per-color
images), the seed quantities/active variants, and all review-panel copy
(shipping, financing, guarantee text). Adding or changing a product is a JSON
edit — no component changes required.

### State model

A single hook, `useBundleBuilder`, owns the state. Quantities are keyed by a
**line key**:

- products **with** variants: `productId:variantId` (e.g. `cam-v4:black`)
- products **without** variants: `productId` (e.g. `motion-sensor`)

```jsonc
{
  "activeVariants": { "cam-v4": "white" },
  "quantities": { "cam-v4:white": 1, "cam-pan-v3:white": 2, "motion-sensor": 2 }
}
```

Everything else is **derived** from this state + the JSON: the selected review
lines, the per-step "N selected" counts, and all totals. The product-card
stepper and the review-panel stepper edit the *same* underlying quantity, so
they stay perfectly in sync.

### Variant model (independent per-variant quantities)

Each variant has its **own** quantity. The card stepper is bound to the
**currently selected** variant:

- Select Red, add 2 → `cam:red = 2`.
- Switch to Blue → the stepper reads 0; Red stays 2.
- The review panel lists Red ×2 and (once added) Blue ×1 as **separate lines**.

A product counts as "selected" (highlighted border) when **any** of its variants
has quantity > 0. The "N selected" indicator counts **distinct products**, so a
product with two selected colours still counts once.

Color chips show a small product photo per colour. The card's main image always
reflects the **currently selected** colour (white by default) and switches the
moment another chip is picked.

### Accordion + counters

Step 1 (cameras) is open on load. Steps expand/collapse, each header shows
"STEP X OF 4", an icon, the title, and a right-side state indicator
("N selected" + up-chevron when open, down-chevron when collapsed). Each open
step ends with a "Next: …" button that advances to the following step.

### Persistence — "Save my system for later"

Clicking **Save my system for later** writes the current configuration
(quantities + active variants) to `localStorage` under `wyze-bundle-builder:v1`
and shows a "Saved ✓" confirmation. On load, a saved configuration is restored
exactly; otherwise the app falls back to the seed state from JSON so first-time
visitors always see the designed default. Only the user's *configuration* is
stored — product data always comes from JSON, and seed variant defaults are
merged in so a newer data file stays compatible with an older saved payload.

### Pricing

All money math lives in `utils/pricing.ts` (never in JSX): line totals,
subtotal, compare-at total, and savings. Totals recalculate immediately on any
quantity change. With the seeded configuration the panel shows
**total $217.81**, pre-discount **$238.81**, **savings $21.00**.

The "Save X%" badge is **computed** from each product's own prices —
`round((compareAt − price) / compareAt)` — so the percentage can never disagree
with the line pricing or the savings total.

### Responsiveness

Desktop is a two-column layout (builder + sticky review rail). The builder cards
reflow from ~2 across down to a single column as space shrinks, and the review
panel stacks beneath the builder at ≤980px. The review rows use **CSS container
queries**, so they respond to the *panel's* width (not the viewport) — that
keeps long product names and the `/mo` plan price from colliding when the panel
is a narrow rail (e.g. at ~1024px). A viewport-based fallback covers browsers
without container-query support. No horizontal scrolling at any width. On large
screens (≥1200px) a step with an odd number of cards centers its lone last card,
matching the design (e.g. the 5th camera in step 1).

---

## Decisions & tradeoffs

- **Two-column layout (Figma frame 1735).** The brief describes a two-column
  experience ("a live review panel beside it"), so the builder is the left
  column and the review panel is a sticky right rail. The Figma includes two
  card treatments — a full-width 5-across layout (frame 1736, vertical cards) and
  a two-column layout (frame 1735, **image-left** cards). The two-column /
  image-left reading was used as the primary, per the brief.
- **Fully interactive shop.** Every product — cameras, plan, sensors, accessory
  — can be added, removed, recoloured, and re-quantified from both the card and
  the summary, with the cart and totals updating live. The original mock showed
  the **Wyze Sense Hub** as a *Required / FREE* item with a disabled stepper; by
  product direction this was changed to a normal, removable **$29.92** product so
  nothing is locked or free. Because of that, the seeded totals differ from the
  static mock ($187.89): they are computed live and currently land at **$217.81 /
  $238.81 / $21.00**.
- **Pricing source.** The mock's per-line figures aren't all internally
  consistent (the Pan v3 card shows one unit price while its review line implies
  another). Pan v3 uses the **$23.99 / $28.99** unit price implied by the review
  line, and the plan's monthly price is included in the bundle total. All numbers
  are derived from unit prices in `bundle-products.json`, so they stay correct as
  quantities change.
- **Typography.** Headings use the real **Gilroy ExtraBold** (the free weight,
  bundled in `public/fonts/`); body text uses **Inter** because Gilroy
  Medium/SemiBold are paid weights. Swap in those files and point `--font-sans`
  at `"Gilroy"` to go fully Gilroy.
- **Icons.** Step icons load the design PNGs from `public/assets/icons/` and fall
  back to matching inline SVGs if a file is missing — no icon-library dependency.
- **Badges are computed, not hardcoded.** The "Save X%" badge is derived from
  each product's own prices — `round((compareAt − price) / compareAt)` — so the
  percentage can never disagree with the actual discount or the savings in the
  review panel. It's a CSS-styled element (`#4E2FD2`, 10px radius), not painted
  into the images, and the shipping row uses the supplied truck image in place of
  an inline SVG.
- **Explicit save** (rather than auto-persisting every change) to match the
  "Save my system for later" interaction precisely; persistence lives in
  `utils/bundleState.ts`.

## Assumptions / notes

- **Steps 2–4 content.** Only Step 1 (cameras) is shown expanded in the Figma;
  Steps 2–4 appear collapsed. They were populated only with the real products the
  review panel establishes (Cam Unlimited; Motion Sensor + Sense Hub; MicroSD
  Card) — nothing invented — reusing the Step 1 card style.
- **Imagery / font weights** come from the provided exports; higher-resolution
  art and the paid Gilroy weights would sharpen things further but aren't
  required for the prototype.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). Uses CSS Grid,
custom properties, container queries (with a viewport fallback), and
`localStorage`.
