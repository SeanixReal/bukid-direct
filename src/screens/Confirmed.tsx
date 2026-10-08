import { Navigate, useNavigate } from 'react-router-dom'
import { Check, PackageCheck, Sunrise, Truck, type LucideIcon } from 'lucide-react'
import { Screen, ScreenFooter } from '../components/Screen'
import { Button } from '../components/ui'
import { useApp } from '../state/AppState'
import {
  getFarm,
  getHub,
  getSlot,
  listNames,
  paymentMethods,
  peso,
  schedule,
  user,
} from '../data/sample'

/* --------------------------------------------------------------------------
   Order confirmation. "Salamat!" is Bisaya for thank you.
   -------------------------------------------------------------------------- */

export function Confirmed() {
  const navigate = useNavigate()
  const { order } = useApp()
  if (!order) return <Navigate to="/shop" replace />

  const hub = getHub(order.hubId)
  const slot = getSlot(order.slotId)
  const farmers = listNames(order.totals.farmIds.map((id) => getFarm(id).call))
  const payment = paymentMethods.find((m) => m.id === order.payment)
  const paidNow = order.payment !== 'cash'

  return (
    <Screen
      footer={
        <ScreenFooter>
          <Button onClick={() => navigate('/orders')}>Track my order</Button>
          <button
            type="button"
            onClick={() => navigate('/shop')}
            className="tappable mt-1 h-11 w-full text-[15px] font-bold text-primary"
          >
            Back to the shop
          </button>
        </ScreenFooter>
      }
    >
      <div className="px-5 pb-6 pt-4">
        {/* ---------------- Salamat ---------------- */}
        <div className="flex flex-col items-center text-center">
          <span className="relative flex h-[96px] w-[96px] items-center justify-center">
            <span className="animate-halo absolute inset-0 rounded-full bg-primary/25" />
            <span className="animate-pop relative flex h-[96px] w-[96px] items-center justify-center rounded-full bg-primary text-on-primary shadow-float">
              <Check size={50} strokeWidth={3} />
            </span>
          </span>
          <h1 className="animate-rise-in mt-5 text-[48px] font-extrabold leading-none tracking-tight text-primary">
            Salamat!
          </h1>
          <p
            className="animate-rise-in mt-3 text-[20px] font-bold text-ink"
            style={{ animationDelay: '80ms' }}
          >
            Your order is in, {user.firstName}.
          </p>
          <p
            className="animate-rise-in mt-1 max-w-[300px] text-[16px] font-medium leading-snug text-ink-muted"
            style={{ animationDelay: '140ms' }}
          >
            {farmers} will harvest it {schedule.pickupDay.toLowerCase()} morning.
          </p>
        </div>

        {/* ---------------- Pickup code ---------------- */}
        <div className="mt-6 rounded-card border border-line bg-card p-4 text-center shadow-card">
          <p className="text-[13px] font-bold uppercase tracking-wide text-ink-muted">Your pickup code</p>
          <div className="mt-2.5 flex justify-center gap-2">
            {order.code.split('').map((d, i) => (
              <span
                key={i}
                className="flex h-[60px] w-[52px] items-center justify-center rounded-md bg-primary-soft text-[32px] font-extrabold text-primary"
              >
                {d}
              </span>
            ))}
          </div>
          <p className="mt-2.5 text-[14px] font-semibold text-ink-muted">Show it at the hub. That's all.</p>
        </div>

        {/* ---------------- Details ---------------- */}
        <dl className="mt-3 divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          <Detail label="Order" value={order.id} />
          <Detail label="Pickup" value={hub.name} sub={hub.host} />
          <Detail label="When" value={`${schedule.pickupDay}, ${slot.label}`} />
          <Detail
            label={paidNow ? 'Paid' : 'To pay'}
            value={peso(order.totals.total)}
            sub={payment?.label}
          />
        </dl>

        {/* ---------------- What happens next ---------------- */}
        <h2 className="mt-6 text-[18px] font-extrabold tracking-tight text-ink">What happens next</h2>
        <ol className="mt-3 space-y-2.5">
          <Next Icon={Sunrise} title="Harvest" detail={`Picked ${schedule.pickupDay.toLowerCase()} at sunrise`} />
          <Next Icon={Truck} title="On the way" detail={`Packed and driven to ${hub.name}`} />
          <Next Icon={PackageCheck} title="Ready for pickup" detail="We'll text you the moment it lands" />
        </ol>
      </div>
    </Screen>
  )
}

function Detail({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-[14px] font-semibold text-ink-muted">{label}</dt>
      <dd className="min-w-0 text-right">
        <span className="block text-[15px] font-extrabold text-ink">{value}</span>
        {sub && <span className="block truncate text-[13px] font-medium text-ink-muted">{sub}</span>}
      </dd>
    </div>
  )
}

function Next({ Icon, title, detail }: { Icon: LucideIcon; title: string; detail: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={19} strokeWidth={2.4} />
      </span>
      <span>
        <span className="block text-[15px] font-bold text-ink">{title}</span>
        <span className="block text-[13px] font-medium text-ink-muted">{detail}</span>
      </span>
    </li>
  )
}
