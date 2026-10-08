# Bukid Direct

> Fresh from the Farm.

A clickable **interface prototype** of a farm-to-buyer marketplace for Cebu,
built for a Technopreneurship pitch. Farmers harvest what buyers order, and
buyers collect it the next afternoon at a **Pickup Hub** near them.

It is a demo of the UI only: no backend, no accounts, no payments. Every farm,
farmer, price, hub and order in it is invented. The street map is real, though,
and the whole thing works with the Wi-Fi off.

---

## Run it

```bash
npm install && npm run dev
```

Open the printed URL (usually `http://localhost:5173`). To check a production
build: `npm run build`.

---

## Demo keyboard shortcuts

| Key | What it does |
| --- | --- |
| **D** | Toggles the presenter panel: play the order day, step through it, switch Direct Plus on and off, fill a demo basket, jump to any key screen, reset everything. |
| **S** | Saves a screenshot: a PNG of the phone mockup (frame, shadow and whatever screen is showing) on a transparent background, at 3× resolution, ready for Canva. The file downloads as `bukid-direct-<screen>-<time>.png`. |
| **Esc** | Closes the panel. |

The presenter panel and the hints sit *outside* the phone, so they never appear
in a screenshot. If Chrome asks whether the site may **download multiple
files**, allow it once so every press of S saves a file.

---

## The demo story (Joy, buying for her family in Lahug)

1. **Splash** → moves on by itself after about 2 seconds.
2. **Onboarding** — how it works in three steps, then choose a Pickup Hub on
   the map. It opens on **Lahug Hub**, so one tap on *Start shopping* keeps the
   story moving.
3. **Shop** — "Maayong buntag, Joy!", category chips, *Picked this morning*,
   big product cards. Tap **+** on a card, or open one (try the tomatoes from
   Nong Romy) and use *Add to basket*.
4. **Basket** → **Checkout** → **Place order** → **"Salamat!"** with a 4-digit
   pickup code.
5. **Track my order**, then press **D** → **Play order day**. Over about 15
   seconds the order goes *Harvesting → On the way → Ready for pickup*, and the
   orange **Ready for pickup** screen takes over by itself.
6. **I'm on my way** → back to Orders → **I've picked it up**.
7. Extras for Q&A: **Hubs** (the map), **Direct Plus** (join, and every price
   turns green), **Farmer view** (Nong Romy's harvest list, drop-offs and
   earnings - reach it from Account or the panel).

**Reset everything** in the panel puts it back to the splash screen.

> The order day is **accelerated** - 15 seconds stands in for a night and a
> morning. Say so on stage if anyone asks.

---

## Brand

| | |
| --- | --- |
| Name | **Bukid Direct** |
| Tagline | Fresh from the Farm. |
| Subscription | **Direct Plus** |
| Pickup point | **Pickup Hub** |
| Tone | Friendly, trustworthy, local. Plain English with the occasional Bisaya touch: *Salamat!* on the order confirmation, *Andam na!* when the order is ready, *Maayong buntag* on the shop, *Nong/Nang* for the farmers. |
| Typeface | Plus Jakarta Sans - ExtraBold for headings and "Bukid", Regular for "Direct". |

### The logo

A location pin with a two-leaf sprout cut out of it - one colour, flat shapes
only, legible at 24px. Green on light backgrounds, white on green or dark ones.
The wordmark is **Bukid** in bold and Direct in regular weight, both in the same
green.

The mark is drawn once, in [`src/components/Logo.tsx`](src/components/Logo.tsx).
Everything else is generated from it:

```bash
npm run export:brand
```

writes `public/logo.svg` (the browser-tab icon) and everything in `brand/`:

| File | What |
| --- | --- |
| `logo-mark.svg` / `.png` | The mark in green |
| `logo-mark-white.svg` / `.png` | The mark in white, for dark backgrounds |
| `logo-wordmark.png` / `-white.png` | Mark + "Bukid Direct" |
| `app-icon.svg` / `.png` | Green rounded square, white mark |
| `color-palette.png` | The palette as one sheet, for slides |
| `colors.txt` | Hex codes, for typing into a Canva Brand Kit |

