/* ==========================================================================
   PresGo - sample content
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE WITH SAMPLE DATA. Street geometry for the map comes
   from OpenStreetMap (src/data/roads.geojson) and the four markets are real
   Cebu City public markets; everything else - sellers, stalls, listings,
   prices, riders, orders, people - is invented.

   How the marketplace works:
     - PresGo puts Cebu's public markets on the phone. Every seller is a
       stall in a public market - Carbon, Pasil, Taboan or Pardo - with its
       own listings, prices and suki deals. Many are local producers: farmers
       and fishing families selling their own harvest or catch.
     - Vegetables, fruit, meat, fish and seafood, root crops, rice and eggs -
       and the same food from several stalls at different prices.
     - A buyer fills one basket from many stalls. Each market's part comes
       with one rider, from a courier the buyer picks - Maxim, Angkas Padala
       or Lalamove - or is picked up at the stalls, like Delivery / Pick-up
       on Grab or foodpanda.
     - Buyer and stalls agree on the courier, the time and the handoff: the
       buyer chooses them at checkout and each stall confirms before packing.
     - Once the stalls have packed, PresGo books the chosen courier at its
       own fare. The rider collects from every stall in that market in one
       stop.

   House rules for anything written in this file:
     - Plain English, with the occasional Bisaya touch in labels
       ("Salamat!", "Nong Romy", "Kamatis"). No slang overload.
     - No invented statistics about Cebu or about its markets in general.
     - Prices, fees and distances are illustrative. Change them freely -
       every total in the app is worked out from these numbers.
   ========================================================================== */

export type LatLng = [number, number]

/* --- Brand ---------------------------------------------------------------- */

export const brand = {
  name: 'PresGo',
  /* "Preskong lokal" - fresh and local, in Bisaya. */
  tagline: 'Preskong Lokal, On the Go',
  plus: 'Direct Plus',
}

/* --- The person using the app --------------------------------------------- */

export const user = {
  firstName: 'Joy',
  fullName: 'Joy Cabahug',
  initials: 'JC',
  mobile: '0917 ••• 2741',
  since: 'On PresGo since August',
  address: {
    label: 'Home',
    street: 'Salinas Drive',
    area: 'Lahug, Cebu City',
    note: 'Green gate beside the bakery',
  },
}

/* Joy's home, on Salinas Drive - where couriers deliver and "You" sits on
   the map. It is on a real street so the rider's route ends at the door. */
export const homeAt: LatLng = [10.32701, 123.90608]

/** A Bisaya hello that matches the time of day. */
export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Maayong buntag'
  if (h < 18) return 'Maayong hapon'
  return 'Maayong gabii'
}

/* --- How the week works ----------------------------------------------------
   Order tonight, the stalls pack in the morning, the order arrives (or is
   ready to collect) tomorrow. Kept relative so the demo never shows a stale
   date. */

export const schedule = {
  cutoff: '9 PM tonight',
  day: 'Tomorrow',
}

/* --- Money ------------------------------------------------------------------
   How PresGo earns - kept small on purpose, so selling on PresGo costs a
   stall far less than a middleman. All PLACEHOLDERS: check them against real
   payment-gateway and courier rates before the pitch. The worked-out maths
   per buyer and per month is in the README. */

/* Share of every peso of food that goes to the stall. PresGo's only cut from
   sellers is a 5% commission. */
export const sellerShare = 0.95

export const fees = {
  /* Paid by the buyer, once per order however many stalls and markets it
     comes from - roughly what the payment fee on an order costs us. Waived
     for Direct Plus members. */
  service: 10,
}

/* A stall can pay to show a listing in the shop's Featured row. Optional,
   and taken from the stall's weekly pay-out. */
export const boost = {
  price: 99,
  period: 'week',
}

export const plusPlan = {
  name: 'Direct Plus',
  price: 49,
  period: 'month',
  /* Welcome voucher, once per member: PresGo pays one market's delivery (the
     dearest) on the first order of ₱200 or more. Once, not every month - at
     a 5% commission, monthly free delivery would cost more than a member
     brings in. */
  welcome: { minSpend: 200 },
  perks: [
    { id: 'fee', title: 'No service fee', detail: 'Save ₱10 every order' },
    { id: 'welcome', title: 'Free first delivery', detail: 'On an order of ₱200 or more' },
    { id: 'suki', title: 'Suki deals', detail: 'Members-only vouchers from stalls' },
    { id: 'early', title: 'First pick', detail: "Order the morning's catch and harvest first" },
  ],
}

/* --- Delivery ----------------------------------------------------------------
   The buyer picks the courier for each market's part of an order: Maxim,
   Angkas Padala or Lalamove, at the courier's own fare - PresGo adds nothing
   on top. The stalls confirm the courier, time and handoff; once they have
   packed, PresGo books that courier, and the buyer sees the rider's name and
   arrival time. Live tracking and rider updates are in the courier's own
   app. Names only: no logos, and nothing here implies a partnership. */

export type CourierId = 'maxim' | 'angkas' | 'lalamove'

export interface Courier {
  id: CourierId
  name: string
  /* Motorcycle fare for a trip of `km` road kilometres. Traffic and demand
     surcharges can apply - the real app shows each courier's live quote. */
  fare: (km: number) => number
}

