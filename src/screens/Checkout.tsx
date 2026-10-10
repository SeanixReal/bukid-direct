import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Banknote, Check, CreditCard, Handshake, MessageSquare, Wallet, type LucideIcon } from 'lucide-react'
import { Screen, ScreenFooter, SectionTitle, TopBar } from '../components/Screen'
import { CityMap } from '../components/CityMap'
import { FulfilmentRow, MarketBadge } from '../components/StallBits'
import { Button, ModeSwitch, PlusTag, Segmented, SumRow } from '../components/ui'
import { useApp } from '../state/AppState'
import type { MarketGroup } from '../state/pricing'
import {
  couriers,
  fareFor,
  getMarket,
  getSeller,
  handoffs,
  homeAt,
  paymentMethods,
  peso,
  schedule,
  slotText,
  stallNo,
  user,
  type PaymentId,
} from '../data/sample'

const paymentIcon: Record<PaymentId, LucideIcon> = {
  gcash: Wallet,
  cash: Banknote,
  card: CreditCard,
}

export function Checkout() {
  const navigate = useNavigate()
  const { basket, groups, basketTotals: t, member, handoff, setHandoff, placeOrder } = useApp()
  const [payment, setPayment] = useState<PaymentId>('gcash')

  if (basket.length === 0) return <Navigate to="/basket" replace />

  const delivering = groups.some((g) => g.mode === 'delivery')
  /* Before the welcome voucher, which gets its own line. */
  const delivery = t.delivery + t.deliveryCovered

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
        subtitle={`${t.count} items from ${t.stallCount} ${t.stallCount === 1 ? 'stall' : 'stalls'}`}
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

        {/* ---------------- Each market: courier and time ---------------- */}
        <SectionTitle className={delivering ? 'mt-6' : ''}>Choose your delivery option</SectionTitle>
        <div className="space-y-3">
          {groups.map((g) => (
            <DeliveryOption key={g.marketId} group={g} />
          ))}
        </div>

        {/* ---------------- Handoff ---------------- */}
        {delivering && (
          <div className="mt-3 rounded-card border border-line bg-card p-4 shadow-card">
            <p className="text-[16px] font-bold text-ink">Handoff</p>
            <p className="text-[13px] font-semibold text-ink-muted">How the rider gives you your order</p>
            <div className="mt-3">
              <Segmented options={handoffs} value={handoff} onChange={setHandoff} />
            </div>
          </div>
        )}

        {/* ---------------- The stalls agree ---------------- */}
        <div className="mt-3 flex items-start gap-3 rounded-card bg-secondary-soft p-4">
          <Handshake size={21} strokeWidth={2.3} className="mt-0.5 shrink-0 text-primary" />
          <p className="text-[14px] font-semibold leading-snug text-on-secondary">
            {t.stallCount === 1 ? 'The stall' : 'Each stall'} confirms{' '}
            {delivering ? 'the courier, time and handoff' : 'your pick-up time'} before packing.
            {delivering && " Once a rider is booked, you'll see their name and arrival time."}
          </p>
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
                    <span className="block truncate text-[13px] font-medium text-ink-muted">{m.detail}</span>
                  </span>
                  <CheckCircle active={active} />
                </button>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex items-center gap-3 rounded-card bg-surface p-4">
          <MessageSquare size={19} strokeWidth={2.3} className="shrink-0 text-primary" />
          <p className="text-[14px] font-semibold text-ink-muted">
            Updates by SMS to <b className="font-extrabold text-ink">{user.mobile}</b>
          </p>
        </div>

        {/* ---------------- Sums ---------------- */}
        <div className="mt-4 space-y-2 rounded-card border border-line bg-card p-4 shadow-card">
          <SumRow label="Food" value={peso(t.regular)} />
          {t.sukiOff > 0 && <SumRow label="Suki deals" value={`−${peso(t.sukiOff)}`} tone="primary" />}
          <SumRow
            label="Delivery · couriers' own fares"
            value={delivery > 0 ? peso(delivery) : 'Free'}
            tone={delivery > 0 ? 'ink' : 'primary'}
          />
          {t.deliveryCovered > 0 && (
            <SumRow label="Welcome voucher" value={`−${peso(t.deliveryCovered)}`} tone="primary" />
          )}
          <SumRow
            label="Service fee"
            value={member ? 'Free' : peso(t.serviceFee)}
            tone={member ? 'primary' : 'ink'}
          />
          <div className="border-t border-line pt-2">
            <SumRow label="Total" value={peso(t.total)} strong />
          </div>
          {member && t.savings > 0 && (
            <p className="flex items-center justify-between gap-2 pt-1 text-[14px] font-bold text-primary">
              <PlusTag label="Direct Plus saved you" />
              <span className="tabular">{peso(t.savings)}</span>
            </p>
          )}
        </div>
      </div>
    </Screen>
  )
}

