# PresGo

> Preskong Lokal, On the Go - Cebu's public markets, on your phone.

A clickable **interface prototype** of an online public market (*palengke*)
for Cebu, built for a Technopreneurship pitch (ES038, Group 3). The stalls of
Cebu City's public markets - Carbon, Pasil, Taboan and Pardo - list their
vegetables, fruit, meat, fish and seafood, root crops, rice and eggs, and
buyers order from home: no trip to the market, just a tap on the phone. Many
sellers are local producers - farmers and fishing families selling their own
harvest or catch.

A buyer fills one basket from many stalls. Each market's part is either
**delivered** by one rider - from a courier the buyer picks: **Maxim, Angkas
Padala or Lalamove** - or **picked up** at the stalls, like Delivery /
Pick-up on Grab and foodpanda. Buyer and stalls agree on the courier, the
time and the handoff before the stalls pack.

The app follows the pitch deck (Canva, "Presentation - PresGo") and its
revised problem statement. It started as Bukid Direct, a farms-only
marketplace - the repo and the Netlify address still carry that name.

It is a demo of the UI only: no backend, no accounts, no payments, no courier
integration. Every seller, listing, rider and order in it is invented, and the
prices are illustrative. The markets and the street map are real, though, and
the whole thing works with the Wi-Fi off.

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
| **S** | Saves a screenshot: a PNG of the phone mockup (frame, shadow and whatever screen is showing) on a transparent background, at 3× resolution, ready for Canva. The file downloads as `presgo-<screen>-<time>.png`. |
| **Esc** | Closes the panel. |

The presenter panel and the hints sit *outside* the phone, so they never appear
in a screenshot. If Chrome asks whether the site may **download multiple
files**, allow it once so every press of S saves a file.

---

## The demo story (Joy, buying for her family in Lahug)

1. **Splash** → moves on by itself after about 2 seconds.
2. **Onboarding** — *Fresh from the market*, with the deck's *How it helps*:
   **No middlemen**, **Tap to order**, **Fair prices**. Then *Delivery or
   Pick-up?* with her address on the map.
3. **Shop** — the Delivery | Pick-up switch, the categories (Vegetables,
   Meat, Fish & seafood, Fruits, Root crops, Rice & eggs), *Stalls selling
   today*, *Fresh this morning*, and every listing showing which stall sells
   it. Open the tomatoes: Nong Romy at Carbon sells them for ₱60, and *Also
   sold by* shows Nong Jun's at Pardo for ₱55 - comparing stalls without
   walking the market.
4. **Basket** (press **D** → *Fill basket* for the prepared one) — grouped by
   market, then by stall. From **Carbon Market**: Nong Romy's vegetables,
   Nang Lorna's pork belly and Nang Fe's pechay - three stalls, **one rider,
   one fare**. From **Pasil Fish Market**: Nong Berto's bangus, set to
   Pick-up.
5. **Checkout** — the deck's **Choose your delivery option**. For each
   market: Delivery or Pick-up, the courier (**Maxim, Angkas Padala or
   Lalamove**, each at its own fare for the trip, the cheapest marked) and
   the time. For the order: the **handoff** (*Hand it to me* or *Leave at the
   gate*). Each stall confirms these before packing. Switch a courier and the
   total changes. → **Place order** → **"Salamat!"**, with a pick-up code for
   the Pasil part.
6. **Track my order**, then **D** → **Play delivery day** (or **Next** to
   step). Over about 25 seconds: the four stalls **confirm** (*Agreed with
   Nong Romy, Nang Lorna and Nang Fe: Lalamove, tomorrow 11 AM – 1 PM*) and
   pack; once packed the **rider is booked** - Joy sees *Rhea M. · Lalamove ·
   ETA 11:35 AM*. The Pasil part turns orange - *Ready for pickup*, show the
   code at Stall 4 - and when the rider sets off, the **live map** takes
   over: from Carbon Market to Joy's door on real Cebu streets, with **Open in
   Lalamove** for live tracking and rider updates in the courier's own app.
   Then *Delivered!* and a star rating.
