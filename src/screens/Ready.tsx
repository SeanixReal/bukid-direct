import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Navigation, PackageCheck, Sunrise } from 'lucide-react'
import { Screen } from '../components/Screen'
import { ProductPicture } from '../components/ProduceArt'
import { Button } from '../components/ui'
import { useApp } from '../state/AppState'
import { demoBasket, demoOrder, getFarm, getHub, getProduct, listNames } from '../data/sample'

/* --------------------------------------------------------------------------
   "Ready for pickup" - takes over the screen when the order reaches the hub.
   Orange is reserved for exactly this moment (and "Harvested today"), which
   is why it reads as news the instant it appears. "Andam na!" is Bisaya for
   "It's ready!".
   -------------------------------------------------------------------------- */

export function Ready() {
  const navigate = useNavigate()
  const { order, hubId, showToast } = useApp()

  /* Opened from the presenter panel before any order exists? Show the demo
     order so the screen is never empty. */
  const hub = getHub(order?.hubId ?? hubId)
  const lines = order?.lines ?? demoBasket
  const code = order?.code ?? demoOrder.code
  const farmIds = [...new Set(lines.map((l) => getProduct(l.productId)?.farmId ?? ''))].filter(Boolean)
  const farmers = listNames(farmIds.map((id) => getFarm(id).call))

  return (
    <Screen
      className="bg-accent"
      footer={
        <div className="shrink-0 space-y-2 px-5 pb-1.5 pt-2">
          <Button
            variant="onAccent"
            onClick={() => {
              showToast(`See you at ${hub.name}!`)
              navigate('/orders')
            }}
          >
            <Navigation size={18} strokeWidth={2.6} />
            I'm on my way
          </Button>
          <Button variant="outlineOnAccent" onClick={() => navigate('/orders')}>
            View order
          </Button>
        </div>
      }
    >
      <div className="flex min-h-full flex-col">
        <div className="flex items-center gap-3 px-4 pb-1 pt-1">
          <button
            type="button"
            onClick={() => navigate('/orders')}
            aria-label="Back to orders"
            className="tappable flex h-11 w-11 items-center justify-center rounded-full bg-on-accent/12 text-on-accent"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>
          <span className="text-[13px] font-extrabold uppercase tracking-[0.14em] text-on-accent/75">
            Pickup Hub
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center px-5 pb-5">
          <div className="flex flex-col items-center text-center">
            <span className="relative flex h-[76px] w-[76px] items-center justify-center rounded-full bg-on-accent/12 text-on-accent">
              <span className="animate-halo absolute inset-0 rounded-full bg-on-accent/20" />
              <PackageCheck size={38} strokeWidth={2.2} className="relative" />
            </span>
            <p className="mt-4 text-[20px] font-extrabold text-on-accent/80">Andam na!</p>
            <h1 className="mt-1 text-balance text-[32px] font-extrabold leading-[1.1] tracking-tight text-on-accent">
              Your order is ready for pickup
            </h1>
            <p className="mt-2 text-[17px] font-bold text-on-accent/80">at {hub.name}</p>
          </div>

          {/* Code */}
          <div className="mt-6 rounded-card bg-card p-4 text-center shadow-float">
            <p className="text-[13px] font-extrabold uppercase tracking-wide text-ink-muted">
              Pickup code
            </p>
            <p className="mt-1 text-[52px] font-extrabold leading-none tracking-[0.12em] text-ink">
              {code}
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-line pt-3 text-left">
              <div className="flex shrink-0 -space-x-2">
                {lines.slice(0, 4).map((l) => {
                  const product = getProduct(l.productId)
                  return product ? (
                    <ProductPicture
                      key={l.productId}
                      product={product}
                      className="h-9 w-9 rounded-full ring-2 ring-card"
                    />
                  ) : null
                })}
              </div>
              <p className="min-w-0 text-[13.5px] font-semibold leading-snug text-ink">
                <span className="inline-flex items-center gap-1 font-extrabold text-accent-strong">
                  <Sunrise size={14} strokeWidth={2.8} />
                  Harvested today
                </span>{' '}
                by {farmers}.
              </p>
            </div>
          </div>

          {/* Where and until when */}
          <div className="mt-3 space-y-2.5 rounded-card bg-on-accent/10 p-4">
            <p className="flex items-center gap-2.5 text-[15px] font-bold text-on-accent">
              <MapPin size={18} strokeWidth={2.5} className="shrink-0" />
              {hub.host}
            </p>
            <p className="flex items-center gap-2.5 text-[15px] font-bold text-on-accent">
              <Clock size={18} strokeWidth={2.5} className="shrink-0" />
              Open until {hub.closes} today
            </p>
          </div>
        </div>
      </div>
    </Screen>
  )
}
