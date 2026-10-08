import { BadgePercent, Check, PiggyBank, Sparkles, Ticket, Tractor, type LucideIcon } from 'lucide-react'
import { Screen, ScreenFooter, TopBar } from '../components/Screen'
import { Logo } from '../components/Logo'
import { Button } from '../components/ui'
import { useApp } from '../state/AppState'
import { plusSavings } from '../state/pricing'
import { pastOrders, peso, plusPlan, user } from '../data/sample'

const perkIcon: Record<string, LucideIcon> = {
  prices: BadgePercent,
  fee: Ticket,
  early: Sparkles,
  visit: Tractor,
}

export function Plus() {
  const { member, setMember, showToast } = useApp()
  const saved = pastOrders.reduce((sum, o) => sum + plusSavings(o.lines), 0)

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
                showToast('Welcome to Direct Plus! Member prices are on.', {
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
            No service fee, and member prices on every harvest.
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

        <div className="flex items-center gap-3.5 rounded-card bg-primary-soft p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <PiggyBank size={21} strokeWidth={2.3} />
          </span>
          <p className="text-[15px] font-semibold leading-snug text-ink">
            On your last {pastOrders.length} orders, {user.firstName}, Direct Plus would have saved
            you <b className="font-extrabold text-primary">{peso(saved)}</b>.
          </p>
        </div>
      </div>
    </Screen>
  )
}
