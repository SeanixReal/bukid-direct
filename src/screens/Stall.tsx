import { Navigate, useParams } from 'react-router-dom'
import { BadgePercent, MapPin, Sprout, Star, Store, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { Screen, SectionTitle, TopBar } from '../components/Screen'
import { Logo } from '../components/Logo'
import { ListingCard } from '../components/ListingCard'
import { Avatar, Rating } from '../components/ui'
import { useApp } from '../state/AppState'
import { allListings } from '../state/catalog'
import {
  cheapestFare,
  courierNames,
  marketOf,
  peso,
  plusPlan,
  schedule,
  sellers,
  slotText,
  type Seller,
} from '../data/sample'

/* One stall's page: where it is in which market, how its food gets to you,
   its listings and what buyers say. */
export function StallScreen() {
  const { id } = useParams()
  /* Subscribes to the store, so a newly published listing shows up here. */
  useApp()
  const seller = sellers.find((s) => s.id === id)
  if (!seller) return <Navigate to="/markets" replace />

  const market = marketOf(seller)
  const forSale = allListings().filter((l) => l.sellerId === seller.id)

  return (
    <Screen tone="light" statusClass="bg-primary">
      {/* ---------------- Header ---------------- */}
      <header className="bg-grad-brand relative overflow-hidden pb-24">
        <Logo
          size={230}
          className="pointer-events-none absolute -right-14 -top-4 text-on-dark opacity-[0.08]"
        />
        <TopBar tone="light" fallback="/markets" />
        <div className="relative flex items-center gap-4 px-5 pt-2">
          <Avatar initials={seller.initials} size={68} tone="onGreen" className="shadow-float" />
          <div className="min-w-0">
            <h1 className="text-[30px] font-extrabold leading-tight tracking-tight text-on-dark">
              {seller.call}
            </h1>
            <p className="text-[15px] font-semibold text-on-dark-muted">{seller.owner}</p>
            <p className="mt-1 flex items-center gap-1.5 text-[14px] font-bold text-on-dark">
              <Star size={15} strokeWidth={0} fill="currentColor" />
              {seller.rating.toFixed(1)}
              <span className="font-semibold text-on-dark-muted">
                · {seller.reviewCount} reviews · {seller.sold}
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="relative -mt-14 px-5 pb-6">
        <div className="rounded-card border border-line bg-card p-4 shadow-card">
          <ul className="space-y-3">
            <Fact Icon={MapPin}>
              {seller.stall}
              <Sub>
                {market.name} · {market.area}
              </Sub>
            </Fact>
            {seller.own && (
              <Fact Icon={Sprout}>
                {seller.own}
                <Sub>Sells their own, straight to you</Sub>
              </Fact>
            )}
            <Fact Icon={Truck}>
              Delivery from {peso(cheapestFare(market))} · one rider from {market.short}
              <Sub>
                {courierNames} · {schedule.day.toLowerCase()} {market.slots.map(slotText).join(' or ')}
              </Sub>
            </Fact>
            <Fact Icon={Store}>
              Pick up at the stall
              <Sub>
                Free · {schedule.day.toLowerCase()} {market.hours}
              </Sub>
            </Fact>
            {seller.sukiDeal && (
              <Fact Icon={BadgePercent}>
                Suki deal: {peso(seller.sukiDeal.off)} off {peso(seller.sukiDeal.minSpend)}+
                <Sub>For {plusPlan.name} members</Sub>
              </Fact>
            )}
          </ul>
          <p className="mt-4 border-t border-line pt-4 text-[16px] font-medium leading-relaxed text-ink">
            {seller.story}
          </p>
        </div>

        <SectionTitle
          className="mt-7"
          action={<span className="text-[13px] font-semibold text-ink-muted">{forSale.length} listings</span>}
        >
          Shop from {seller.call}
        </SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {forSale.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>

        <Reviews seller={seller} />
      </div>
    </Screen>
  )
}

function Reviews({ seller }: { seller: Seller }) {
  return (
    <>
      <SectionTitle
        className="mt-7"
        action={<Rating value={seller.rating} count={seller.reviewCount} className="text-[14px]" />}
      >
        What buyers say
      </SectionTitle>
      <ul className="space-y-2.5">
        {seller.reviews.map((r) => (
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
