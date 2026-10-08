/* ==========================================================================
   Bukid Direct - sample content
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE WITH SAMPLE DATA. Street geometry for the map comes
   from OpenStreetMap (src/data/roads.geojson); everything else - farms,
   farmers, listings, prices, couriers, riders, orders, people - is invented.

   How the marketplace works:
     - Every seller - a farm or a fishing family - has its own shop, prices
       and delivery terms.
     - The same produce can be sold by several sellers at different prices.
     - Each farm's part of an order is delivered by Lalamove, or picked up
       at the farm's own pickup point - like Delivery / Pick-up on Grab or
       foodpanda.
     - Bukid Direct books the Lalamove rider when the buyer pays, at
       Lalamove's own price. The farmer only packs and hands over.
     - Far farms bring the day's orders into the city, and the riders
       collect them there.

   House rules for anything written in this file:
     - Plain English, with the occasional Bisaya touch in labels
       ("Salamat!", "Nong Romy", "Kamatis"). No slang overload.
     - No invented statistics about Cebu or about farming in general.
     - Prices, fees and distances are illustrative. Change them freely -
       every total in the app is worked out from these numbers.
   ========================================================================== */

export type LatLng = [number, number]

/* --- Brand ---------------------------------------------------------------- */

export const brand = {
  name: 'Bukid Direct',
  tagline: 'Fresh from the Farm.',
  plus: 'Direct Plus',
}

/* --- The person using the app --------------------------------------------- */

