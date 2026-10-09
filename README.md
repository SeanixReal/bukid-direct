# Bukid Direct

> Your suki, one tap away

A clickable **interface prototype** of a local food marketplace for Cebu,
built for a Technopreneurship pitch. Cebu farmers sell fruit and vegetables
directly to buyers - no middleman, no trip to the market, just a tap on the
phone. A buyer fills one basket from several farms, and each farm's part is
either **delivered** by Lalamove or **picked up** at the farm's stall or gate,
like Delivery / Pick-up on Grab and foodpanda.

It is a demo of the UI only: no backend, no accounts, no payments, no courier
integration. Every farm, listing, rider and order in it is invented, and the
prices are illustrative. The street map is real, though, and the whole thing works with the
Wi-Fi off.

---

## Run it

```bash
npm install && npm run dev
```

Open the printed URL (usually `http://localhost:5173`). To check a production
build: `npm run build`.

**Live demo: <https://bukid-direct.netlify.app>** - hosted on Netlify
(`netlify.toml` holds the build settings).

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
3. **Shop** — the Delivery | Pick-up switch, *Selling this week*, *Fresh this
   morning*, and every listing showing which farm sells it.
   Open the tomatoes: Nong Romy sells them for ₱60, and *Also sold by* shows
   Nong Jun's for ₱55.
4. **Basket** (press **D** → *Fill basket* for the prepared one) — grouped by
   farm like Shopee. Nong Romy's vegetables and Lito & Grace's mangoes come by
   Lalamove, Nang Fe's greens are set to Pick-up at her farm gate. Each farm
   shows its delivery fee - Lalamove's fare for the trip - and an *Add ₱X
   more* nudge.
5. **Checkout** → **Place order** → **"Salamat!"**, with a pick-up code for
   Nang Fe's part.
6. **Track my order**, then **D** → **Play delivery day**. Over about 25
   seconds every farm packs; Nang Fe's part turns orange - *Ready for
   pickup* - and when the riders set off, the **live map** takes over: Nong
   Romy's Lalamove rider going from his Carbon Market stall to Joy's door on
   real Cebu streets, then *Delivered!* and a star rating.
7. **Seller Center** (Account → *Sell on Bukid Direct*, or the panel) — the
   farmer's side: tomorrow's orders from several buyers, *Mark all as
   harvested* → *Mark packed* → **Hand over to the riders**. Bukid Direct
   booked the riders when the buyers paid, so the farmer books nothing. Then
   **Add a listing**: pick a produce, set a price (other sellers' prices are
   shown as a guide), publish - and it is in the shop. Under *Grow your
   sales*, **Feature tomatoes · ₱99** puts them in the shop's *Featured this
   week* row.
