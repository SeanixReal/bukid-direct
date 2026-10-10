import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, ShoppingBasket, Sprout } from 'lucide-react'
import { Screen, ScreenFooter } from '../components/Screen'
import { ProducePicture } from '../components/ProduceArt'
import { FulfilmentRow, MarketBadge } from '../components/StallBits'
import { Avatar, Button, ModeSwitch, PlusTag, Rating, Stepper, SumRow } from '../components/ui'
import { useApp } from '../state/AppState'
import { listingDetails } from '../state/catalog'
import { lineTotal, plusSavings, type MarketGroup, type StallPart } from '../state/pricing'
import { getMarket, getSeller, peso, perUnit, plusPlan, qtyText, schedule, stallNo } from '../data/sample'

export function Basket() {
  const navigate = useNavigate()
  const { basket, groups, basketTotals: t, member, modeOf, courierOf, welcomeLeft } = useApp()

  if (basket.length === 0) {
    return (
      <Screen nav>
        <Header />
        <div className="flex flex-col items-center px-8 pt-16 text-center">
          <span className="flex h-28 w-28 items-center justify-center rounded-full bg-primary-soft text-primary">
            <ShoppingBasket size={52} strokeWidth={1.9} />
          </span>
          <h2 className="mt-6 text-[24px] font-extrabold tracking-tight text-ink">Your basket is empty</h2>
          <p className="mt-1.5 text-[16px] font-medium leading-snug text-ink-muted">
            Mix and match from as many stalls as you like. Order by {schedule.cutoff} for{' '}
            {schedule.day.toLowerCase()}.
          </p>
          <Button className="mt-7" onClick={() => navigate('/shop')}>
            Start shopping
          </Button>
        </div>
      </Screen>
    )
  }

  const saving = plusSavings(basket, modeOf, welcomeLeft, courierOf)
  /* Before the welcome voucher, which gets its own line. */
  const delivery = t.delivery + t.deliveryCovered
  const riders = groups.filter((g) => g.mode === 'delivery').length
  /* A member still holding the welcome voucher, not yet at its minimum. */
  const toWelcome =
    member && welcomeLeft && t.delivery > 0 && t.subtotal < plusPlan.welcome.minSpend
      ? plusPlan.welcome.minSpend - t.subtotal
      : 0

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
      <Header count={t.count} stallCount={t.stallCount} marketCount={t.marketCount} />

      <div className="space-y-3 px-5 pb-6">
        {groups.map((g) => (
          <MarketGroupCard key={g.marketId} group={g} member={member} />
        ))}

        {/* ---------------- Where the money goes ---------------- */}
        <div className="flex items-center gap-3 rounded-card bg-secondary-soft p-4">
          <div className="flex shrink-0 -space-x-2.5">
            {t.sellerIds.slice(0, 4).map((id) => (
              <Avatar
                key={id}
                initials={getSeller(id).initials}
                size={36}
                tone="onGreen"
                className="ring-2 ring-secondary-soft"
              />
            ))}
          </div>
          <p className="text-[14px] font-semibold leading-snug text-on-secondary">
            <b className="font-extrabold">{peso(t.toSellers)}</b> of this goes straight to{' '}
            {t.stallCount === 1 ? 'the stall' : `${t.stallCount} stalls`}.
          </p>
        </div>

        {/* ---------------- Sums ---------------- */}
        <div className="space-y-2 rounded-card border border-line bg-card p-4 shadow-card">
          <SumRow label="Food" value={peso(t.regular)} />
          {t.sukiOff > 0 && <SumRow label="Suki deals" value={`−${peso(t.sukiOff)}`} tone="primary" />}
          <SumRow
            label={riders > 0 ? `Delivery (${riders} ${riders === 1 ? 'rider' : 'riders'})` : 'Delivery'}
            value={delivery > 0 ? peso(delivery) : 'Free'}
            tone={delivery > 0 ? 'ink' : 'primary'}
          />
          {t.deliveryCovered > 0 && (
            <SumRow label="Welcome voucher" value={`−${peso(t.deliveryCovered)}`} tone="primary" />
          )}
          {toWelcome > 0 && (
            <p className="text-[12.5px] font-semibold text-ink-muted">
              Add <b className="font-extrabold text-ink">{peso(toWelcome)}</b> more to use your welcome
              free delivery
            </p>
          )}
          <SumRow
            label="Service fee"
            value={member ? 'Free' : peso(t.serviceFee)}
            tone={member ? 'primary' : 'ink'}
          />
          <div className="border-t border-line pt-2">
            <SumRow label="Total" value={peso(t.total)} strong />
          </div>
          {member && t.savings > 0 && (
            <p className="flex items-center justify-between gap-2 pt-1 text-[14px] font-bold text-primary">
              <PlusTag label="Direct Plus saved you" />
              <span className="tabular">{peso(t.savings)}</span>
            </p>
          )}
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

/* One market's part of the basket: its stalls and their items, Delivery or
   Pick-up, and the one rider's fee. */
function MarketGroupCard({ group: g, member }: { group: MarketGroup; member: boolean }) {
  const { setMarketMode, slotOf } = useApp()
  const market = getMarket(g.marketId)
  const stalls = `${g.stalls.length} ${g.stalls.length === 1 ? 'stall' : 'stalls'}`

  return (
    <section className="overflow-hidden rounded-card border border-line bg-card shadow-card">
      {/* Market */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <MarketBadge size={40} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-extrabold text-ink">{market.name}</span>
          <span className="block truncate text-[12.5px] font-semibold text-ink-muted">
            {g.mode === 'delivery' ? `${stalls} · one rider brings it all` : `${stalls} · collect at the market`}
          </span>
        </span>
      </div>
      <div className="border-b border-line px-4 py-2.5">
        <ModeSwitch size="sm" value={g.mode} onChange={(m) => setMarketMode(market.id, m)} />
      </div>

      {/* Each stall's items */}
      <div className="divide-y divide-line">
        {g.stalls.map((stall) => (
          <StallLines key={stall.sellerId} stall={stall} member={member} />
        ))}
      </div>

      {/* How it gets to you */}
      <div className="flex items-center justify-between gap-3 border-t border-line bg-surface/60 px-4 py-3">
        <FulfilmentRow market={market} mode={g.mode} courier={g.courier} slot={market.slots[slotOf(market.id)]} />
        <span className={`shrink-0 text-[15px] font-extrabold ${g.fee > 0 ? 'text-ink' : 'text-primary'}`}>
          {g.voucher && (
            <span className="mr-1.5 text-[13px] font-semibold text-ink-faint line-through">{peso(g.fare)}</span>
          )}
          {g.fee > 0 ? peso(g.fee) : 'Free'}
        </span>
      </div>
    </section>
  )
}

/* One stall's part of a market: its items, and for members its suki deal. */
function StallLines({ stall, member }: { stall: StallPart; member: boolean }) {
  const navigate = useNavigate()
  const { setQty } = useApp()
  const seller = getSeller(stall.sellerId)
  const deal = seller.sukiDeal
  /* For members: how close this stall's part is to its suki deal. */
  const gap = member && deal && stall.suki === 0 ? deal.minSpend - stall.regular : 0

  return (
    <div className="pb-1">
      <button
        type="button"
        onClick={() => navigate(`/stall/${seller.id}`)}
        className="tappable flex w-full items-center gap-2.5 px-4 pt-3 text-left"
      >
        <Avatar initials={seller.initials} size={30} />
        <span className="min-w-0 flex-1 truncate text-[14.5px] font-extrabold text-ink">
          {seller.call} <span className="font-semibold text-ink-muted">· {stallNo(seller)}</span>
        </span>
        <Rating value={seller.rating} className="shrink-0 text-[12.5px]" />
      </button>

      <ul className="divide-y divide-line px-4">
        {stall.lines.map((line) => {
          const found = listingDetails(line.listingId)
          if (!found) return null
          const { listing, item } = found
          return (
            <li key={line.listingId} className="flex gap-3 py-3.5">
              <button
                type="button"
                onClick={() => navigate(`/listing/${listing.id}`)}
                aria-label={item.name}
                className="tappable shrink-0"
              >
                <ProducePicture item={item} className="h-[68px] w-[68px] rounded-md" />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[16px] font-bold text-ink">{item.name}</p>
                  <p className="tabular shrink-0 text-[16px] font-extrabold text-ink">{peso(lineTotal(line))}</p>
                </div>
                <p className="truncate text-[13px] font-semibold text-ink-muted">
                  {peso(listing.price)} / {perUnit(item)}
                </p>
                <Stepper
                  size="sm"
                  className="mt-2"
                  label={qtyText(item, line.qty)}
                  onDec={() => setQty(listing.id, line.qty - item.step)}
                  onInc={() => setQty(listing.id, line.qty + item.step)}
                  decLabel={line.qty <= item.step ? `Remove ${item.name}` : `Less ${item.name}`}
                  incLabel={`More ${item.name}`}
                />
              </div>
            </li>
          )
        })}
      </ul>

      {stall.suki > 0 && (
        <div className="mx-4 mb-2.5 flex items-center justify-between gap-3">
          <PlusTag label="Suki deal" />
          <span className="tabular text-[14px] font-extrabold text-primary">−{peso(stall.suki)}</span>
        </div>
      )}
      {deal && gap > 0 && (
        <div className="mx-4 mb-3">
          <div className="h-[6px] overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-secondary"
              style={{ width: `${(stall.regular / deal.minSpend) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-[12.5px] font-semibold text-ink-muted">
            Add <b className="font-extrabold text-ink">{peso(gap)}</b> more from {seller.call} for a{' '}
            {peso(deal.off)} suki deal
          </p>
        </div>
      )}
    </div>
  )
}

function Header({
  count,
  stallCount,
  marketCount,
}: {
  count?: number
  stallCount?: number
  marketCount?: number
}) {
  return (
    <div className="px-5 pb-4 pt-2">
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Your basket</h1>
      {count ? (
        <p className="text-[15px] font-semibold text-ink-muted">
          {count} {count === 1 ? 'item' : 'items'} from {stallCount} {stallCount === 1 ? 'stall' : 'stalls'} ·{' '}
          {marketCount} {marketCount === 1 ? 'market' : 'markets'}
        </p>
      ) : null}
    </div>
  )
}