/* --------------------------------------------------------------------------
   One market's part of the order: Delivery or Pick-up and, for a delivery,
   which courier brings it and when - what the stalls then confirm. One
   rider collects from every stall in the market, so each courier is shown
   once, at its own fare for the trip.
   -------------------------------------------------------------------------- */

function DeliveryOption({ group: g }: { group: MarketGroup }) {
  const { setMarketMode, setMarketCourier, slotOf, setMarketSlot } = useApp()
  const market = getMarket(g.marketId)
  const fares = couriers.map((courier) => ({ courier, fare: fareFor(market, courier.id) }))
  const cheapest = Math.min(...fares.map((f) => f.fare))
  const slots = market.slots.map((slot, i) => ({ id: String(i), label: slotText(slot) }))
  const stallList = g.stalls.map((s) => stallNo(getSeller(s.sellerId))).join(', ')

  return (
    <section className="overflow-hidden rounded-card border border-line bg-card shadow-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <MarketBadge size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold text-ink">{market.name}</p>
          <p className="truncate text-[13px] font-semibold text-ink-muted">
            {g.stalls.length} {g.stalls.length === 1 ? 'stall' : 'stalls'} · {g.lines.length}{' '}
            {g.lines.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <p className="tabular shrink-0 text-[15px] font-extrabold text-ink">
          {g.suki > 0 && (
            <span className="mr-1.5 text-[13px] font-semibold text-ink-faint line-through">{peso(g.regular)}</span>
          )}
          {peso(g.subtotal)}
        </p>
      </div>

      <div className="border-t border-line px-4 py-2.5">
        <ModeSwitch size="sm" value={g.mode} onChange={(m) => setMarketMode(market.id, m)} />
      </div>

      {g.mode === 'delivery' ? (
        <>
          <div role="radiogroup" aria-label={`Courier from ${market.name}`} className="border-t border-line px-2 py-1.5">
            {fares.map(({ courier, fare }) => {
              const active = courier.id === g.courier
              /* One tag a row, so a long courier name never gets cut off. */
              const tag = fare === cheapest ? 'Cheapest' : courier.id === market.usual ? 'Usual' : null
              return (
                <button
                  key={courier.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMarketCourier(market.id, courier.id)}
                  className={`tappable flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left ${
                    active ? 'bg-primary-soft' : ''
                  }`}
                >
                  <CheckCircle active={active} />
                  <span className={`min-w-0 flex-1 truncate text-[15px] font-bold ${active ? 'text-primary' : 'text-ink'}`}>
                    {courier.name}
                  </span>
                  {tag && <Tag tone={tag === 'Cheapest' ? 'leaf' : 'plain'}>{tag}</Tag>}
                  <span className="tabular w-[42px] shrink-0 text-right text-[15px] font-extrabold text-ink">
                    {peso(fare)}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="border-t border-line px-4 pb-3.5 pt-3">
            <p className="mb-2 text-[13px] font-bold text-ink-muted">{schedule.day}, between</p>
            <Segmented
              options={slots}
              value={String(slotOf(market.id))}
              onChange={(id) => setMarketSlot(market.id, Number(id))}
            />
          </div>

          <p className="border-t border-line px-4 py-2.5 text-[13px] font-semibold leading-snug text-ink-muted">
            {g.voucher ? (
              <b className="font-bold text-primary">Free: your welcome voucher pays this delivery.</b>
            ) : g.stalls.length > 1 ? (
              `One rider collects from all ${g.stalls.length} stalls at ${market.handover}.`
            ) : (
              `The rider collects at ${market.handover}.`
            )}
          </p>
        </>
      ) : (
        <div className="space-y-1 border-t border-line px-4 py-3">
          <FulfilmentRow market={market} mode="pickup" wrap />
          <p className="pl-6 text-[13px] font-bold text-primary">
            Free · show your code at {stallList}
          </p>
        </div>
      )}
    </section>
  )
}

function CheckCircle({ active }: { active: boolean }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
        active ? 'border-primary bg-primary text-on-primary' : 'border-line'
      }`}
    >
      {active && <Check size={14} strokeWidth={3.2} />}
    </span>
  )
}

function Tag({ children, tone = 'plain' }: { children: string; tone?: 'plain' | 'leaf' }) {
  return (
    <span
      className={`shrink-0 rounded-pill px-2 py-[2px] text-[11.5px] font-extrabold ${
        tone === 'leaf' ? 'bg-secondary-soft text-primary' : 'bg-surface text-ink-muted'
      }`}
    >
      {children}
    </span>
  )
}
