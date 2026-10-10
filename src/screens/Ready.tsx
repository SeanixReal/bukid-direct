import { useMemo } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock, PackageCheck } from 'lucide-react'
import { Screen } from '../components/Screen'
import { CityMap } from '../components/CityMap'
import { ProducePicture } from '../components/ProduceArt'
import { Button } from '../components/ui'
import { useApp } from '../state/AppState'
import { getListing } from '../state/catalog'
import { route } from '../data/route'
import { distanceKm, distanceText, getMarket, getProduce, getSeller, homeAt, stallNo } from '../data/sample'

/* --------------------------------------------------------------------------
   "Ready for pickup" - takes over the screen when a Pick-up order is packed
   and waiting at the market's stalls. Orange is reserved for exactly this
   (and "Fresh today"), which is why it reads as news the instant it appears.
   "Andam na!" is Bisaya for "It's ready!".
   -------------------------------------------------------------------------- */

export function Ready() {
  const { id } = useParams()
  const { order } = useApp()
  const shipment = order?.shipments.find((s) => s.id === id)
  if (!shipment) return <Navigate to="/orders" replace />
  if (shipment.mode === 'delivery') return <Navigate to={`/track/${shipment.id}`} replace />
  return <ReadyForPickup id={shipment.id} />
}

function ReadyForPickup({ id }: { id: string }) {
  const navigate = useNavigate()
  const { order, markPickedUp, showToast, stageOf } = useApp()
  const shipment = order!.shipments.find((s) => s.id === id)!
  const market = getMarket(shipment.marketId)
  const collected = stageOf(shipment) === 'done'
  const directions = useMemo(() => route(homeAt, market.at), [market])

  return (
    <Screen
      className="bg-accent"
      footer={
        <div className="shrink-0 space-y-2 px-5 pb-1.5 pt-2">
          <Button
            variant="onAccent"
            disabled={collected}
            onClick={() => {
              markPickedUp(shipment.id)
              showToast(`Enjoy your food from ${market.short}. Salamat!`)
              navigate('/orders')
            }}
          >
            <Check size={19} strokeWidth={3} />
            {collected ? 'Picked up' : "I've picked it up"}
          </Button>
          <Button variant="outlineOnAccent" onClick={() => navigate('/orders')}>
            View order
          </Button>
        </div>
      }
    >
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 px-4 pb-1 pt-1">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            aria-label="Back to orders"
            className="tappable flex h-11 w-11 items-center justify-center rounded-full bg-on-accent/12 text-on-accent"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>
          <span className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-on-accent/75">
            Pick-up · {market.short}
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center px-5 pb-4">
          <div className="flex flex-col items-center text-center">
            <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full bg-on-accent/12 text-on-accent">
              <span className="animate-halo absolute inset-0 rounded-full bg-on-accent/20" />
              <PackageCheck size={34} strokeWidth={2.2} className="relative" />
            </span>
            <p className="mt-3 text-[19px] font-extrabold text-on-accent/80">Andam na!</p>
            <h1 className="mt-0.5 text-balance text-[30px] font-extrabold leading-[1.1] tracking-tight text-on-accent">
              Your order is ready for pickup
            </h1>
            <p className="mt-1.5 text-[17px] font-bold text-on-accent/80">at {market.name}</p>
          </div>

          {/* Code, and the stalls to collect from */}
          <div className="mt-4 rounded-card bg-card p-4 text-center shadow-float">
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-ink-muted">Pick-up code</p>
            <p className="mt-1 text-[44px] font-extrabold leading-none tracking-[0.12em] text-ink">{order!.code}</p>
            <ul className="mt-3.5 space-y-2.5 border-t border-line pt-3 text-left">
              {shipment.stalls.map((st) => {
                const seller = getSeller(st.sellerId)
                return (
                  <li key={st.sellerId} className="flex items-center gap-3">
                    <div className="flex shrink-0 -space-x-2">
                      {st.lines.slice(0, 3).map((l) => {
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
                    <p className="min-w-0 truncate text-[14px] font-semibold text-ink">
                      <b className="font-extrabold">{stallNo(seller)}</b> · {seller.call}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Where */}
          <div className="mt-3 overflow-hidden rounded-card bg-card shadow-float">
            <CityMap
              frame={[homeAt, market.at]}
              route={directions}
              markers={[
                { id: 'home', at: homeAt, kind: 'home', label: 'You' },
                { id: 'pickup', at: market.at, kind: 'pin' },
              ]}
              padding={{ top: 32, right: 30, bottom: 14, left: 30 }}
              className="h-[124px]"
              attributionClassName="bottom-1 right-1.5"
            />
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold text-ink">
                  {market.name} · {market.area}
                </p>
                <p className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-muted">
                  <Clock size={14} strokeWidth={2.5} />
                  Open {market.hours} · {distanceText(distanceKm(market.at))} from you
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}
