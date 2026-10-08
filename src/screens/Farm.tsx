import { Navigate, useParams } from 'react-router-dom'
import { CalendarDays, MapPin, Star, Store, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Screen, SectionTitle, TopBar } from '../components/Screen'
import { Hills } from '../components/ProduceArt'
import { ListingCard } from '../components/ListingCard'
import { deliveryLine, pickupLine } from '../components/FarmBits'
import { Avatar, Rating } from '../components/ui'
import { useApp } from '../state/AppState'
import { allListings } from '../state/catalog'
import { distanceKm, distanceText, farms, peso, type Farm } from '../data/sample'

export function FarmScreen() {
  const { id } = useParams()
  /* Subscribes to the store, so a newly published listing shows up here. */
  useApp()
  const farm = farms.find((f) => f.id === id)
  if (!farm) return <Navigate to="/farms" replace />

  const forSale = allListings().filter((l) => l.farmId === farm.id)

  return (
    <Screen tone="light" statusClass="bg-primary">
      {/* ---------------- Header over the hills ---------------- */}
      <header className="bg-grad-brand relative overflow-hidden pb-24">
        <Hills className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] w-full" />
        <TopBar tone="light" fallback="/farms" />
        <div className="relative flex items-center gap-4 px-5 pt-2">
          <Avatar initials={farm.initials} size={68} tone="onGreen" className="shadow-float" />
          <div className="min-w-0">
            <h1 className="text-[30px] font-extrabold leading-tight tracking-tight text-on-dark">
              {farm.call}
            </h1>
            <p className="text-[15px] font-semibold text-on-dark-muted">{farm.farmer}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[14px] font-bold text-on-dark">
              <Star size={15} strokeWidth={0} fill="currentColor" />
              {farm.rating.toFixed(1)}
              <span className="font-semibold text-on-dark-muted">
                · {farm.reviewCount} reviews · {farm.sold}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="relative -mt-14 px-5 pb-6">
        <div className="rounded-card border border-line bg-card p-4 shadow-card">
          <ul className="space-y-3">
            <Fact Icon={MapPin}>{farm.place}</Fact>
            <Fact Icon={Truck}>
              Delivers by {deliveryLine(farm)}
              <Sub>
                {peso(farm.delivery.fee)} delivery · free over {peso(farm.delivery.freeOver)}
              </Sub>
              {farm.delivery.shared && (
                <Sub>
                  Shared city run: one courier trip carries all of the day's city orders, so you
                  pay a share, not a whole trip.
                </Sub>
              )}
            </Fact>
            <Fact Icon={Store}>
              {farm.pickup ? `Pick up at ${pickupLine(farm)}` : 'Delivery only'}
              {farm.pickup && (
                <Sub>
                  {farm.pickup.detail} · {distanceText(distanceKm(farm.pickup.at))} from you
                </Sub>
              )}
            </Fact>
            <Fact Icon={CalendarDays}>{farm.since}</Fact>
          </ul>
          <p className="mt-4 border-t border-line pt-4 text-[16px] font-medium leading-relaxed text-ink">
            {farm.story}
          </p>
        </div>

        <SectionTitle
          className="mt-7"
          action={<span className="text-[13px] font-semibold text-ink-muted">{forSale.length} listings</span>}
        >
          Shop from {farm.call}
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {forSale.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>

        <Reviews farm={farm} />
      </div>
    </Screen>
  )
}

function Reviews({ farm }: { farm: Farm }) {
  return (
    <>
      <SectionTitle className="mt-7" action={<Rating value={farm.rating} count={farm.reviewCount} className="text-[14px]" />}>
        What buyers say
      </SectionTitle>
      <ul className="space-y-2.5">
        {farm.reviews.map((r) => (
          <li key={r.name} className="rounded-card border border-line bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-ink">{r.name}</span>
              <span className="flex gap-0.5 text-primary" aria-label={`${r.stars} out of 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    size={14}
                    strokeWidth={0}
                    fill="currentColor"
                    className={i < r.stars ? '' : 'opacity-25'}
                  />
                ))}
              </span>
            </div>
            <p className="mt-1 text-[15px] font-medium leading-snug text-ink-muted">{r.text}</p>
          </li>
        ))}
      </ul>
    </>
  )
}

function Fact({ Icon, children }: { Icon: typeof MapPin; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[15px] font-semibold text-ink">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={18} strokeWidth={2.4} />
      </span>
      <span className="min-w-0 pt-1.5">{children}</span>
    </li>
  )
}

function Sub({ children }: { children: ReactNode }) {
  return <span className="mt-0.5 block text-[13.5px] font-medium leading-snug text-ink-muted">{children}</span>
}
