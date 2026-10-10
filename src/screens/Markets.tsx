import { useNavigate } from 'react-router-dom'
import { ChevronRight, Store, Truck } from 'lucide-react'
import { Screen } from '../components/Screen'
import { MarketBadge } from '../components/StallBits'
import { Avatar, Rating } from '../components/ui'
import { useApp } from '../state/AppState'
import {
  fareFor,
  distanceKm,
  distanceText,
  markets,
  peso,
  sellers,
  stallNo,
} from '../data/sample'

/* Every market on PresGo, with its stalls and how an order gets to you. */
export function Markets() {
  const navigate = useNavigate()
  useApp()

  return (
    <Screen nav>
      <div className="px-5 pb-4 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Markets</h1>
        <p className="text-[15px] font-semibold text-ink-muted">
          {markets.length} Cebu City public markets · {sellers.length} stalls
        </p>
      </div>

      <ul className="space-y-3 px-5">
        {markets.map((market) => {
          const stalls = sellers.filter((s) => s.marketId === market.id)
          return (
            <li key={market.id} className="overflow-hidden rounded-card border border-line bg-card shadow-card">
              <div className="flex items-center gap-3 px-4 pb-3 pt-4">
                <MarketBadge size={48} />
                <div className="min-w-0 flex-1">
                  <p className="text-[18px] font-extrabold leading-tight text-ink">{market.name}</p>
                  <p className="truncate text-[13.5px] font-semibold text-ink-muted">{market.known}</p>
                </div>
              </div>
              <div className="mx-4 mb-3 space-y-1.5 rounded-md bg-surface px-3 py-2.5 text-[13px] font-semibold text-ink-muted">
                <span className="flex items-center gap-2">
                  <Truck size={15} strokeWidth={2.4} className="shrink-0 text-primary" />
                  Delivery {peso(fareFor(market))} · one rider for every stall
                </span>
                <span className="flex items-center gap-2">
                  <Store size={15} strokeWidth={2.4} className="shrink-0 text-primary" />
                  Pick-up {market.hours} · {distanceText(distanceKm(market.at))} from you
                </span>
              </div>
              <ul className="divide-y divide-line border-t border-line">
                {stalls.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/stall/${s.id}`)}
                      className="tappable flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <Avatar initials={s.initials} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-bold text-ink">
                          {s.call} <span className="font-semibold text-ink-muted">· {stallNo(s)}</span>
                        </span>
                        <span className="block truncate text-[13px] font-semibold text-ink-muted">{s.sells}</span>
                      </span>
                      <Rating value={s.rating} className="shrink-0 text-[13px]" />
                      <ChevronRight size={18} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>

      {/* ---------------- The other side of the marketplace ---------------- */}
      <div className="px-5 pb-6 pt-4">
        <button
          type="button"
          onClick={() => navigate('/seller')}
          className="tappable bg-grad-brand flex w-full items-center gap-3.5 rounded-card p-4 text-left shadow-card"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-on-dark/15 text-on-dark">
            <Store size={24} strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-extrabold text-on-dark">Do you sell at the market?</span>
            <span className="block text-[13.5px] font-semibold leading-snug text-on-dark-muted">
              Put your stall online in minutes. We book the riders.
            </span>
          </span>
          <ChevronRight size={20} strokeWidth={2.6} className="shrink-0 text-on-dark" />
        </button>
      </div>
    </Screen>
  )
}