export const user = {
  firstName: 'Joy',
  fullName: 'Joy Cabahug',
  initials: 'JC',
  mobile: '0917 ••• 2741',
  since: 'Buying direct since August',
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
   Order tonight, the farms harvest at dawn, the order arrives (or is ready
   to collect) tomorrow. Kept relative so the demo never shows a stale date. */

export const schedule = {
  cutoff: '9 PM tonight',
  day: 'Tomorrow',
}

/* --- Money ------------------------------------------------------------------
   How Bukid Direct earns - kept small on purpose, because the point is
   selling without paying a middleman. All PLACEHOLDERS: check them against
   real payment-gateway and courier rates before the pitch. The worked-out
   maths per buyer and per month is in the README. */

/* Share of every produce peso that goes to the farm. Bukid Direct's only cut
   from farmers is a 5% commission. */
export const farmerShare = 0.95

export const fees = {
  /* Paid by the buyer, once per order however many farms it comes from -
     roughly what the payment fee on an order costs us. Waived for Direct
     Plus members. */
  service: 10,
}

/* A farm can pay to show a listing in the shop's Featured row. Optional,
   and taken from the farm's weekly pay-out. */
export const boost = {
  price: 99,
  period: 'week',
}

export const plusPlan = {
  name: 'Direct Plus',
  price: 49,
  period: 'month',
  /* Welcome voucher, once per member: Bukid Direct pays one farm's delivery
     fee (the biggest) on the first order of ₱200 or more. Once, not every
     month - at a 5% commission, monthly free delivery would cost more than a
     member brings in. */
  welcome: { minSpend: 200 },
  perks: [
    { id: 'fee', title: 'No service fee', detail: 'Save ₱10 every order' },
    { id: 'welcome', title: 'Free first delivery', detail: 'On an order of ₱200 or more' },
    { id: 'suki', title: 'Suki deals', detail: 'Members-only vouchers from sellers' },
    { id: 'early', title: 'First pick', detail: 'New harvests a day early' },
    { id: 'visit', title: 'Farm visit days', detail: 'Twice a year' },
  ],
}

/* --- Delivery ----------------------------------------------------------------
   Bukid Direct books every delivery with Lalamove's business API: at
   checkout it asks Lalamove for the trip's price and shows exactly that -
   no markup - then books the rider when the buyer pays. Name only: no logo,
   and nothing here implies a partnership. */

export const courier = 'Lalamove'

/* Lalamove's published motorcycle rates for Cebu: ₱49 base, ₱6 a km for the
   first 5 km, ₱5 a km after that. Traffic and demand surcharges can apply -
   the real app shows the live quote. */
export function lalamoveFare(km: number) {
  return Math.round(49 + 6 * Math.min(km, 5) + 5 * Math.max(0, km - 5))
}

/* --- Sellers: farms and fisherfolk ------------------------------------------- */

export type Mode = 'delivery' | 'pickup'

export interface Farm {
  id: string
  farmer: string
  /* How buyers know them. */
  call: string
  initials: string
  place: string
  /* Rough road distance to the city, for the farm list. */
  kmToCity: number
  since: string
  story: string
  rating: number
  reviewCount: number
  sold: string
  delivery: {
    /* Lalamove's fare from the hand-over point to the buyer - here Joy, at
       the road distance on the city map. */
    fee: number
    /* Free delivery from this farm at or above this subtotal - the farm
       pays the rider. */
    freeOver: number
    /* Arrival window, the day after ordering. */
    window: string
    /* Where the rider collects the order: the farm, or for far farms, the
       city spot they bring the day's orders to. */
    handover: { place: string; at: LatLng }
    rider: { name: string; plate: string }
  }
  /* Farms that also let buyers collect. */
  pickup?: {
    place: string
    detail: string
    at: LatLng
    hours: string
  }
  /* A members-only voucher the farm chooses to post for its regulars - its
     suki. Paid by the farm, like a seller voucher on Shopee. */
  sukiDeal?: { off: number; minSpend: number }
  reviews: { name: string; stars: number; text: string }[]
}

export const farms: Farm[] = [
  {
    id: 'romy',
    farmer: 'Romy Alcoseba',
    call: 'Nong Romy',
    initials: 'RA',
    place: 'Mantalongon, Dalaguete',
    kmToCity: 85,
    since: 'Selling since 2025',
    story: 'Highland vegetables from the slopes his father farmed. He picks only what has been ordered.',
    rating: 4.9,
    reviewCount: 312,
    sold: '1.2k sold',
    delivery: {
      fee: lalamoveFare(5.0),
      freeOver: 800,
      window: '11 AM – 1 PM',
      handover: { place: 'Carbon Market stall', at: [10.29296, 123.90033] },
      rider: { name: 'Rhea M.', plate: 'GAJ 2716' },
    },
    pickup: {
      place: 'Carbon Market stall',
      detail: 'Stall 12, F. Gonzales Street side',
      at: [10.29296, 123.90033],
      hours: '1 – 6 PM',
    },
    sukiDeal: { off: 10, minSpend: 200 },
    reviews: [
      { name: 'Marites C.', stars: 5, text: 'Tomatoes lasted a whole week. Packed well too.' },
      { name: 'Jun T.', stars: 5, text: 'Sweetest carrots I have bought in the city.' },
    ],
  },
  {
    id: 'fe',
    farmer: 'Fe Tabanao',
    call: 'Nang Fe',
    initials: 'FT',
    place: 'Busay, Cebu City',
    kmToCity: 9,
    since: 'Selling since 2025',
    story: 'Leafy greens from terraces above the city, cut at first light so they arrive crisp.',
    rating: 4.8,
    reviewCount: 208,
    sold: '860 sold',
    delivery: {
      fee: lalamoveFare(9.6),
      freeOver: 700,
      window: '8 – 10 AM',
      handover: { place: 'the farm gate', at: [10.37153, 123.8745] },
      rider: { name: 'Jomar Y.', plate: 'NDC 4821' },
    },
    pickup: {
      place: 'Farm gate, Busay',
      detail: 'Transcentral Highway - look for the green sign',
      at: [10.37153, 123.8745],
      hours: '7 AM – 5 PM',
    },
    sukiDeal: { off: 10, minSpend: 150 },
    reviews: [
      { name: 'Liza P.', stars: 5, text: 'The lettuce was still cold when it arrived.' },
      { name: 'Ernie L.', stars: 4, text: 'Fresh pechay, generous bundles.' },
    ],
  },
  {
    id: 'ybanez',
    farmer: 'Lito & Grace Ybañez',
    call: 'Lito & Grace',
    initials: 'LG',
    place: 'Balamban',
    kmToCity: 45,
    since: 'Selling since 2026',
    story: 'A family orchard of old mango trees, with saba, calamansi and kamote in between.',
    rating: 4.7,
    reviewCount: 145,
    sold: '540 sold',
    delivery: {
      fee: lalamoveFare(3.1),
      freeOver: 900,
      window: '10 AM – 12 NN',
      handover: { place: 'Fuente Osmeña Circle', at: [10.31, 123.89249] },
      rider: { name: 'Dennis A.', plate: 'KAB 5530' },
    },
    reviews: [
      { name: 'Cora M.', stars: 5, text: 'Mangoes ripened perfectly in two days.' },
      { name: 'Rico D.', stars: 4, text: 'Good saba, a few were small.' },
    ],
  },
  {
    id: 'ernie',
    farmer: 'Ernie Pepito',
    call: 'Nong Ernie',
    initials: 'EP',
    place: 'Carcar',
    kmToCity: 40,
    since: 'Selling since 2025',
    story: 'Lowland vegetables and free-range hens. Eggs are collected the day before delivery.',
    rating: 4.8,
    reviewCount: 176,
    sold: '700 sold',
    delivery: {
      fee: lalamoveFare(6.8),
      freeOver: 800,
      window: '10 AM – 12 NN',
      handover: { place: 'N. Bacalso Avenue', at: [10.29158, 123.87803] },
      rider: { name: 'Arnel P.', plate: 'GBV 1184' },
    },
    sukiDeal: { off: 15, minSpend: 250 },
    reviews: [
      { name: 'Mila G.', stars: 5, text: 'Eggs with bright orange yolks. Will reorder.' },
      { name: 'Boy S.', stars: 5, text: 'Talong was young and tender.' },
    ],
  },
  {
    id: 'jun',
    farmer: 'Jun Cañete',
    call: 'Nong Jun',
    initials: 'JC',
    place: 'Manipis, Talisay City',
    kmToCity: 18,
    since: 'Selling since 2026',
    story: 'A mixed farm in the hills above Talisay. Jun also sells at his Pardo Market stall.',
    rating: 4.6,
    reviewCount: 98,
    sold: '410 sold',
    delivery: {
      fee: lalamoveFare(10.3),
      freeOver: 700,
      window: '9 – 11 AM',
      handover: { place: 'Pardo Market stall', at: [10.27429, 123.85005] },
      rider: { name: 'Kim L.', plate: 'NAC 7302' },
    },
    pickup: {
      place: 'Pardo Market stall',
      detail: 'Stall 7, N. Bacalso Avenue side',
      at: [10.27429, 123.85005],
      hours: '6 AM – 12 NN',
    },
    reviews: [
      { name: 'Fely A.', stars: 5, text: 'Cheapest tomatoes I found, and good ones.' },
      { name: 'Dodong M.', stars: 4, text: 'Easy pick-up at Pardo on my way home.' },
    ],
  },
  {
    id: 'berto',
    farmer: 'Berto Ompad',
    call: 'Nong Berto',
    initials: 'BO',
    place: 'Cordova, Mactan',
    kmToCity: 20,
    since: 'Selling since 2026',
    story: 'A fishing family from Cordova. The catch comes in at dawn and leaves the same morning.',
    rating: 4.8,
    reviewCount: 87,
    sold: '320 sold',
    delivery: {
      fee: lalamoveFare(5.5),
      freeOver: 1000,
      window: '8 – 10 AM',
      handover: { place: 'Pasil Fish Market stall', at: [10.2915, 123.8935] },
      rider: { name: 'Mae C.', plate: 'GBC 3391' },
    },
    pickup: {
      place: 'Pasil Fish Market stall',
      detail: 'Stall 4, near the main gate',
      at: [10.2915, 123.8935],
      hours: '5 – 10 AM',
    },
    reviews: [
      { name: 'Annie R.', stars: 5, text: 'The squid still had its shine. So fresh.' },
      { name: 'Oscar D.', stars: 5, text: 'Bangus came cleaned and scaled, as asked.' },
    ],
  },
]

/* --- Produce types -------------------------------------------------------------
   What can be sold. Each has a flat illustration in ProduceArt.tsx, a unit
   it is sold in, and how much one tap of + adds. */

export type CategoryId = 'vegetables' | 'leafy' | 'root' | 'fruits' | 'seafood' | 'pantry'

export const categories: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'leafy', label: 'Leafy greens' },
  { id: 'root', label: 'Root crops' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'seafood', label: 'Fish & seafood' },
  { id: 'pantry', label: 'Eggs & rice' },
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
  | 'bangus'
  | 'squid'
  | 'shrimp'
  | 'eggs'
  | 'rice'

