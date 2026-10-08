import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bell, ChevronRight, Heart, MapPin, Sunrise, Truck, type LucideIcon } from 'lucide-react'
import { BackButton, Screen, ScreenFooter } from '../components/Screen'
import { ProductPicture, tintClass } from '../components/ProduceArt'
import { Avatar, Button, HarvestedBadge, PlusTag, SoldOutBadge, Stepper } from '../components/ui'
import { useApp } from '../state/AppState'
import { unitPrice } from '../state/pricing'
import {
  categories,
  getFarm,
  getHub,
  getProduct,
  orderStages,
  peso,
  perUnit,
  qtyText,
  schedule,
} from '../data/sample'

export function ProductScreen() {
  const { id } = useParams()
  const product = getProduct(id)
  if (!product) return <Navigate to="/shop" replace />
  /* Keyed so moving between products starts from a fresh quantity. */
  return <ProductDetail key={product.id} productId={product.id} />
}

function ProductDetail({ productId }: { productId: string }) {
  const navigate = useNavigate()
  const { member, hubId, qtyOf, setQty, favorites, toggleFavorite, showToast } = useApp()
  const product = getProduct(productId)!
  const farm = getFarm(product.farmId)
  const hub = getHub(hubId)
  const inBasket = qtyOf(product.id)
  const firstQty = product.unit === 'kg' ? 1 : product.step
  const [qty, setLocalQty] = useState(inBasket > 0 ? inBasket : firstQty)

  const price = unitPrice(product.price, member)
  const memberPrice = unitPrice(product.price, true)
  const lineTotal = Math.round(price * qty)
  const favorite = favorites.includes(product.id)
  const readyTime = orderStages.find((s) => s.id === 'ready')?.time
  const category = categories.find((c) => c.id === product.category)?.label

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate('/shop'))

  const save = () => {
    setQty(product.id, qty)
    showToast(
      inBasket > 0
        ? `Basket updated: ${qtyText(product, qty)} ${product.name.toLowerCase()}`
        : `Added ${qtyText(product, qty)} ${product.name.toLowerCase()}`,
      { label: 'View', to: '/basket' },
    )
  }

  return (
    <Screen
      /* The status bar takes the picture's background so the top reads as one. */
      statusClass={tintClass[product.tint]}
      footer={
        <ScreenFooter>
          {product.outOfStock ? (
            <Button
              variant="secondary"
              onClick={() =>
                showToast(`We'll text you when ${product.name.toLowerCase()} is back`)
              }
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
      <ProductPicture product={product} className="h-[292px]">
        <div className="absolute inset-x-4 top-1 flex items-center justify-between">
          <BackButton onClick={goBack} tone="float" />
          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-label={favorite ? 'Remove from favourites' : 'Save to favourites'}
            aria-pressed={favorite}
            className="tappable flex h-11 w-11 items-center justify-center rounded-full bg-card text-primary shadow-float"
          >
            <Heart size={20} strokeWidth={2.4} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </ProductPicture>

      <div className="relative -mt-7 rounded-t-xl bg-canvas px-5 pb-6 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          {product.harvestedToday && <HarvestedBadge />}
          {product.outOfStock && <SoldOutBadge />}
          <span className="rounded-pill bg-surface px-3 py-[5px] text-[13px] font-bold text-ink-muted">
            {category}
          </span>
        </div>

        <h1 className="mt-3 text-[30px] font-extrabold leading-tight tracking-tight text-ink">
          {product.name}
        </h1>
        {product.local && (
          <p className="text-[16px] font-semibold text-ink-muted">{product.local}</p>
        )}

        {/* ---------------- Price ---------------- */}
        <div className="mt-4">
          <div>
            <p className="flex items-baseline gap-1.5">
              <span
                className={`text-[32px] font-extrabold leading-none tracking-tight ${
                  member ? 'text-primary' : 'text-ink'
                }`}
              >
                {peso(price)}
              </span>
              <span className="text-[16px] font-semibold text-ink-muted">/ {perUnit(product)}</span>
            </p>
            {member ? (
              <p className="mt-2 flex items-center gap-2 text-[14px] font-semibold text-ink-muted">
                <PlusTag label="Member price" />
                <span className="line-through">{peso(product.price)}</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/plus')}
                className="tappable mt-2 flex items-center gap-2 text-[14px] font-bold text-primary"
              >
                <PlusTag />
                {peso(memberPrice)} / {perUnit(product)} for members
              </button>
            )}
          </div>
        </div>

        {/* ---------------- How much ---------------- */}
        {!product.outOfStock && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-card border border-line bg-card py-2.5 pl-4 pr-2.5 shadow-card">
            <span className="min-w-0">
              <span className="block text-[16px] font-bold text-ink">How much?</span>
              <span className="block text-[13px] font-semibold text-ink-muted">
                {product.size
                  ? `One ${product.unit} is ${product.size}`
                  : product.unit === 'kg'
                    ? `In steps of ${product.step} kg`
                    : `Sold by the ${product.unit}`}
              </span>
            </span>
            <Stepper
              label={qtyText(product, qty)}
              onDec={() => setLocalQty((q) => Math.max(product.step, q - product.step))}
              onInc={() => setLocalQty((q) => q + product.step)}
              decLabel={`Less ${product.name}`}
              incLabel={`More ${product.name}`}
            />
          </div>
        )}

        {product.outOfStock && (
          <div className="mt-4 rounded-card bg-danger-soft p-4 text-[14px] font-semibold leading-snug text-danger">
            Sold out for this week. {farm.call} picks the next batch in a few days.
          </div>
        )}

        {/* ---------------- Who grew it ---------------- */}
        <button
          type="button"
          onClick={() => navigate(`/farm/${farm.id}`)}
          className="tappable mt-5 flex w-full items-center gap-3 rounded-card border border-line bg-card p-3.5 text-left shadow-card"
        >
          <Avatar initials={farm.initials} size={48} />
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-bold uppercase tracking-wide text-ink-muted">
              Grown by
            </span>
            <span className="block text-[17px] font-extrabold text-ink">{farm.call}</span>
            <span className="block truncate text-[13px] font-semibold text-ink-muted">
              {farm.place}
            </span>
          </span>
          <ChevronRight size={20} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
        </button>

        {/* ---------------- Freshness ---------------- */}
        {!product.outOfStock && (
          <ul className="mt-3 space-y-2.5 rounded-card bg-surface p-4">
            <Fact Icon={Sunrise}>Picked the morning of your pickup</Fact>
            <Fact Icon={Truck}>
              At {hub.name} by {readyTime}
            </Fact>
            <Fact Icon={MapPin}>
              Pick up {schedule.pickupDay.toLowerCase()}, {hub.hours}
            </Fact>
          </ul>
        )}

        <h2 className="mt-6 text-[18px] font-extrabold tracking-tight text-ink">About this harvest</h2>
        <p className="mt-1.5 text-[16px] font-medium leading-relaxed text-ink-muted">{product.about}</p>
      </div>
    </Screen>
  )
}

function Fact({ Icon, children }: { Icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-[15px] font-semibold text-ink">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-primary">
        <Icon size={18} strokeWidth={2.4} />
      </span>
      {children}
    </li>
  )
}
