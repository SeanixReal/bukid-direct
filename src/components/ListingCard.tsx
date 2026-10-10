import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Star } from 'lucide-react'
import { ProducePicture } from './ProduceArt'
import { FreshBadge, SoldOutBadge } from './ui'
import { useApp } from '../state/AppState'
import { getProduce, getSeller, peso, perUnit, qtyText, type Listing } from '../data/sample'

/* --------------------------------------------------------------------------
   The big listing card: a strong picture, what it is, which stall sells it
   and a bold price. The add button sits on the picture and turns into a
   stepper once the item is in the basket.
   -------------------------------------------------------------------------- */

export function ListingCard({
  listing,
  className = '',
  pictureClass = 'h-[136px]',
}: {
  listing: Listing
  className?: string
  pictureClass?: string
}) {
  const navigate = useNavigate()
  const { qtyOf, setQty, addToBasket, showToast } = useApp()
  const item = getProduce(listing.produceId)
  const seller = getSeller(listing.sellerId)
  const qty = qtyOf(listing.id)
  const open = () => navigate(`/listing/${listing.id}`)

  const add = () => {
    addToBasket(listing.id)
    showToast(`Added ${item.name.toLowerCase()} from ${seller.call}`, {
      label: 'View',
      to: '/basket',
    })
  }

  return (
    <div
      className={`overflow-hidden rounded-card bg-card shadow-card ring-1 ring-inset ring-line ${className}`}
    >
      <ProducePicture item={item} dim={listing.outOfStock} className={pictureClass}>
        <button
          type="button"
          onClick={open}
          aria-label={`Open ${item.name} from ${seller.call}`}
          className="absolute inset-0"
        />
        {listing.freshToday && (
          <FreshBadge size="sm" className="pointer-events-none absolute left-2 top-2" />
        )}
        {listing.outOfStock && (
          <SoldOutBadge size="sm" className="pointer-events-none absolute left-2 top-2" />
        )}

        {!listing.outOfStock && (
          <div className="absolute bottom-2 right-2">
            {qty > 0 ? (
              <div className="flex items-center rounded-pill bg-card p-1 shadow-float">
                <button
                  type="button"
                  onClick={() => setQty(listing.id, qty - item.step)}
                  aria-label={`Less ${item.name}`}
                  className="tappable flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary-soft text-primary"
                >
                  <Minus size={16} strokeWidth={2.8} />
                </button>
                <span className="tabular min-w-[48px] px-1 text-center text-[13px] font-extrabold text-ink">
                  {qtyText(item, qty)}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(listing.id, qty + item.step)}
                  aria-label={`More ${item.name}`}
                  className="tappable flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary-soft text-primary"
                >
                  <Plus size={16} strokeWidth={2.8} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={add}
                aria-label={`Add ${item.name} to basket`}
                className="tappable flex h-[44px] w-[44px] items-center justify-center rounded-full bg-card text-primary shadow-float"
              >
                <Plus size={22} strokeWidth={2.8} />
              </button>
            )}
          </div>
        )}
      </ProducePicture>

      <button type="button" onClick={open} className="block w-full px-3.5 pb-3.5 pt-3 text-left">
        <span className="block truncate text-[16px] font-bold leading-tight text-ink">{item.name}</span>
        <span className="mt-0.5 flex items-center gap-1 truncate text-[12.5px] font-semibold text-ink-muted">
          <span className="truncate">{seller.call}</span>
          <Star size={12} strokeWidth={0} fill="currentColor" className="shrink-0 text-primary" />
          <span className="shrink-0 text-ink">{seller.rating.toFixed(1)}</span>
        </span>
        <span className="mt-2 flex items-baseline gap-1">
          <span
            className={`text-[20px] font-extrabold leading-none tracking-tight ${
              listing.outOfStock ? 'text-ink-faint' : 'text-ink'
            }`}
          >
            {peso(listing.price)}
          </span>
          <span className="truncate text-[12.5px] font-semibold text-ink-muted">/ {perUnit(item)}</span>
        </span>
      </button>
    </div>
  )
}
