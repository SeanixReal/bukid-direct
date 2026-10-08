/* ==========================================================================
   Bukid Direct - sample content
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE WITH SAMPLE DATA. Street geometry for the map comes
   from OpenStreetMap (src/data/roads.geojson); everything else - farms,
   farmers, listings, prices, couriers, riders, orders, people - is invented.

   How the marketplace works:
     - Every farm is a seller with its own shop, prices and delivery terms.
     - The same produce can be sold by several farms at different prices.
     - Each farm delivers its own part of an order by courier (Lalamove or
       Maxim, booked by the farmer), or lets the buyer pick it up at the
       farm's own pickup point - like Delivery / Pick-up on Grab or foodpanda.
     - Far farms batch the day's city orders into one shared courier trip, so
       each buyer pays a share instead of a whole trip.

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
    {
      id: 'fee',
      title: 'No service fee',
      detail: 'Save ₱10 on every order.',
    },
    {
      id: 'welcome',
      title: 'Free delivery on your first order',
      detail: "One farm's delivery is on us, on any order of ₱200 or more.",
    },
    {
      id: 'suki',
      title: 'Suki deals from farms',
      detail: 'Members-only vouchers that farms post for their regulars.',
    },
    {
      id: 'early',
      title: 'First pick of the harvest',
      detail: 'Shop new harvests a day before everyone else.',
    },
    {
      id: 'visit',
      title: 'Farm visit days',
      detail: 'Meet the farmers on their land, twice a year.',
    },
  ],
}

/* --- Couriers ----------------------------------------------------------------
   Third-party couriers the farmers book. Names only - the app does not show
   their logos, and nothing here implies a partnership. */

export type CourierId = 'lalamove' | 'maxim'

export const couriers: Record<CourierId, { name: string }> = {
  lalamove: { name: 'Lalamove' },
  maxim: { name: 'Maxim' },
}

/* --- Farms (the sellers) ------------------------------------------------------ */

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
    courier: CourierId
    /* What the buyer pays for this farm's part of an order. */
    fee: number
    /* Free delivery from this farm at or above this subtotal. */
    freeOver: number
    /* Arrival window, the day after ordering. */
    window: string
    /* One courier trip carries all of the day's city orders. */
    shared: boolean
    /* Where the courier enters the map on the way to the buyer. */
    from: LatLng
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
    story:
      'Romy farms the cool highland slopes his father farmed before him. He plants in small batches so something is always ready, and picks only what has been ordered.',
    rating: 4.9,
    reviewCount: 312,
    sold: '1.2k sold',
    delivery: {
      courier: 'lalamove',
      fee: 79,
      freeOver: 800,
      window: '11 AM – 1 PM',
      shared: true,
      from: [10.26092, 123.87211],
      rider: { name: 'Rhea M.', plate: 'GAJ 2716' },
    },
    pickup: {
      place: 'Carbon Market stall',
      detail: 'Stall 12, F. Gonzales Street side',
      at: [10.29296, 123.90033],
      hours: '1 – 6 PM',
    },
    sukiDeal: { off: 15, minSpend: 150 },
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
    story:
      'Fe grows leafy greens on terraces above the city. Everything is cut at first light and packed in the shade, so it arrives still crisp.',
    rating: 4.8,
    reviewCount: 208,
    sold: '860 sold',
    delivery: {
      courier: 'maxim',
      fee: 69,
      freeOver: 500,
      window: '8 – 10 AM',
      shared: false,
      from: [10.37153, 123.8745],
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
    story:
      'A family orchard with mango trees older than the couple. Between the trees they grow saba, calamansi and kamote, and they pick fruit just before it ripens.',
    rating: 4.7,
    reviewCount: 145,
    sold: '540 sold',
    delivery: {
      courier: 'lalamove',
      fee: 89,
      freeOver: 900,
      window: '10 AM – 12 NN',
      shared: true,
      from: [10.42245, 123.79576],
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
    story:
      'Lowland vegetables and a yard of free-range hens. Ernie collects the eggs the day before delivery and picks his vegetables the same morning.',
    rating: 4.8,
    reviewCount: 176,
    sold: '700 sold',
    delivery: {
      courier: 'lalamove',
      fee: 85,
      freeOver: 800,
      window: '10 AM – 12 NN',
      shared: true,
      from: [10.26092, 123.87211],
      rider: { name: 'Arnel P.', plate: 'GBV 1184' },
    },
    sukiDeal: { off: 20, minSpend: 300 },
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
    story:
      'A mixed farm in the hills above Talisay. Jun sells from his stall at Pardo Market most mornings, and now delivers to the city too.',
    rating: 4.6,
    reviewCount: 98,
    sold: '410 sold',
    delivery: {
      courier: 'maxim',
      fee: 99,
      freeOver: 700,
      window: '9 – 11 AM',
      shared: false,
      from: [10.27429, 123.85005],
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
]

/* --- Produce types -------------------------------------------------------------
   What can be sold. Each has a flat illustration in ProduceArt.tsx, a unit
   it is sold in, and how much one tap of + adds. */

export type CategoryId = 'vegetables' | 'leafy' | 'root' | 'fruits' | 'pantry'

export const categories: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'leafy', label: 'Leafy greens' },
  { id: 'root', label: 'Root crops' },
  { id: 'fruits', label: 'Fruits' },
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
  { id: 'eggs', name: 'Free-range eggs', local: 'Itlog', category: 'pantry', tint: 'mint', unit: 'dozen', step: 1 },
  { id: 'rice', name: 'Brown rice', local: 'Bugas', category: 'pantry', tint: 'sand', unit: 'bag', size: '2 kg', step: 1 },
]

