import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronRight, ShoppingBasket, Sprout } from 'lucide-react'
import { Screen, ScreenFooter } from '../components/Screen'
import { ProducePicture } from '../components/ProduceArt'
import { FulfilmentRow } from '../components/FarmBits'
import { Avatar, Button, ModeSwitch, PlusTag, Rating, Stepper, SumRow } from '../components/ui'
import { useApp } from '../state/AppState'
import { listingDetails } from '../state/catalog'
import { lineTotal, plusSavings, type FarmGroup } from '../state/pricing'
import { getFarm, peso, perUnit, plusPlan, qtyText, schedule } from '../data/sample'

export function Basket() {
  const navigate = useNavigate()
  const { basket, groups, basketTotals: t, member, modeOf, welcomeLeft } = useApp()

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
            Mix and match from as many farms as you like. Order by {schedule.cutoff} for{' '}
            {schedule.day.toLowerCase()}.
          </p>
          <Button className="mt-7" onClick={() => navigate('/shop')}>
            Start shopping
          </Button>
        </div>
      </Screen>
    )
  }

  const saving = plusSavings(basket, modeOf, welcomeLeft)
  /* Before the welcome voucher, which gets its own line. */
  const delivery = t.delivery + t.deliveryCovered
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
      <Header count={t.count} farmCount={t.farmCount} />

      <div className="space-y-3 px-5 pb-6">
        {groups.map((g) => (
          <FarmGroupCard key={g.farmId} group={g} member={member} />
        ))}

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
            {t.farmCount === 1 ? 'the farm' : `${t.farmCount} farms`}.
          </p>
        </div>

        {/* ---------------- Sums ---------------- */}
        <div className="space-y-2 rounded-card border border-line bg-card p-4 shadow-card">
          <SumRow label="Produce" value={peso(t.regular)} />
          {t.sukiOff > 0 && <SumRow label="Suki deals" value={`−${peso(t.sukiOff)}`} tone="primary" />}
          <SumRow
            label={`Delivery (${groups.filter((g) => g.mode === 'delivery').length} of ${t.farmCount} farms)`}
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

interface Nudge {
  gap: number
  share: number
  label: string
}

/* One farm's part of the basket: its items, Delivery or Pick-up, and its fee. */
function FarmGroupCard({ group: g, member }: { group: FarmGroup; member: boolean }) {
  const navigate = useNavigate()
  const { setQty, setFarmMode } = useApp()
  const farm = getFarm(g.farmId)
  const deal = farm.sukiDeal
  /* The nearest thing to aim for from this farm: its own free delivery or,
     for members, its suki deal. */
  const nudge = [
    g.mode === 'delivery' && g.fee > 0 && g.toFree > 0
      ? { gap: g.toFree, share: g.regular / (g.regular + g.toFree), label: 'for free delivery' }
      : null,
    member && deal && g.suki === 0
      ? { gap: deal.minSpend - g.regular, share: g.regular / deal.minSpend, label: `for a ${peso(deal.off)} suki deal` }
      : null,
  ]
    .filter((n): n is Nudge => n !== null)
    .sort((a, b) => a.gap - b.gap)[0]

  return (
    <section className="overflow-hidden rounded-card border border-line bg-card shadow-card">
      {/* Farm */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(`/farm/${farm.id}`)}
          className="tappable flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <Avatar initials={farm.initials} size={40} />
          <span className="min-w-0">
            <span className="block truncate text-[16px] font-extrabold text-ink">{farm.call}</span>
            <span className="flex items-center gap-1.5 text-[12.5px]">
              <Rating value={farm.rating} />
              <span className="truncate font-semibold text-ink-muted">· {farm.place.split(', ').pop()}</span>
            </span>
          </span>
        </button>
        {!farm.pickup && (
          <span className="shrink-0 rounded-pill bg-surface px-3 py-1.5 text-[12px] font-bold text-ink-muted">
            Delivery only
          </span>
        )}
      </div>
      {farm.pickup && (
        <div className="border-b border-line px-4 py-2.5">
          <ModeSwitch size="sm" value={g.mode} onChange={(m) => setFarmMode(farm.id, m)} />
        </div>
      )}

      {/* Items */}
      <ul className="divide-y divide-line px-4">
        {g.lines.map((line) => {
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

      {/* Deals, and how it gets to you */}
      <div className="border-t border-line bg-surface/60 px-4 py-3">
        {g.suki > 0 && (
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <PlusTag label="Suki deal" />
            <span className="tabular text-[15px] font-extrabold text-primary">−{peso(g.suki)}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <FulfilmentRow farm={farm} mode={g.mode} />
          <span
            className={`shrink-0 text-[15px] font-extrabold ${g.fee > 0 ? 'text-ink' : 'text-primary'}`}
          >
            {g.voucher && (
              <span className="mr-1.5 text-[13px] font-semibold text-ink-faint line-through">
                {peso(farm.delivery.fee)}
              </span>
            )}
            {g.fee > 0 ? peso(g.fee) : 'Free'}
          </span>
        </div>
        {nudge && (
          <div className="mt-2.5">
            <div className="h-[6px] overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${nudge.share * 100}%` }} />
            </div>
            <p className="mt-1.5 text-[12.5px] font-semibold text-ink-muted">
              Add <b className="font-extrabold text-ink">{peso(nudge.gap)}</b> more from {farm.call}{' '}
              {nudge.label}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function Header({ count, farmCount }: { count?: number; farmCount?: number }) {
  return (
    <div className="px-5 pb-4 pt-2">
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Your basket</h1>
      {count ? (
        <p className="text-[15px] font-semibold text-ink-muted">
          {count} {count === 1 ? 'item' : 'items'} from {farmCount}{' '}
          {farmCount === 1 ? 'farm' : 'farms'} · each sends its own part
        </p>
      ) : null}
    </div>
  )
}
