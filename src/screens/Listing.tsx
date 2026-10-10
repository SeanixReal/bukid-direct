import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bell, ChevronRight, Heart, Store, Truck, Users } from 'lucide-react'
import { BackButton, Screen, ScreenFooter } from '../components/Screen'
import { ProducePicture, tintClass } from '../components/ProduceArt'
import {
  Avatar,
  Button,
  FreshBadge,
  PlusTag,
  Rating,
  SoldOutBadge,
  Stepper,
} from '../components/ui'
import { useApp } from '../state/AppState'
import { allListings, listingDetails } from '../state/catalog'
import {
  categories,
  cheapestFare,
  getSeller,
  marketOf,
  peso,
  perUnit,
  qtyText,
  schedule,
  stallNo,
} from '../data/sample'

export function ListingScreen() {
  const { id } = useParams()
  const found = listingDetails(id)
  if (!found) return <Navigate to="/shop" replace />
  /* Keyed so moving between listings starts from a fresh quantity. */
  return <ListingDetail key={found.listing.id} id={found.listing.id} />
}

function ListingDetail({ id }: { id: string }) {
  const navigate = useNavigate()
  const { member, qtyOf, setQty, favorites, toggleFavorite, showToast } = useApp()
  const { listing, item } = listingDetails(id)!
  const seller = getSeller(listing.sellerId)
  const market = marketOf(seller)
  const inBasket = qtyOf(listing.id)
  const [qty, setLocalQty] = useState(inBasket > 0 ? inBasket : item.unit === 'kg' ? 1 : item.step)

  const lineTotal = Math.round(listing.price * qty)
  const deal = seller.sukiDeal
  const favorite = favorites.includes(listing.id)
  const category = categories.find((c) => c.id === item.category)?.label
  /* The same food from other stalls - comparing prices across the market,
     without walking it. */
  const others = allListings()
    .filter((l) => l.produceId === listing.produceId && l.id !== listing.id)
    .sort((a, b) => a.price - b.price)

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/shop'))

  const save = () => {
    setQty(listing.id, qty)
    showToast(
      `${inBasket > 0 ? 'Basket updated' : 'Added'}: ${qtyText(item, qty)} ${item.name.toLowerCase()} from ${seller.call}`,
      { label: 'View', to: '/basket' },
    )
  }

  return (
    <Screen
      /* The status bar takes the picture's background so the top reads as one. */
      statusClass={tintClass[item.tint]}
      footer={
        <ScreenFooter>
          {listing.outOfStock ? (
            <Button
              variant="secondary"
              onClick={() => showToast(`We'll text you when ${seller.call} has ${item.name.toLowerCase()} again`)}
            >
              <Bell size={19} strokeWidth={2.5} />
              Tell me when it's back
            </Button>
          ) : (
            <Button onClick={save}>
              {inBasket > 0 ? 'Update basket' : 'Add to basket'}
              <span className="opacity-60">·</span>
              <span className="tabular">{peso(lineTotal)}</span>
            </Button>
          )}
        </ScreenFooter>
      }
    >
      {/* ---------------- Picture ---------------- */}
      <ProducePicture item={item} dim={listing.outOfStock} className="h-[280px]">
        <div className="absolute inset-x-4 top-1 flex items-center justify-between">
          <BackButton onClick={goBack} tone="float" />
          <button
            type="button"
            onClick={() => toggleFavorite(listing.id)}
            aria-label={favorite ? 'Remove from favourites' : 'Save to favourites'}
            aria-pressed={favorite}
            className="tappable flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-float"
          >
            <Heart size={20} strokeWidth={2.4} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </ProducePicture>

      <div className="relative -mt-7 rounded-t-xl bg-canvas px-5 pb-6 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          {listing.freshToday && <FreshBadge />}
          {listing.outOfStock && <SoldOutBadge />}
          <span className="rounded-pill bg-surface px-3 py-[5px] text-[13px] font-bold text-ink-muted">
            {category}
          </span>
        </div>

        <h1 className="mt-3 text-[30px] font-extrabold leading-tight tracking-tight text-ink">{item.name}</h1>
        {item.local && <p className="text-[16px] font-semibold text-ink-muted">{item.local}</p>}

        {/* ---------------- Price ---------------- */}
        <p className="mt-4 flex items-baseline gap-1.5">
          <span className="text-[32px] font-extrabold leading-none tracking-tight text-ink">
            {peso(listing.price)}
          </span>
          <span className="text-[16px] font-semibold text-ink-muted">/ {perUnit(item)}</span>
        </p>
        {/* The stall's own deal for Direct Plus members, when it has one. */}
        {deal &&
          (member ? (
            <p className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-ink-muted">
              <PlusTag label="Suki deal" />
              {peso(deal.off)} off {peso(deal.minSpend)}+ from {seller.call}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/plus')}
              className="tappable mt-2 flex items-center gap-2 text-[14px] font-bold text-primary"
            >
              <PlusTag />
              Suki deal: {peso(deal.off)} off {peso(deal.minSpend)}+
            </button>
          ))}

        {/* ---------------- How much ---------------- */}
        {!listing.outOfStock && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-card border border-line bg-card py-2.5 pl-4 pr-2.5 shadow-card">
            <span className="min-w-0">
              <span className="block text-[16px] font-bold text-ink">How much?</span>
              <span className="block text-[13px] font-semibold text-ink-muted">
                {item.size
                  ? `One ${item.unit} is ${item.size}`
                  : item.unit === 'kg'
                    ? `In steps of ${item.step} kg`
                    : `Sold by the ${item.unit}`}
              </span>
            </span>
            <Stepper
              label={qtyText(item, qty)}
              onDec={() => setLocalQty((q) => Math.max(item.step, q - item.step))}
              onInc={() => setLocalQty((q) => q + item.step)}
              decLabel={`Less ${item.name}`}
              incLabel={`More ${item.name}`}
            />
          </div>
        )}

        {listing.outOfStock && (
          <div className="mt-4 rounded-card bg-danger-soft p-4 text-[14px] font-semibold leading-snug text-danger">
            {seller.call} is sold out this week.
            {others.length > 0 && ' Other stalls still have some - see below.'}
          </div>
        )}

        {/* ---------------- The stall ---------------- */}
        <button
          type="button"
          onClick={() => navigate(`/stall/${seller.id}`)}
          className="tappable mt-5 block w-full rounded-card border border-line bg-card text-left shadow-card"
        >
          <span className="flex items-center gap-3 p-3.5">
            <Avatar initials={seller.initials} size={48} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold uppercase tracking-wide text-ink-muted">
                Sold by
              </span>
              <span className="block text-[17px] font-extrabold text-ink">{seller.call}</span>
              <span className="flex items-center gap-1.5 text-[13px]">
                <Rating value={seller.rating} count={seller.reviewCount} />
                <span className="truncate font-semibold text-ink-muted">
                  · {stallNo(seller)}, {market.name}
                </span>
              </span>
            </span>
            <ChevronRight size={20} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
          </span>
          <span className="block space-y-2 border-t border-line px-3.5 py-3">
            <span className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
              <Truck size={17} strokeWidth={2.4} className="shrink-0 text-primary" />
              Delivery from {peso(cheapestFare(market))} · one rider from {market.short}
            </span>
            <span className="flex items-center gap-2.5 text-[14px] font-semibold text-ink">
              <Store size={17} strokeWidth={2.4} className="shrink-0 text-primary" />
              Free pick-up · {schedule.day.toLowerCase()} {market.hours}
            </span>
          </span>
        </button>

        {/* ---------------- Other stalls ---------------- */}
        {others.length > 0 && (
          <>
            <h2 className="mt-6 flex items-center gap-2 text-[18px] font-extrabold tracking-tight text-ink">
              <Users size={19} strokeWidth={2.4} className="text-primary" />
              Also sold by
            </h2>
            <ul className="mt-3 divide-y divide-line rounded-card border border-line bg-card px-3.5 shadow-card">
              {others.map((o) => {
                const s = getSeller(o.sellerId)
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/listing/${o.id}`, { replace: true })}
                      className="tappable flex w-full items-center gap-3 py-3 text-left"
                    >
                      <Avatar initials={s.initials} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-bold text-ink">{s.call}</span>
                        <span className="flex items-center gap-1.5 text-[12.5px]">
                          <Rating value={s.rating} />
                          <span className="truncate font-semibold text-ink-muted">· {marketOf(s).short}</span>
                        </span>
                      </span>
                      <span className="text-right">
                        <span
                          className={`block text-[17px] font-extrabold ${
                            o.outOfStock ? 'text-ink-faint' : 'text-ink'
                          }`}
                        >
                          {peso(o.price)}
                        </span>
                        <span className="block text-[12px] font-semibold text-ink-muted">
                          {o.outOfStock ? 'Sold out' : `/ ${perUnit(item)}`}
                        </span>
                      </span>
                      <ChevronRight size={18} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        <h2 className="mt-6 text-[18px] font-extrabold tracking-tight text-ink">Good to know</h2>
        <p className="mt-1.5 text-[16px] font-medium leading-relaxed text-ink-muted">{listing.about}</p>
      </div>
    </Screen>
  )
}
