/* ==========================================================================
   Bukid Direct - sample content
   --------------------------------------------------------------------------
   THIS IS THE ONLY FILE WITH SAMPLE DATA. Street geometry for the hub map
   comes from OpenStreetMap (src/data/roads.geojson); everything else -
   farms, farmers, produce, prices, hubs, orders, people - is invented.

   House rules for anything written in this file:
     - Plain English, with the occasional Bisaya touch in labels
       ("Salamat!", "Nong Romy", "Kamatis"). No slang overload.
     - No invented statistics about Cebu or about farming in general.
       Everything here describes one made-up week for one made-up buyer and
       the four made-up farms she buys from.
     - Prices are illustrative, in pesos. Change them freely - every total
       in the app is worked out from these numbers.
   ========================================================================== */

/* --- Brand ---------------------------------------------------------------- */

export const brand = {
  name: 'Bukid Direct',
  tagline: 'Fresh from the Farm.',
  plus: 'Direct Plus',
  hub: 'Pickup Hub',
}

/* --- The person using the app --------------------------------------------- */

export const user = {
  firstName: 'Joy',
  fullName: 'Joy Cabahug',
  initials: 'JC',
  area: 'Lahug, Cebu City',
  mobile: '0917 ••• 2741',
  since: 'Buying direct since August',
}

/** A Bisaya hello that matches the time of day. */
export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Maayong buntag'
  if (h < 18) return 'Maayong hapon'
  return 'Maayong gabii'
}

/* --- How the week works ----------------------------------------------------
   Order tonight, the farms harvest in the morning, pick up in the afternoon.
   Kept relative ("tonight", "tomorrow") so the demo never shows a stale
   date. */

export const schedule = {
  cutoff: '9 PM tonight',
  pickupDay: 'Tomorrow',
}

export type SlotId = 'early' | 'late'

export const pickupSlots: { id: SlotId; label: string }[] = [
  { id: 'early', label: '3 – 5 PM' },
  { id: 'late', label: '5 – 7 PM' },
]

/* --- Money ------------------------------------------------------------------ */

export const fees = {
  /* Per order, for running the hub. Free with Direct Plus. */
  hub: 25,
}

/* Share of every produce peso that goes to the farm. PLACEHOLDER - set the
   real number once the model is agreed. */
export const farmerShare = 0.85

