/* ==========================================================================
   Basket and order maths. Every peso amount on screen comes through here, so
   prices and fees in sample.ts are the only numbers anyone needs to edit.

   A basket is split by farm: each farm packs and sends (or hands over) its
   own part, so each farm has its own delivery fee and free-delivery mark.
   ========================================================================== */

import { farmerShare, getFarm, plusPlan, type Mode } from '../data/sample'
import { getListing } from './catalog'

export interface Line {
  listingId: string
  qty: number
}

/** Price per unit, with the Direct Plus discount when the buyer is a member. */
export function unitPrice(price: number, member: boolean) {
  return member ? Math.round(price * (1 - plusPlan.discount)) : price
}

export function lineTotal(line: Line, member: boolean) {
  const listing = getListing(line.listingId)
  return listing ? Math.round(unitPrice(listing.price, member) * line.qty) : 0
}

export interface FarmGroup {
  farmId: string
  mode: Mode
  lines: Line[]
  /* At regular prices. */
  regular: number
  subtotal: number
  /* The farm's delivery fee before any discount. */
  baseFee: number
  /* What the buyer pays for this farm's delivery. */
  fee: number
  /* Pesos more from this farm for free delivery; 0 when free or picking up. */
  toFree: number
}

export function groupByFarm(
  lines: Line[],
  member: boolean,
  modeOf: (farmId: string) => Mode,
): FarmGroup[] {
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
        subtotal: 0,
        baseFee: 0,
        fee: 0,
        toFree: 0,
      }
      groups.set(listing.farmId, group)
    }
    group.lines.push(line)
    group.regular += Math.round(listing.price * line.qty)
    group.subtotal += lineTotal(line, member)
  }

  for (const group of groups.values()) {
    if (group.mode === 'pickup') continue
    const delivery = getFarm(group.farmId).delivery
    const free = group.subtotal >= delivery.freeOver
    group.baseFee = delivery.fee
    group.toFree = free ? 0 : delivery.freeOver - group.subtotal
    group.fee = free ? 0 : Math.max(0, delivery.fee - (member ? plusPlan.deliveryDiscount : 0))
  }

  return [...groups.values()]
}

export interface Totals {
  /* Number of different listings. */
  count: number
  farmCount: number
  regular: number
  subtotal: number
  delivery: number
  /* Member prices plus the member delivery discount. */
  savings: number
  total: number
  /* The farms' share of the produce price. */
  toFarmers: number
  farmIds: string[]
}

export function totals(groups: FarmGroup[]): Totals {
  let count = 0
  let regular = 0
  let subtotal = 0
  let delivery = 0
  let deliverySaved = 0

  for (const g of groups) {
    count += g.lines.length
    regular += g.regular
    subtotal += g.subtotal
    delivery += g.fee
    if (g.mode === 'delivery' && g.toFree > 0) deliverySaved += g.baseFee - g.fee
  }

  return {
    count,
    farmCount: groups.length,
    regular,
    subtotal,
    delivery,
    savings: regular - subtotal + deliverySaved,
    total: subtotal + delivery,
    toFarmers: Math.round(subtotal * farmerShare),
    farmIds: groups.map((g) => g.farmId),
  }
}

/** What a basket would save with Direct Plus. Past orders count as
    delivered; the live basket passes its own Delivery / Pick-up choices. */
export function plusSavings(lines: Line[], modeOf: (farmId: string) => Mode = () => 'delivery') {
  return totals(groupByFarm(lines, true, modeOf)).savings
}

/** A basket's total at regular prices, everything delivered. */
export function regularTotal(lines: Line[]) {
  return totals(groupByFarm(lines, false, () => 'delivery')).total
}