/* In the order the pitch deck names them. */
export const couriers: Courier[] = [
  /* PLACEHOLDER rate: Maxim does not publish a Cebu rate card. Check the
     Maxim app before the pitch. */
  { id: 'maxim', name: 'Maxim', fare: (km) => Math.round(45 + 6.5 * km) },
  /* PLACEHOLDER rate: check the Angkas app for current Cebu Padala fares. */
  { id: 'angkas', name: 'Angkas Padala', fare: (km) => Math.round(52 + 8 * Math.max(0, km - 2)) },
  /* Lalamove's published motorcycle rates for Cebu: ₱49 base, ₱6 a km for
     the first 5 km, ₱5 a km after that. */
  {
    id: 'lalamove',
    name: 'Lalamove',
    fare: (km) => Math.round(49 + 6 * Math.min(km, 5) + 5 * Math.max(0, km - 5)),
  },
]

/** "Maxim, Angkas Padala or Lalamove" */
export const courierNames = `${couriers
  .slice(0, -1)
  .map((c) => c.name)
  .join(', ')} or ${couriers[couriers.length - 1].name}`

/* How the rider hands the order over - agreed along with the courier and
   the time. */
export type HandoffId = 'hand' | 'gate'

export const handoffs: { id: HandoffId; label: string }[] = [
  { id: 'hand', label: 'Hand it to me' },
  { id: 'gate', label: 'Leave at the gate' },
]

/* A delivery time the stalls offer, the day after ordering: [from, to] in
   24-hour clock hours. */
export type Slot = [number, number]

export type Mode = 'delivery' | 'pickup'

/* --- Markets ------------------------------------------------------------------
   Real Cebu City public markets. Positions are for the demo map: Pasil's is
   from Wikipedia, Taboan's is a point on Tres de Abril Street (approximate),
   Carbon's and Pardo's sit at stalls on the market's edge. `km` is the road
   distance to Joy's home on the street map, from src/data/route.ts. */

export type MarketId = 'carbon' | 'pasil' | 'taboan' | 'pardo'

export interface Market {
  id: MarketId
  name: string
  /* For tight spots: "Carbon". */
  short: string
  area: string
  /* What it is known for, on the markets list. */
  known: string
  at: LatLng
  km: number
  /* The courier this market's stalls usually hand over to: the default at
     checkout. */
  usual: CourierId
  /* Where the stalls hand a delivery to the rider - one stop for the whole
     market. */
  handover: string
  /* Delivery times the stalls offer. The first is the default. */
  slots: Slot[]
  /* When buyers can collect from the stalls, the day after ordering. */
  hours: string
  /* The rider the demo shows for this market. */
  rider: { name: string; plate: string }
}

export const markets: Market[] = [
  {
    id: 'carbon',
    name: 'Carbon Market',
    short: 'Carbon',
    area: 'Downtown Cebu City',
    known: "Cebu City's oldest and biggest market",
    at: [10.29296, 123.90033],
    km: 5.0,
    usual: 'lalamove',
    handover: 'the F. Gonzales Street gate',
    slots: [
      [11, 13],
      [15, 17],
    ],
    hours: '6 AM – 6 PM',
    rider: { name: 'Rhea M.', plate: 'GAJ 2716' },
  },
  {
    id: 'pasil',
    name: 'Pasil Fish Market',
    short: 'Pasil',
    area: 'Suba, Cebu City',
    known: 'The morning catch from the Visayan seas',
    at: [10.28964, 123.89142],
    km: 5.8,
    usual: 'maxim',
    handover: 'the Belgium Street entrance',
    slots: [
      [8, 10],
      [10, 12],
    ],
    hours: '5 – 11 AM',
    rider: { name: 'Mae C.', plate: 'GBC 3391' },
  },
  {
    id: 'taboan',
    name: 'Taboan Public Market',
    short: 'Taboan',
    area: 'San Nicolas, Cebu City',
    known: 'Danggit and dried fish',
    at: [10.29517, 123.8929],
    km: 5.0,
    usual: 'angkas',
    handover: 'the Tres de Abril Street side',
    slots: [
      [10, 12],
      [14, 16],
    ],
    hours: '7 AM – 6 PM',
    rider: { name: 'Dennis A.', plate: 'KAB 5530' },
  },
  {
    id: 'pardo',
    name: 'Pardo Public Market',
    short: 'Pardo',
    area: 'Pardo, Cebu City',
    known: 'The south side neighbourhood market',
    at: [10.27429, 123.85005],
    km: 10.3,
    usual: 'maxim',
    handover: 'the N. Bacalso Avenue side',
    slots: [
      [9, 11],
      [14, 16],
    ],
    hours: '6 AM – 12 NN',
    rider: { name: 'Kim L.', plate: 'NAC 7302' },
  },
]

/* --- Sellers: the stalls -------------------------------------------------------- */

export interface Seller {
  id: string
  owner: string
  /* How buyers know them. */
  call: string
  initials: string
  marketId: MarketId
  stall: string
  /* What the stall sells, in a few words. */
  sells: string
  /* For a local producer selling their own harvest or catch. */
  own?: string
  story: string
  rating: number
  reviewCount: number
  sold: string
  /* A members-only voucher the stall chooses to post for its regulars - its
     suki. Paid by the stall, like a seller voucher on Shopee. */
  sukiDeal?: { off: number; minSpend: number }
  reviews: { name: string; stars: number; text: string }[]
}

