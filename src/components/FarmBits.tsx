import { useNavigate } from 'react-router-dom'
import { ChevronRight, Store, Truck } from 'lucide-react'
import { Avatar, Rating } from './ui'
import { courier, distanceKm, distanceText, peso, schedule, type Farm, type Mode } from '../data/sample'

/* --------------------------------------------------------------------------
   Small pieces that describe a farm as a seller: how it delivers, where it
   can be picked up, and the compact card used in the shop's farm rail.
   -------------------------------------------------------------------------- */

/** "Lalamove · tomorrow 11 AM – 1 PM" */
export function deliveryLine(farm: Farm) {
  return `${courier} · ${schedule.day.toLowerCase()} ${farm.delivery.window}`
}

/** "Carbon Market stall · tomorrow 1 – 6 PM" */
export function pickupLine(farm: Farm) {
  return farm.pickup ? `${farm.pickup.place} · ${schedule.day.toLowerCase()} ${farm.pickup.hours}` : ''
}

/** How this farm gets an order to the buyer. `wrap` lets it take two lines
    instead of cutting off the time. */
export function FulfilmentRow({ farm, mode, wrap = false }: { farm: Farm; mode: Mode; wrap?: boolean }) {
  const Icon = mode === 'pickup' ? Store : Truck
  return (
    <span
      className={`flex min-w-0 gap-2 text-[13.5px] font-semibold leading-snug text-ink-muted ${wrap ? 'items-start' : 'items-center'}`}
    >
      <Icon size={16} strokeWidth={2.4} className={`shrink-0 text-primary ${wrap ? 'mt-[1px]' : ''}`} />
      <span className={wrap ? '' : 'truncate'}>{mode === 'pickup' ? pickupLine(farm) : deliveryLine(farm)}</span>
    </span>
  )
}

/** Compact farm card for the shop's "Farms selling this week" rail. */
export function FarmChip({ farm, mode }: { farm: Farm; mode: Mode }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(`/farm/${farm.id}`)}
      className="tappable flex w-[236px] shrink-0 flex-col gap-2.5 rounded-card border border-line bg-card p-3.5 text-left shadow-card"
    >
      <span className="flex items-center gap-3">
        <Avatar initials={farm.initials} size={44} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-extrabold text-ink">{farm.call}</span>
          <span className="flex items-center gap-1.5 text-[12.5px]">
            <Rating value={farm.rating} />
            <span className="truncate font-semibold text-ink-muted">· {farm.place.split(', ').pop()}</span>
          </span>
        </span>
        <ChevronRight size={18} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
      </span>
      <span className="rounded-md bg-surface px-3 py-2 text-[12.5px] font-semibold leading-snug text-ink-muted">
        {mode === 'pickup' && farm.pickup ? (
          <>
            Pick up at <b className="font-bold text-ink">{farm.pickup.place}</b> ·{' '}
            {distanceText(distanceKm(farm.pickup.at))} away
          </>
        ) : (
          <>
            <b className="font-bold text-ink">{peso(farm.delivery.fee)}</b> delivery · free over{' '}
            {peso(farm.delivery.freeOver)}
          </>
        )}
      </span>
    </button>
  )
}
