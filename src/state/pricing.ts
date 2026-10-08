/* ==========================================================================
   Basket and order maths. Every peso amount on screen comes through here, so
   prices and fees in sample.ts are the only numbers anyone needs to edit.

   A basket is split by farm: each farm packs and sends (or hands over) its
   own part, so each farm has its own delivery fee and free-delivery mark.
   On top sits one small service fee per order, waived for Direct Plus.

   Who pays for what:
     - Suki deals are posted and paid for by the farm, so the farm's share is
       worked out on what the buyer actually pays for its produce.
     - The Direct Plus welcome voucher is paid by Bukid Direct, never the
       farm: Lalamove still gets its full price.
   ========================================================================== */

import { farmerShare, fees, getFarm, plusPlan, type Mode } from '../data/sample'
import { getListing } from './catalog'

export interface Line {
  listingId: string
  qty: number
}

export function lineTotal(line: Line) {
  const listing = getListing(line.listingId)
  return listing ? Math.round(listing.price * line.qty) : 0
}

export interface FarmGroup {
  farmId: string
  mode: Mode
  lines: Line[]
  /* At the farm's prices. */
  regular: number
  /* The farm's suki deal, when the buyer is a member and it applies. */
  suki: number
  /* What the buyer pays for this farm's produce. */
  subtotal: number
  /* What the buyer pays for this farm's delivery. */
  fee: number
  /* Pesos more from this farm for its own free delivery; 0 when free or
     picking up. */
  toFree: number
  /* Delivery covered by the Direct Plus welcome voucher. */
  voucher: boolean
}

function groupByFarm(lines: Line[], member: boolean, modeOf: (farmId: string) => Mode): FarmGroup[] {
  const groups = new Map<string, FarmGroup>()

  for (const line of lines) {
    const listing = getListing(line.listingId)
    if (!listing) continue
    let group = groups.get(listing.farmId)
    if (!group) {
      group = {
        farmId: listing.farmId,
        mode: modeOf(listing.farmId),
        lines: [],
        regular: 0,
        suki: 0,
        subtotal: 0,
        fee: 0,
        toFree: 0,
        voucher: false,
      }
      groups.set(listing.farmId, group)
    }
    group.lines.push(line)
    group.regular += lineTotal(line)
  }

  for (const group of groups.values()) {
    const farm = getFarm(group.farmId)
    const deal = farm.sukiDeal
    group.suki = member && deal && group.regular >= deal.minSpend ? deal.off : 0
    group.subtotal = group.regular - group.suki

    /* Free delivery is the farm's own offer, so it counts the farm's prices. */
    if (group.mode === 'pickup') continue
    const free = group.regular >= farm.delivery.freeOver
    group.toFree = free ? 0 : farm.delivery.freeOver - group.regular
    group.fee = free ? 0 : farm.delivery.fee
  }

  return [...groups.values()]
}

export interface Totals {
  /* Number of different listings. */
  count: number
  farmCount: number
  /* Produce at the farms' prices. */
  regular: number
  /* Suki deals, paid by the farms. */
  sukiOff: number
  /* What the buyer pays for the produce. */
  subtotal: number
  /* Delivery the buyer pays, after the welcome voucher. */
  delivery: number
  /* Delivery paid by Bukid Direct with the welcome voucher. */
  deliveryCovered: number
  serviceFee: number
  /* Everything Direct Plus took off this order. */
  savings: number
  total: number
  /* The farms' share of what the buyer pays for their produce. */
  toFarmers: number
  farmIds: string[]
}

export interface Priced {
  groups: FarmGroup[]
  totals: Totals
  /* This order uses up the welcome voucher. */
  usedWelcome: boolean
}

/** Prices a basket. `welcome` says whether a member still has the welcome
    voucher: on an order of ₱200 or more it pays the biggest delivery fee. */
export function priceBasket(
  lines: Line[],
  member: boolean,
  modeOf: (farmId: string) => Mode,
  welcome: boolean,
): Priced {
  const groups = groupByFarm(lines, member, modeOf)
  let deliveryCovered = 0

  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0)
  if (member && welcome && subtotal >= plusPlan.welcome.minSpend) {
    const biggest = groups
      .filter((g) => g.fee > 0)
      .sort((a, b) => b.fee - a.fee)[0]
    if (biggest) {
      deliveryCovered = biggest.fee
      biggest.fee = 0
      biggest.voucher = true
    }
  }

  return {
    groups,
    totals: totals(groups, member, deliveryCovered),
    usedWelcome: deliveryCovered > 0,
  }
}

function totals(groups: FarmGroup[], member: boolean, deliveryCovered: number): Totals {
  let count = 0
  let regular = 0
  let sukiOff = 0
  let subtotal = 0
  let delivery = 0

  for (const g of groups) {
    count += g.lines.length
    regular += g.regular
    sukiOff += g.suki
    subtotal += g.subtotal
    delivery += g.fee
  }

  const serviceFee = count > 0 && !member ? fees.service : 0
  const waived = count > 0 && member ? fees.service : 0

  return {
    count,
    farmCount: groups.length,
    regular,
    sukiOff,
    subtotal,
    delivery,
    deliveryCovered,
    serviceFee,
    savings: sukiOff + deliveryCovered + waived,
    total: subtotal + delivery + serviceFee,
    toFarmers: Math.round(subtotal * farmerShare),
    farmIds: groups.map((g) => g.farmId),
  }
}

/** Where an order's money goes. Delivery is paid to Lalamove at its own
    price; Bukid Direct keeps the commission and the service fee, and pays
    for the welcome voucher. Before payment fees. */
export function moneySplit(t: Totals) {
  const commission = t.subtotal - t.toFarmers
  return {
    farms: t.toFarmers,
    delivery: t.delivery + t.deliveryCovered,
    commission,
    serviceFee: t.serviceFee,
    voucher: t.deliveryCovered,
    us: commission + t.serviceFee - t.deliveryCovered,
  }
}

/** What a basket would save with Direct Plus. The live basket passes its own
    Delivery / Pick-up choices and whether the welcome voucher is still there. */
export function plusSavings(
  lines: Line[],
  modeOf: (farmId: string) => Mode = () => 'delivery',
  welcome = true,
) {
  return priceBasket(lines, true, modeOf, welcome).totals.savings
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