export const sellers: Seller[] = [
  {
    id: 'romy',
    owner: 'Romy Alcoseba',
    call: 'Nong Romy',
    initials: 'RA',
    marketId: 'carbon',
    stall: 'Stall 12, F. Gonzales Street side',
    sells: 'Highland vegetables',
    own: 'Grows them in Mantalongon, Dalaguete',
    story: 'Highland vegetables from the slopes his father farmed, brought down to his stall before dawn.',
    rating: 4.9,
    reviewCount: 312,
    sold: '1.2k sold',
    sukiDeal: { off: 10, minSpend: 200 },
    reviews: [
      { name: 'Marites C.', stars: 5, text: 'Tomatoes lasted a whole week. Packed well too.' },
      { name: 'Jun T.', stars: 5, text: 'Sweetest carrots I have bought in the city.' },
    ],
  },
  {
    id: 'fe',
    owner: 'Fe Tabanao',
    call: 'Nang Fe',
    initials: 'FT',
    marketId: 'carbon',
    stall: 'Stall 18, vegetable section',
    sells: 'Leafy greens',
    own: 'Grows them on terraces in Busay',
    story: 'Leafy greens cut at first light above the city and at her stall by six, still crisp.',
    rating: 4.8,
    reviewCount: 208,
    sold: '860 sold',
    sukiDeal: { off: 10, minSpend: 150 },
    reviews: [
      { name: 'Liza P.', stars: 5, text: 'The lettuce was still cold when it arrived.' },
      { name: 'Ernie L.', stars: 4, text: 'Fresh pechay, generous bundles.' },
    ],
  },
  {
    id: 'lorna',
    owner: 'Lorna Villacarlos',
    call: 'Nang Lorna',
    initials: 'LV',
    marketId: 'carbon',
    stall: 'Stall 31, meat section',
    sells: 'Pork, chicken and beef',
    story: 'Three generations at the meat section. Pork from backyard raisers in Carcar, chicken dressed every morning.',
    rating: 4.8,
    reviewCount: 264,
    sold: '1.5k sold',
    sukiDeal: { off: 15, minSpend: 300 },
    reviews: [
      { name: 'Mila G.', stars: 5, text: 'Liempo with just the right fat, cut the way I asked.' },
      { name: 'Boy S.', stars: 5, text: 'Chicken came cleaned and cut for tinola.' },
    ],
  },
  {
    id: 'ybanez',
    owner: 'Lito & Grace Ybañez',
    call: 'Lito & Grace',
    initials: 'LG',
    marketId: 'carbon',
    stall: 'Stall 44, fruit section',
    sells: 'Mangoes and fruit',
    own: 'From their orchard in Balamban',
    story: 'A family orchard of old mango trees, with saba, calamansi and kamote in between.',
    rating: 4.7,
    reviewCount: 145,
    sold: '540 sold',
    reviews: [
      { name: 'Cora M.', stars: 5, text: 'Mangoes ripened perfectly in two days.' },
      { name: 'Rico D.', stars: 4, text: 'Good saba, a few were small.' },
    ],
  },
  {
    id: 'ernie',
    owner: 'Ernie Pepito',
    call: 'Nong Ernie',
    initials: 'EP',
    marketId: 'carbon',
    stall: 'Stall 27, rice and eggs',
    sells: 'Rice, eggs and lowland vegetables',
    own: 'From his farm in Carcar',
    story: 'Lowland vegetables and free-range hens. Eggs are collected the day before they sell.',
    rating: 4.8,
    reviewCount: 176,
    sold: '700 sold',
    sukiDeal: { off: 15, minSpend: 250 },
    reviews: [
      { name: 'Mila G.', stars: 5, text: 'Eggs with bright orange yolks. Will reorder.' },
      { name: 'Boy S.', stars: 5, text: 'Talong was young and tender.' },
    ],
  },
  {
    id: 'berto',
    owner: 'Berto Ompad',
    call: 'Nong Berto',
    initials: 'BO',
    marketId: 'pasil',
    stall: 'Stall 4, near the main gate',
    sells: 'Fish and seafood',
    own: "His family's catch from Cordova",
    story: 'A fishing family from Cordova. The catch lands at Pasil before dawn and sells the same morning.',
    rating: 4.8,
    reviewCount: 87,
    sold: '320 sold',
    reviews: [
      { name: 'Annie R.', stars: 5, text: 'The squid still had its shine. So fresh.' },
      { name: 'Oscar D.', stars: 5, text: 'Bangus came cleaned and scaled, as asked.' },
    ],
  },
  {
    id: 'cita',
    owner: 'Lucita Abellana',
    call: 'Nang Cita',
    initials: 'LA',
    marketId: 'taboan',
    stall: 'Stall 9, dried fish row',
    sells: 'Danggit and dried fish',
    own: 'Sun-dried by her family in Bantayan',
    story: 'Danggit and squid sun-dried by her family in Bantayan, sold from the same Taboan stall for years.',
    rating: 4.9,
    reviewCount: 190,
    sold: '980 sold',
    sukiDeal: { off: 20, minSpend: 400 },
    reviews: [
      { name: 'Rosa L.', stars: 5, text: 'Crispy danggit, not too salty. Packed for the trip.' },
      { name: 'Dan P.', stars: 4, text: 'Good dried squid, a little pricey.' },
    ],
  },
  {
    id: 'jun',
    owner: 'Jun Cañete',
    call: 'Nong Jun',
    initials: 'JC',
    marketId: 'pardo',
    stall: 'Stall 7, N. Bacalso Avenue side',
    sells: 'Vegetables, fruit and eggs',
    own: 'From his farm in Manipis, Talisay',
    story: 'A mixed farm in the hills above Talisay. He sells it all at his Pardo stall.',
    rating: 4.6,
    reviewCount: 98,
    sold: '410 sold',
    reviews: [
      { name: 'Fely A.', stars: 5, text: 'Cheapest tomatoes I found, and good ones.' },
      { name: 'Dodong M.', stars: 4, text: 'Easy pick-up at Pardo on my way home.' },
    ],
  },
]