8. Extras for Q&A: **Farms** tab, a farm's page with reviews, **Direct
   Plus** (join, then *Fill basket*: the service fee goes, Nong Romy's suki
   deal comes off, and the welcome voucher pays Nong Romy's delivery).
9. **"How do you make money?"** - after an order is placed, the presenter
   panel shows *This order's money*: what the farms, Lalamove and Bukid
   Direct each get from it. The full maths is [below](#how-bukid-direct-makes-money).

**Reset everything** in the panel puts it back to the splash screen.

> The delivery day is **accelerated** - 25 seconds stands in for a morning of
> packing and a Lalamove trip. Say so on stage if anyone asks.

---

## How delivery works (and why)

- **Bukid Direct books Lalamove for the farm.** At checkout the app asks
  Lalamove's business API for the trip's price and shows exactly that - no
  markup. When the buyer pays, the rider is booked for the next morning, and
  Bukid Direct pays Lalamove out of the buyer's payment. The farmer only packs
  and hands over; no warehouses or hubs to run.
- **Far farms hand over in the city.** Farms in Dalaguete, Balamban or
  Carcar bring the day's orders to a city spot - Nong Romy's Carbon Market
  stall, for example - and the riders collect them there, so each buyer pays
  a short city trip.
- **Fees follow Lalamove's published Cebu motorcycle rates** - ₱49 base, ₱6 a
  km for the first 5 km, ₱5 a km after - applied to the road distance on the
  map (`lalamoveFare` in `sample.ts`), so ₱68–106 in the demo. The real app
  shows the live quote, which can include traffic or demand surcharges.
- **Every farm sets a free-delivery mark** (the farm then pays the rider),
  and the basket nudges buyers towards it.
- **Pick-up is free** at farms with a stall or gate in reach (Carbon Market,
  Pardo Market, Busay).

Lalamove is named in text only - no logo - and nothing implies a partnership.
Maxim and other couriers could be added if they offer a business account.

---

## How Bukid Direct makes money

Small cuts, on purpose - the point is that farmers sell without paying a
middleman. Every number lives in [`src/data/sample.ts`](src/data/sample.ts)
and every total in the app is worked out from them.

| Stream | Who pays | Sample value | Where it shows |
| --- | --- | --- | --- |
| Commission | the farm | **5%** of each sale (`farmerShare` = 0.95) | Seller Center: *You keep 95%* |
| Service fee | the buyer | **₱10** per order, however many farms (`fees.service`) | Basket, Checkout |
| Direct Plus | the buyer | **₱49/month** (`plusPlan.price`) | Direct Plus screen |
| Featured listing | the farm, if it wants | **₱99/week** (`boost.price`), taken from its weekly pay-out | Seller Center, Shop |

Delivery fees are not income: the buyer pays Lalamove's fare and Bukid Direct
passes it on to Lalamove.

### What Direct Plus gives, and who pays for it

| Perk | Paid by | Cost to Bukid Direct |
| --- | --- | --- |
| No service fee | Bukid Direct | ₱10 per order, not collected |
| Welcome voucher: one seller's delivery free on the first order of ₱200 or more | Bukid Direct | once per member, ₱68–106 in the sample data |
| Suki deals - members-only vouchers a farm posts for its regulars (e.g. ₱15 off ₱150) | the farm | nothing |
| First pick of new harvests, farm visit days | - | nothing |

**Why free delivery only once, not every month.** At a 5% commission a ₱500
order earns ₱25, and one Lalamove trip costs ₱68–106. Free delivery every
month would cost more than a member brings in. The first draft - four free
deliveries a month, two ₱20 vouchers and 5% off everything - would have cost
about ₱460 a month per member against ₱149 coming in (₱49 + 5% of four ₱500
orders).

### The maths per buyer

These are **our assumptions, to test in a pilot** - not market data:

- an average order is ₱500 of produce plus ₱80 delivery;
- payment processing costs about 2.5% of what the buyer pays (check your
  gateway's current GCash and card rates);
- non-members order twice a month, members four times.

| Per order | Non-member | Member |
| --- | --- | --- |
| Buyer pays | ₱590 (₱500 + ₱80 + ₱10) | ₱580 (no service fee) |
| Farm keeps | ₱475 | ₱475 |
| Courier gets | ₱80 | ₱80 |
| Bukid Direct earns | ₱35 (₱25 + ₱10) | ₱25 |
| Payment fee, 2.5% | −₱15 | −₱15 |
| **Left per order** | **₱20** | **₱10** |

| Per month | Non-member | Member |
| --- | --- | --- |
| From orders | 2 × ₱20 = ₱40 | 4 × ₱10 = ₱40 |
| Direct Plus, after its payment fee | - | ₱48 |
| **Left per buyer** | **₱40** | **₱88** |
| Welcome voucher, once | - | about −₱80, paid back in the first month |

So a member is worth about twice a non-member, and Direct Plus never loses
money: even a member who orders once a month leaves ₱58. It only earns less
than the service fee would once a member orders five or more times a month -
and those are the buyers worth keeping.

### A month at pilot size (example)

1,000 active buyers, 200 of them members - an example, not a forecast:

| | |
| --- | --- |
| Orders | 800 × 2 + 200 × 4 = 2,400 |
| Produce sold | 2,400 × ₱500 = ₱1,200,000 - farms keep ₱1,140,000 |
| Commission, 5% | ₱60,000 |
| Service fees | 1,600 × ₱10 = ₱16,000 |
| Direct Plus | 200 × ₱49 = ₱9,800 |
| Featured listings | e.g. 20 farms × ₱99 × 4 weeks = ₱7,920 |
| **Revenue** | **₱93,720** |
| Payment fees, about 2.5% | −₱35,400 |
| Welcome vouchers | e.g. 40 new members × ₱80 = −₱3,200 |
| **Left for running costs** | **about ₱55,000**, or about ₱55 per active buyer |

Running costs - hosting, SMS order updates, support, signing up farms,
marketing - come out of that. **Break-even** = monthly running costs ÷ ₱55
per active buyer. For example, ₱40,000 a month of running costs (a
placeholder - use your own budget) needs about 730 active buyers.

Placeholders worth settling before the pitch: the four prices above, the
2.5% payment fee, and each farm's `delivery.fee` and `delivery.freeOver` -
check Lalamove's current Cebu rates, and check the produce prices against
DA-7's market price monitoring.

---

## Brand

| | |
| --- | --- |
| Name | **Bukid Direct** |
| Tagline | Your suki, one tap away |
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
                            "fresh today". Never decoration.           */
  --danger: #C8442F;     /* errors, out of stock                        */
  --canvas: #FAFAF6;     /* warm off-white screen background            */
  /* ...plus soft/strong variants, neutrals, shadows and corner radii    */
}
```

House rules the app follows:

- **One clear primary button per screen.**
- **Orange means exactly two things:** *Ready for pickup* (packed and waiting -
  for the rider, or for the buyer to collect) and *Fresh today*.
- **No blue anywhere.** Tailwind's built-in colours are switched off in the
  `@theme` block, so a stray `bg-blue-500` simply does not exist.

The `@theme` block in the same file maps the palette onto Tailwind class names
(`--primary` → `bg-primary`, `text-primary`, ...). You normally do not touch it.
Coming from FloodWatch: `safe` became `primary`, `alert` became `accent`, and
the water/rain tokens are gone.

---

## Changing the sample data

**All invented content lives in [`src/data/sample.ts`](src/data/sample.ts):**
the buyer and her address, the five farms
with their delivery terms and suki deals, the 17 kinds of produce, the 23
listings (several farms offer the same produce at different prices, two are
featured), the order stages and their
timing, past orders, the fees, Direct Plus, and the Seller Center. Every
total in the app is worked out from those numbers.

House rule: no invented statistics about Cebu or about farming in general.
The money maths above uses our own assumptions, labelled as such.

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
