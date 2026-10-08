# Bukid Direct

> Fresh from the Farm.

A clickable **interface prototype** of a farm-to-table marketplace for Cebu,
built for a Technopreneurship pitch. Farmers sell directly to buyers, each from
their own shop. A buyer fills one basket from several farms, and each farm
either **delivers** its part - booking a Lalamove or Maxim rider - or lets the
buyer **pick it up** at the farm's stall or gate, like Delivery / Pick-up on
Grab and foodpanda.

It is a demo of the UI only: no backend, no accounts, no payments, no courier
integration. Every farm, farmer, listing, price, fee, rider and order in it is
invented. The street map is real, though, and the whole thing works with the
Wi-Fi off.

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
| **D** | Toggles the presenter panel: play the delivery day, step through it, jump to the moving rider or the orange pick-up screen, open the Seller Center, switch Direct Plus on and off, fill a demo basket, reset everything. |
| **S** | Saves a screenshot: a PNG of the phone mockup (frame, shadow and whatever screen is showing) on a transparent background, at 3× resolution, ready for Canva. The file downloads as `bukid-direct-<screen>-<time>.png`. |
| **Esc** | Closes the panel. |

The presenter panel and the hints sit *outside* the phone, so they never appear
in a screenshot. If Chrome asks whether the site may **download multiple
files**, allow it once so every press of S saves a file.

---

## The demo story (Joy, buying for her family in Lahug)

1. **Splash** → moves on by itself after about 2 seconds.
2. **Onboarding** — how the marketplace works, then *Delivery or Pick-up?*
   with her address on the map.
3. **Shop** — the Delivery | Pick-up switch, *Farms selling this week*,
   *Picked this morning*, and every listing showing which farm sells it.
   Open the tomatoes: Nong Romy sells them for ₱90, and *Also sold by* shows
   Nong Jun's for ₱85.
4. **Basket** (press **D** → *Fill basket* for the prepared one) — grouped by
   farm like Shopee. Nong Romy and Lito & Grace deliver by Lalamove, Nang Fe is
   set to Pick-up at her farm gate. Each farm shows its own fee and an
   *Add ₱X more for free delivery* nudge.
5. **Checkout** → **Place order** → **"Salamat!"**, with a pick-up code for
   Nang Fe's part.
6. **Track my order**, then **D** → **Play delivery day**. Over about 25
   seconds every farm harvests and packs; Nang Fe's part turns orange -
   *Ready for pickup* - and when the riders set off, the **live map** takes
   over: Nong Romy's Lalamove rider moving along real Cebu streets to Joy's
   door, then *Delivered!* and a star rating for the farm.
7. **Seller Center** (Account → *Sell on Bukid Direct*, or the panel) — the
   farmer's side: tomorrow's orders from several buyers, *Mark all as
   harvested* → *Mark packed* → **one shared Lalamove trip for all the city
   stops**. Then **Add a listing**: pick a produce, set a price (other farms'
   prices are shown as a guide), publish - and it is in the shop.
8. Extras for Q&A: **Farms** tab, a farm's store page with reviews, **Direct
   Plus** (join, and every price turns green).

**Reset everything** in the panel puts it back to the splash screen.

> The delivery day is **accelerated** - 25 seconds stands in for a morning of
> harvesting and a courier trip. Say so on stage if anyone asks.

---

## How delivery works (and why)

- **Farms book the courier.** Each farm packs its own part of an order and
  books a Lalamove or Maxim rider; there are no warehouses or hubs to run.
- **Far farms share one trip.** A farm in Dalaguete or Balamban puts all of
  the day's city orders into one multi-stop courier booking, so each buyer
  pays a share (₱79–89 in the sample data) instead of a whole trip.
- **Near farms deliver on demand**, e.g. Nang Fe in Busay by Maxim.
- **Every farm sets a free-delivery mark** and the basket nudges buyers
  towards it.
- **Pick-up is free** at farms that have a stall or farm gate in reach (Carbon
  Market, Pardo Market, Busay).

