import { useNavigate } from 'react-router-dom'
import { BadgePercent, Check, Megaphone, PackageCheck, Plus, Sprout, Store, Truck, Wallet } from 'lucide-react'
import { Screen, ScreenFooter, SectionTitle, TopBar } from '../components/Screen'
import { ProducePicture } from '../components/ProduceArt'
import { Avatar, Button, FreshBadge, ReadyBadge } from '../components/ui'
import { useApp, type SellerStep } from '../state/AppState'
import { allListings, getListing } from '../state/catalog'
import {
  boost,
  getCourier,
  getProduce,
  getSeller,
  listNames,
  marketOf,
  peso,
  perUnit,
  qtyText,
  sellerShare,
  sellerView,
  slotText,
  stallNo,
  user,
  type Market,
  type Mode,
  type SellerOrder,
} from '../data/sample'

/* --------------------------------------------------------------------------
   The seller's side of the marketplace - what Nong Romy sees at his Carbon
   Market stall. Tomorrow's orders from different buyers, each with the
   courier and time the buyer picked: he confirms them, harvests and packs -
   PresGo then books each buyer's courier - and hands them to the riders.
   Plus his listings, what sells where and when, the paid extras that help
   him sell, and what he earns.
   -------------------------------------------------------------------------- */

export function Seller() {
  const navigate = useNavigate()
  const { order, sellerStep, setSellerStep, featureListing, showToast } = useApp()
  const seller = getSeller(sellerView.sellerId)
  const market = marketOf(seller)

  /* Joy's order joins the list when it includes something from this stall. */
  const shipment = order?.shipments.find((s) => s.stalls.some((st) => st.sellerId === seller.id))
  const mine = shipment?.stalls.find((st) => st.sellerId === seller.id)
  const orders: (SellerOrder & { you?: boolean })[] = [
    ...(shipment && mine
      ? [
          {
            buyer: `${user.firstName} ${user.fullName.split(' ')[1].charAt(0)}.`,
            area: user.address.area.split(',')[0],
            mode: shipment.mode,
            courier: shipment.courier,
            slot: shipment.slot,
            items: mine.lines
              .map((l) => {
                const listing = getListing(l.listingId)
                return listing ? `${getProduce(listing.produceId).name} ${qtyText(getProduce(listing.produceId), l.qty)}` : ''
              })
              .filter(Boolean)
              .join(', '),
            total: mine.subtotal,
            you: true,
          },
        ]
      : []),
    ...sellerView.orders,
  ]
  const stops = orders.filter((o) => o.mode === 'delivery')
  const riders = `${stops.length} ${stops.length === 1 ? 'rider' : 'riders'}`
  /* Harvested and packed - PresGo has booked the riders. */
  const packed = sellerStep === 'ready' || sellerStep === 'handedOver'
  const sales = orders.reduce((sum, o) => sum + o.total, 0)
  const earnings = Math.round(sellerView.thisWeekSales * sellerShare)
  const weeks = [...sellerView.pastWeeks, { label: 'This wk', amount: earnings }]
  const top = Math.max(...weeks.map((w) => w.amount))
  const listings = allListings().filter((l) => l.sellerId === seller.id)
  const boosted = getListing(sellerView.boostListingId)
  const boostedItem = boosted && getProduce(boosted.produceId)
  const bookedWith = listNames([
    ...new Set(stops.flatMap((o) => (o.courier ? [getCourier(o.courier).name] : []))),
  ])

  const next: Record<SellerStep, { label: string; run: () => void } | null> = {
    new: {
      label: `Confirm ${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`,
      run: () => {
        setSellerStep('confirmed')
        showToast('Confirmed. Buyers have been told.')
      },
    },
    confirmed: {
      label: 'Mark harvested and packed',
      run: () => {
        setSellerStep('ready')
        showToast(stops.length ? `Packed. ${riders} booked.` : 'Packed. Buyers have been told.')
      },
    },
    ready: {
      label: `Hand over to ${riders}`,
      run: () => {
        setSellerStep('handedOver')
        showToast('Handed over to the riders')
      },
    },
    handedOver: null,
  }
  const action = next[sellerStep]

  return (
    <Screen
      tone="light"
      statusClass="bg-primary-deep"
      footer={
        <ScreenFooter>
          {action ? (
            <Button onClick={action.run}>
              {sellerStep === 'ready' ? <Truck size={19} strokeWidth={2.5} /> : <Check size={19} strokeWidth={3} />}
              {action.label}
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/shop')}>
              Back to the buyer app
            </Button>
          )}
        </ScreenFooter>
      }
    >
      {/* ---------------- Header ---------------- */}
      <header className="bg-primary-deep pb-20">
        <TopBar
          tone="light"
          fallback="/account"
          right={
            <span className="rounded-pill bg-on-dark/15 px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-wide text-on-dark">
              Seller Center
            </span>
          }
        />
        <div className="flex items-center gap-4 px-5 pt-1">
          <Avatar initials={seller.initials} size={60} tone="onGreen" />
          <div className="min-w-0">
            <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-on-dark">{seller.call}</h1>
            <p className="truncate text-[14px] font-semibold text-on-dark-muted">
              {stallNo(seller)}, {market.name} · ★ {seller.rating.toFixed(1)} · {seller.sold}
            </p>
          </div>
        </div>
      </header>

      <div className="relative -mt-14 px-5 pb-6">
        {/* ---------------- Tomorrow at a glance ---------------- */}
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Orders" value={String(orders.length)} />
          <Stat label="Sales" value={peso(sales)} />
          <Stat label="You keep" value={`${Math.round(sellerShare * 100)}%`} strong />
        </div>

        {/* ---------------- Orders ---------------- */}
        <SectionTitle className="mt-6" action={<StepChip step={sellerStep} />}>
          Tomorrow's orders
        </SectionTitle>
        <ul className="space-y-2.5">
          {orders.map((o) => (
            <li
              key={o.buyer}
              className={`rounded-card border p-3.5 shadow-card ${o.you ? 'border-primary/40 bg-primary-soft' : 'border-line bg-card'}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-card text-primary ring-1 ring-inset ring-line">
                  {o.mode === 'pickup' ? <Store size={17} strokeWidth={2.4} /> : <Truck size={17} strokeWidth={2.4} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-ink">
                    {o.buyer} <span className="font-semibold text-ink-muted">· {o.area}</span>
                  </p>
                  <p className="truncate text-[13px] font-medium text-ink-muted">{o.items}</p>
                </div>
                <span className="tabular shrink-0 text-[15px] font-extrabold text-ink">{peso(o.total)}</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[12.5px] font-bold text-ink-muted">{plan(o, market)}</span>
                <OrderStatus step={sellerStep} mode={o.mode} />
              </div>
            </li>
          ))}
        </ul>

        {/* ---------------- The riders, booked once packed ---------------- */}
        {stops.length > 0 && (
          <p className="mt-3 flex items-center gap-2 rounded-md bg-primary-soft px-3 py-2.5 text-[13.5px] font-bold leading-snug text-primary">
            <Truck size={16} strokeWidth={2.6} className="shrink-0" />
            {packed
              ? `${riders} booked: ${bookedWith}`
              : `PresGo books each buyer's courier once you've packed`}
          </p>
        )}

        {/* ---------------- Listings ---------------- */}
        <SectionTitle
          className="mt-7"
          action={<span className="text-[13px] font-semibold text-ink-muted">{listings.length} live</span>}
        >
          Your listings
        </SectionTitle>
        <ul className="divide-y divide-line rounded-card border border-line bg-card px-3.5 shadow-card">
          {listings.map((l) => {
            const item = getProduce(l.produceId)
            return (
              <li key={l.id} className="flex items-center gap-3 py-3">
                <ProducePicture item={item} dim={l.outOfStock} className="h-12 w-12 shrink-0 rounded-md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-ink">{item.name}</p>
                  <p className="text-[13px] font-semibold text-ink-muted">
                    {peso(l.price)} / {perUnit(item)}
                  </p>
                </div>
                {l.outOfStock ? (
                  <span className="rounded-pill bg-danger-soft px-2.5 py-1 text-[12px] font-extrabold text-danger">
                    Out of stock
                  </span>
                ) : l.freshToday || packed ? (
                  <FreshBadge size="sm" />
                ) : null}
              </li>
            )
          })}
        </ul>
        <Button variant="secondary" size="md" className="mt-3" onClick={() => navigate('/seller/new')}>
          <Plus size={18} strokeWidth={2.8} />
          Add a listing
        </Button>

        {/* ---------------- What sells, where and when ---------------- */}
        <SectionTitle
          className="mt-7"
          action={<span className="text-[13px] font-semibold text-ink-muted">Last 4 weeks</span>}
        >
          Plan your stock
        </SectionTitle>
        <div className="rounded-card border border-line bg-card px-4 pb-4 pt-3 shadow-card">
          <p className="text-[13px] font-bold text-ink-muted">What sold, where and when</p>
          <ul className="divide-y divide-line">
            {sellerView.stockPlan.rows.map((r) => {
              const item = getProduce(r.produceId)
              return (
                <li key={r.produceId} className="flex items-center gap-3 py-3">
                  <ProducePicture item={item} className="h-11 w-11 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-bold text-ink">{item.name}</p>
                    <p className="truncate text-[13px] font-semibold text-ink-muted">
                      {r.days} · {r.areas}
                    </p>
                  </div>
                  <span className="tabular shrink-0 text-[15px] font-extrabold text-ink">
                    {qtyText(item, r.qty)}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="mt-1 flex items-start gap-2.5 rounded-md bg-secondary-soft px-3 py-2.5 text-[13.5px] font-semibold leading-snug text-on-secondary">
            <Sprout size={16} strokeWidth={2.5} className="mt-[1px] shrink-0 text-primary" />
            {sellerView.stockPlan.tip}
          </p>
        </div>

        {/* ---------------- Paid extras ---------------- */}
        <SectionTitle className="mt-7">Grow your sales</SectionTitle>
        <div className="divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          {boosted && boostedItem && (
            <div className="py-4">
              <p className="flex items-center gap-2 text-[16px] font-extrabold text-ink">
                <Megaphone size={18} strokeWidth={2.4} className="text-primary" />
                Feature a listing
              </p>
              <p className="mt-1 text-[14px] font-medium leading-snug text-ink-muted">
                Top of the shop for {peso(boost.price)} a {boost.period}.
              </p>
              {boosted.featured ? (
                <p className="mt-2.5 flex items-center gap-2 rounded-md bg-primary-soft px-3 py-2 text-[13.5px] font-bold text-primary">
                  <Check size={16} strokeWidth={3} />
                  {boostedItem.name} featured for 7 days
                </p>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  className="mt-3"
                  onClick={() => {
                    featureListing(boosted.id)
                    showToast(`Now featured: ${boostedItem.name}`, {
                      label: 'See it',
                      to: '/shop',
                    })
                  }}
                >
                  <Megaphone size={17} strokeWidth={2.5} />
                  Feature {boostedItem.name.toLowerCase()} · {peso(boost.price)}
                </Button>
              )}
            </div>
          )}
          {seller.sukiDeal && (
            <div className="py-4">
              <p className="flex items-center gap-2 text-[16px] font-extrabold text-ink">
                <BadgePercent size={18} strokeWidth={2.4} className="text-primary" />
                Your suki deal
              </p>
              <p className="mt-1 text-[14px] font-medium leading-snug text-ink-muted">
                {peso(seller.sukiDeal.off)} off {peso(seller.sukiDeal.minSpend)}+ for Direct Plus members.
                You pay only when it's used.
              </p>
            </div>
          )}
        </div>

        {/* ---------------- Earnings ---------------- */}
        <SectionTitle className="mt-7">Earnings</SectionTitle>
        <div className="rounded-card border border-line bg-card p-4 shadow-card">
          <div className="flex h-[140px] items-end gap-2.5">
            {weeks.map((w, i) => {
              const now = i === weeks.length - 1
              return (
                <div key={w.label} className="flex h-full flex-1 flex-col items-center justify-end">
                  <span className={`tabular mb-1 text-[11.5px] font-extrabold ${now ? 'text-primary' : 'text-ink-muted'}`}>
                    {(w.amount / 1000).toFixed(1)}k
                  </span>
                  <span
                    className={`w-full origin-bottom rounded-t-[10px] ${now ? 'bg-primary' : 'bg-secondary/45'}`}
                    style={{
                      height: `${(w.amount / top) * 100}%`,
                      animation: `bar-grow 600ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 60}ms both`,
                    }}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-2 flex gap-2.5 border-t border-line pt-2">
            {weeks.map((w, i) => (
              <span
                key={w.label}
                className={`flex-1 text-center text-[11.5px] font-bold ${i === weeks.length - 1 ? 'text-primary' : 'text-ink-muted'}`}
              >
                {w.label}
              </span>
            ))}
          </div>
          <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-ink-muted">
            <Wallet size={17} strokeWidth={2.4} className="text-primary" />
            {sellerView.payout}
          </p>
        </div>
      </div>
    </Screen>
  )
}

/** What the buyer chose: "GrabExpress · 11 AM – 1 PM", or "Pick-up · 1 – 6 PM". */
function plan(o: SellerOrder, market: Market) {
  if (o.mode === 'pickup') return `Pick-up · ${market.hours}`
  return [o.courier && getCourier(o.courier).name, o.slot && slotText(o.slot)].filter(Boolean).join(' · ')
}

function OrderStatus({ step, mode }: { step: SellerStep; mode: Mode }) {
  if (step === 'new') {
    return (
      <span className="shrink-0 rounded-pill bg-surface px-2.5 py-1 text-[12px] font-extrabold text-ink-muted">
        To confirm
      </span>
    )
  }
  if (step === 'confirmed') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-primary-soft px-2.5 py-1 text-[12px] font-extrabold text-primary">
        <Check size={13} strokeWidth={3} />
        Confirmed
      </span>
    )
  }
  if (step === 'handedOver' && mode === 'delivery') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-primary-soft px-2.5 py-1 text-[12px] font-extrabold text-primary">
        <Truck size={13} strokeWidth={2.6} />
        With rider
      </span>
    )
  }
  /* Packed: waiting for the rider, or for the buyer to collect. */
  return <ReadyBadge size="sm" />
}

function StepChip({ step }: { step: SellerStep }) {
  const n = { new: 1, confirmed: 2, ready: 3, handedOver: 4 }[step]
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-muted">
      <PackageCheck size={15} strokeWidth={2.4} className="text-primary" />
      Step {n} of 4
    </span>
  )
}

function Stat({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-card border border-line bg-card px-3 py-3.5 shadow-card">
      <p className="text-[12px] font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`tabular mt-1 text-[20px] font-extrabold leading-none tracking-tight ${strong ? 'text-primary' : 'text-ink'}`}>
        {value}
      </p>
    </div>
  )
}

