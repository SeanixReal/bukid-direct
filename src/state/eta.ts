/* ==========================================================================
   When a booked rider should reach the buyer: the start of the time the
   buyer and the stalls agreed, plus collecting the order at the market,
   plus the trip across the city on the street map.
   ========================================================================== */

import { pathLength, route } from '../data/route'
import { getMarket, homeAt, type MarketId, type Slot } from '../data/sample'

/* Average speed across the city, for arrival estimates. */
export const CITY_KMH = 22

/* Minutes for the rider to reach the market and collect from the stalls. */
const COLLECT_MIN = 20

/** The rider's route from the market to the buyer's door. */
export function deliveryRoute(marketId: MarketId) {
  return route(getMarket(marketId).at, homeAt)
}

/** How long that trip takes, in minutes. */
export function tripMinutes(marketId: MarketId) {
  return (pathLength(deliveryRoute(marketId)) / 1000 / CITY_KMH) * 60
}

/** Estimated arrival at the buyer's door, in minutes after midnight,
    rounded to five minutes. */
export function arrivalAt(marketId: MarketId, slot: Slot) {
  return Math.round((slot[0] * 60 + COLLECT_MIN + tripMinutes(marketId)) / 5) * 5
}
