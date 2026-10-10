/* ==========================================================================
   Basket and order maths. Every peso amount on screen comes through here, so
   prices and fees in sample.ts are the only numbers anyone needs to edit.

   A basket is split by market, then by stall: the stalls in one market each
   pack their own part, and one rider - from the courier the buyer picked -
   collects them all in a single stop. So each market has one delivery fee,
   the same whichever courier the buyer picked. On top sits one small service
   fee per order, waived for Direct Plus.

   Who pays for what:
     - Suki deals are posted and paid for by the stall, so the stall's share
       is worked out on what the buyer actually pays for its food.
     - The Direct Plus welcome voucher is paid by PresGo, never the stalls:
       the courier still gets its full fare.
   ========================================================================== */

import {
  fareFor,
  fees,
  getMarket,
  getSeller,
  plusPlan,
  sellerShare,
  type CourierId,
  type MarketId,
  type Mode,
} from '../data/sample'
import { getListing } from './catalog'

export interface Line {
  listingId: string
  qty: number
}

export function lineTotal(line: Line) {
  const listing = getListing(line.listingId)
  return listing ? Math.round(listing.price * line.qty) : 0
}

type ModeOf = (marketId: MarketId) => Mode
type CourierOf = (marketId: MarketId) => CourierId

/** Each market's usual courier - what checkout starts with. */
const usualCourier: CourierOf = (marketId) => getMarket(marketId).usual

/* One stall's part of a market's group. */
export interface StallPart {
  sellerId: string
  lines: Line[]
  /* At the stall's prices. */
  regular: number
  /* The stall's suki deal, when the buyer is a member and it applies. */
  suki: number
}

export interface MarketGroup {
  marketId: MarketId
  mode: Mode
  /* The courier the buyer picked for this market, and the market's delivery
     fare before any voucher. */
  courier: CourierId
  fare: number
  stalls: StallPart[]
  /* Every line from this market, in basket order. */
  lines: Line[]
  regular: number
  suki: number
  /* What the buyer pays for this market's food. */
  subtotal: number
  /* What the buyer pays for this market's delivery. */
  fee: number
  /* Delivery covered by the Direct Plus welcome voucher. */
  voucher: boolean
}

function groupByMarket(lines: Line[], member: boolean, modeOf: ModeOf, courierOf: CourierOf): MarketGroup[] {
  const groups = new Map<MarketId, MarketGroup>()

  for (const line of lines) {
    const listing = getListing(line.listingId)
    if (!listing) continue
    const seller = getSeller(listing.sellerId)
    let group = groups.get(seller.marketId)
    if (!group) {
      const courier = courierOf(seller.marketId)
      group = {
        marketId: seller.marketId,
        mode: modeOf(seller.marketId),
        courier,
        fare: fareFor(getMarket(seller.marketId)),
        stalls: [],
        lines: [],
        regular: 0,
        suki: 0,
        subtotal: 0,
        fee: 0,
        voucher: false,
      }
      groups.set(seller.marketId, group)
    }
    let stall = group.stalls.find((s) => s.sellerId === seller.id)
    if (!stall) {
      stall = { sellerId: seller.id, lines: [], regular: 0, suki: 0 }
      group.stalls.push(stall)
    }
    stall.lines.push(line)
    stall.regular += lineTotal(line)
    group.lines.push(line)
    group.regular += lineTotal(line)
  }

  for (const group of groups.values()) {
    for (const stall of group.stalls) {
      const deal = getSeller(stall.sellerId).sukiDeal
      stall.suki = member && deal && stall.regular >= deal.minSpend ? deal.off : 0
      group.suki += stall.suki
    }
    group.subtotal = group.regular - group.suki
    group.fee = group.mode === 'pickup' ? 0 : group.fare
  }

  return [...groups.values()]
}

