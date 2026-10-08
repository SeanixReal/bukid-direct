import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, MapPin, ShoppingBasket, Sprout } from 'lucide-react'
import { Screen, ScreenFooter } from '../components/Screen'
import { ProductPicture } from '../components/ProduceArt'
import { Avatar, Button, PlusTag, Stepper, SumRow } from '../components/ui'
import { useApp } from '../state/AppState'
import { lineTotal, plusSavings, unitPrice } from '../state/pricing'
import {
  getFarm,
  getHub,
  getProduct,
  peso,
  perUnit,
  qtyText,
  schedule,
} from '../data/sample'

export function Basket() {
  const navigate = useNavigate()
  const { basket, basketTotals: t, member, hubId, setQty } = useApp()
  const hub = getHub(hubId)

  if (basket.length === 0) {
    return (
      <Screen nav>
        <Header count={0} />
        <div className="flex flex-col items-center px-8 pt-16 text-center">
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-primary-soft text-primary">
            <ShoppingBasket size={52} strokeWidth={1.9} />
          </span>
          <h2 className="mt-6 text-[24px] font-extrabold tracking-tight text-ink">
            Your basket is empty
          </h2>
          <p className="mt-1.5 text-[16px] font-medium leading-snug text-ink-muted">
            Fill it with this week's harvest. Order by {schedule.cutoff} for pickup{' '}
            {schedule.pickupDay.toLowerCase()}.
          </p>
          <Button className="mt-7" onClick={() => navigate('/shop')}>
            Start shopping
          </Button>
        </div>
      </Screen>
    )
  }

  const saving = plusSavings(basket)

  return (
    <Screen
      nav
      footer={
        <ScreenFooter>
          <Button onClick={() => navigate('/checkout')}>
            Checkout
            <span className="opacity-60">·</span>
            <span className="tabular">{peso(t.total)}</span>
            <ArrowRight size={19} strokeWidth={2.6} />
          </Button>
        </ScreenFooter>
      }
    >
      <Header count={t.count} />

      <div className="space-y-3 px-5 pb-6">
        {/* ---------------- Pickup ---------------- */}
        <button
          type="button"
          onClick={() => navigate('/hubs')}
          className="tappable flex w-full items-center gap-3 rounded-card bg-primary-soft p-3.5 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <MapPin size={19} strokeWidth={2.5} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-bold text-ink">Pickup at {hub.name}</span>
            <span className="block text-[13px] font-semibold text-ink-muted">
              {schedule.pickupDay}, {hub.hours}
            </span>
          </span>
          <span className="text-[14px] font-bold text-primary">Change</span>
        </button>

        {/* ---------------- Lines ---------------- */}
        <ul className="divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          {basket.map((line) => {
            const product = getProduct(line.productId)
            if (!product) return null
            const farm = getFarm(product.farmId)
            return (
              <li key={line.productId} className="flex gap-3 py-3.5">
                <button
                  type="button"
                  onClick={() => navigate(`/product/${product.id}`)}
                  aria-label={product.name}
                  className="tappable shrink-0"
                >
                  <ProductPicture product={product} className="h-[72px] w-[72px] rounded-md" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[16px] font-bold text-ink">{product.name}</p>
                    <p className="tabular shrink-0 text-[16px] font-extrabold text-ink">
                      {peso(lineTotal(line, member))}
                    </p>
                  </div>
                  <p className="truncate text-[13px] font-semibold text-ink-muted">
                    {farm.call} · {peso(unitPrice(product.price, member))} / {perUnit(product)}
                  </p>
                  <Stepper
                    size="sm"
                    className="mt-2"
                    label={qtyText(product, line.qty)}
                    onDec={() => setQty(product.id, line.qty - product.step)}
                    onInc={() => setQty(product.id, line.qty + product.step)}
                    decLabel={line.qty <= product.step ? `Remove ${product.name}` : `Less ${product.name}`}
                    incLabel={`More ${product.name}`}
                  />
                </div>
              </li>
            )
          })}
        </ul>

        {/* ---------------- Where the money goes ---------------- */}
        <div className="flex items-center gap-3 rounded-card bg-secondary-soft p-4">
          <div className="flex shrink-0 -space-x-2.5">
            {t.farmIds.map((id) => (
              <Avatar
                key={id}
                initials={getFarm(id).initials}
                size={36}
                tone="onGreen"
                className="ring-2 ring-secondary-soft"
              />
            ))}
          </div>
          <p className="text-[14px] font-semibold leading-snug text-on-secondary">
            <b className="font-extrabold">{peso(t.toFarmers)}</b> of this goes straight to{' '}
            {t.farmIds.length === 1 ? 'the farm' : `${t.farmIds.length} farms`}.
          </p>
        </div>

        {/* ---------------- Sums ---------------- */}
        <div className="space-y-2 rounded-card border border-line bg-card p-4 shadow-card">
          <SumRow label="Produce" value={peso(t.subtotal)} />
          <SumRow
            label="Pickup Hub fee"
            value={member ? 'Free' : peso(t.hubFee)}
            tone={member ? 'primary' : 'ink'}
          />
          {member && t.savings > 0 && (
            <SumRow
              label={<PlusTag label="You saved" />}
              value={`−${peso(t.savings)}`}
              tone="primary"
            />
          )}
          <div className="border-t border-line pt-2">
            <SumRow label="Total" value={peso(t.total)} strong />
          </div>
        </div>

        {!member && saving > 0 && (
          <button
            type="button"
            onClick={() => navigate('/plus')}
            className="tappable flex w-full items-center gap-3 rounded-card border border-line bg-card p-3.5 text-left"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-primary">
              <Sprout size={20} strokeWidth={2.4} />
            </span>
            <span className="flex-1 text-[14px] font-semibold leading-snug text-ink">
              Save <b className="font-extrabold text-primary">{peso(saving)}</b> on this basket with
              Direct Plus
            </span>
            <ChevronRight size={19} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
          </button>
        )}
      </div>
    </Screen>
  )
}

function Header({ count }: { count: number }) {
  return (
    <div className="px-5 pb-4 pt-2">
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Your basket</h1>
      {count > 0 && (
        <p className="text-[15px] font-semibold text-ink-muted">
          {count} {count === 1 ? 'item' : 'items'} from local farms
        </p>
      )}
    </div>
  )
}