It needs a local Chrome or Edge for the PNGs (set `CHROME_PATH` if it cannot
find one).

---

## Changing the colours

**Every colour in the app lives in [`src/theme.css`](src/theme.css) and nowhere
else.** Edit the values in the `:root` block and the whole app follows -
screens, produce art, map, phone frame, and (after `npm run export:brand`) the
brand files.

```css
:root {
  --primary: #1F7A4D;    /* emerald green: headers, primary buttons    */
  --secondary: #6DBE6B;  /* leaf green: accents, chips, highlights     */
  --accent: #F29F3D;     /* warm orange: ONLY "ready for pickup" and
                            "harvested today". Never decoration.       */
  --danger: #C8442F;     /* errors, out of stock                        */
  --canvas: #FAFAF6;     /* warm off-white screen background            */
  /* ...plus soft/strong variants, neutrals, shadows and corner radii    */
}
```

House rules the app follows:

- **One clear primary button per screen.**
- **Orange means exactly two things:** *Ready for pickup* and *Harvested
  today*. Nothing else is orange, which is why those two moments stand out.
- **No blue anywhere.** Tailwind's built-in colours are switched off in the
  `@theme` block, so a stray `bg-blue-500` simply does not exist.

The `@theme` block in the same file maps the palette onto Tailwind class names
(`--primary` → `bg-primary`, `text-primary`, ...). You normally do not touch it.
Coming from FloodWatch: `safe` became `primary`, `alert` became `accent`, and
the water/rain tokens are gone.

---

## Changing the sample data

**All invented content lives in [`src/data/sample.ts`](src/data/sample.ts):**
the buyer, the four farms, the 17 products and their prices, the five Pickup
Hubs, the order stages and their timing, past orders, the Direct Plus plan and
the farmer view. Every total in the app is worked out from those numbers.

Placeholders worth settling before the pitch:

- `plusPlan.price` - **₱99/month** is a placeholder.
- `farmerShare` - **85%** of the produce price going to the farm is a
  placeholder; the app quotes it on onboarding and in the basket.
- `fees.hub` - the ₱25 Pickup Hub fee.

House rule: no invented statistics about Cebu or about farming in general.
Everything describes one made-up week for one made-up buyer and her four
made-up farms.

---

## The map

The Pickup Hub map draws 168 real Cebu City streets from
`src/data/roads.geojson` as plain SVG - no map tiles - so it works offline and
stays green and white. Hub pins are the logo mark. To refresh the street data
(needs internet; the app never does this):

```bash
npm run fetch:roads
```

Road geometry © OpenStreetMap contributors, ODbL 1.0. The attribution on the
map is required; please leave it in place.

---

## Layout

```
src/
├── theme.css              ← ALL colours, shadows, radii
├── index.css              ← Tailwind, base styles, animations
├── data/
│   ├── sample.ts          ← ALL invented content
│   ├── roads.geojson      ← real street geometry (generated, committed)
│   └── roads.ts           ← loads it
├── state/
│   ├── AppState.tsx       ← basket, order, order-day clock, Direct Plus
│   └── pricing.ts         ← every peso amount
├── components/            ← phone frame, logo, produce art, hub map, cards, UI bits
└── screens/               ← the fourteen screens
```

Screens: Splash · Onboarding · Shop · Product · Farm · Basket · Checkout ·
Salamat (order confirmed) · Orders · Ready for pickup · Pickup Hubs ·
Direct Plus · Farmer view · Account.

Built with React + Vite + TypeScript, Tailwind CSS v4, React Router and
lucide-react. The produce pictures are flat SVG drawn in code
(`src/components/ProduceArt.tsx`), and the font is installed as an npm package
rather than linked from Google Fonts, so nothing needs the internet.
