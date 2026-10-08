/* ==========================================================================
   Everything for sale right now: the sample listings plus anything a farmer
   publishes during the demo from the Seller Center. Reset puts it back to
   the sample listings.
   ========================================================================== */

import { getProduce, listings as sampleListings, type Listing } from '../data/sample'

let all: Listing[] = [...sampleListings]
let index = new Map(all.map((l) => [l.id, l]))

export function getListing(id: string | undefined): Listing | undefined {
  return id ? index.get(id) : undefined
}

export function allListings(): Listing[] {
  return all
}

/** Newest first, so a fresh listing shows at the top of the shop. */
export function addListing(listing: Listing) {
  all = [listing, ...all]
  index.set(listing.id, listing)
}

/** Puts a listing in the shop's Featured row - a farm paid for it. */
export function featureListing(id: string) {
  const listing = index.get(id)
  if (!listing || listing.featured) return
  const featured = { ...listing, featured: true }
  all = all.map((l) => (l.id === id ? featured : l))
  index.set(id, featured)
}

export function resetListings() {
  all = [...sampleListings]
  index = new Map(all.map((l) => [l.id, l]))
}

/** The listing together with its produce type - what most screens need. */
export function listingDetails(id: string | undefined) {
  const listing = getListing(id)
  return listing ? { listing, item: getProduce(listing.produceId) } : undefined
}
