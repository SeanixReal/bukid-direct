import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Check,
  ChevronRight,
  ExternalLink,
  Hand,
  MessageCircle,
  PackageCheck,
  Phone,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { BackButton, Screen } from '../components/Screen'
import { CityMap } from '../components/CityMap'
import { ProducePicture } from '../components/ProduceArt'
import { whenText } from '../components/StallBits'
import { Avatar, Button } from '../components/ui'
import { riderProgress, useApp, useSimClock } from '../state/AppState'
import { getListing } from '../state/catalog'
import { arrivalAt, deliveryRoute, tripMinutes } from '../state/eta'
import {
  clockText,
  fillText,
  getCourier,
  getMarket,
  getProduce,
  getSeller,
  handoffs,
  homeAt,
  listNames,
  stageText,
  user,
} from '../data/sample'

/* --------------------------------------------------------------------------
   Tracking for one market's delivery: the courier's route on real Cebu
   streets and the rider moving along it. Until the stalls have packed it
   shows what buyer and stalls agreed; once the rider is booked, who is
   coming and when. Live tracking and rider updates are in the courier's own
   app, one tap away.
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
  const market = getMarket(shipment.marketId)
  const who = listNames(shipment.stalls.map((st) => getSeller(st.sellerId).call))
  const stalls = `${shipment.stalls.length} ${shipment.stalls.length === 1 ? 'stall' : 'stalls'}`
  const stage = stageOf(shipment)
  const copy = stageText.delivery[stage]
  const rider = market.rider
  const courier = getCourier(shipment.courier)
  const handoff = handoffs.find((h) => h.id === order!.handoff)

  const path = deliveryRoute(market.id)
  const moving = stage === 'onTheWay'
  /* The rider is booked once the stalls have packed. */
  const booked = stage === 'ready' || moving
  const progress = stage === 'done' ? 1 : moving ? riderProgress(elapsed) : 0
  const minutesLeft = Math.max(1, Math.round((1 - progress) * tripMinutes(market.id)))
  const eta = clockText(arrivalAt(market.id, shipment.slot))

  return (
    <Screen scroll={false} className="bg-surface-2">
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <CityMap
            frame={path}
            route={path}
            progress={moving || stage === 'done' ? progress : undefined}
            markers={[{ id: 'home', at: homeAt, kind: 'home', label: 'You' }]}
            padding={{ top: 76, right: 40, bottom: 340, left: 40 }}
            className="h-full w-full"
            attributionClassName="top-[64px] left-4"
          />
        </div>

        {/* Top bar over the map */}
        <div className="absolute inset-x-4 top-2 z-10 flex items-center gap-3">
          <BackButton onClick={() => navigate('/orders')} tone="float" label="Back to orders" />
          <span className="rounded-pill bg-card px-4 py-2.5 text-[14px] font-extrabold text-ink shadow-float">
            {moving ? `Arriving in about ${minutesLeft} min` : booked ? `Arrives around ${eta}` : copy.label}
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
                    Your {market.short} order is at your door. Salamat!
                  </p>
                </div>
              </div>
              <p className="mt-4 text-[15px] font-bold text-ink">How was your order from {market.short}?</p>
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
                    {moving ? `${rider.name} is on the way` : booked ? 'Rider booked' : copy.label}
                  </h1>
                  <p className="mt-0.5 text-[14px] font-semibold text-ink-muted">
                    {moving
                      ? `Bringing your order from ${market.name}`
                      : booked
                        ? `Collecting from ${stalls} at ${market.name}`
                        : fillText(copy.detail, {
                            who,
                            market,
                            courier: shipment.courier,
                            time: whenText(market, 'delivery', shipment.slot),
                          })}
                  </p>
                </div>
                {stage === 'ready' && (
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-accent px-3 py-[5px] text-[12.5px] font-extrabold text-on-accent">
                    <PackageCheck size={14} strokeWidth={2.6} />
                    Packed
                  </span>
                )}
              </div>

              {booked ? (
                <>
                  {/* The rider: name and arrival time once booked */}
                  <div className="mt-4 flex items-center gap-3 rounded-card bg-surface p-3">
                    <Avatar initials={rider.name.charAt(0)} size={46} tone="primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[16px] font-bold text-ink">{rider.name}</p>
                      <p className="truncate text-[13px] font-semibold text-ink-muted">
                        {courier.name} · {rider.plate}
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
                      onClick={() => showToast(`Calling ${rider.name} through ${courier.app}...`)}
                      className="tappable flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-card"
                    >
                      <Phone size={19} strokeWidth={2.4} />
                    </button>
                  </div>

                  {/* Live tracking and rider updates: the courier's own app */}
                  <button
                    type="button"
                    onClick={() => showToast(`Opening ${courier.app} for live tracking...`)}
                    className="tappable mt-2.5 flex w-full items-center gap-3 rounded-card border border-line px-3 py-2.5 text-left"
                  >
                    <ExternalLink size={18} strokeWidth={2.4} className="shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-bold text-ink">Open in {courier.app}</span>
                      <span className="block text-[12.5px] font-semibold text-ink-muted">
                        Live tracking and rider updates
                      </span>
                    </span>
                    <ChevronRight size={18} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
                  </button>
                </>
              ) : (
                /* What buyer and stalls agreed, until the rider is booked */
                <div className="mt-4 space-y-2 rounded-card bg-surface p-3">
                  <PlanRow Icon={Truck}>
                    {courier.name} · {whenText(market, 'delivery', shipment.slot)}
                  </PlanRow>
                  {handoff && (
                    <PlanRow Icon={Hand}>
                      {handoff.label} · {user.address.note}
                    </PlanRow>
                  )}
                  <p className="pt-0.5 text-[13px] font-medium leading-snug text-ink-muted">
                    The rider is booked once{' '}
                    {shipment.stalls.length === 1 ? 'the stall has' : `all ${stalls} have`} packed. Their
                    name and arrival time show here.
                  </p>
                </div>
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
                  {shipment.lines.length} {shipment.lines.length === 1 ? 'item' : 'items'} from {stalls}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Screen>
  )
}

function PlanRow({ Icon, children }: { Icon: LucideIcon; children: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 text-[14px] font-bold leading-snug text-ink">
      <Icon size={17} strokeWidth={2.4} className="mt-[1px] shrink-0 text-primary" />
      <span className="min-w-0">{children}</span>
    </p>
  )
}
