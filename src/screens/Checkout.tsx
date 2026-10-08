import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Banknote, Check, CreditCard, MessageSquare, Wallet, type LucideIcon } from 'lucide-react'
import { Screen, ScreenFooter, SectionTitle, TopBar } from '../components/Screen'
import { CityMap } from '../components/CityMap'
import { FulfilmentRow } from '../components/FarmBits'
import { Avatar, Button, PlusTag, SumRow } from '../components/ui'
import { useApp } from '../state/AppState'
import { getFarm, homeAt, paymentMethods, peso, user, type PaymentId } from '../data/sample'

const paymentIcon: Record<PaymentId, LucideIcon> = {
  gcash: Wallet,
  cash: Banknote,
  card: CreditCard,
}

export function Checkout() {
  const navigate = useNavigate()
  const { basket, groups, basketTotals: t, member, placeOrder } = useApp()
  const [payment, setPayment] = useState<PaymentId>('gcash')

  if (basket.length === 0) return <Navigate to="/basket" replace />

  const delivering = groups.some((g) => g.mode === 'delivery')

  const submit = () => {
    placeOrder({ payment })
    navigate('/confirmed', { replace: true })
  }

  return (
    <Screen
      footer={
        <ScreenFooter>
          <Button onClick={submit}>
            Place order
            <span className="opacity-60">·</span>
            <span className="tabular">{peso(t.total)}</span>
          </Button>
        </ScreenFooter>
      }
    >
      <TopBar
        title="Checkout"
        subtitle={`${t.count} items from ${t.farmCount} ${t.farmCount === 1 ? 'farm' : 'farms'}`}
        fallback="/basket"
      />

      <div className="px-5 pb-6">
        {/* ---------------- Where ---------------- */}
        {delivering && (
          <>
            <SectionTitle>Deliver to</SectionTitle>
            <div className="overflow-hidden rounded-card border border-line bg-card shadow-card">
              <CityMap
                frame={[homeAt]}
                markers={[{ id: 'home', at: homeAt, kind: 'home', label: user.address.label }]}
                padding={{ top: 20, right: 20, bottom: 20, left: 20 }}
                className="h-[120px]"
                attributionClassName="bottom-1 right-1.5"
              />
              <div className="p-4">
                <p className="text-[17px] font-extrabold text-ink">
                  {user.address.label} · {user.address.street}
                </p>
                <p className="text-[14px] font-semibold text-ink-muted">
                  {user.address.area} · {user.address.note}
                </p>
              </div>
            </div>
          </>
        )}

        {/* ---------------- Each farm ---------------- */}
        <SectionTitle className={delivering ? 'mt-6' : ''}>
          {t.farmCount === 1 ? 'Your farm' : `Your ${t.farmCount} farms`}
        </SectionTitle>
        <ul className="divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          {groups.map((g) => {
            const farm = getFarm(g.farmId)
            return (
              <li key={g.farmId} className="flex items-center gap-3 py-3.5">
                <Avatar initials={farm.initials} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[16px] font-bold text-ink">{farm.call}</p>
                    <p className="tabular shrink-0 text-[15px] font-extrabold text-ink">{peso(g.subtotal)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <FulfilmentRow farm={farm} mode={g.mode} wrap />
                    <span
                      className={`shrink-0 text-[13px] font-bold ${g.fee > 0 ? 'text-ink-muted' : 'text-primary'}`}
                    >
                      {g.fee > 0 ? `+${peso(g.fee)}` : 'Free'}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        {/* ---------------- Payment ---------------- */}
        <SectionTitle className="mt-6">Payment</SectionTitle>
        <ul className="space-y-2.5">
          {paymentMethods.map((m) => {
            const active = m.id === payment
            const Icon = paymentIcon[m.id]
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setPayment(m.id)}
                  aria-pressed={active}
                  className={`tappable flex w-full items-center gap-3 rounded-card border p-3.5 text-left ${
                    active ? 'border-primary bg-primary-soft' : 'border-line bg-card'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                      active ? 'bg-primary text-on-primary' : 'bg-surface text-ink-muted'
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[16px] font-bold ${active ? 'text-primary' : 'text-ink'}`}>
                      {m.label}
                    </span>
                    <span className="block truncate text-[13px] font-medium text-ink-muted">{m.detail}</span>
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      active ? 'border-primary bg-primary text-on-primary' : 'border-line'
                    }`}
                  >
                    {active && <Check size={14} strokeWidth={3.2} />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex items-start gap-3 rounded-card bg-surface p-4">
          <MessageSquare size={19} strokeWidth={2.3} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-[14px] font-semibold leading-snug text-ink-muted">
            We'll text <b className="font-extrabold text-ink">{user.mobile}</b> as each farm packs,
            hands over to the rider, or is ready for you to collect.
          </p>
        </div>

        {/* ---------------- Sums ---------------- */}
        <div className="mt-4 space-y-2 rounded-card border border-line bg-card p-4 shadow-card">
          <SumRow label="Produce" value={peso(t.subtotal)} />
          <SumRow
            label="Delivery"
            value={t.delivery > 0 ? peso(t.delivery) : 'Free'}
            tone={t.delivery > 0 ? 'ink' : 'primary'}
          />
          <SumRow
            label="Service fee"
            value={member ? 'Free' : peso(t.serviceFee)}
            tone={member ? 'primary' : 'ink'}
          />
          {member && t.savings > 0 && (
            <SumRow label={<PlusTag label="You saved" />} value={`−${peso(t.savings)}`} tone="primary" />
          )}
          <div className="border-t border-line pt-2">
            <SumRow label="Total" value={peso(t.total)} strong />
          </div>
        </div>
      </div>
    </Screen>
  )
}
