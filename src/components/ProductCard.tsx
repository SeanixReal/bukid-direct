import { useNavigate } from 'react-router-dom'
import { Minus, Plus } from 'lucide-react'
import { ProductPicture } from './ProduceArt'
import { HarvestedBadge, SoldOutBadge } from './ui'
import { useApp } from '../state/AppState'
import { unitPrice } from '../state/pricing'
import { getFarm, peso, perUnit, qtyText, type Product } from '../data/sample'

/* --------------------------------------------------------------------------
   The big product card: a strong picture, the name, who grew it and a bold
   price. The add button sits on the picture and turns into a stepper once
   the item is in the basket.
   -------------------------------------------------------------------------- */

export function ProductCard({
  product,
  className = '',
  pictureClass = 'h-[136px]',
}: {
  product: Product
  className?: string
  pictureClass?: string
}) {
  const navigate = useNavigate()
  const { member, qtyOf, setQty, addToBasket, showToast } = useApp()
  const farm = getFarm(product.farmId)
  const qty = qtyOf(product.id)
  const price = unitPrice(product.price, member)
  const open = () => navigate(`/product/${product.id}`)

  const add = () => {
    addToBasket(product.id)
    showToast(`Added ${product.name.toLowerCase()} to your basket`, {
      label: 'View',
      to: '/basket',
    })
  }

  return (
    <div
      className={`overflow-hidden rounded-card bg-card shadow-card ring-1 ring-inset ring-line ${className}`}
    >
      <ProductPicture product={product} className={pictureClass}>
        <button
          type="button"
          onClick={open}
          aria-label={`Open ${product.name}`}
          className="absolute inset-0"
        />
        {product.harvestedToday && (
          <HarvestedBadge size="sm" className="pointer-events-none absolute left-2 top-2" />
        )}
        {product.outOfStock && (
          <SoldOutBadge size="sm" className="pointer-events-none absolute left-2 top-2" />
        )}

        {!product.outOfStock && (
          <div className="absolute bottom-2 right-2">
            {qty > 0 ? (
              <div className="flex items-center rounded-pill bg-card p-1 shadow-float">
                <button
                  type="button"
                  onClick={() => setQty(product.id, qty - product.step)}
                  aria-label={`Less ${product.name}`}
                  className="tappable flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary-soft text-primary"
                >
                  <Minus size={16} strokeWidth={2.8} />
                </button>
                <span className="tabular min-w-[48px] px-1 text-center text-[13px] font-extrabold text-ink">
                  {qtyText(product, qty)}
                </span>
                <button
                  type="button"
                  onClick={() => setQty(product.id, qty + product.step)}
                  aria-label={`More ${product.name}`}
                  className="tappable flex h-[34px] w-[34px] items-center justify-center rounded-full bg-primary-soft text-primary"
                >
                  <Plus size={16} strokeWidth={2.8} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={add}
                aria-label={`Add ${product.name} to basket`}
                className="tappable flex h-[44px] w-[44px] items-center justify-center rounded-full bg-card text-primary shadow-float"
              >
                <Plus size={22} strokeWidth={2.8} />
              </button>
            )}
          </div>
        )}
      </ProductPicture>

      <button type="button" onClick={open} className="block w-full px-3.5 pb-3.5 pt-3 text-left">
        <span className="block truncate text-[16px] font-bold leading-tight text-ink">
          {product.name}
        </span>
        <span className="mt-0.5 block truncate text-[12.5px] font-semibold text-ink-muted">
          {farm.call} · {farm.place.split(', ').pop()}
        </span>
        <span className="mt-2 flex items-baseline gap-1">
          <span
            className={`text-[20px] font-extrabold leading-none tracking-tight ${
              product.outOfStock ? 'text-ink-faint' : member ? 'text-primary' : 'text-ink'
            }`}
          >
            {peso(price)}
          </span>
          <span className="truncate text-[12.5px] font-semibold text-ink-muted">
            / {perUnit(product)}
          </span>
        </span>
      </button>
    </div>
  )
}
