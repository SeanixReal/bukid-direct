import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search, Sprout, Store, X, ChevronRight } from 'lucide-react'
import { Screen, SectionTitle } from '../components/Screen'
import { Wordmark } from '../components/Logo'
import { ListingCard } from '../components/ListingCard'
import { FarmChip } from '../components/FarmBits'
import { Avatar, Chip, ModeSwitch } from '../components/ui'
import { useApp } from '../state/AppState'
import { allListings } from '../state/catalog'
import {
  categories,
  farms,
  getFarm,
  getProduce,
  greeting,
  peso,
  plusPlan,
  user,
  type CategoryId,
  type Listing,
} from '../data/sample'

export function Shop() {
  const navigate = useNavigate()
  const { member, prefMode, setPrefMode } = useApp()
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [query, setQuery] = useState('')

  const pickup = prefMode === 'pickup'
  /* Pick-up shows only farms that have a pickup point, like foodpanda. */
  const sellers = farms.filter((f) => !pickup || f.pickup)
  const forSale = allListings().filter((l) => !pickup || getFarm(l.farmId).pickup)
  const q = query.trim().toLowerCase()
  const browsing = category === 'all' && !q
  const list = forSale.filter(
    (l) =>
      (category === 'all' || getProduce(l.produceId).category === category) && (!q || matches(l, q)),
  )
  const fresh = forSale.filter((l) => l.harvestedToday)
  const featured = forSale.filter((l) => l.featured)
  const listTitle = q
    ? `Results for “${query.trim()}”`
    : category === 'all'
      ? 'All produce'
      : categories.find((c) => c.id === category)?.label

  return (
    <Screen nav>
      {/* ---------------- Header ---------------- */}
      <header className="px-5 pt-1">
        <div className="flex items-center justify-between">
          <Wordmark size={19} />
          <button
            type="button"
            onClick={() => navigate('/account')}
            aria-label="Account"
            className="tappable rounded-full"
          >
            <Avatar initials={user.initials} size={40} />
          </button>
        </div>

        <ModeSwitch value={prefMode} onChange={setPrefMode} className="mt-4" />

        <p className="mt-2.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted">
          {pickup ? (
            <>
              <Store size={15} strokeWidth={2.5} className="text-primary" />
              Collect from farm stalls and farm gates near you
            </>
          ) : (
            <>
              <MapPin size={15} strokeWidth={2.5} className="text-primary" />
              Deliver to <b className="font-bold text-ink">{user.address.label}</b> ·{' '}
              {user.address.street}, {user.address.area.split(',')[0]}
            </>
          )}
        </p>

        <p className="mt-4 text-[16px] font-semibold text-ink-muted">
          {greeting()}, {user.firstName}!
        </p>
        <h1 className="mt-0.5 text-[28px] font-extrabold leading-[1.12] tracking-tight text-ink">
          Buy straight from Cebu farmers
        </h1>

        <label className="mt-4 flex h-[52px] items-center gap-2.5 rounded-pill bg-card px-4 shadow-card ring-1 ring-inset ring-line focus-within:ring-2 focus-within:ring-primary">
          <Search size={20} strokeWidth={2.4} className="shrink-0 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search produce or farms"
            className="min-w-0 flex-1 bg-transparent text-[16px] font-semibold outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="tappable flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-muted"
            >
              <X size={15} strokeWidth={2.8} />
            </button>
          )}
        </label>
      </header>

      {/* ---------------- Category chips ---------------- */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {categories.map((c) => (
          <Chip key={c.id} active={c.id === category} onClick={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      {/* ---------------- The sellers ---------------- */}
      {browsing && (
        <section className="mt-6">
          <SectionTitle
            className="px-5"
            action={
              <button
                type="button"
                onClick={() => navigate('/farms')}
                className="tappable text-[14px] font-bold text-primary"
              >
                See all
              </button>
            }
          >
            {pickup ? 'Farms with pick-up' : 'Farms selling this week'}
          </SectionTitle>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
            {sellers.map((f) => (
              <FarmChip key={f.id} farm={f} mode={pickup ? 'pickup' : 'delivery'} />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Harvested today ---------------- */}
      {browsing && fresh.length > 0 && (
        <section className="mt-5">
          <SectionTitle
            className="px-5"
            action={<span className="text-[13px] font-semibold text-ink-muted">{fresh.length} items</span>}
          >
            Picked this morning
          </SectionTitle>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
            {fresh.map((l) => (
              <ListingCard key={l.id} listing={l} className="w-[172px] shrink-0" />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Featured: farms pay for this row ---------------- */}
      {browsing && featured.length > 0 && (
        <section className="mt-5">
          <SectionTitle
            className="px-5"
            action={<span className="text-[13px] font-semibold text-ink-muted">Sponsored</span>}
          >
            Featured this week
          </SectionTitle>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} className="w-[172px] shrink-0" />
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Direct Plus ---------------- */}
      {browsing && !member && (
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={() => navigate('/plus')}
            className="tappable bg-grad-brand flex w-full items-center gap-3.5 rounded-card p-4 text-left shadow-card"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-on-dark/15 text-on-dark">
              <Sprout size={24} strokeWidth={2.4} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-extrabold text-on-dark">{plusPlan.name}</span>
              <span className="block text-[13.5px] font-semibold leading-snug text-on-dark-muted">
                No service fee, suki deals from farms, and your first delivery free.{' '}
                {peso(plusPlan.price)}/{plusPlan.period}.
              </span>
            </span>
            <ChevronRight size={20} strokeWidth={2.6} className="shrink-0 text-on-dark" />
          </button>
        </div>
      )}

      {/* ---------------- Everything ---------------- */}
      <section className="px-5 pb-6 pt-6">
        <SectionTitle
          action={
            <span className="text-[13px] font-semibold text-ink-muted">
              {list.length} {list.length === 1 ? 'listing' : 'listings'}
            </span>
          }
        >
          {listTitle}
        </SectionTitle>

        {list.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {list.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-line bg-card p-6 text-center">
            <p className="text-[16px] font-bold text-ink">
              {q ? `Nothing matches “${query.trim()}”` : 'Nothing here for pick-up yet'}
            </p>
            <p className="mt-1 text-[14px] font-medium text-ink-muted">
              {q ? "Try “tomatoes”, “mango” or a farmer's name." : 'Switch to Delivery to see every farm.'}
            </p>
          </div>
        )}
      </section>
    </Screen>
  )
}

function matches(l: Listing, q: string) {
  const farm = getFarm(l.farmId)
  const item = getProduce(l.produceId)
  return [item.name, item.local ?? '', farm.call, farm.farmer, farm.place].some((s) =>
    s.toLowerCase().includes(q),
  )
}
