import { useNavigate } from 'react-router-dom'
import { ChevronRight, Store, Truck } from 'lucide-react'
import { Avatar, Rating } from './ui'
import {
  distanceKm,
  distanceText,
  getCourier,
  marketOf,
  schedule,
  slotText,
  stallNo,
  type CourierId,
  type Market,
  type Mode,
  type Seller,
  type Slot,
} from '../data/sample'

/* --------------------------------------------------------------------------
   Small pieces that describe how an order gets from a market to the buyer,
   the round market badge, and the compact stall card used in the shop's
   rail.
   -------------------------------------------------------------------------- */

/** "tomorrow 11 AM – 1 PM" */
export function slotWhen(slot: Slot) {
  return `${schedule.day.toLowerCase()} ${slotText(slot)}`
}

/** "Lalamove · tomorrow 11 AM – 1 PM" */
export function deliveryLine(courier: CourierId, slot: Slot) {
  return `${getCourier(courier).name} · ${slotWhen(slot)}`
}

/** "Pasil Fish Market · tomorrow 5 – 11 AM" */
export function pickupLine(market: Market) {
  return `${market.name} · ${schedule.day.toLowerCase()} ${market.hours}`
}

/** When a market's part arrives, or can be collected: "tomorrow 11 AM – 1 PM". */
export function whenText(market: Market, mode: Mode, slot: Slot) {
  return mode === 'pickup' ? `${schedule.day.toLowerCase()} ${market.hours}` : slotWhen(slot)
}

/** How a market's part gets to the buyer: the courier and time picked for
    it, or pick-up at the market. Without a choice it shows the market's
    usual courier and first time. `wrap` lets it take two lines instead of
    cutting off the time. */
export function FulfilmentRow({
  market,
  mode,
  courier = market.usual,
  slot = market.slots[0],
  wrap = false,
}: {
  market: Market
  mode: Mode
  courier?: CourierId
  slot?: Slot
  wrap?: boolean
}) {
  const Icon = mode === 'pickup' ? Store : Truck
  return (
    <span
      className={`flex min-w-0 gap-2 text-[13.5px] font-semibold leading-snug text-ink-muted ${wrap ? 'items-start' : 'items-center'}`}
    >
      <Icon size={16} strokeWidth={2.4} className={`shrink-0 text-primary ${wrap ? 'mt-[1px]' : ''}`} />
      <span className={wrap ? '' : 'truncate'}>
        {mode === 'pickup' ? pickupLine(market) : deliveryLine(courier, slot)}
      </span>
    </span>
  )
}

/** A market, as a round green badge - stalls get initials, markets get this. */
export function MarketBadge({ size = 40 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"
      style={{ width: size, height: size }}
    >
      <Store size={Math.round(size * 0.46)} strokeWidth={2.3} />
    </span>
  )
}

/** Compact stall card for the shop's "Stalls selling today" rail. */
export function StallChip({ seller, mode }: { seller: Seller; mode: Mode }) {
  const navigate = useNavigate()
  const market = marketOf(seller)
  return (
    <button
      type="button"
      onClick={() => navigate(`/stall/${seller.id}`)}
      className="tappable flex w-[236px] shrink-0 flex-col gap-2.5 rounded-card border border-line bg-card p-3.5 text-left shadow-card"
    >
      <span className="flex items-center gap-3">
        <Avatar initials={seller.initials} size={44} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-extrabold text-ink">{seller.call}</span>
          <span className="flex items-center gap-1.5 text-[12.5px]">
            <Rating value={seller.rating} />
            <span className="truncate font-semibold text-ink-muted">· {market.short}</span>
          </span>
        </span>
        <ChevronRight size={18} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
      </span>
      <span className="rounded-md bg-surface px-3 py-2 text-[12.5px] font-semibold leading-snug text-ink-muted">
        <b className="block truncate font-bold text-ink">{seller.sells}</b>
        <span className="block truncate">
          {stallNo(seller)} ·{' '}
          {mode === 'pickup' ? `${distanceText(distanceKm(market.at))} away` : market.name}
        </span>
      </span>
    </button>
  )
}