7. **Seller Center** (Account → *Sell on PresGo*, or the panel) — Nong Romy's
   stall, Stall 12 at Carbon Market: tomorrow's orders from several buyers,
   each with the courier and time the buyer picked. **Confirm 5 orders** →
   *Mark harvested and packed* (PresGo books each buyer's courier) → **Hand
   over to 4 riders**. The seller books nothing. *Plan your stock* shows what
   sold, where and when. Then **Add a listing**: pick a food, set a price
   (other stalls' prices are shown as a guide), publish - and it is in the
   shop. Under *Grow your sales*, **Feature tomatoes · ₱99** puts them in the
   shop's *Featured this week* row.
8. Extras for Q&A: the **Markets** tab (four markets and their stalls), a
   stall's page (where it is, whose harvest or catch it sells, reviews),
   **Direct Plus** (join, then *Fill basket*: the service fee goes, Nong
   Romy's and Nang Lorna's suki deals come off, and the welcome voucher pays
   the Carbon delivery).
9. **"How do you make money?"** - after an order is placed, the presenter
   panel shows *This order's money*: what the stalls, the couriers and PresGo
   each get from it. The full maths is [below](#how-presgo-makes-money).

**Reset everything** in the panel puts it back to the splash screen.

> The delivery day is **accelerated** - 25 seconds stands in for an evening of
> confirming, a morning of packing and a courier trip. Say so on stage if
> anyone asks.

---

## How delivery works (and why)

- **One rider per market.** The stalls in a market each pack their own part
  and hand it over at one spot - Carbon's F. Gonzales Street gate, for
  example - so a basket from three Carbon stalls is one stop, one rider and
  one fare.
- **The buyer picks the courier.** At checkout each market's part shows
  **Maxim, Angkas Padala and Lalamove**, each at its own fare for the trip -
  no markup - starting on the courier that market's stalls usually use.
  Buyers who find delivery too dear take the cheapest, or pick up for free.
- **Buyer and stalls agree** on the courier, the time and the handoff: the
  buyer chooses them at checkout, each stall confirms them in the Seller
  Center before it packs.
- **PresGo books the rider once the stalls have packed**, through the
  courier's business account, and pays the courier out of the buyer's
  payment. The buyer then sees the rider's name and estimated arrival time;
  live tracking and rider updates are in the courier's own app (*Open in
  Lalamove*). Sellers only pack and hand over; no warehouses or hubs to run.
- **Fares come from each courier's rate** applied to the road distance from
  the market on the map (`couriers` and each market's `km` in `sample.ts`),
  so ₱76–118 in the demo. Lalamove's are its published Cebu motorcycle rates -
  ₱49 base, ₱6 a km for the first 5 km, ₱5 a km after. **Maxim's and Angkas
  Padala's are placeholders**: neither publishes a Cebu rate card, so check
  their apps before the pitch. The real app shows each courier's live quote,
  which can include traffic or demand surcharges.
- **Pick-up is free**: the buyer shows one code at each stall, which has the
  bag ready.

Maxim, Angkas Padala and Lalamove are named in text only - no logos - and
nothing implies a partnership. Other couriers could be added if they offer a
business account.

---

## How PresGo makes money

Small cuts, on purpose - selling on PresGo should cost a stall far less than a
middleman. Every number lives in [`src/data/sample.ts`](src/data/sample.ts)
and every total in the app is worked out from them.

| Stream | Who pays | Sample value | Where it shows |
| --- | --- | --- | --- |
| Commission | the stall | **5%** of each sale (`sellerShare` = 0.95) | Seller Center: *You keep 95%* |
| Service fee | the buyer | **₱10** per order, however many stalls (`fees.service`) | Basket, Checkout |
| Direct Plus | the buyer | **₱49/month** (`plusPlan.price`) | Direct Plus screen |
| Featured listing | the stall, if it wants | **₱99/week** (`boost.price`), taken from its weekly pay-out | Seller Center, Shop |

Delivery fees are not income: the buyer pays the courier's fare and PresGo
passes it on to the courier.

### What Direct Plus gives, and who pays for it

| Perk | Paid by | Cost to PresGo |
| --- | --- | --- |
| No service fee | PresGo | ₱10 per order, not collected |
| Welcome voucher: one market's delivery free on the first order of ₱200 or more | PresGo | once per member, ₱76–118 in the sample data |
| Suki deals - members-only vouchers a stall posts for its regulars (e.g. ₱15 off ₱300) | the stall | nothing |
| First pick of the morning's catch and harvest | - | nothing |

**Why free delivery only once, not every month.** At a 5% commission a ₱500
order earns ₱25, and one courier trip costs ₱76–118. Free delivery every
month would cost more than a member brings in. The first draft - four free
deliveries a month, two ₱20 vouchers and 5% off everything - would have cost
about ₱460 a month per member against ₱149 coming in (₱49 + 5% of four ₱500
orders).

### The maths per buyer

These are **our assumptions, to test in a pilot** - not market data:

- an average order is ₱500 of food plus ₱80 delivery;
- payment processing costs about 2.5% of what the buyer pays (check your
  gateway's current GCash and card rates);
- non-members order twice a month, members four times.

| Per order | Non-member | Member |
| --- | --- | --- |
| Buyer pays | ₱590 (₱500 + ₱80 + ₱10) | ₱580 (no service fee) |
| Stalls keep | ₱475 | ₱475 |
| Courier gets | ₱80 | ₱80 |
| PresGo earns | ₱35 (₱25 + ₱10) | ₱25 |
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
| Food sold | 2,400 × ₱500 = ₱1,200,000 - stalls keep ₱1,140,000 |
| Commission, 5% | ₱60,000 |
| Service fees | 1,600 × ₱10 = ₱16,000 |
| Direct Plus | 200 × ₱49 = ₱9,800 |
| Featured listings | e.g. 20 stalls × ₱99 × 4 weeks = ₱7,920 |
| **Revenue** | **₱93,720** |
| Payment fees, about 2.5% | −₱35,400 |
| Welcome vouchers | e.g. 40 new members × ₱80 = −₱3,200 |
| **Left for running costs** | **about ₱55,000**, or about ₱55 per active buyer |

Running costs - hosting, SMS order updates, support, signing up stalls,
marketing - come out of that. **Break-even** = monthly running costs ÷ ₱55
per active buyer. For example, ₱40,000 a month of running costs (a
placeholder - use your own budget) needs about 730 active buyers.

Placeholders worth settling before the pitch: the four prices above, the
2.5% payment fee, each market's `km`, and the Maxim and Angkas Padala rates
in `couriers` - check all three couriers' current Cebu rates in their apps,
and check the food prices against DA-7's market price monitoring.

---

## Brand

| | |
| --- | --- |
| Name | **PresGo** (formerly Bukid Direct) |
| Tagline | Preskong Lokal, On the Go - *preskong lokal* is fresh and local |
| Line | Fresh from the market. No market trip. |
| Subscription | **Direct Plus** - the name the pitch deck uses |
| Tone | Friendly, trustworthy, local. Plain English with the occasional Bisaya touch: *Salamat!* on the order confirmation, *Andam na!* when a pick-up is ready, *Maayong buntag* on the shop, *Nong/Nang* for the sellers, Bisaya food names. |
| Typeface | Plus Jakarta Sans - ExtraBold for headings and the "PresGo" wordmark. |

### The logo

A location pin with a two-leaf sprout cut out of it - one colour, flat shapes
only, legible at 24px. Green on light backgrounds, white on green or dark ones.
The wordmark is **PresGo** in ExtraBold, in the same green - as on the pitch
deck. The same mark is the pin on the map.

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
| `logo-wordmark.png` / `-white.png` | Mark + "PresGo" |
| `app-icon.svg` / `.png` | Green rounded square, white mark |
| `color-palette.png` | The palette as one sheet, for slides |
| `colors.txt` | Hex codes, for typing into a Canva Brand Kit |

It needs a local Chrome or Edge for the PNGs (set `CHROME_PATH` if it cannot
find one).

---

## Changing the colours

**Every colour in the app lives in [`src/theme.css`](src/theme.css) and nowhere
else.** Edit the values in the `:root` block and the whole app follows -
screens, food art, map, phone frame, and (after `npm run export:brand`) the
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
the buyer and her address, the three couriers and their rates, the four
markets (where they are, how far from Joy, delivery times, pick-up hours),
the eight stalls with their suki deals and reviews, the 25 kinds of food, the
31 listings (several stalls offer the same food at different prices, two are
featured), the order stages and their timing, past orders, the fees, Direct
Plus, and the Seller Center with its *Plan your stock* figures. Every total
in the app is worked out from those numbers.

House rule: no invented statistics about Cebu or its markets. The money maths
above uses our own assumptions, labelled as such.

---

## The map

The map draws 168 real Cebu City streets from `src/data/roads.geojson` as plain
SVG - no map tiles - so it works offline and stays green and white. It shows
the buyer's address, a rider's route from the market on the live tracking
screen, and directions to a market for pick-up. Pasil Fish Market sits at its
Wikipedia position, Taboan at an approximate point on Tres de Abril Street.

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
│   ├── pricing.ts         ← every peso amount, split by market and stall
│   └── eta.ts             ← when a booked rider reaches the buyer
├── components/            ← phone frame, logo, food art, map, cards, UI bits
└── screens/               ← the sixteen screens
```

Screens: Splash · Onboarding · Shop · Listing · Stall · Markets · Basket ·
Checkout · Salamat (order confirmed) · Orders · Live tracking · Ready for
pickup · Direct Plus · Seller Center · New listing · Account.

Built with React + Vite + TypeScript, Tailwind CSS v4, React Router and
lucide-react. The food pictures are flat SVG drawn in code
(`src/components/ProduceArt.tsx`), and the font is installed as an npm package
rather than linked from Google Fonts, so nothing needs the internet.