export interface Totals {
  /* Number of different listings. */
  count: number
  marketCount: number
  stallCount: number
  /* Food at the stalls' prices. */
  regular: number
  /* Suki deals, paid by the stalls. */
  sukiOff: number
  /* What the buyer pays for the food. */
  subtotal: number
  /* Delivery the buyer pays, after the welcome voucher. */
  delivery: number
  /* Delivery paid by PresGo with the welcome voucher. */
  deliveryCovered: number
  serviceFee: number
  /* Everything Direct Plus took off this order. */
  savings: number
  total: number
  /* The stalls' share of what the buyer pays for their food. */
  toSellers: number
  sellerIds: string[]
}

export interface Priced {
  groups: MarketGroup[]
  totals: Totals
  /* This order uses up the welcome voucher. */
  usedWelcome: boolean
}

/** Prices a basket. `welcome` says whether a member still has the welcome
    voucher: on an order of ₱200 or more it pays the dearest delivery.
    `courierOf` is the courier picked for each market - its usual one unless
    the buyer changed it. */
export function priceBasket(
  lines: Line[],
  member: boolean,
  modeOf: ModeOf,
  welcome: boolean,
  courierOf: CourierOf = usualCourier,
): Priced {
  const groups = groupByMarket(lines, member, modeOf, courierOf)
  let deliveryCovered = 0

  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0)
  if (member && welcome && subtotal >= plusPlan.welcome.minSpend) {
    const dearest = groups
      .filter((g) => g.fee > 0)
      .sort((a, b) => b.fee - a.fee)[0]
    if (dearest) {
      deliveryCovered = dearest.fee
      dearest.fee = 0
      dearest.voucher = true
    }
  }

  return {
    groups,
    totals: totals(groups, member, deliveryCovered),
    usedWelcome: deliveryCovered > 0,
  }
}

function totals(groups: MarketGroup[], member: boolean, deliveryCovered: number): Totals {
  let count = 0
  let regular = 0
  let sukiOff = 0
  let subtotal = 0
  let delivery = 0
  const sellerIds: string[] = []

  for (const g of groups) {
    count += g.lines.length
    regular += g.regular
    sukiOff += g.suki
    subtotal += g.subtotal
    delivery += g.fee
    sellerIds.push(...g.stalls.map((s) => s.sellerId))
  }

  const serviceFee = count > 0 && !member ? fees.service : 0
  const waived = count > 0 && member ? fees.service : 0

  return {
    count,
    marketCount: groups.length,
    stallCount: sellerIds.length,
    regular,
    sukiOff,
    subtotal,
    delivery,
    deliveryCovered,
    serviceFee,
    savings: sukiOff + deliveryCovered + waived,
    total: subtotal + delivery + serviceFee,
    toSellers: Math.round(subtotal * sellerShare),
    sellerIds,
  }
}

/** Where an order's money goes. Delivery is paid to the couriers; PresGo
    keeps the commission and the service fee, and pays for the welcome
    voucher. Before payment fees. */
export function moneySplit(t: Totals) {
  const commission = t.subtotal - t.toSellers
  return {
    sellers: t.toSellers,
    delivery: t.delivery + t.deliveryCovered,
    commission,
    serviceFee: t.serviceFee,
    voucher: t.deliveryCovered,
    us: commission + t.serviceFee - t.deliveryCovered,
  }
}

/** What a basket would save with Direct Plus. The live basket passes its own
    Delivery / Pick-up and courier choices, and whether the welcome voucher
    is still there. */
export function plusSavings(
  lines: Line[],
  modeOf: ModeOf = () => 'delivery',
  welcome = true,
  courierOf: CourierOf = usualCourier,
) {
  return priceBasket(lines, true, modeOf, welcome, courierOf).totals.savings
}

/** What a run of orders, oldest first, would have saved with Direct Plus -
    the welcome voucher on the first one it fits. */
export function plusSavingsOver(orders: Line[][]) {
  let welcome = true
  let saved = 0
  for (const lines of orders) {
    const priced = priceBasket(lines, true, () => 'delivery', welcome)
    saved += priced.totals.savings
    if (priced.usedWelcome) welcome = false
  }
  return saved
}

/** A basket's total without Direct Plus, everything delivered. */
export function regularTotal(lines: Line[]) {
  return priceBasket(lines, false, () => 'delivery', false).totals.total
}
