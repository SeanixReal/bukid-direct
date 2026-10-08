/* ==========================================================================
   Basket and order maths. Every peso amount on screen comes through here, so
   prices in sample.ts are the only numbers anyone needs to edit.
   ========================================================================== */

import { farmerShare, fees, getProduct, plusPlan, type ProductId } from '../data/sample'

export interface Line {
  productId: ProductId
  qty: number
}

/** Price per unit, with the Direct Plus discount when the buyer is a member. */
export function unitPrice(price: number, member: boolean) {
  return member ? Math.round(price * (1 - plusPlan.discount)) : price
}

export function lineTotal(line: Line, member: boolean) {
  const product = getProduct(line.productId)
  if (!product) return 0
  return Math.round(unitPrice(product.price, member) * line.qty)
}

export interface Totals {
  /* Number of different products. */
  count: number
  /* What the produce would cost at regular prices. */
  regular: number
  subtotal: number
  hubFee: number
  /* Member discount plus the waived hub fee. */
  savings: number
  total: number
  /* The farms' share of the produce price. */
  toFarmers: number
  farmIds: string[]
}

export function totals(lines: Line[], member: boolean): Totals {
  const count = lines.length
  let regular = 0
  let subtotal = 0
  const farmIds: string[] = []

  for (const line of lines) {
    const product = getProduct(line.productId)
    if (!product) continue
    regular += Math.round(product.price * line.qty)
    subtotal += lineTotal(line, member)
    if (!farmIds.includes(product.farmId)) farmIds.push(product.farmId)
  }

  const hubFee = count > 0 && !member ? fees.hub : 0
  const waived = count > 0 && member ? fees.hub : 0

  return {
    count,
    regular,
    subtotal,
    hubFee,
    savings: regular - subtotal + waived,
    total: subtotal + hubFee,
    toFarmers: Math.round(subtotal * farmerShare),
    farmIds,
  }
}

/** What a basket would have saved with Direct Plus. */
export function plusSavings(lines: Line[]) {
  return totals(lines, true).savings
}
