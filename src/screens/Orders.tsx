import { useNavigate } from 'react-router-dom'
import { Check, MapPin, Package, PackageCheck, Repeat } from 'lucide-react'
import { Screen, SectionTitle } from '../components/Screen'
import { ProductPicture } from '../components/ProduceArt'
import { Button } from '../components/ui'
import { READY_STAGE, useApp, type Order } from '../state/AppState'
import { totals, type Line } from '../state/pricing'
import {
  getHub,
  getProduct,
  getSlot,
  orderStages,
  pastOrders,
  peso,
  schedule,
  weekday,
} from '../data/sample'

export function Orders() {
  const navigate = useNavigate()
  const { order } = useApp()

  return (
    <Screen nav>
      <div className="px-5 pb-4 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Orders</h1>
      </div>

      <div className="px-5 pb-6">
        {order ? (
          <ActiveOrder order={order} />
        ) : (
          <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-card px-6 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Package size={28} strokeWidth={2.1} />
            </span>
            <p className="mt-4 text-[18px] font-extrabold text-ink">Nothing on the way yet</p>
            <p className="mt-1 text-[14px] font-medium text-ink-muted">
              Order by {schedule.cutoff} and it's yours {schedule.pickupDay.toLowerCase()}.
            </p>
            <Button variant="secondary" size="md" className="mt-5" onClick={() => navigate('/shop')}>
              Shop this week's harvest
            </Button>
          </div>
        )}

        <SectionTitle className="mt-8">Past orders</SectionTitle>
        <div className="space-y-3">
          {pastOrders.map((p) => (
            <PastOrderCard key={p.id} id={p.id} when={p.when} hubId={p.hubId} lines={p.lines} />
          ))}
        </div>
      </div>
    </Screen>
  )
}

/* --------------------------------------------------------------------------
   The order in progress, with its timeline.
   -------------------------------------------------------------------------- */