export type Unit = 'kg' | 'bundle' | 'head' | 'bunch' | 'pack' | 'dozen' | 'bag'

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
  { id: 'lettuce', name: 'Lettuce', local: 'Litsugas', category: 'leafy', tint: 'leaf', unit: 'head', step: 1 },
  { id: 'pechay', name: 'Pechay', category: 'leafy', tint: 'mint', unit: 'bundle', step: 1 },
  { id: 'malunggay', name: 'Malunggay', category: 'leafy', tint: 'leaf', unit: 'bundle', step: 1 },
  { id: 'carrots', name: 'Carrots', local: 'Karot', category: 'root', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'potatoes', name: 'Potatoes', local: 'Patatas', category: 'root', tint: 'sand', unit: 'kg', step: 0.5 },
  { id: 'kamote', name: 'Sweet potatoes', local: 'Kamote', category: 'root', tint: 'sand', unit: 'kg', step: 0.5 },
  { id: 'mangoes', name: 'Mangoes', local: 'Mangga', category: 'fruits', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'saba', name: 'Saba bananas', local: 'Saging saba', category: 'fruits', tint: 'cream', unit: 'bunch', size: 'about 10 pieces', step: 1 },
  { id: 'calamansi', name: 'Calamansi', local: 'Lemonsito', category: 'fruits', tint: 'leaf', unit: 'pack', size: '250 g', step: 1 },
  { id: 'bangus', name: 'Milkfish', local: 'Bangus', category: 'seafood', tint: 'mint', unit: 'kg', step: 0.5 },
  { id: 'squid', name: 'Squid', local: 'Nokus', category: 'seafood', tint: 'cream', unit: 'kg', step: 0.5 },
  { id: 'shrimp', name: 'Shrimp', local: 'Pasayan', category: 'seafood', tint: 'sand', unit: 'kg', step: 0.5 },
  { id: 'eggs', name: 'Free-range eggs', local: 'Itlog', category: 'pantry', tint: 'mint', unit: 'dozen', step: 1 },
  { id: 'rice', name: 'Brown rice', local: 'Bugas', category: 'pantry', tint: 'sand', unit: 'bag', size: '2 kg', step: 1 },
]

