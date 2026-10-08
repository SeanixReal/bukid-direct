import { Navigate, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { Screen, ScreenFooter } from '../components/Screen'
import { FulfilmentRow } from '../components/FarmBits'
import { Avatar, Button } from '../components/ui'
import { useApp } from '../state/AppState'
import { getFarm, listNames, paymentMethods, peso, schedule, user } from '../data/sample'

/* --------------------------------------------------------------------------
   Order confirmation. "Salamat!" is Bisaya for thank you.
   -------------------------------------------------------------------------- */

export function Confirmed() {
  const navigate = useNavigate()
  const { order } = useApp()
  if (!order) return <Navigate to="/shop" replace />

  const farmers = listNames(order.shipments.map((s) => getFarm(s.farmId).call))
  const payment = paymentMethods.find((m) => m.id === order.payment)
  const collecting = order.shipments.some((s) => s.mode === 'pickup')

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
          <p className="animate-rise-in mt-3 text-[20px] font-bold text-ink" style={{ animationDelay: '80ms' }}>
            Your order is in, {user.firstName}.
          </p>
          <p
            className="animate-rise-in mt-1 max-w-[310px] text-[16px] font-medium leading-snug text-ink-muted"
            style={{ animationDelay: '140ms' }}
          >
            {farmers} will pack it fresh {schedule.day.toLowerCase()} morning.
          </p>
        </div>

        {/* ---------------- Each farm's part ---------------- */}
        <ul className="mt-6 divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          {order.shipments.map((s) => {
            const farm = getFarm(s.farmId)
            return (
              <li key={s.id} className="flex items-center gap-3 py-3.5">
                <Avatar initials={farm.initials} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[16px] font-bold text-ink">{farm.call}</p>
                    <p className="text-[13px] font-bold text-ink-muted">
                      {s.lines.length} {s.lines.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <FulfilmentRow farm={farm} mode={s.mode} wrap />
                </div>
              </li>
            )
          })}
        </ul>

        {/* ---------------- Pickup code ---------------- */}
        {collecting && (
          <div className="mt-3 rounded-card border border-line bg-card p-4 text-center shadow-card">
            <p className="text-[13px] font-bold uppercase tracking-wide text-ink-muted">Pick-up code</p>
            <div className="mt-2.5 flex justify-center gap-2">
              {order.code.split('').map((d, i) => (
                <span
                  key={i}
                  className="flex h-[58px] w-[50px] items-center justify-center rounded-md bg-primary-soft text-[30px] font-extrabold text-primary"
                >
                  {d}
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-[14px] font-semibold text-ink-muted">Show it when you collect.</p>
          </div>
        )}

        {/* ---------------- Details ---------------- */}
        <dl className="mt-3 divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          <Detail label="Order" value={order.id} />
          <Detail label="Placed" value={`Today, ${order.placedAt}`} />
          <Detail
            label={order.payment === 'cash' ? 'To pay' : 'Paid'}
            value={peso(order.totals.total)}
            sub={payment?.label}
          />
        </dl>
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
