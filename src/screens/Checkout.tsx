import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Banknote, Check, CreditCard, MessageSquare, Wallet, type LucideIcon } from 'lucide-react'
import { Screen, ScreenFooter, SectionTitle, TopBar } from '../components/Screen'
import { HubMap } from '../components/HubMap'
import { Button, Chip, PlusTag, SumRow } from '../components/ui'
import { useApp } from '../state/AppState'
import {
  distanceKm,
  distanceText,
  getHub,
  paymentMethods,
  peso,
  pickupSlots,
  schedule,
  user,
  type PaymentId,
  type SlotId,
} from '../data/sample'

const paymentIcon: Record<PaymentId, LucideIcon> = {
  gcash: Wallet,
  cash: Banknote,
  card: CreditCard,
}

export function Checkout() {
  const navigate = useNavigate()
  const { basket, basketTotals: t, member, hubId, placeOrder } = useApp()
  const [slotId, setSlotId] = useState<SlotId>('early')
  const [payment, setPayment] = useState<PaymentId>('gcash')
  const hub = getHub(hubId)

  if (basket.length === 0) return <Navigate to="/basket" replace />

  const submit = () => {
    placeOrder({ slotId, payment })
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
      <TopBar title="Checkout" subtitle={`${t.count} items from ${t.farmIds.length} farms`} fallback="/basket" />

      <div className="px-5 pb-6">
        {/* ---------------- Hub ---------------- */}
        <SectionTitle
          action={
            <button
              type="button"
              onClick={() => navigate('/hubs')}
              className="tappable text-[14px] font-bold text-primary"
            >
              Change
            </button>
          }
        >
          Pickup Hub
        </SectionTitle>
        <div className="overflow-hidden rounded-card border border-line bg-card shadow-card">
          <HubMap
            selectedId={hub.id}
            focusIds={[hub.id]}
            labels={false}
            compact
            padding={{ top: 40, right: 40, bottom: 24, left: 40 }}
            className="h-[128px]"
            attributionClassName="bottom-1 right-1.5"
          />
          <div className="p-4">
            <p className="text-[17px] font-extrabold text-ink">{hub.name}</p>
            <p className="text-[14px] font-semibold text-ink-muted">
              {hub.host} · {distanceText(distanceKm(hub.at))}
            </p>
          </div>
        </div>

        {/* ---------------- When ---------------- */}
        <SectionTitle className="mt-6">Pickup time · {schedule.pickupDay}</SectionTitle>
        <div className="flex gap-2">
          {pickupSlots.map((s) => (
            <Chip
              key={s.id}
              active={s.id === slotId}
              onClick={() => setSlotId(s.id)}
              className="flex-1 justify-center"
            >
              {s.label}
            </Chip>
          ))}
        </div>

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
                    <span className="block truncate text-[13px] font-medium text-ink-muted">
                      {m.detail}
                    </span>
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
            We'll text <b className="font-extrabold text-ink">{user.mobile}</b> the moment your
            order is ready for pickup.
          </p>
        </div>

        {/* ---------------- Sums ---------------- */}
        <div className="mt-4 space-y-2 rounded-card border border-line bg-card p-4 shadow-card">
          <SumRow label="Produce" value={peso(t.subtotal)} />
          <SumRow
            label="Pickup Hub fee"
            value={member ? 'Free' : peso(t.hubFee)}
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