/* --- Listings -------------------------------------------------------------------
   What each seller has right now. Several sellers can offer the same
   produce - the product page shows the other offers side by side. Prices sit
   a little under typical Cebu market prices: no middleman's cut. */

export interface Listing {
  id: string
  produceId: ProduceId
  farmId: string
  price: number
  /* "Fresh today" - picked, laid or caught today. Marked in orange, one of
     only two uses of orange. */
  freshToday?: boolean
  outOfStock?: boolean
  /* The farm pays to show it in the shop's Featured row (see `boost`). */
  featured?: boolean
  about: string
}

export const listings: Listing[] = [
  /* Nong Romy - highland vegetables */
  { id: 'romy-tomatoes', produceId: 'tomatoes', farmId: 'romy', price: 60, freshToday: true, about: 'Firm, sweet highland tomatoes, picked just as they turn red so they finish ripening on your counter, not in a truck.' },
  { id: 'romy-carrots', produceId: 'carrots', farmId: 'romy', price: 70, freshToday: true, about: 'Sweet highland carrots, pulled the morning they ship. Twist the tops off at home to keep them crisp.' },
  { id: 'romy-cabbage', produceId: 'cabbage', farmId: 'romy', price: 50, about: 'Tight, heavy heads from the cool Mantalongon slopes. Keeps for a week in the fridge.' },
  { id: 'romy-potatoes', produceId: 'potatoes', farmId: 'romy', price: 75, about: 'Floury potatoes for mashing, frying and nilaga. Store them somewhere dark and dry.' },
  { id: 'romy-lettuce', produceId: 'lettuce', farmId: 'romy', price: 35, about: 'Highland romaine with a good crunch. Big heads, cut the morning they ship.' },
  { id: 'romy-bellpepper', produceId: 'bellpepper', farmId: 'romy', price: 160, outOfStock: true, about: 'Thick-walled red peppers. Sold out for this week - the next batch is a few days away.' },

  /* Nang Fe - leafy greens from Busay */
  { id: 'fe-lettuce', produceId: 'lettuce', farmId: 'fe', price: 30, freshToday: true, about: 'Crisp green-leaf lettuce from Busay, cut at dawn and kept cool all the way to you.' },
  { id: 'fe-pechay', produceId: 'pechay', farmId: 'fe', price: 20, freshToday: true, about: 'Tender pechay with thick white stems. Cook it the day it arrives for the best crunch.' },
  { id: 'fe-malunggay', produceId: 'malunggay', farmId: 'fe', price: 10, about: 'Fresh moringa sprigs for tinola and soups. Strip the leaves just before cooking.' },

  /* Lito & Grace - orchard fruit from Balamban */
  { id: 'ybanez-mangoes', produceId: 'mangoes', farmId: 'ybanez', price: 110, about: 'Sweet carabao mangoes from old Balamban trees. Ready to eat in a day or two.' },
  { id: 'ybanez-saba', produceId: 'saba', farmId: 'ybanez', price: 45, about: 'Firm cooking bananas for banana cue, turon, or simply boiled as a merienda.' },
  { id: 'ybanez-calamansi', produceId: 'calamansi', farmId: 'ybanez', price: 18, about: 'Juicy little limes for juice, pancit and sawsawan.' },
  { id: 'ybanez-kamote', produceId: 'kamote', farmId: 'ybanez', price: 40, about: 'Purple-skinned kamote with sweet yellow flesh. Boil it, roast it or make kamote cue.' },

  /* Nong Ernie - lowland vegetables, eggs and rice from Carcar */
  { id: 'ernie-eggplant', produceId: 'eggplant', farmId: 'ernie', price: 55, about: 'Long, glossy talong for tortang talong or adobo. Picked young, so never bitter.' },
  { id: 'ernie-sitaw', produceId: 'sitaw', farmId: 'ernie', price: 20, about: 'A generous bundle of long beans. Good in utan bisaya or stir-fried with garlic.' },
  { id: 'ernie-squash', produceId: 'squash', farmId: 'ernie', price: 30, about: 'Sweet, deep-orange flesh. Sold by weight - ask for half if you only need a little.' },
  { id: 'ernie-eggs', produceId: 'eggs', farmId: 'ernie', price: 110, featured: true, about: "From hens that roam Nong Ernie's yard. Collected the day before delivery." },
  { id: 'ernie-rice', produceId: 'rice', farmId: 'ernie', price: 120, about: 'Unpolished brown rice, milled in small batches. Nutty, filling and good for you.' },

  /* Nong Jun - mixed farm above Talisay */
  { id: 'jun-tomatoes', produceId: 'tomatoes', farmId: 'jun', price: 55, about: 'Smaller lowland tomatoes with plenty of flavour. Good for sauces and sawsawan.' },
  { id: 'jun-eggplant', produceId: 'eggplant', farmId: 'jun', price: 50, freshToday: true, about: 'Round purple talong, picked this morning. Great grilled for ensaladang talong.' },
  { id: 'jun-eggs', produceId: 'eggs', farmId: 'jun', price: 100, about: 'Native-chicken eggs, a little smaller with rich yolks.' },
  { id: 'jun-calamansi', produceId: 'calamansi', farmId: 'jun', price: 16, about: 'Calamansi from the trees along the farm path. Extra juicy this month.' },
  { id: 'jun-mangoes', produceId: 'mangoes', farmId: 'jun', price: 100, featured: true, about: 'Talisay mangoes, a touch smaller than the Balamban ones, just as sweet.' },

  /* Nong Berto - the morning's catch from Cordova */
  { id: 'berto-bangus', produceId: 'bangus', farmId: 'berto', price: 170, freshToday: true, about: 'Silvery bangus from the family fish pens. Cleaned and scaled if you ask.' },
  { id: 'berto-squid', produceId: 'squid', farmId: 'berto', price: 250, freshToday: true, about: "Small, tender nokus from last night's catch. Grill it, or cook it in its ink." },
  { id: 'berto-shrimp', produceId: 'shrimp', farmId: 'berto', price: 350, about: 'Medium pasayan. Sweet in sinigang, or steamed with garlic.' },
]