/* --- Listings -------------------------------------------------------------------
   What each farm is selling right now. Several farms can sell the same
   produce - the product page shows the other offers side by side. */

export interface Listing {
  id: string
  produceId: ProduceId
  farmId: string
  price: number
  /* Orange badge. "Harvested today" is one of only two uses of orange. */
  harvestedToday?: boolean
  outOfStock?: boolean
  /* The farm pays to show it in the shop's Featured row (see `boost`). */
  featured?: boolean
  about: string
}

export const listings: Listing[] = [
  /* Nong Romy - highland vegetables */
  { id: 'romy-tomatoes', produceId: 'tomatoes', farmId: 'romy', price: 90, harvestedToday: true, about: 'Firm, sweet highland tomatoes, picked just as they turn red so they finish ripening on your counter, not in a truck.' },
  { id: 'romy-carrots', produceId: 'carrots', farmId: 'romy', price: 95, harvestedToday: true, about: 'Sweet highland carrots, pulled the morning they ship. Twist the tops off at home to keep them crisp.' },
  { id: 'romy-cabbage', produceId: 'cabbage', farmId: 'romy', price: 70, about: 'Tight, heavy heads from the cool Mantalongon slopes. Keeps for a week in the fridge.' },
  { id: 'romy-potatoes', produceId: 'potatoes', farmId: 'romy', price: 110, about: 'Floury potatoes for mashing, frying and nilaga. Store them somewhere dark and dry.' },
  { id: 'romy-lettuce', produceId: 'lettuce', farmId: 'romy', price: 60, about: 'Highland romaine with a good crunch. Big heads, cut the morning they ship.' },
  { id: 'romy-bellpepper', produceId: 'bellpepper', farmId: 'romy', price: 220, outOfStock: true, about: 'Thick-walled red peppers. Sold out for this week - the next batch is a few days away.' },

  /* Nang Fe - leafy greens from Busay */
  { id: 'fe-lettuce', produceId: 'lettuce', farmId: 'fe', price: 55, harvestedToday: true, about: 'Crisp green-leaf lettuce from Busay, cut at dawn and kept cool all the way to you.' },
  { id: 'fe-pechay', produceId: 'pechay', farmId: 'fe', price: 35, harvestedToday: true, about: 'Tender pechay with thick white stems. Cook it the day it arrives for the best crunch.' },
  { id: 'fe-malunggay', produceId: 'malunggay', farmId: 'fe', price: 20, about: 'Fresh moringa sprigs for tinola and soups. Strip the leaves just before cooking.' },

  /* Lito & Grace - orchard fruit from Balamban */
  { id: 'ybanez-mangoes', produceId: 'mangoes', farmId: 'ybanez', price: 180, about: 'Sweet carabao mangoes from old Balamban trees. Ready to eat in a day or two.' },
  { id: 'ybanez-saba', produceId: 'saba', farmId: 'ybanez', price: 65, about: 'Firm cooking bananas for banana cue, turon, or simply boiled as a merienda.' },
  { id: 'ybanez-calamansi', produceId: 'calamansi', farmId: 'ybanez', price: 30, about: 'Juicy little limes for juice, pancit and sawsawan.' },
  { id: 'ybanez-kamote', produceId: 'kamote', farmId: 'ybanez', price: 60, about: 'Purple-skinned kamote with sweet yellow flesh. Boil it, roast it or make kamote cue.' },

  /* Nong Ernie - lowland vegetables, eggs and rice from Carcar */
  { id: 'ernie-eggplant', produceId: 'eggplant', farmId: 'ernie', price: 80, about: 'Long, glossy talong for tortang talong or adobo. Picked young, so never bitter.' },
  { id: 'ernie-sitaw', produceId: 'sitaw', farmId: 'ernie', price: 40, about: 'A generous bundle of long beans. Good in utan bisaya or stir-fried with garlic.' },
  { id: 'ernie-squash', produceId: 'squash', farmId: 'ernie', price: 50, about: 'Sweet, deep-orange flesh. Sold by weight - ask for half if you only need a little.' },
  { id: 'ernie-eggs', produceId: 'eggs', farmId: 'ernie', price: 120, featured: true, about: "From hens that roam Nong Ernie's yard. Collected the day before delivery." },
  { id: 'ernie-rice', produceId: 'rice', farmId: 'ernie', price: 150, about: 'Unpolished brown rice, milled in small batches. Nutty, filling and good for you.' },

  /* Nong Jun - mixed farm above Talisay */
  { id: 'jun-tomatoes', produceId: 'tomatoes', farmId: 'jun', price: 85, about: 'Smaller lowland tomatoes with plenty of flavour. Good for sauces and sawsawan.' },
  { id: 'jun-eggplant', produceId: 'eggplant', farmId: 'jun', price: 75, harvestedToday: true, about: 'Round purple talong, picked this morning. Great grilled for ensaladang talong.' },
  { id: 'jun-eggs', produceId: 'eggs', farmId: 'jun', price: 110, about: 'Native-chicken eggs, a little smaller with rich yolks.' },
  { id: 'jun-calamansi', produceId: 'calamansi', farmId: 'jun', price: 28, about: 'Calamansi from the trees along the farm path. Extra juicy this month.' },
  { id: 'jun-mangoes', produceId: 'mangoes', farmId: 'jun', price: 170, featured: true, about: 'Talisay mangoes, a touch smaller than the Balamban ones, just as sweet.' },
]

