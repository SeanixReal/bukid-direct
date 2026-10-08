import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, MapPin, Search, Sprout, X } from 'lucide-react'
import { Screen, SectionTitle } from '../components/Screen'
import { Wordmark } from '../components/Logo'
import { ProductCard } from '../components/ProductCard'
import { Avatar, Chip } from '../components/ui'
import { useApp } from '../state/AppState'
import {
  categories,
  getFarm,
  getHub,
  greeting,
  peso,
  plusPlan,
  products,
  schedule,
  user,
  type CategoryId,
  type Product,
} from '../data/sample'

export function Shop() {
  const navigate = useNavigate()
  const { hubId, member } = useApp()
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const [query, setQuery] = useState('')

  const hub = getHub(hubId)
  const q = query.trim().toLowerCase()
  const browsing = category === 'all' && !q
  const list = products.filter(
    (p) => (category === 'all' || p.category === category) && (!q || matches(p, q)),
  )
  const fresh = products.filter((p) => p.harvestedToday)
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

        <p className="mt-5 text-[16px] font-semibold text-ink-muted">
          {greeting()}, {user.firstName}!
        </p>
        <h1 className="mt-0.5 text-[28px] font-extrabold leading-[1.12] tracking-tight text-ink">
          What's fresh this week?
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

        <button
          type="button"
          onClick={() => navigate('/hubs')}
          className="tappable mt-3 flex w-full items-center gap-3 rounded-card bg-primary-soft p-3.5 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <MapPin size={19} strokeWidth={2.5} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-bold text-ink">
              Pickup {schedule.pickupDay.toLowerCase()} at {hub.name}
            </span>
            <span className="block truncate text-[13px] font-semibold text-ink-muted">
              {hub.hours} · Order by {schedule.cutoff}
            </span>
          </span>
          <ChevronRight size={19} strokeWidth={2.6} className="shrink-0 text-primary" />
        </button>
      </header>

      {/* ---------------- Category chips ---------------- */}
      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {categories.map((c) => (
          <Chip key={c.id} active={c.id === category} onClick={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      {/* ---------------- Harvested today ---------------- */}
      {browsing && (
        <section className="mt-6">
          <SectionTitle
            className="px-5"
            action={
              <span className="text-[13px] font-semibold text-ink-muted">{fresh.length} items</span>
            }
          >
            Picked this morning
          </SectionTitle>
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
            {fresh.map((p) => (
              <ProductCard key={p.id} product={p} className="w-[172px] shrink-0" />
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
                10% off every harvest and no hub fee. {peso(plusPlan.price)}/{plusPlan.period}.
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
              {list.length} {list.length === 1 ? 'item' : 'items'}
            </span>
          }
        >
          {listTitle}
        </SectionTitle>

        {list.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-line bg-card p-6 text-center">
            <p className="text-[16px] font-bold text-ink">Nothing matches “{query.trim()}”</p>
            <p className="mt-1 text-[14px] font-medium text-ink-muted">
              Try “tomatoes”, “mango” or a farmer's name.
            </p>
          </div>
        )}
      </section>
    </Screen>
  )
}

function matches(p: Product, q: string) {
  const farm = getFarm(p.farmId)
  return [p.name, p.local ?? '', farm.call, farm.farmer, farm.place].some((s) =>
    s.toLowerCase().includes(q),
  )
}