/* What "Fill basket" in the presenter panel puts in the basket: two farms and
   a fishing family, one of them set to Pick-up, so both ways of getting an
   order show. */
export const demoBasket: { listingId: string; qty: number }[] = [
  { listingId: 'romy-tomatoes', qty: 1 },
  { listingId: 'romy-potatoes', qty: 2 },
  { listingId: 'fe-lettuce', qty: 1 },
  { listingId: 'fe-pechay', qty: 2 },
  { listingId: 'berto-bangus', qty: 1 },
]
export const demoModes: Record<string, Mode> = { fe: 'pickup' }

/* --- An order's journey ----------------------------------------------------------
   Each farm's part of an order (a "shipment") moves through these stages.
   "Play delivery day" in the presenter panel (D) walks them on an
   accelerated clock; `at` is when each stage is reached, in ms. Pick-up
   orders stop at "Ready for pickup" until the buyer collects. */

export type StageId = 'placed' | 'packing' | 'ready' | 'onTheWay' | 'done'

export const stageAt: Record<StageId, number> = {
  placed: 0,
  packing: 2000,
  ready: 6000,
  onTheWay: 9000,
  done: 25000,
}

export const stagesFor: Record<Mode, StageId[]> = {
  delivery: ['placed', 'packing', 'ready', 'onTheWay', 'done'],
  pickup: ['placed', 'packing', 'ready', 'done'],
}

