import { useNavigate } from 'react-router-dom'
import { ChevronRight, Store, Tractor, Truck } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Avatar, Rating } from '../components/ui'
import { useApp } from '../state/AppState'
import { allListings } from '../state/catalog'
import { distanceKm, distanceText, farms, peso } from '../data/sample'

/* Every farm on the marketplace, with how each one gets an order to you. */
export function Farms() {
  const navigate = useNavigate()
  useApp()

  return (
    <Screen nav>
      <div className="px-5 pb-4 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Farms</h1>
        <p className="text-[15px] font-semibold text-ink-muted">
          {farms.length} Cebu farms selling this week
        </p>
      </div>

      <ul className="space-y-3 px-5">
        {farms.map((farm) => {
          const count = allListings().filter((l) => l.farmId === farm.id).length
          return (
            <li key={farm.id}>
              <button
                type="button"
                onClick={() => navigate(`/farm/${farm.id}`)}
                className="tappable block w-full rounded-card border border-line bg-card p-4 text-left shadow-card"
              >
                <span className="flex items-center gap-3">
                  <Avatar initials={farm.initials} size={52} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[18px] font-extrabold text-ink">{farm.call}</span>
                    <span className="block truncate text-[13.5px] font-semibold text-ink-muted">
                      {farm.place} · about {farm.kmToCity} km out
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[13px]">
                      <Rating value={farm.rating} count={farm.reviewCount} />
                      <span className="font-semibold text-ink-muted">· {count} listings</span>
                    </span>
                  </span>
                  <ChevronRight size={20} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
                </span>
                <span className="mt-3 block space-y-1.5 rounded-md bg-surface px-3 py-2.5 text-[13px] font-semibold text-ink-muted">
                  <span className="flex items-center gap-2">
                    <Truck size={15} strokeWidth={2.4} className="shrink-0 text-primary" />
                    Delivery {peso(farm.delivery.fee)} · free over {peso(farm.delivery.freeOver)}
                  </span>
                  <span className="flex items-center gap-2">
                    <Store size={15} strokeWidth={2.4} className="shrink-0 text-primary" />
                    {farm.pickup
                      ? `Pick-up at ${farm.pickup.place} · ${distanceText(distanceKm(farm.pickup.at))}`
                      : 'Delivery only'}
                  </span>
                </span>
              </button>
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
            <Tractor size={24} strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-extrabold text-on-dark">Are you a farmer?</span>
            <span className="block text-[13.5px] font-semibold leading-snug text-on-dark-muted">
              Sell direct. List in minutes, we book the riders.
            </span>
          </span>
          <ChevronRight size={20} strokeWidth={2.6} className="shrink-0 text-on-dark" />
        </button>
      </div>
    </Screen>
  )
}