/* --- Food types ------------------------------------------------------------------
   What can be sold. Each has a flat illustration in ProduceArt.tsx, a unit
   it is sold in, and how much one tap of + adds. */

export type CategoryId = 'vegetables' | 'meat' | 'seafood' | 'fruits' | 'root' | 'pantry'

export const categories: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'meat', label: 'Meat' },
  { id: 'seafood', label: 'Fish & seafood' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'root', label: 'Root crops' },
  { id: 'pantry', label: 'Rice & eggs' },
]

/* Picture background behind each illustration. */
export type Tint = 'mint' | 'leaf' | 'cream' | 'sand'

export type ProduceId =
  | 'tomatoes'
  | 'cabbage'
  | 'bellpepper'
  | 'eggplant'
  | 'sitaw'
  | 'squash'
  | 'lettuce'
  | 'pechay'
  | 'malunggay'
  | 'carrots'
  | 'potatoes'
  | 'kamote'
  | 'mangoes'
  | 'saba'
  | 'calamansi'
  | 'liempo'
  | 'chicken'
  | 'beefshank'
  | 'bangus'
  | 'squid'
  | 'shrimp'
  | 'danggit'
  | 'driedsquid'
  | 'eggs'
  | 'rice'

export type Unit = 'kg' | 'bundle' | 'head' | 'bunch' | 'pack' | 'dozen' | 'bag' | 'piece'

export interface Produce {
  id: ProduceId
  name: string
  /* Bisaya name, shown under the English one. */
  local?: string
  category: CategoryId
  tint: Tint
  unit: Unit
  /* Extra size detail, e.g. "250 g". */
  size?: string
  step: number
}

export const produce: Produce[] = [
  { id: 'tomatoes', name: 'Tomatoes', local: 'Kamatis', category: 'vegetables', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'cabbage', name: 'Cabbage', local: 'Repolyo', category: 'vegetables', tint: 'mint', unit: 'kg', step: 0.5 },
  { id: 'bellpepper', name: 'Bell pepper', category: 'vegetables', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'eggplant', name: 'Eggplant', local: 'Talong', category: 'vegetables', tint: 'sand', unit: 'kg', step: 0.5 },
  { id: 'sitaw', name: 'String beans', local: 'Batong', category: 'vegetables', tint: 'leaf', unit: 'bundle', step: 1 },
  { id: 'squash', name: 'Squash', local: 'Kalabasa', category: 'vegetables', tint: 'sand', unit: 'kg', step: 0.5 },
  { id: 'lettuce', name: 'Lettuce', local: 'Litsugas', category: 'vegetables', tint: 'leaf', unit: 'head', step: 1 },
  { id: 'pechay', name: 'Pechay', category: 'vegetables', tint: 'mint', unit: 'bundle', step: 1 },
  { id: 'malunggay', name: 'Malunggay', category: 'vegetables', tint: 'leaf', unit: 'bundle', step: 1 },
  { id: 'carrots', name: 'Carrots', local: 'Karot', category: 'root', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'potatoes', name: 'Potatoes', local: 'Patatas', category: 'root', tint: 'sand', unit: 'kg', step: 0.5 },
  { id: 'kamote', name: 'Sweet potatoes', local: 'Kamote', category: 'root', tint: 'sand', unit: 'kg', step: 0.5 },
  { id: 'mangoes', name: 'Mangoes', local: 'Mangga', category: 'fruits', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'saba', name: 'Saba bananas', local: 'Saging saba', category: 'fruits', tint: 'cream', unit: 'bunch', size: 'about 10 pieces', step: 1 },
  { id: 'calamansi', name: 'Calamansi', local: 'Lemonsito', category: 'fruits', tint: 'leaf', unit: 'pack', size: '250 g', step: 1 },
  { id: 'liempo', name: 'Pork belly', local: 'Liempo', category: 'meat', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'chicken', name: 'Whole chicken', local: 'Manok', category: 'meat', tint: 'sand', unit: 'piece', size: 'about 1.2 kg', step: 1 },
  { id: 'beefshank', name: 'Beef shank', local: 'Bulalo', category: 'meat', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'bangus', name: 'Milkfish', local: 'Bangus', category: 'seafood', tint: 'mint', unit: 'kg', step: 0.5 },
  { id: 'squid', name: 'Squid', local: 'Nokus', category: 'seafood', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'shrimp', name: 'Shrimp', local: 'Pasayan', category: 'seafood', tint: 'sand', unit: 'kg', step: 0.5 },
  { id: 'danggit', name: 'Danggit', local: 'Dried rabbitfish', category: 'seafood', tint: 'sand', unit: 'pack', size: '250 g', step: 1 },
  { id: 'driedsquid', name: 'Dried squid', category: 'seafood', tint: 'cream', unit: 'pack', size: '250 g', step: 1 },
  { id: 'eggs', name: 'Free-range eggs', local: 'Itlog', category: 'pantry', tint: 'mint', unit: 'dozen', step: 1 },
  { id: 'rice', name: 'Brown rice', local: 'Bugas', category: 'pantry', tint: 'sand', unit: 'bag', size: '2 kg', step: 1 },
]

