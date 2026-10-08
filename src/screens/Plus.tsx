import { useNavigate } from 'react-router-dom'
import {
  BadgePercent,
  Check,
  ChevronRight,
  PiggyBank,
  Sparkles,
  Ticket,
  Tractor,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { Screen, ScreenFooter, TopBar } from '../components/Screen'
import { Logo } from '../components/Logo'
import { Avatar, Button } from '../components/ui'
import { useApp } from '../state/AppState'
import { plusSavingsOver } from '../state/pricing'
import { farms, pastOrders, peso, plusPlan } from '../data/sample'

const perkIcon: Record<string, LucideIcon> = {
  fee: Ticket,
  welcome: Truck,
  suki: BadgePercent,
  early: Sparkles,
  visit: Tractor,
}

export function Plus() {
  const navigate = useNavigate()
  const { member, setMember, showToast } = useApp()
  /* Oldest first, so the welcome voucher lands where it would have. */
  const saved = plusSavingsOver([...pastOrders].reverse().map((o) => o.lines))
  const deals = farms.flatMap((farm) => (farm.sukiDeal ? [{ farm, deal: farm.sukiDeal }] : []))

  return (
    <Screen
      tone="light"
      statusClass="bg-primary"
      footer={
        <ScreenFooter>
          {member ? (
            <Button variant="secondary" disabled>
              <Check size={19} strokeWidth={3} />
              You're a Direct Plus member
            </Button>
          ) : (
            <Button
              onClick={() => {
                setMember(true)
                showToast('Welcome to Direct Plus!', {
                  label: 'Shop',
                  to: '/shop',
                })
              }}
            >
              Join {plusPlan.name}
              <span className="opacity-60">·</span>
              {peso(plusPlan.price)}/{plusPlan.period}
            </Button>
          )}
        </ScreenFooter>
      }
    >
      {/* ---------------- Hero ---------------- */}
      <header className="bg-grad-brand relative overflow-hidden pb-12">
        <Logo
          size={230}
          className="pointer-events-none absolute -right-14 -top-4 text-on-dark opacity-[0.08]"
        />
        <TopBar tone="light" />
        <div className="relative px-5 pt-1">
          <h1 className="text-[38px] font-extrabold leading-none tracking-tight text-on-dark">
            {plusPlan.name}
          </h1>
          <p className="mt-2.5 max-w-[300px] text-[17px] font-semibold leading-snug text-on-dark-muted">
            No service fee, suki deals and a free first delivery.
          </p>
          <p className="mt-5 flex items-baseline gap-2 text-on-dark">
            <span className="text-[36px] font-extrabold leading-none tracking-tight">
              {peso(plusPlan.price)}
            </span>
            <span className="text-[16px] font-semibold text-on-dark-muted">
              a {plusPlan.period} · cancel any time
            </span>
          </p>
        </div>
      </header>

      <div className="relative -mt-6 space-y-3 px-5 pb-6">
        <ul className="divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          {plusPlan.perks.map((perk) => {
            const Icon = perkIcon[perk.id] ?? Sparkles
            return (
              <li key={perk.id} className="flex items-center gap-3.5 py-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-primary">
                  <Icon size={21} strokeWidth={2.3} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[16px] font-bold text-ink">{perk.title}</span>
                  <span className="block text-[14px] font-medium leading-snug text-ink-muted">
                    {perk.detail}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>

        {/* ---------------- The farms' own deals ---------------- */}
        <div className="rounded-card border border-line bg-card px-4 pb-1.5 pt-4 shadow-card">
          <p className="text-[16px] font-extrabold text-ink">This week's suki deals</p>
          <ul className="mt-1 divide-y divide-line">
            {deals.map(({ farm, deal }) => (
              <li key={farm.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/farm/${farm.id}`)}
                  className="tappable flex w-full items-center gap-3 py-3 text-left"
                >
                  <Avatar initials={farm.initials} size={38} />
                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold text-ink">{farm.call}</span>
                  <span className="shrink-0 text-[14px] font-extrabold text-primary">
                    {peso(deal.off)} off {peso(deal.minSpend)}+
                  </span>
                  <ChevronRight size={18} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3.5 rounded-card bg-primary-soft p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <PiggyBank size={21} strokeWidth={2.3} />
          </span>
          <p className="text-[15px] font-semibold leading-snug text-ink">
            Direct Plus would have saved you{' '}
            <b className="font-extrabold text-primary">{peso(saved)}</b> on your last{' '}
            {pastOrders.length} orders.
          </p>
        </div>
      </div>
    </Screen>
  )
}