export const plusPlan = {
  name: 'Direct Plus',
  /* PLACEHOLDER price - change freely. */
  price: 99,
  period: 'month',
  /* Member prices are this much lower on every item. */
  discount: 0.1,
  perks: [
    {
      id: 'prices',
      title: '10% off every harvest',
      detail: 'Member prices show in green across the shop.',
    },
    {
      id: 'fee',
      title: 'No Pickup Hub fee',
      detail: 'Save ₱25 on every single order.',
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

/* --- Pickup Hubs ------------------------------------------------------------
   `at` is [lat, lng] on the real street named in `host`, so the pins land on
   the right road on the map. Distances are worked out from `homeAt`. */

export interface Hub {
  id: string
  name: string
  area: string
  host: string
  at: [number, number]
  /* Pickup window, every day. */
  hours: string
  closes: string
}

export const hubs: Hub[] = [
  {
    id: 'lahug',
    name: 'Lahug Hub',
    area: 'Lahug',
    host: 'Covered court, Salinas Drive',
    at: [10.33068, 123.89908],
    hours: '3 – 7 PM',
    closes: '7 PM',
  },
  {
    id: 'banilad',
    name: 'Banilad Hub',
    area: 'Banilad',
    host: 'Parish hall, Gov. M. Cuenco Avenue',
    at: [10.35574, 123.91506],
    hours: '3 – 7 PM',
    closes: '7 PM',
  },
  {
    id: 'mabolo',
    name: 'Mabolo Hub',
    area: 'Mabolo',
    host: 'Community center, Juan Luna Avenue',
    at: [10.3133, 123.91534],
    hours: '3 – 7 PM',
    closes: '7 PM',
  },
  {
    id: 'fuente',
    name: 'Fuente Hub',
    area: 'Capitol Site',
    host: 'Osmeña Boulevard, near the rotonda',
    at: [10.31482, 123.89147],
    hours: '3 – 7 PM',
    closes: '7 PM',
  },
  {
    id: 'labangon',
    name: 'Labangon Hub',
    area: 'Labangon',
    host: 'Market annex, Katipunan Street',
    at: [10.30004, 123.87692],
    hours: '3 – 7 PM',
    closes: '7 PM',
  },
]

/* Where Joy lives - the "You" dot on the map. */
export const homeAt: [number, number] = [10.3262, 123.9046]

export const defaultHubId = 'lahug'

/* --- Farms -------------------------------------------------------------- */

export interface Farm {
  id: string
  farmer: string
  /* How buyers know them. */
  call: string
  initials: string
  place: string
  since: string
  harvests: string
  story: string
}

export const farms: Farm[] = [
  {
    id: 'romy',
    farmer: 'Romy Alcoseba',
    call: 'Nong Romy',
    initials: 'RA',
    place: 'Mantalongon, Dalaguete',
    since: 'Selling here since 2025',
    harvests: 'Harvests the morning of every pickup',
    story:
      'Romy farms the cool highland slopes his father farmed before him. He plants in small batches so something is always ready, and picks only what has been ordered.',
  },
  {
    id: 'fe',
    farmer: 'Fe Tabanao',
    call: 'Nang Fe',
    initials: 'FT',
    place: 'Busay, Cebu City',
    since: 'Selling here since 2025',
    harvests: 'Picks at dawn, packs in the shade',
    story:
      'Fe grows leafy greens on terraces above the city. Everything is cut at first light and packed in the shade, so it reaches the hub still crisp.',
  },
  {
    id: 'ybanez',
    farmer: 'Lito & Grace Ybañez',
    call: 'Lito & Grace',
    initials: 'LG',
    place: 'Balamban',
    since: 'Selling here since 2026',
    harvests: 'Picks fruit a day or two before it ripens',
    story:
      'A family orchard with mango trees older than the couple. Between the trees they grow saba, calamansi and kamote, and they pick fruit just before it ripens.',
  },
  {
    id: 'ernie',
    farmer: 'Ernie Pepito',
    call: 'Nong Ernie',
    initials: 'EP',
    place: 'Carcar',
    since: 'Selling here since 2025',
    harvests: 'Eggs collected the day before pickup',
    story:
      'Lowland vegetables and a yard of free-range hens. Ernie collects the eggs the day before pickup and picks his vegetables the same morning.',
  },
]

/* --- Produce ---------------------------------------------------------------- */

export type CategoryId = 'vegetables' | 'leafy' | 'root' | 'fruits' | 'pantry'

export const categories: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'leafy', label: 'Leafy greens' },
  { id: 'root', label: 'Root crops' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'pantry', label: 'Eggs & rice' },
]

/* Picture background behind each product's illustration. */
export type Tint = 'mint' | 'leaf' | 'cream' | 'sand'

/* Every product has a matching flat illustration in ProduceArt.tsx. */
export type ProductId =
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

export interface Product {
  id: ProductId
  name: string
  /* Bisaya name, shown under the English one. */
  local?: string
  category: CategoryId
  farmId: string
  /* Sold per... */
  unit: 'kg' | 'bundle' | 'head' | 'bunch' | 'pack' | 'dozen' | 'bag'
  /* Extra size detail, e.g. "250 g". */
  size?: string
  /* How much one tap of + adds. */
  step: number
  price: number
  tint: Tint
  /* Accent badge. "Harvested today" is one of only two uses of orange. */
  harvestedToday?: boolean
  outOfStock?: boolean
  about: string
}

export const products: Product[] = [
  {
    id: 'tomatoes',
    name: 'Tomatoes',
    local: 'Kamatis',
    category: 'vegetables',
    farmId: 'romy',
    unit: 'kg',
    step: 0.5,
    price: 90,
    tint: 'cream',
    harvestedToday: true,
    about:
      'Firm, sweet highland tomatoes, picked just as they turn red so they finish ripening on your counter, not in a truck.',
  },
  {
    id: 'cabbage',
    name: 'Cabbage',
    local: 'Repolyo',
    category: 'vegetables',
    farmId: 'romy',
    unit: 'kg',
    step: 0.5,
    price: 70,
    tint: 'mint',
    about: 'Tight, heavy heads from the cool Mantalongon slopes. Keeps for a week in the fridge.',
  },
  {
    id: 'bellpepper',
    name: 'Bell pepper',
    category: 'vegetables',
    farmId: 'romy',
    unit: 'kg',
    step: 0.5,
    price: 220,
    tint: 'cream',
    outOfStock: true,
    about:
      'Thick-walled red peppers. Sold out for this week - Nong Romy picks the next batch in a few days.',
  },
  {
    id: 'eggplant',
    name: 'Eggplant',
    local: 'Talong',
    category: 'vegetables',
    farmId: 'ernie',
    unit: 'kg',
    step: 0.5,
    price: 80,
    tint: 'sand',
    about: 'Long, glossy talong for tortang talong or adobo. Picked young, so never bitter.',
  },
  {
    id: 'sitaw',
    name: 'String beans',
    local: 'Batong',
    category: 'vegetables',
    farmId: 'ernie',
    unit: 'bundle',
    step: 1,
    price: 40,
    tint: 'leaf',
    about: 'A generous bundle of long beans. Good in utan bisaya or stir-fried with garlic.',
  },
  {
    id: 'squash',
    name: 'Squash',
    local: 'Kalabasa',
    category: 'vegetables',
    farmId: 'ernie',
    unit: 'kg',
    step: 0.5,
    price: 50,
    tint: 'sand',
    about: 'Sweet, deep-orange flesh. Sold by weight - ask for half if you only need a little.',
  },
  {
    id: 'lettuce',
    name: 'Lettuce',
    local: 'Litsugas',
    category: 'leafy',
    farmId: 'fe',
    unit: 'head',
    step: 1,
    price: 55,
    tint: 'leaf',
    harvestedToday: true,
    about: 'Crisp green-leaf lettuce from Busay, cut at dawn and kept cool all the way to the hub.',
  },
  {
    id: 'pechay',
    name: 'Pechay',
    category: 'leafy',
    farmId: 'fe',
    unit: 'bundle',
    step: 1,
    price: 35,
    tint: 'mint',
    harvestedToday: true,
    about: 'Tender pechay with thick white stems. Cook it the day you pick it up for the best crunch.',
  },
  {
    id: 'malunggay',
    name: 'Malunggay',
    category: 'leafy',
    farmId: 'fe',
    unit: 'bundle',
    step: 1,
    price: 20,
    tint: 'leaf',
    about: 'Fresh moringa sprigs for tinola and soups. Strip the leaves just before cooking.',
  },
  {
    id: 'carrots',
    name: 'Carrots',
    local: 'Karot',
    category: 'root',
    farmId: 'romy',
    unit: 'kg',
    step: 0.5,
    price: 95,
    tint: 'cream',
    harvestedToday: true,
    about:
      'Sweet highland carrots, pulled the morning they ship. Twist the tops off at home to keep them crisp.',
  },
  {
    id: 'potatoes',
    name: 'Potatoes',
    local: 'Patatas',
    category: 'root',
    farmId: 'romy',
    unit: 'kg',
    step: 0.5,
    price: 110,
    tint: 'sand',
    about: 'Floury potatoes for mashing, frying and nilaga. Store them somewhere dark and dry.',
  },
  {
    id: 'kamote',
    name: 'Sweet potatoes',
    local: 'Kamote',
    category: 'root',
    farmId: 'ybanez',
    unit: 'kg',
    step: 0.5,
    price: 60,
    tint: 'sand',
    about: 'Purple-skinned kamote with sweet yellow flesh. Boil it, roast it or make kamote cue.',
  },
  {
    id: 'mangoes',
    name: 'Mangoes',
    local: 'Mangga',
    category: 'fruits',
    farmId: 'ybanez',
    unit: 'kg',
    step: 0.5,
    price: 180,
    tint: 'cream',
    about: 'Sweet carabao mangoes from old Balamban trees. Ready to eat in a day or two.',
  },
  {
    id: 'saba',
    name: 'Saba bananas',
    local: 'Saging saba',
    category: 'fruits',
    farmId: 'ybanez',
    unit: 'bunch',
    size: 'about 10 pieces',
    step: 1,
    price: 65,
    tint: 'cream',
    about: 'Firm cooking bananas for banana cue, turon, or simply boiled as a merienda.',
  },
  {
    id: 'calamansi',
    name: 'Calamansi',
    local: 'Lemonsito',
    category: 'fruits',
    farmId: 'ybanez',
    unit: 'pack',
    size: '250 g',
    step: 1,
    price: 30,
    tint: 'leaf',
    about: 'Juicy little limes for juice, pancit and sawsawan.',
  },
  {
    id: 'eggs',
    name: 'Free-range eggs',
    local: 'Itlog',
    category: 'pantry',
    farmId: 'ernie',
    unit: 'dozen',
    step: 1,
    price: 120,
    tint: 'mint',
    about: "From hens that roam Nong Ernie's yard. Collected the day before pickup.",
  },
  {
    id: 'rice',
    name: 'Brown rice',
    local: 'Bugas',
    category: 'pantry',
    farmId: 'ernie',
    unit: 'bag',
    size: '2 kg',
    step: 1,
    price: 150,
    tint: 'sand',
    about: 'Unpolished brown rice, milled in small batches. Nutty, filling and good for you.',
  },
]

/* What "Fill a demo basket" in the presenter panel puts in the basket. */
export const demoBasket: { productId: ProductId; qty: number }[] = [
  { productId: 'tomatoes', qty: 1 },
  { productId: 'pechay', qty: 2 },
  { productId: 'lettuce', qty: 1 },
  { productId: 'mangoes', qty: 1 },
  { productId: 'eggs', qty: 1 },
]

/* --- The order ---------------------------------------------------------------
   One order moves through these stages. "Play order day" in the presenter
   panel (D) walks through them on an accelerated clock; `at` is when each
   stage is reached, in ms after pressing it. */

export type StageId = 'placed' | 'harvesting' | 'onTheWay' | 'ready' | 'pickedUp'

export const orderStages: {
  id: StageId
  label: string
  detail: string
  time: string
  at: number
}[] = [
  {
    id: 'placed',
    label: 'Order placed',
    detail: 'Sent to the farms tonight.',
    time: '',
    at: 0,
  },
  {
    id: 'harvesting',
    label: 'Harvesting',
    detail: 'The farmers are picking your order this morning.',
    time: '5:30 AM',
    at: 2000,
  },
  {
    id: 'onTheWay',
    label: 'On the way',
    detail: 'Packed in crates and on the truck to {hub}.',
    time: '11:10 AM',
    at: 8000,
  },
  {
    id: 'ready',
    label: 'Ready for pickup',
    detail: 'Waiting for you at {hub}. Bring your pickup code.',
    time: '2:45 PM',
    at: 14000,
  },
  {
    id: 'pickedUp',
    label: 'Picked up',
    detail: 'Enjoy your harvest. Salamat for buying direct!',
    time: '3:20 PM',
    at: Infinity,
  },
]

/* The order the demo places. */
export const demoOrder = {
  id: 'BD-2481',
  code: '4821',
}

/* --- Past orders ------------------------------------------------------------ */

export interface PastOrder {
  id: string
  when: string
  hubId: string
  lines: { productId: ProductId; qty: number }[]
}

export const pastOrders: PastOrder[] = [
  {
    id: 'BD-2417',
    when: 'Last Friday',
    hubId: 'lahug',
    lines: [
      { productId: 'tomatoes', qty: 1 },
      { productId: 'pechay', qty: 2 },
      { productId: 'mangoes', qty: 1 },
      { productId: 'eggs', qty: 1 },
    ],
  },
  {
    id: 'BD-2386',
    when: '2 weeks ago',
    hubId: 'lahug',
    lines: [
      { productId: 'cabbage', qty: 1 },
      { productId: 'carrots', qty: 1 },
      { productId: 'potatoes', qty: 1 },
      { productId: 'calamansi', qty: 1 },
    ],
  },
  {
    id: 'BD-2342',
    when: '3 weeks ago',
    hubId: 'fuente',
    lines: [
      { productId: 'lettuce', qty: 2 },
      { productId: 'tomatoes', qty: 0.5 },
      { productId: 'saba', qty: 1 },
      { productId: 'rice', qty: 1 },
    ],
  },
]

/* --- Checkout options ------------------------------------------------------- */

export type PaymentId = 'gcash' | 'cash' | 'card'

export const paymentMethods: { id: PaymentId; label: string; detail: string }[] = [
  { id: 'gcash', label: 'GCash', detail: 'Pay now from your wallet' },
  { id: 'cash', label: 'Cash at pickup', detail: 'Pay the hub staff when you collect' },
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

/* --- The farmer's side (Nong Romy) ------------------------------------------ */

export const farmerView = {
  farmId: 'romy',
  orders: 38,
  /* This week's harvest list, in kg. */
  harvest: [
    { productId: 'tomatoes' as ProductId, kg: 46 },
    { productId: 'cabbage' as ProductId, kg: 31 },
    { productId: 'carrots' as ProductId, kg: 24 },
    { productId: 'potatoes' as ProductId, kg: 18 },
  ],
  dropOffs: [
    { hubId: 'lahug', time: '11:10 AM', crates: 6 },
    { hubId: 'banilad', time: '11:45 AM', crates: 4 },
    { hubId: 'mabolo', time: '12:20 PM', crates: 3 },
    { hubId: 'fuente', time: '1:00 PM', crates: 5 },
    { hubId: 'labangon', time: '1:35 PM', crates: 2 },
  ],
  /* Earlier weeks' pay-outs. This week's is worked out from the harvest
     list, so the last bar always matches the number above it. */
  pastWeeks: [
    { label: 'Wk 1', amount: 6150 },
    { label: 'Wk 2', amount: 7020 },
    { label: 'Wk 3', amount: 6780 },
    { label: 'Wk 4', amount: 7930 },
    { label: 'Wk 5', amount: 8420 },
  ],
  payout: 'Paid every Saturday to GCash',
}

/* ==========================================================================
   Lookups and wording
   ========================================================================== */

const productIndex = new Map(products.map((p) => [p.id, p]))
const farmIndex = new Map(farms.map((f) => [f.id, f]))
const hubIndex = new Map(hubs.map((h) => [h.id, h]))

export function getProduct(id: string | undefined): Product | undefined {
  return id ? productIndex.get(id as ProductId) : undefined
}

export function getFarm(id: string | undefined): Farm {
  return (id && farmIndex.get(id)) || farms[0]
}

export function getHub(id: string | undefined): Hub {
  return (id && hubIndex.get(id)) || hubs[0]
}

export function getSlot(id: SlotId) {
  return pickupSlots.find((s) => s.id === id) ?? pickupSlots[0]
}

/** ₱1,240 - whole pesos, the way prices are written at the market. */
export function peso(amount: number) {
  return `₱${Math.round(amount).toLocaleString('en-PH')}`
}

const plurals: Record<Product['unit'], string> = {
  kg: 'kg',
  bundle: 'bundles',
  head: 'heads',
  bunch: 'bunches',
  pack: 'packs',
  dozen: 'dozen',
  bag: 'bags',
}

/** "1.5 kg", "2 bundles", "1 dozen". */
export function qtyText(product: Product, qty: number) {
  const n = Number.isInteger(qty) ? String(qty) : qty.toFixed(1)
  if (product.unit === 'kg') return `${n} kg`
  return `${n} ${qty === 1 ? product.unit : plurals[product.unit]}`
}

/** "per kg", "per 250 g pack". */
export function perUnit(product: Product) {
  return product.size && product.unit !== 'bunch'
    ? `${product.size} ${product.unit}`
    : product.unit
}

/** Straight-line distance from Joy's home, for the hub list. */
export function distanceKm(at: [number, number], from: [number, number] = homeAt) {
  const rad = Math.PI / 180
  const dLat = (at[0] - from[0]) * rad
  const dLng = (at[1] - from[1]) * rad
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(from[0] * rad) * Math.cos(at[0] * rad) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

/** "Thu" today, "Fri" tomorrow - real weekdays, so the order timeline
    reads in order whatever day the demo runs. */
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

export function distanceText(km: number) {
  return km < 1 ? `${Math.round(km * 1000 / 50) * 50} m away` : `${km.toFixed(1)} km away`
}