function ActiveOrder({ order }: { order: Order }) {
  const navigate = useNavigate()
  const { markPickedUp, showToast } = useApp()
  const hub = getHub(order.hubId)
  const slot = getSlot(order.slotId)
  const stage = orderStages[order.stage]
  const ready = stage.id === 'ready'
  const done = stage.id === 'pickedUp'

  return (
    <div className="overflow-hidden rounded-card border border-line bg-card shadow-card">
      {/* ---------------- Status header ---------------- */}
      {ready ? (
        <button
          type="button"
          onClick={() => navigate('/ready')}
          className="tappable flex w-full items-center gap-3 bg-accent p-4 text-left text-on-accent"
        >
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-on-accent/12">
            <span className="animate-halo absolute inset-0 rounded-full bg-on-accent/20" />
            <PackageCheck size={24} strokeWidth={2.4} className="relative" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[19px] font-extrabold leading-tight">Ready for pickup</span>
            <span className="block text-[14px] font-semibold opacity-80">
              At {hub.name} · until {hub.closes}
            </span>
          </span>
          <span className="text-right">
            <span className="block text-[11px] font-extrabold uppercase tracking-wide opacity-70">Code</span>
            <span className="block text-[24px] font-extrabold leading-none">{order.code}</span>
          </span>
        </button>
      ) : (
        <div className={`flex items-center gap-3 p-4 ${done ? 'bg-primary-soft' : 'bg-surface'}`}>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            {done ? <Check size={24} strokeWidth={3} /> : <Package size={22} strokeWidth={2.3} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[19px] font-extrabold leading-tight text-ink">
              {done ? `Picked up at ${stage.time}` : stage.label}
            </span>
            <span className="block text-[14px] font-semibold text-ink-muted">
              {order.id} · {schedule.pickupDay}, {slot.label}
            </span>
          </span>
          <span className="text-right">
            <span className="block text-[11px] font-extrabold uppercase tracking-wide text-ink-muted">Code</span>
            <span className="block text-[24px] font-extrabold leading-none text-primary">{order.code}</span>
          </span>
        </div>
      )}

      {/* ---------------- Timeline ---------------- */}
      <ol className="px-4 pb-1 pt-4">
        {orderStages.map((s, i) => {
          const past = i < order.stage || (i === order.stage && s.id === 'pickedUp')
          const current = i === order.stage && !past
          const isReady = s.id === 'ready'
          /* Placed today at the real time; everything else happens tomorrow. */
          const time =
            s.id === 'placed' ? `${weekday(0)} ${order.placedAt}` : `${weekday(1)} ${s.time}`
          return (
            <li key={s.id} className="relative flex gap-3 pb-4">
              {i < orderStages.length - 1 && (
                <span
                  className={`absolute bottom-0 left-[14px] top-8 w-[2px] rounded-full ${
                    i < order.stage ? 'bg-primary' : 'bg-line'
                  }`}
                />
              )}
              <span
                className={`relative z-[1] flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${
                  past
                    ? 'bg-primary text-on-primary'
                    : current && isReady
                      ? 'bg-accent text-on-accent ring-4 ring-accent/25'
                      : current
                        ? 'bg-primary-soft text-primary ring-2 ring-inset ring-primary'
                        : 'bg-surface-2 text-ink-faint'
                }`}
              >
                {past ? (
                  <Check size={16} strokeWidth={3.2} />
                ) : current && isReady ? (
                  <PackageCheck size={16} strokeWidth={2.6} />
                ) : current ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                ) : null}
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p
                    className={`text-[16px] font-bold ${
                      past || current ? 'text-ink' : 'text-ink-faint'
                    }`}
                  >
                    {s.label}
                  </p>
                  {(past || current) && time && (
                    <span className="tabular shrink-0 text-[13px] font-semibold text-ink-muted">
                      {time}
                    </span>
                  )}
                </div>
                {current && (
                  <p className="mt-0.5 text-[14px] font-medium leading-snug text-ink-muted">
                    {s.detail.replace('{hub}', hub.name)}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {/* ---------------- Hub and items ---------------- */}
      <div className="mx-4 flex items-center gap-3 border-t border-line py-3.5">
        <MapPin size={19} strokeWidth={2.4} className="shrink-0 text-primary" />
        <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">
          {hub.name} <span className="text-ink-muted">· {hub.host}</span>
        </p>
      </div>
      <div className="mx-4 flex items-center gap-3 border-t border-line py-3.5">
        <Thumbs lines={order.lines} />
        <p className="tabular ml-auto shrink-0 text-[15px] font-extrabold text-ink">
          {peso(order.totals.total)}
        </p>
      </div>

      {ready && (
        <div className="px-4 pb-4">
          <Button
            onClick={() => {
              markPickedUp()
              showToast('Enjoy your harvest. Salamat for buying direct!')
            }}
          >
            <Check size={19} strokeWidth={3} />
            I've picked it up
          </Button>
        </div>
      )}
      {order.stage < READY_STAGE && (
        <p className="px-4 pb-4 text-[13px] font-semibold text-ink-muted">
          We'll text you when it reaches the hub.
        </p>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------------
   Earlier orders, one tap to buy the same again.
   -------------------------------------------------------------------------- */

function PastOrderCard({
  id,
  when,
  hubId,
  lines,
}: {
  id: string
  when: string
  hubId: string
  lines: Line[]
}) {
  const { member, addToBasket, showToast } = useApp()
  const total = totals(lines, member).total

  const reorder = () => {
    const available = lines.filter((l) => !getProduct(l.productId)?.outOfStock)
    for (const l of available) addToBasket(l.productId, l.qty)
    showToast(`Added ${available.length} items to your basket`, { label: 'View', to: '/basket' })
  }

  return (
    <div className="rounded-card border border-line bg-card p-4 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[16px] font-extrabold text-ink">{when}</p>
        <p className="tabular text-[16px] font-extrabold text-ink">{peso(total)}</p>
      </div>
      <p className="text-[13px] font-semibold text-ink-muted">
        {id} · {getHub(hubId).name}
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
        const product = getProduct(l.productId)
        if (!product) return null
        return (
          <ProductPicture
            key={l.productId}
            product={product}
            className="h-10 w-10 rounded-full ring-2 ring-card"
          />
        )
      })}
    </div>
  )
}
