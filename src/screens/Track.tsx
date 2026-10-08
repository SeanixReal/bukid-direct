import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Check, MessageCircle, PackageCheck, Phone, Star } from 'lucide-react'
import { BackButton, Screen } from '../components/Screen'
import { CityMap } from '../components/CityMap'
import { ProducePicture } from '../components/ProduceArt'
import { Avatar, Button } from '../components/ui'
import { riderProgress, useApp, useSimClock } from '../state/AppState'
import { getListing } from '../state/catalog'
import { pathLength, route } from '../data/route'
import { courier, fillText, getFarm, getProduce, homeAt, stageText } from '../data/sample'

/* Average speed across the city, for the "arriving in" estimate. */
const CITY_KMH = 22

/* --------------------------------------------------------------------------
   Live tracking for one farm's delivery: the courier's route on real Cebu
   streets, the rider moving along it, and who is bringing what.
   -------------------------------------------------------------------------- */

export function Track() {
  const { id } = useParams()
  const { order } = useApp()
  const shipment = order?.shipments.find((s) => s.id === id)
  if (!shipment) return <Navigate to="/orders" replace />
  if (shipment.mode === 'pickup') return <Navigate to={`/ready/${shipment.id}`} replace />
  return <TrackShipment id={shipment.id} />
}

function TrackShipment({ id }: { id: string }) {
  const navigate = useNavigate()
  const { order, stageOf, showToast } = useApp()
  const elapsed = useSimClock()
  const [stars, setStars] = useState(0)

  const shipment = order!.shipments.find((s) => s.id === id)!
  const farm = getFarm(shipment.farmId)
  const stage = stageOf(shipment)
  const copy = stageText.delivery[stage]
  const rider = farm.delivery.rider

  const path = useMemo(() => route(farm.delivery.handover.at, homeAt), [farm])
  const moving = stage === 'onTheWay'
  const progress = stage === 'done' ? 1 : moving ? riderProgress(elapsed) : 0
  const tripMin = (pathLength(path) / 1000 / CITY_KMH) * 60
  const minutesLeft = Math.max(1, Math.round((1 - progress) * tripMin))

  return (
    <Screen scroll={false} className="bg-surface-2">
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <CityMap
            frame={path}
            route={path}
            progress={moving || stage === 'done' ? progress : undefined}
            markers={[{ id: 'home', at: homeAt, kind: 'home', label: 'You' }]}
            padding={{ top: 76, right: 40, bottom: 300, left: 40 }}
            className="h-full w-full"
            attributionClassName="top-[64px] left-4"
          />
        </div>

        {/* Top bar over the map */}
        <div className="absolute inset-x-4 top-2 z-10 flex items-center gap-3">
          <BackButton onClick={() => navigate('/orders')} tone="float" label="Back to orders" />
          <span className="rounded-pill bg-card px-4 py-2.5 text-[14px] font-extrabold text-ink shadow-float">
            {moving ? `Arriving in about ${minutesLeft} min` : copy.label}
          </span>
        </div>

        {/* The sheet */}
        <div className="animate-sheet-up absolute inset-x-3 bottom-3 z-10 rounded-xl bg-card p-4 shadow-float">
          {stage === 'done' ? (
            <>
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                  <Check size={26} strokeWidth={3} />
                </span>
                <div>
                  <h1 className="text-[22px] font-extrabold tracking-tight text-ink">Delivered!</h1>
                  <p className="text-[14px] font-semibold text-ink-muted">
                    {farm.call}'s order is at your door. Salamat!
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[15px] font-bold text-ink">How was {farm.call}'s order?</p>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    className="tappable flex h-12 flex-1 items-center justify-center rounded-md bg-surface text-primary"
                  >
                    <Star size={24} strokeWidth={2} fill={n <= stars ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <Button
                className="mt-4"
                onClick={() => {
                  if (stars) showToast(`Thanks! Your ${stars}-star review helps other buyers.`)
                  navigate('/orders')
                }}
              >
                {stars ? 'Send review' : 'Done'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="text-[22px] font-extrabold leading-tight tracking-tight text-ink">
                    {moving ? `${rider.name} is on the way` : copy.label}
                  </h1>
                  <p className="mt-0.5 text-[14px] font-semibold text-ink-muted">
                    {moving
                      ? `Bringing ${farm.call}'s order from ${farm.delivery.handover.place}`
                      : fillText(copy.detail, farm)}
                  </p>
                </div>
                {stage === 'ready' && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-accent px-3 py-[5px] text-[12.5px] font-extrabold text-on-accent">
                    <PackageCheck size={14} strokeWidth={2.6} />
                    Packed
                  </span>
                )}
              </div>

              {/* Rider - booked when the order was paid */}
              {moving || stage === 'ready' ? (
                <div className="mt-4 flex items-center gap-3 rounded-card bg-surface p-3">
                  <Avatar initials={rider.name.charAt(0)} size={46} tone="primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[16px] font-bold text-ink">{rider.name}</p>
                    <p className="truncate text-[13px] font-semibold text-ink-muted">
                      {courier} · {rider.plate}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Message ${rider.name}`}
                    onClick={() => showToast(`Message sent to ${rider.name}`)}
                    className="tappable flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-card"
                  >
                    <MessageCircle size={19} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Call ${rider.name}`}
                    onClick={() => showToast(`Calling ${rider.name} through ${courier}...`)}
                    className="tappable flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-card"
                  >
                    <Phone size={19} strokeWidth={2.4} />
                  </button>
                </div>
              ) : (
                <p className="mt-4 rounded-card bg-surface p-3 text-[14px] font-semibold leading-snug text-ink-muted">
                  {courier} rider booked · collects at {farm.delivery.handover.place}
                </p>
              )}

              {/* What is coming */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {shipment.lines.slice(0, 4).map((l) => {
                    const listing = getListing(l.listingId)
                    return listing ? (
                      <ProducePicture
                        key={l.listingId}
                        item={getProduce(listing.produceId)}
                        className="h-9 w-9 rounded-full ring-2 ring-card"
                      />
                    ) : null
                  })}
                </div>
                <p className="text-[14px] font-semibold text-ink-muted">
                  {shipment.lines.length} {shipment.lines.length === 1 ? 'item' : 'items'} from {farm.call}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Screen>
  )
}