/* --- Listings -------------------------------------------------------------------
   What each stall has right now. Several stalls can offer the same food -
   the product page shows the other offers side by side. Prices sit a little
   under typical Cebu market prices. */

export interface Listing {
  id: string
  produceId: ProduceId
  sellerId: string
  price: number
  /* "Fresh today" - picked, caught or dressed today. Marked in orange, one
     of only two uses of orange. */
  freshToday?: boolean
  outOfStock?: boolean
  /* The stall pays to show it in the shop's Featured row (see `boost`). */
  featured?: boolean
  about: string
}

export const listings: Listing[] = [
  /* Nong Romy - highland vegetables, Carbon Market */
  { id: 'romy-tomatoes', produceId: 'tomatoes', sellerId: 'romy', price: 60, freshToday: true, about: 'Firm, sweet highland tomatoes, picked just as they turn red so they finish ripening on your counter, not in a truck.' },
  { id: 'romy-carrots', produceId: 'carrots', sellerId: 'romy', price: 70, freshToday: true, about: 'Sweet highland carrots, pulled the morning they come down. Twist the tops off at home to keep them crisp.' },
  { id: 'romy-cabbage', produceId: 'cabbage', sellerId: 'romy', price: 50, about: 'Tight, heavy heads from the cool Mantalongon slopes. Keeps for a week in the fridge.' },
  { id: 'romy-potatoes', produceId: 'potatoes', sellerId: 'romy', price: 75, about: 'Floury potatoes for mashing, frying and nilaga. Store them somewhere dark and dry.' },
  { id: 'romy-lettuce', produceId: 'lettuce', sellerId: 'romy', price: 35, about: 'Highland romaine with a good crunch. Big heads, cut the morning they come down.' },
  { id: 'romy-bellpepper', produceId: 'bellpepper', sellerId: 'romy', price: 160, outOfStock: true, about: 'Thick-walled red peppers. Sold out for this week - the next batch is a few days away.' },

  /* Nang Fe - leafy greens, Carbon Market */
  { id: 'fe-lettuce', produceId: 'lettuce', sellerId: 'fe', price: 30, freshToday: true, about: 'Crisp green-leaf lettuce from Busay, cut at dawn and kept cool all the way to you.' },
  { id: 'fe-pechay', produceId: 'pechay', sellerId: 'fe', price: 20, freshToday: true, about: 'Tender pechay with thick white stems. Cook it the day it arrives for the best crunch.' },
  { id: 'fe-malunggay', produceId: 'malunggay', sellerId: 'fe', price: 10, about: 'Fresh moringa sprigs for tinola and soups. Strip the leaves just before cooking.' },

  /* Nang Lorna - pork, chicken and beef, Carbon Market */
  { id: 'lorna-liempo', produceId: 'liempo', sellerId: 'lorna', price: 330, about: 'Pork belly with an even layer of fat, cut to order. For sinugba, adobo or lechon kawali.' },
  { id: 'lorna-chicken', produceId: 'chicken', sellerId: 'lorna', price: 240, freshToday: true, about: 'Dressed this morning and cleaned. Ask for it cut for tinola, adobo or the grill.' },
  { id: 'lorna-beefshank', produceId: 'beefshank', sellerId: 'lorna', price: 360, about: 'Meaty shank with the marrow bone, cut into rounds. Slow-cook it for pochero or nilaga.' },

  /* Lito & Grace - fruit, Carbon Market */
  { id: 'ybanez-mangoes', produceId: 'mangoes', sellerId: 'ybanez', price: 110, about: 'Sweet carabao mangoes from old Balamban trees. Ready to eat in a day or two.' },
  { id: 'ybanez-saba', produceId: 'saba', sellerId: 'ybanez', price: 45, about: 'Firm cooking bananas for banana cue, turon, or simply boiled as a merienda.' },
  { id: 'ybanez-calamansi', produceId: 'calamansi', sellerId: 'ybanez', price: 18, about: 'Juicy little limes for juice, pancit and sawsawan.' },
  { id: 'ybanez-kamote', produceId: 'kamote', sellerId: 'ybanez', price: 40, about: 'Purple-skinned kamote with sweet yellow flesh. Boil it, roast it or make kamote cue.' },

  /* Nong Ernie - rice, eggs and lowland vegetables, Carbon Market */
  { id: 'ernie-eggplant', produceId: 'eggplant', sellerId: 'ernie', price: 55, about: 'Long, glossy talong for tortang talong or adobo. Picked young, so never bitter.' },
  { id: 'ernie-sitaw', produceId: 'sitaw', sellerId: 'ernie', price: 20, about: 'A generous bundle of long beans. Good in utan bisaya or stir-fried with garlic.' },
  { id: 'ernie-squash', produceId: 'squash', sellerId: 'ernie', price: 30, about: 'Sweet, deep-orange flesh. Sold by weight - ask for half if you only need a little.' },
  { id: 'ernie-eggs', produceId: 'eggs', sellerId: 'ernie', price: 110, featured: true, about: "From hens that roam Nong Ernie's yard in Carcar. Collected the day before they sell." },
  { id: 'ernie-rice', produceId: 'rice', sellerId: 'ernie', price: 120, about: 'Unpolished brown rice, milled in small batches. Nutty, filling and good for you.' },

  /* Nong Berto - the morning's catch, Pasil Fish Market */
  { id: 'berto-bangus', produceId: 'bangus', sellerId: 'berto', price: 170, freshToday: true, about: 'Silvery bangus from the family fish pens. Cleaned and scaled if you ask.' },
  { id: 'berto-squid', produceId: 'squid', sellerId: 'berto', price: 250, freshToday: true, about: "Small, tender nokus from last night's catch. Grill it, or cook it in its ink." },
  { id: 'berto-shrimp', produceId: 'shrimp', sellerId: 'berto', price: 350, about: 'Medium pasayan. Sweet in sinigang, or steamed with garlic.' },

  /* Nang Cita - dried fish, Taboan Public Market */
  { id: 'cita-danggit', produceId: 'danggit', sellerId: 'cita', price: 240, featured: true, about: 'Crisp, lightly salted danggit, sun-dried in Bantayan. Fry it for breakfast with garlic rice.' },
  { id: 'cita-driedsquid', produceId: 'driedsquid', sellerId: 'cita', price: 260, about: 'Sweet, chewy sun-dried squid. Grill it over coals, or fry it and dip it in vinegar.' },

  /* Nong Jun - mixed farm, Pardo Public Market */
  { id: 'jun-tomatoes', produceId: 'tomatoes', sellerId: 'jun', price: 55, about: 'Smaller lowland tomatoes with plenty of flavour. Good for sauces and sawsawan.' },
  { id: 'jun-eggplant', produceId: 'eggplant', sellerId: 'jun', price: 50, freshToday: true, about: 'Round purple talong, picked this morning. Great grilled for ensaladang talong.' },
  { id: 'jun-eggs', produceId: 'eggs', sellerId: 'jun', price: 100, about: 'Native-chicken eggs, a little smaller with rich yolks.' },
  { id: 'jun-calamansi', produceId: 'calamansi', sellerId: 'jun', price: 16, about: 'Calamansi from the trees along the farm path. Extra juicy this month.' },
  { id: 'jun-mangoes', produceId: 'mangoes', sellerId: 'jun', price: 100, about: 'Talisay mangoes, a touch smaller than the Balamban ones, just as sweet.' },
]