/* {farm}, {courier}, {rider} and {place} are filled in per shipment. */
export const stageText: Record<Mode, Record<StageId, { label: string; detail: string }>> = {
  delivery: {
    placed: { label: 'Order placed', detail: 'Sent to {farm}.' },
    packing: { label: 'Packing', detail: '{farm} is getting your order ready.' },
    ready: { label: 'Ready for pickup', detail: 'Packed and waiting for the {courier} rider.' },
    onTheWay: { label: 'On the way', detail: '{rider} is bringing it to your door.' },
    done: { label: 'Delivered', detail: 'Salamat for buying direct!' },
  },
  pickup: {
    placed: { label: 'Order placed', detail: 'Sent to {farm}.' },
    packing: { label: 'Packing', detail: '{farm} is getting your order ready.' },
    ready: { label: 'Ready for pickup', detail: 'Packed and waiting for you at {place}.' },
    onTheWay: { label: 'On the way', detail: '' },
    done: { label: 'Picked up', detail: 'Salamat for buying direct!' },
  },
}

/* The order the demo places. */
export const demoOrder = {
  id: 'BD-2481',
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
    id: 'BD-2417',
    when: 'Last Friday',
    lines: [
      { listingId: 'romy-tomatoes', qty: 1 },
      { listingId: 'fe-pechay', qty: 2 },
      { listingId: 'ybanez-mangoes', qty: 1 },
      { listingId: 'ernie-eggs', qty: 1 },
    ],
  },
  {
    id: 'BD-2386',
    when: '2 weeks ago',
    lines: [
      { listingId: 'romy-cabbage', qty: 1 },
      { listingId: 'romy-carrots', qty: 1 },
      { listingId: 'romy-potatoes', qty: 1 },
      { listingId: 'jun-calamansi', qty: 1 },
    ],
  },
  {
    id: 'BD-2342',
    when: '3 weeks ago',
    lines: [
      { listingId: 'fe-lettuce', qty: 2 },
      { listingId: 'jun-tomatoes', qty: 0.5 },
      { listingId: 'ybanez-saba', qty: 1 },
      { listingId: 'ernie-rice', qty: 1 },
    ],
  },
]