All of this lives in `farms` in [`src/data/sample.ts`](src/data/sample.ts):
courier, fee, free-delivery mark, delivery window, whether the trip is shared,
the rider, and the optional pickup point. Courier names are text only - no
logos - and nothing implies a partnership.

---

## Brand

| | |
| --- | --- |
| Name | **Bukid Direct** |
| Tagline | Fresh from the Farm. |
| Subscription | **Direct Plus** |
| Tone | Friendly, trustworthy, local. Plain English with the occasional Bisaya touch: *Salamat!* on the order confirmation, *Andam na!* when a pick-up is ready, *Maayong buntag* on the shop, *Nong/Nang* for the farmers, Bisaya produce names. |
| Typeface | Plus Jakarta Sans - ExtraBold for headings and "Bukid", Regular for "Direct". |

### The logo

A location pin with a two-leaf sprout cut out of it - one colour, flat shapes
only, legible at 24px. Green on light backgrounds, white on green or dark ones.
The wordmark is **Bukid** in bold and Direct in regular weight, both in the same
green. The same mark is the pin on the map.

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
- **Orange means exactly two things:** *Ready for pickup* (packed and waiting -
  for the rider, or for the buyer to collect) and *Harvested today*.
- **No blue anywhere.** Tailwind's built-in colours are switched off in the
  `@theme` block, so a stray `bg-blue-500` simply does not exist.

The `@theme` block in the same file maps the palette onto Tailwind class names
(`--primary` → `bg-primary`, `text-primary`, ...). You normally do not touch it.
Coming from FloodWatch: `safe` became `primary`, `alert` became `accent`, and
the water/rain tokens are gone.

---

## Changing the sample data

**All invented content lives in [`src/data/sample.ts`](src/data/sample.ts):**
the buyer and her address, the five farms and their delivery terms, the 17
kinds of produce, the 23 listings (several farms sell the same produce at
different prices), the order stages and their timing, past orders, Direct
Plus, and the Seller Center. Every total in the app is worked out from those
numbers.

Placeholders worth settling before the pitch:

- `plusPlan.price` - **₱99/month**, and `plusPlan.deliveryDiscount` - ₱50 off
  each farm's delivery.
- `farmerShare` - **85%** of the produce price going to the farm; the app
  quotes it in onboarding, the basket and the Seller Center.
- Each farm's `delivery.fee` and `delivery.freeOver` - illustrative; get real
  Lalamove / Maxim quotes for the actual routes.

House rule: no invented statistics about Cebu or about farming in general.

---

## The map

The map draws 168 real Cebu City streets from `src/data/roads.geojson` as plain
SVG - no map tiles - so it works offline and stays green and white. It shows
the buyer's address, a rider's route on the live tracking screen, and
directions to a pickup point.

Routes come from a small street router in
[`src/data/route.ts`](src/data/route.ts): it builds a graph from the street
geometry, joins streets that meet, and bridges two short connectors missing
from the export (Salinas Drive Extension to Gorordo Avenue, and the
Balamban side of the Transcentral Highway). Good enough for a believable line
on a demo map - not navigation.

To refresh the street data (needs internet; the app never does this):

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
│   ├── roads.ts           ← loads it
│   └── route.ts           ← street routing for the map
├── state/
│   ├── AppState.tsx       ← basket, orders, delivery-day clock, seller flow
│   ├── catalog.ts         ← everything for sale, incl. new listings
│   └── pricing.ts         ← every peso amount, split by farm
├── components/            ← phone frame, logo, produce art, map, cards, UI bits
└── screens/               ← the sixteen screens
```

Screens: Splash · Onboarding · Shop · Listing · Farm · Farms · Basket ·
Checkout · Salamat (order confirmed) · Orders · Live tracking · Ready for
pickup · Direct Plus · Seller Center · New listing · Account.

Built with React + Vite + TypeScript, Tailwind CSS v4, React Router and
lucide-react. The produce pictures are flat SVG drawn in code
(`src/components/ProduceArt.tsx`), and the font is installed as an npm package
rather than linked from Google Fonts, so nothing needs the internet.
