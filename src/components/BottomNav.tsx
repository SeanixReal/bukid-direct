import { Package, ShoppingBasket, Store, Tractor, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useApp } from '../state/AppState'

const items = [
  { to: '/shop', label: 'Shop', Icon: Store },
  { to: '/farms', label: 'Farms', Icon: Tractor },
  { to: '/basket', label: 'Basket', Icon: ShoppingBasket },
  { to: '/orders', label: 'Orders', Icon: Package },
  { to: '/account', label: 'Account', Icon: User },
] as const

export function BottomNav() {
  const { basketTotals, order, stageOf } = useApp()
  /* Orange dot: something is packed and ready for pickup. */
  const ready = order?.shipments.some((s) => stageOf(s) === 'ready') ?? false

  return (
    <nav className="shrink-0 border-t border-line bg-card px-2 pt-1.5">
      <ul className="flex items-stretch justify-between">
        {items.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} className="tappable flex flex-col items-center gap-[3px] rounded-md py-1">
              {({ isActive }) => (
                <>
                  <span
                    className={`relative flex h-[32px] w-[52px] items-center justify-center rounded-pill transition-colors ${
                      isActive ? 'bg-primary-soft text-primary' : 'text-ink-muted'
                    }`}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2.1} />
                    {to === '/basket' && basketTotals.count > 0 && (
                      <span
                        key={basketTotals.count}
                        className="animate-bump absolute -right-0.5 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-extrabold text-on-primary ring-2 ring-card"
                      >
                        {basketTotals.count}
                      </span>
                    )}
                    {to === '/orders' && ready && (
                      <span className="absolute right-2.5 top-0.5 h-[10px] w-[10px] rounded-full bg-accent ring-2 ring-card" />
                    )}
                  </span>
                  <span
                    className={`text-[12px] ${isActive ? 'font-extrabold text-primary' : 'font-semibold text-ink-muted'}`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
