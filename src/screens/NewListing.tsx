import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sunrise } from 'lucide-react'
import { Screen, ScreenFooter, SectionTitle, TopBar } from '../components/Screen'
import { ProducePicture } from '../components/ProduceArt'
import { Button, HarvestedBadge } from '../components/ui'
import { useApp } from '../state/AppState'
import { allListings } from '../state/catalog'
import { farmerShare, getFarm, getProduce, peso, perUnit, produce, sellerView, type ProduceId } from '../data/sample'

/* --------------------------------------------------------------------------
   A farmer puts something up for sale. Publishing adds it to the shop
   straight away, so the room sees the marketplace work end to end.
   -------------------------------------------------------------------------- */

export function NewListing() {
  const navigate = useNavigate()
  const { publishListing, showToast } = useApp()
  const farm = getFarm(sellerView.farmId)
  const [produceId, setProduceId] = useState<ProduceId>('squash')
  const [price, setPrice] = useState('48')
  const [harvested, setHarvested] = useState(true)

  const item = getProduce(produceId)
  const amount = Number(price)
  const valid = Number.isFinite(amount) && amount > 0
  /* What other farms ask, as a guide. */
  const market = allListings()
    .filter((l) => l.produceId === produceId && !l.outOfStock)
    .map((l) => l.price)
  const range =
    market.length > 0
      ? Math.min(...market) === Math.max(...market)
        ? peso(market[0])
        : `${peso(Math.min(...market))} – ${peso(Math.max(...market))}`
      : null

  const publish = () => {
    const listing = publishListing({
      produceId,
      farmId: farm.id,
      price: Math.round(amount),
      harvestedToday: harvested,
      about: `Fresh from ${farm.call}'s farm in ${farm.place}. Listed today.`,
    })
    showToast(`Your ${item.name.toLowerCase()} is live on Bukid Direct`, {
      label: 'See it',
      to: `/listing/${listing.id}`,
    })
    navigate('/seller')
  }

  return (
    <Screen
      footer={
        <ScreenFooter>
          <Button disabled={!valid} onClick={publish}>
            <Check size={19} strokeWidth={3} />
            Publish listing
          </Button>
        </ScreenFooter>
      }
    >
      <TopBar title="New listing" subtitle={`Selling as ${farm.call}`} fallback="/seller" />

      <div className="px-5 pb-6">
        {/* ---------------- What ---------------- */}
        <SectionTitle>What are you selling?</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5">
          {produce.map((p) => {
            const active = p.id === produceId
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setProduceId(p.id)}
                aria-pressed={active}
                className={`tappable overflow-hidden rounded-lg border-2 bg-card text-left ${
                  active ? 'border-primary shadow-card' : 'border-transparent ring-1 ring-inset ring-line'
                }`}
              >
                <ProducePicture item={p} className="h-[64px]" />
                <span
                  className={`block truncate px-2 py-1.5 text-[12.5px] font-bold ${active ? 'text-primary' : 'text-ink'}`}
                >
                  {p.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* ---------------- Price ---------------- */}
        <SectionTitle className="mt-6">Your price</SectionTitle>
        <label className="flex h-[60px] items-center gap-2 rounded-lg bg-card px-4 shadow-card ring-1 ring-inset ring-line focus-within:ring-2 focus-within:ring-primary">
          <span className="text-[24px] font-extrabold text-ink-muted">₱</span>
          <input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d]/g, '').slice(0, 5))}
            aria-label="Price"
            className="min-w-0 flex-1 bg-transparent text-[26px] font-extrabold text-ink outline-none"
          />
          <span className="text-[16px] font-semibold text-ink-muted">per {perUnit(item)}</span>
        </label>
        <p className="mt-2 text-[14px] font-semibold text-ink-muted">
          {range ? (
            <>
              Other farms are asking <b className="font-extrabold text-ink">{range}</b>.
            </>
          ) : (
            'No other farm is selling this yet - you set the price.'
          )}{' '}
          You keep {Math.round(farmerShare * 100)}% of every sale.
        </p>

        {/* ---------------- Harvested today ---------------- */}
        <button
          type="button"
          onClick={() => setHarvested((h) => !h)}
          aria-pressed={harvested}
          className="tappable mt-5 flex w-full items-center gap-3 rounded-card border border-line bg-card p-4 text-left shadow-card"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink-muted">
            <Sunrise size={20} strokeWidth={2.4} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold text-ink">Picked this morning</span>
            <span className="block text-[13px] font-medium text-ink-muted">
              Shows the orange "Harvested today" badge
            </span>
          </span>
          <span
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${harvested ? 'bg-primary' : 'bg-surface-2'}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-card shadow-card transition-[left] ${harvested ? 'left-6' : 'left-1'}`}
            />
          </span>
        </button>

        {/* ---------------- Preview ---------------- */}
        <SectionTitle className="mt-6">How buyers will see it</SectionTitle>
        <div className="flex items-center gap-3 rounded-card border border-line bg-card p-3 shadow-card">
          <ProducePicture item={item} className="h-[76px] w-[76px] shrink-0 rounded-md" />
          <div className="min-w-0 flex-1">
            {harvested && <HarvestedBadge size="sm" />}
            <p className="mt-1 truncate text-[16px] font-bold text-ink">{item.name}</p>
            <p className="text-[13px] font-semibold text-ink-muted">{farm.call}</p>
            <p className="mt-1 text-[18px] font-extrabold leading-none text-ink">
              {valid ? peso(amount) : '₱ -'}
              <span className="ml-1 text-[12.5px] font-semibold text-ink-muted">/ {perUnit(item)}</span>
            </p>
          </div>
        </div>
      </div>
    </Screen>
  )
}