/* What "Fill basket" in the presenter panel puts in the basket: three farms,
   one of them set to Pick-up, so both ways of getting an order show. */
export const demoBasket: { listingId: string; qty: number }[] = [
  { listingId: 'romy-tomatoes', qty: 1 },
  { listingId: 'romy-carrots', qty: 1 },
  { listingId: 'fe-lettuce', qty: 1 },
  { listingId: 'fe-pechay', qty: 2 },
  { listingId: 'ybanez-mangoes', qty: 1 },
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
    packing: { label: 'Harvesting & packing', detail: '{farm} is picking your order this morning.' },
    ready: { label: 'Ready for pickup', detail: 'Packed and waiting for the {courier} rider.' },
    onTheWay: { label: 'On the way', detail: '{rider} is bringing it to your door.' },
    done: { label: 'Delivered', detail: 'Enjoy your harvest. Salamat for buying direct!' },
  },
  pickup: {
    placed: { label: 'Order placed', detail: 'Sent to {farm}.' },
    packing: { label: 'Harvesting & packing', detail: '{farm} is picking your order this morning.' },
    ready: { label: 'Ready for pickup', detail: 'Packed and waiting for you at {place}.' },
    onTheWay: { label: 'On the way', detail: '' },
    done: { label: 'Picked up', detail: 'Enjoy your harvest. Salamat for buying direct!' },
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
    { buyer: 'Mark T.', area: 'Banilad', mode: 'delivery' as Mode, items: 'Tomatoes 2 kg, Cabbage 1 kg', total: 250 },
    { buyer: 'Liza P.', area: 'Mabolo', mode: 'delivery' as Mode, items: 'Carrots 1 kg, Potatoes 2 kg', total: 315 },
    { buyer: 'Cora M.', area: 'Carbon Market', mode: 'pickup' as Mode, items: 'Tomatoes 3 kg, Lettuce 2 heads', total: 390 },
    { buyer: 'Rico D.', area: 'Labangon', mode: 'delivery' as Mode, items: 'Cabbage 2 kg, Carrots 1 kg', total: 235 },
  ],
  /* Earlier weeks' pay-outs. This week's is worked out from the orders. */
  pastWeeks: [
    { label: 'Wk 1', amount: 6150 },
    { label: 'Wk 2', amount: 7020 },
    { label: 'Wk 3', amount: 6780 },
    { label: 'Wk 4', amount: 7930 },
    { label: 'Wk 5', amount: 8420 },
  ],
  thisWeekSales: 10570,
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
    .replace('{courier}', couriers[farm.delivery.courier].name)
    .replace('{rider}', farm.delivery.rider.name)
    .replace('{place}', farm.pickup?.place ?? 'the farm')
}