/* --- Checkout options ------------------------------------------------------------- */

export type PaymentId = 'gcash' | 'cash' | 'card'

export const paymentMethods: { id: PaymentId; label: string; detail: string }[] = [
  { id: 'gcash', label: 'GCash', detail: 'Pay now from your wallet' },
  { id: 'cash', label: 'Cash', detail: 'Pay the rider, or the farmer at pick-up' },
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

/* --- The seller's side (Nong Romy) ------------------------------------------------ */

export const sellerView = {
  farmId: 'romy',
  /* Other buyers' orders for tomorrow. Joy's order joins this list when it
     includes something from Nong Romy. */
  orders: [
    { buyer: 'Mark T.', area: 'Banilad', mode: 'delivery' as Mode, items: 'Tomatoes 2 kg, Cabbage 1 kg', total: 170 },
    { buyer: 'Liza P.', area: 'Mabolo', mode: 'delivery' as Mode, items: 'Carrots 1 kg, Potatoes 2 kg', total: 220 },
    { buyer: 'Cora M.', area: 'Carbon Market', mode: 'pickup' as Mode, items: 'Tomatoes 3 kg, Lettuce 2 heads', total: 250 },
    { buyer: 'Rico D.', area: 'Labangon', mode: 'delivery' as Mode, items: 'Cabbage 2 kg, Carrots 1 kg', total: 170 },
  ],
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

const farmIndex = new Map(farms.map((f) => [f.id, f]))
const produceIndex = new Map(produce.map((p) => [p.id, p]))

export function getFarm(id: string | undefined): Farm {
  return (id && farmIndex.get(id)) || farms[0]
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
}

/** "1.5 kg", "2 bundles", "1 dozen". */
export function qtyText(item: Produce, qty: number) {
  const n = Number.isInteger(qty) ? String(qty) : qty.toFixed(1)
  if (item.unit === 'kg') return `${n} kg`
  return `${n} ${qty === 1 ? item.unit : plurals[item.unit]}`
}

/** "kg", "250 g pack". */
export function perUnit(item: Produce) {
  return item.size && item.unit !== 'bunch' ? `${item.size} ${item.unit}` : item.unit
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

/** Fills {farm}, {courier}, {rider} and {place} in stage wording. */
export function fillText(text: string, farm: Farm) {
  return text
    .replace('{farm}', farm.call)
    .replace('{courier}', courier)
    .replace('{rider}', farm.delivery.rider.name)
    .replace('{place}', farm.pickup?.place ?? 'the farm')
}