/* What "Fill basket" in the presenter panel puts in the basket: three stalls
   at Carbon Market - one rider brings them all - and the fish stall at
   Pasil, set to Pick-up, so both ways of getting an order show. */
export const demoBasket: { listingId: string; qty: number }[] = [
  { listingId: 'romy-tomatoes', qty: 1 },
  { listingId: 'romy-potatoes', qty: 2 },
  { listingId: 'lorna-liempo', qty: 1 },
  { listingId: 'fe-pechay', qty: 2 },
  { listingId: 'berto-bangus', qty: 1 },
]
export const demoModes: Partial<Record<MarketId, Mode>> = { pasil: 'pickup' }

/* --- An order's journey ----------------------------------------------------------
   Each market's part of an order (a "shipment") moves through these stages -
   the pitch deck's "farm to table": confirmation, packing, then delivered
   or picked up. "Play delivery day" in the presenter panel (D) walks them on
   an accelerated clock; `at` is when each stage is reached, in ms. Pick-up
   orders stop at "Ready for pickup" until the buyer collects. */

export type StageId = 'placed' | 'confirmed' | 'packing' | 'ready' | 'onTheWay' | 'done'

export const stageAt: Record<StageId, number> = {
  placed: 0,
  confirmed: 1500,
  packing: 3500,
  ready: 6500,
  onTheWay: 9000,
  done: 25000,
}

export const stagesFor: Record<Mode, StageId[]> = {
  delivery: ['placed', 'confirmed', 'packing', 'ready', 'onTheWay', 'done'],
  pickup: ['placed', 'confirmed', 'packing', 'ready', 'done'],
}

