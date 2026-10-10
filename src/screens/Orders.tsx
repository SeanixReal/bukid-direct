import { useNavigate } from 'react-router-dom'
import { Check, Navigation, Package, PackageCheck, Repeat, Ticket } from 'lucide-react'
import { Screen, SectionTitle } from '../components/Screen'
import { ProducePicture } from '../components/ProduceArt'
import { FulfilmentRow, MarketBadge, whenText } from '../components/StallBits'
import { Avatar, Button } from '../components/ui'
import { useApp, type Shipment } from '../state/AppState'
import { getListing } from '../state/catalog'
import { arrivalAt } from '../state/eta'
import { regularTotal, type Line } from '../state/pricing'
import {
  clockText,
  fillText,
  getCourier,
  getMarket,
  getProduce,
  getSeller,
  listNames,
  pastOrders,
  peso,
  schedule,
  stageText,
  stagesFor,
  type StageId,
} from '../data/sample'

export function Orders() {
  const navigate = useNavigate()
  const { order } = useApp()

  return (
    <Screen nav>
      <div className="px-5 pb-4 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Orders</h1>
        {order && (
          <p className="text-[15px] font-semibold text-ink-muted">
            {order.id} · placed today, {order.placedAt} · {peso(order.totals.total)}
          </p>
        )}
      </div>

      <div className="px-5 pb-6">
        {order ? (
          <div className="space-y-3">
            {order.shipments.map((s) => (
              <ShipmentCard key={s.id} shipment={s} code={order.code} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Package size={28} strokeWidth={2.1} />
            </span>
            <p className="mt-4 text-[18px] font-extrabold text-ink">Nothing on the way yet</p>
            <p className="mt-1 text-[14px] font-medium text-ink-muted">
              Order by {schedule.cutoff} and it's yours {schedule.day.toLowerCase()}.
            </p>
            <Button variant="secondary" size="md" className="mt-5" onClick={() => navigate('/shop')}>
              Shop today's market
            </Button>
          </div>
        )}

        <SectionTitle className="mt-8">Past orders</SectionTitle>
        <div className="space-y-3">
          {pastOrders.map((p) => (
            <PastOrderCard key={p.id} id={p.id} when={p.when} lines={p.lines} />
          ))}
        </div>
      </div>
    </Screen>
  )
}

/* --------------------------------------------------------------------------
   One market's part of the order, and where it is.
   -------------------------------------------------------------------------- */

const chipStyle: Record<StageId, string> = {
  placed: 'bg-surface text-ink-muted',
  confirmed: 'bg-primary-soft text-primary',
  packing: 'bg-surface text-ink-muted',
  ready: 'bg-accent text-on-accent',
  onTheWay: 'bg-primary-soft text-primary',
  done: 'bg-primary-soft text-primary',
}

function ShipmentCard({ shipment: s, code }: { shipment: Shipment; code: string }) {
  const navigate = useNavigate()
  const { stageOf } = useApp()
  const market = getMarket(s.marketId)
  const who = listNames(s.stalls.map((st) => getSeller(st.sellerId).call))
  const stage = stageOf(s)
  const copy = stageText[s.mode][stage]
  const steps = stagesFor[s.mode]
  /* The rider is booked once the stalls have packed. */
  const booked = s.mode === 'delivery' && (stage === 'ready' || stage === 'onTheWay')
  const rider = market.rider

  return (
    <div className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <MarketBadge size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-extrabold text-ink">{market.name}</p>
          <FulfilmentRow market={market} mode={s.mode} courier={s.courier} slot={s.slot} wrap />
        </div>
      </div>
      <p className="mt-2 truncate text-[13px] font-semibold text-ink-muted">From {who}</p>

      {/* Progress */}
      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-[5px] text-[13px] font-extrabold ${chipStyle[stage]}`}
        >
          {stage === 'ready' && <PackageCheck size={14} strokeWidth={2.6} />}
          {(stage === 'confirmed' || stage === 'done') && <Check size={14} strokeWidth={3} />}
          {copy.label}
        </span>
        <div className="flex flex-1 gap-1">
          {steps.map((id, i) => (
            <span
              key={id}
              className={`h-[6px] flex-1 rounded-full ${
                i > s.stage ? 'bg-surface-2' : id === 'ready' && i === s.stage ? 'bg-accent' : 'bg-primary'
              }`}
            />
          ))}
        </div>
      </div>
      <p className="mt-2 text-[14px] font-medium leading-snug text-ink-muted">
        {fillText(copy.detail, { who, market, courier: s.courier, time: whenText(market, s.mode, s.slot) })}
      </p>

      {/* Booked: who is coming, and when */}
      {booked && (
        <div className="mt-3 flex items-center gap-3 rounded-md bg-surface px-3 py-2.5">
          <Avatar initials={rider.name.charAt(0)} size={34} tone="primary" />
          <p className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink-muted">
            <b className="font-bold text-ink">{rider.name}</b> · {getCourier(s.courier).name}
          </p>
          <span className="tabular shrink-0 text-[13px] font-extrabold text-ink">
            ETA {clockText(arrivalAt(s.marketId, s.slot))}
          </span>
        </div>
      )}

      {/* What and how much */}
      <div className="mt-3 flex items-center gap-3 border-t border-line pt-3">
        <Thumbs lines={s.lines} />
        <p className="tabular ml-auto shrink-0 text-[15px] font-extrabold text-ink">
          {peso(s.subtotal + s.fee)}
        </p>
      </div>

      {/* What you can do now */}
      {s.mode === 'delivery' && (stage === 'ready' || stage === 'onTheWay' || stage === 'done') && (
        <Button variant="secondary" size="md" className="mt-3" onClick={() => navigate(`/track/${s.id}`)}>
          <Navigation size={17} strokeWidth={2.6} />
          {stage === 'done' ? 'See delivery' : 'Track the rider'}
        </Button>
      )}
      {s.mode === 'pickup' && stage === 'ready' && (
        <Button variant="secondary" size="md" className="mt-3" onClick={() => navigate(`/ready/${s.id}`)}>
          <Ticket size={17} strokeWidth={2.6} />
          Show pick-up code {code}
        </Button>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------
   Earlier orders, one tap to buy the same again.
   -------------------------------------------------------------------------- */

function PastOrderCard({ id, when, lines }: { id: string; when: string; lines: Line[] }) {
  const { addToBasket, showToast } = useApp()
  const sellerIds = [...new Set(lines.map((l) => getListing(l.listingId)?.sellerId ?? ''))].filter(Boolean)

  const reorder = () => {
    const available = lines.filter((l) => !getListing(l.listingId)?.outOfStock)
    for (const l of available) addToBasket(l.listingId, l.qty)
    showToast(`Added ${available.length} items to your basket`, { label: 'View', to: '/basket' })
  }

  return (
    <div className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[16px] font-extrabold text-ink">{when}</p>
        <p className="tabular text-[16px] font-extrabold text-ink">{peso(regularTotal(lines))}</p>
      </div>
      <p className="truncate text-[13px] font-semibold text-ink-muted">
        {id} · {sellerIds.length} {sellerIds.length === 1 ? 'stall' : 'stalls'} ·{' '}
        {sellerIds.map((s) => getSeller(s).call).join(', ')}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Thumbs lines={lines} />
        <Button variant="secondary" size="sm" className="!w-auto shrink-0" onClick={reorder}>
          <Repeat size={16} strokeWidth={2.6} />
          Reorder
        </Button>
      </div>
    </div>
  )
}

function Thumbs({ lines }: { lines: Line[] }) {
  return (
    <div className="flex -space-x-2">
      {lines.slice(0, 5).map((l) => {
        const listing = getListing(l.listingId)
        if (!listing) return null
        return (
          <ProducePicture
            key={l.listingId}
            item={getProduce(listing.produceId)}
            className="h-10 w-10 rounded-full ring-2 ring-card"
          />
        )
      })}
    </div>
  )
}