/* {who}, {market}, {courier}, {rider} and {time} are filled in per shipment. */
export const stageText: Record<Mode, Record<StageId, { label: string; detail: string }>> = {
  delivery: {
    placed: { label: 'Waiting to confirm', detail: 'Sent to {who} to confirm the courier, time and handoff.' },
    confirmed: { label: 'Confirmed', detail: 'Agreed with {who}: {courier}, {time}.' },
    packing: { label: 'Packing', detail: 'Being packed fresh at {market}.' },
    ready: { label: 'Ready for pickup', detail: 'Packed. {courier} rider {rider} is coming to collect it.' },
    onTheWay: { label: 'On the way', detail: '{rider} is bringing it from {market}.' },
    done: { label: 'Delivered', detail: 'Salamat for buying local!' },
  },
  pickup: {
    placed: { label: 'Waiting to confirm', detail: 'Sent to {who} to confirm your pick-up time.' },
    confirmed: { label: 'Confirmed', detail: 'Agreed with {who}: pick it up at {market}, {time}.' },
    packing: { label: 'Packing', detail: 'Being packed fresh at {market}.' },
    ready: { label: 'Ready for pickup', detail: 'Packed and waiting for you at {market}.' },
    onTheWay: { label: 'On the way', detail: '' },
    done: { label: 'Picked up', detail: 'Salamat for buying local!' },
  },
}

/* The order the demo places. */
export const demoOrder = {
  id: 'PG-2481',
  code: '4821',
}

/* --- Past orders ------------------------------------------------------------------ */

export interface PastOrder {
  id: string
  when: string
  lines: { listingId: string; qty: number }[]
}

export const pastOrders: PastOrder[] = [
  {
    id: 'PG-2417',
    when: 'Last Friday',
    lines: [
      { listingId: 'romy-tomatoes', qty: 1 },
      { listingId: 'fe-pechay', qty: 2 },
      { listingId: 'lorna-chicken', qty: 1 },
      { listingId: 'berto-bangus', qty: 1 },
    ],
  },
  {
    id: 'PG-2386',
    when: '2 weeks ago',
    lines: [
      { listingId: 'romy-cabbage', qty: 1 },
      { listingId: 'romy-carrots', qty: 1 },
      { listingId: 'lorna-liempo', qty: 1 },
      { listingId: 'ernie-eggs', qty: 1 },
    ],
  },
  {
    id: 'PG-2342',
    when: '3 weeks ago',
    lines: [
      { listingId: 'fe-lettuce', qty: 2 },
      { listingId: 'ybanez-saba', qty: 1 },
      { listingId: 'cita-danggit', qty: 1 },
      { listingId: 'ernie-rice', qty: 1 },
    ],
  },
]

/* --- Checkout options ------------------------------------------------------------- */

export type PaymentId = 'gcash' | 'cash' | 'card'

export const paymentMethods: { id: PaymentId; label: string; detail: string }[] = [
  { id: 'gcash', label: 'GCash', detail: 'Pay now from your wallet' },
  { id: 'cash', label: 'Cash on delivery', detail: 'Pay the rider, or at the stalls when you pick up' },
  { id: 'card', label: 'Debit or credit card', detail: 'Saved card ending 0417' },
]

export type ChannelId = 'sms' | 'app' | 'both'

export const notifyChannels: { id: ChannelId; label: string }[] = [
  { id: 'sms', label: 'SMS' },
  { id: 'app', label: 'App' },
  { id: 'both', label: 'Both' },
]

export type LanguageId = 'en' | 'ceb'

export const languages: { id: LanguageId; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'ceb', label: 'Cebuano' },
]

/* --- The seller's side (Nong Romy's stall) ---------------------------------------- */

export interface SellerOrder {
  buyer: string
  area: string
  mode: Mode
  /* What the buyer chose for a delivery - the stall confirms it. */
  courier?: CourierId
  slot?: Slot
  items: string
  total: number
}

export const sellerView = {
  sellerId: 'romy',
  /* Other buyers' orders for tomorrow, each with the courier and time the
     buyer chose. Joy's order joins this list when it includes something
     from Nong Romy. */
  orders: [
    { buyer: 'Mark T.', area: 'Banilad', mode: 'delivery', courier: 'maxim', slot: [11, 13], items: 'Tomatoes 2 kg, Cabbage 1 kg', total: 170 },
    { buyer: 'Liza P.', area: 'Mabolo', mode: 'delivery', courier: 'angkas', slot: [11, 13], items: 'Carrots 1 kg, Potatoes 2 kg', total: 220 },
    { buyer: 'Cora M.', area: 'Talamban', mode: 'pickup', items: 'Tomatoes 3 kg, Lettuce 2 heads', total: 250 },
    { buyer: 'Rico D.', area: 'Labangon', mode: 'delivery', courier: 'lalamove', slot: [15, 17], items: 'Cabbage 2 kg, Carrots 1 kg', total: 170 },
  ] as SellerOrder[],
  /* What sells, where and when - from the stall's own orders over the last
     four weeks - so the seller can plan what to bring. */
  stockPlan: {
    rows: [
      { produceId: 'tomatoes' as ProduceId, qty: 46, days: 'Fri – Sat', areas: 'Lahug, Banilad' },
      { produceId: 'carrots' as ProduceId, qty: 28, days: 'Sat', areas: 'Mabolo, Talamban' },
      { produceId: 'potatoes' as ProduceId, qty: 21, days: 'Mon', areas: 'Labangon' },
    ],
    tip: 'Tomatoes ran out on the last two Fridays. Bring about 10 kg more this week.',
  },
  /* Earlier weeks' pay-outs. This week's is worked out from the orders. */
  pastWeeks: [
    { label: 'Wk 1', amount: 4300 },
    { label: 'Wk 2', amount: 4900 },
    { label: 'Wk 3', amount: 4750 },
    { label: 'Wk 4', amount: 5550 },
    { label: 'Wk 5', amount: 5900 },
  ],
  thisWeekSales: 7400,
  payout: 'Paid every Saturday to GCash',
  /* What "Feature a listing" in the Seller Center puts in the Featured row. */
  boostListingId: 'romy-tomatoes',
}

/* ==========================================================================
   Lookups and wording
   ========================================================================== */

const marketIndex = new Map(markets.map((m) => [m.id, m]))
const sellerIndex = new Map(sellers.map((s) => [s.id, s]))
const produceIndex = new Map(produce.map((p) => [p.id, p]))
const courierIndex = new Map(couriers.map((c) => [c.id, c]))

export function getMarket(id: MarketId | undefined): Market {
  return (id && marketIndex.get(id)) || markets[0]
}

export function getSeller(id: string | undefined): Seller {
  return (id && sellerIndex.get(id)) || sellers[0]
}

/** The market a stall is in. */
export function marketOf(seller: Seller): Market {
  return getMarket(seller.marketId)
}

/** "Stall 12" - the stall without its directions. */
export function stallNo(seller: Seller) {
  return seller.stall.split(',')[0]
}

export function getCourier(id: CourierId): Courier {
  return courierIndex.get(id) ?? couriers[0]
}

/** What a courier charges for the trip from this market to the buyer. */
export function fareFor(market: Market, courier: CourierId) {
  return getCourier(courier).fare(market.km)
}

/** The cheapest courier fare from this market - "Delivery from ₱76". */
export function cheapestFare(market: Market) {
  return Math.min(...couriers.map((c) => c.fare(market.km)))
}

export function getProduce(id: ProduceId): Produce {
  return produceIndex.get(id) ?? produce[0]
}

/** ₱1,240 - whole pesos, the way prices are written at the market. */
export function peso(amount: number) {
  return `₱${Math.round(amount).toLocaleString('en-PH')}`
}

const plurals: Record<Unit, string> = {
  kg: 'kg',
  bundle: 'bundles',
  head: 'heads',
  bunch: 'bunches',
  pack: 'packs',
  dozen: 'dozen',
  bag: 'bags',
  piece: 'pieces',
}

/** "1.5 kg", "2 bundles", "1 dozen". */
export function qtyText(item: Produce, qty: number) {
  const n = Number.isInteger(qty) ? String(qty) : qty.toFixed(1)
  if (item.unit === 'kg') return `${n} kg`
  return `${n} ${qty === 1 ? item.unit : plurals[item.unit]}`
}

/** "kg", "250 g pack", "piece". */
export function perUnit(item: Produce) {
  return item.size && item.unit !== 'bunch' && item.unit !== 'piece' ? `${item.size} ${item.unit}` : item.unit
}

/** Straight-line distance between two points, in km. */
export function distanceKm(a: LatLng, b: LatLng = homeAt) {
  const rad = Math.PI / 180
  const dLat = (a[0] - b[0]) * rad
  const dLng = (a[1] - b[1]) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(b[0] * rad) * Math.cos(a[0] * rad) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export function distanceText(km: number) {
  return km < 1 ? `${Math.round((km * 1000) / 50) * 50} m` : `${km.toFixed(1)} km`
}

/** "8 – 10 AM", "10 AM – 12 NN", "11 AM – 1 PM", "3 – 5 PM". */
export function slotText([from, to]: Slot) {
  const half = (h: number) => (h === 12 ? 'NN' : h < 12 ? 'AM' : 'PM')
  const hour = (h: number) => String(h > 12 ? h - 12 : h)
  if (half(from) === half(to)) return `${hour(from)} – ${hour(to)} ${half(to)}`
  return `${hour(from)} ${half(from)} – ${hour(to)} ${half(to)}`
}

/** "11:25 AM", from minutes after midnight. */
export function clockText(minutes: number) {
  const total = Math.round(minutes)
  const h = Math.floor(total / 60) % 24
  return `${h % 12 || 12}:${String(total % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}

/** "Thu" today, "Fri" tomorrow - real weekdays, so times read in order
    whatever day the demo runs. */
export function weekday(daysFromToday = 0) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

/** "Nong Romy, Nang Fe and Lito & Grace". */
export function listNames(names: string[]) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** Fills {who}, {market}, {courier}, {rider} and {time} in stage wording,
    from what the buyer and the stalls agreed for this shipment. */
export function fillText(
  text: string,
  plan: { who: string; market: Market; courier: CourierId; time: string },
) {
  return text
    .replace('{who}', plan.who)
    .replace('{market}', plan.market.name)
    .replace('{courier}', getCourier(plan.courier).name)
    .replace('{rider}', plan.market.rider.name)
    .replace('{time}', plan.time)
}
