import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  demoBasket,
  demoModes,
  demoOrder,
  getMarket,
  getProduce,
  stageAt,
  stagesFor,
  type ChannelId,
  type CourierId,
  type HandoffId,
  type LanguageId,
  type Listing,
  type MarketId,
  type Mode,
  type PaymentId,
  type Slot,
  type StageId,
} from '../data/sample'
import { addListing, featureListing, getListing, resetListings } from './catalog'
import { priceBasket, type Line, type MarketGroup, type Priced, type Totals } from './pricing'

/* --------------------------------------------------------------------------
   One small store for the whole prototype. No backend, no persistence - the
   presenter can reset it at any time from the demo panel (D).

   An order is split into one "shipment" per market: the stalls in a market
   each pack their own part, and one rider - from the courier the buyer
   picked - collects them all, or the buyer picks them up. Each shipment
   walks through stagesFor[mode]: the stalls confirm, pack, then it is
   delivered or picked up.
   -------------------------------------------------------------------------- */

interface Profile {
  channel: ChannelId
  language: LanguageId
}

/* One stall's part of a shipment - what its Seller Center shows. */
export interface ShipmentStall {
  sellerId: string
  lines: Line[]
  /* What the buyer pays for this stall's food. */
  subtotal: number
}

export interface Shipment {
  id: string
  marketId: MarketId
  mode: Mode
  /* What the buyer chose and the stalls confirm: the courier and the time.
     Only used for deliveries. */
  courier: CourierId
  slot: Slot
  stalls: ShipmentStall[]
  lines: Line[]
  subtotal: number
  fee: number
  /* Index into stagesFor[mode]. */
  stage: number
}

export interface Order {
  id: string
  /* Shown at the stalls on pick-up. */
  code: string
  placedAt: string
  payment: PaymentId
  /* How the rider hands deliveries over. */
  handoff: HandoffId
  member: boolean
  shipments: Shipment[]
  totals: Totals
}

export interface Toast {
  id: number
  text: string
  action?: { label: string; to: string }
}

/* Nong Romy's side of tomorrow: confirm the orders, harvest and pack, hand
   over to the riders. */
export type SellerStep = 'new' | 'confirmed' | 'ready' | 'handedOver'

interface AppStateValue {
  /* Buyer ---------------------------------------------------------------- */
  member: boolean
  setMember: (on: boolean) => void
  profile: Profile
  updateProfile: (patch: Partial<Profile>) => void
  favorites: string[]
  toggleFavorite: (listingId: string) => void

  /* Delivery or Pick-up, like Grab and foodpanda. `prefMode` is the switch
     on the shop; each market in the basket can differ. */
  prefMode: Mode
  setPrefMode: (mode: Mode) => void
  modeOf: (marketId: MarketId) => Mode
  setMarketMode: (marketId: MarketId, mode: Mode) => void

  /* Choose your delivery option: for each market the buyer picks a courier
     and a time (the market's usual courier and first time to start with),
     and for the order how the rider hands it over. The stalls confirm. */
  courierOf: (marketId: MarketId) => CourierId
  setMarketCourier: (marketId: MarketId, courier: CourierId) => void
  /* Index into the market's slots. */
  slotOf: (marketId: MarketId) => number
  setMarketSlot: (marketId: MarketId, index: number) => void
  handoff: HandoffId
  setHandoff: (handoff: HandoffId) => void

  /* Basket ----------------------------------------------------------------- */
  basket: Line[]
  groups: MarketGroup[]
  basketTotals: Totals
  /* The Direct Plus welcome voucher (free delivery once) is still unused. */
  welcomeLeft: boolean
  qtyOf: (listingId: string) => number
  setQty: (listingId: string, qty: number) => void
  addToBasket: (listingId: string, qty?: number) => void
  fillDemoBasket: () => void

  /* The order -------------------------------------------------------------- */
  order: Order | null
  placeOrder: (opts: { payment: PaymentId }) => Order
  placeDemoOrder: () => Order
  stageOf: (shipment: Shipment) => StageId
  simRunning: boolean
  playDay: () => void
  pauseDay: () => void
  nextStep: () => void
  /* Presenter shortcut: put every shipment on a stage. */
  jumpTo: (stage: StageId) => Order
  markPickedUp: (shipmentId: string) => void

  /* Seller ------------------------------------------------------------------ */
  sellerStep: SellerStep
  setSellerStep: (step: SellerStep) => void
  /* Bumped when a seller publishes, so lists re-read the catalog. */
  listingsVersion: number
  publishListing: (listing: Omit<Listing, 'id'>) => Listing
  /* A stall pays to put a listing in the shop's Featured row. */
  featureListing: (listingId: string) => void

  /* Little confirmation pill over the bottom of the screen. */
  toast: Toast | null
  showToast: (text: string, action?: Toast['action']) => void
  dismissToast: () => void

  resetDemo: () => void
  /* Bumped on reset so the router can remount cleanly. */
  demoKey: number
}

const defaultProfile: Profile = { channel: 'both', language: 'en' }
const TICK_MS = 100

const AppStateContext = createContext<AppStateValue | null>(null)
/* The delivery-day clock gets its own context: it ticks ten times a second
   while playing, and only the tracking map needs to hear it. */
const ClockContext = createContext(0)

function clockTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** Furthest stage the clock alone takes a shipment to. Pick-up orders wait
    at "Ready for pickup" until the buyer collects. */
function autoEnd(mode: Mode) {
  const list = stagesFor[mode]
  return mode === 'pickup' ? list.indexOf('ready') : list.length - 1
}

function reached(mode: Mode, elapsed: number) {
  const list = stagesFor[mode]
  let i = 0
  list.forEach((id, idx) => {
    if (stageAt[id] <= elapsed) i = idx
  })
  return Math.min(i, autoEnd(mode))
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState(false)
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [favorites, setFavorites] = useState<string[]>([])
  const [prefMode, setPrefModeState] = useState<Mode>('delivery')
  const [marketModes, setMarketModes] = useState<Partial<Record<MarketId, Mode>>>({})
  const [marketCouriers, setMarketCouriers] = useState<Partial<Record<MarketId, CourierId>>>({})
  const [marketSlots, setMarketSlots] = useState<Partial<Record<MarketId, number>>>({})
  const [handoff, setHandoff] = useState<HandoffId>('hand')
  const [basket, setBasket] = useState<Line[]>([])
  const [order, setOrder] = useState<Order | null>(null)
  const [simRunning, setSimRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sellerStep, setSellerStep] = useState<SellerStep>('new')
  const [listingsVersion, setListingsVersion] = useState(0)
  const [welcomeLeft, setWelcomeLeft] = useState(true)
  const [toast, setToast] = useState<Toast | null>(null)
  const [demoKey, setDemoKey] = useState(0)
  const toastSeq = useRef(0)

  /* --- Delivery day ------------------------------------------------------ */
  useEffect(() => {
    if (!simRunning) return
    const id = window.setInterval(() => setElapsed((e) => e + TICK_MS), TICK_MS)
    return () => window.clearInterval(id)
  }, [simRunning])

  /* Move shipments on as the clock passes each stage. */
  useEffect(() => {
    setOrder((o) => {
      if (!o) return o
      let changed = false
      const shipments = o.shipments.map((s) => {
        const next = reached(s.mode, elapsed)
        if (next <= s.stage) return s
        changed = true
        return { ...s, stage: next }
      })
      return changed ? { ...o, shipments } : o
    })
  }, [elapsed])

  /* The day is over once every shipment is as far as the clock takes it. */
  useEffect(() => {
    if (simRunning && order && order.shipments.every((s) => s.stage >= autoEnd(s.mode))) {
      setSimRunning(false)
    }
  }, [order, simRunning])

  /* --- Delivery or pick-up -------------------------------------------------- */

  const modeOf = useCallback(
    (marketId: MarketId): Mode => marketModes[marketId] ?? prefMode,
    [marketModes, prefMode],
  )

  const setPrefMode = useCallback((mode: Mode) => {
    setPrefModeState(mode)
    setMarketModes({})
  }, [])

  const setMarketMode = useCallback((marketId: MarketId, mode: Mode) => {
    setMarketModes((m) => ({ ...m, [marketId]: mode }))
  }, [])

  /* --- Courier, time and handoff ----------------------------------------------- */

  const courierOf = useCallback(
    (marketId: MarketId): CourierId => marketCouriers[marketId] ?? getMarket(marketId).usual,
    [marketCouriers],
  )

  const setMarketCourier = useCallback((marketId: MarketId, courier: CourierId) => {
    setMarketCouriers((c) => ({ ...c, [marketId]: courier }))
  }, [])

  const slotOf = useCallback((marketId: MarketId) => marketSlots[marketId] ?? 0, [marketSlots])

  const setMarketSlot = useCallback((marketId: MarketId, index: number) => {
    setMarketSlots((s) => ({ ...s, [marketId]: index }))
  }, [])

  /* --- Basket ---------------------------------------------------------------- */

  const setQty = useCallback((listingId: string, qty: number) => {
    setBasket((lines) => {
      const value = Math.max(0, Math.round(qty * 10) / 10)
      if (value === 0) return lines.filter((l) => l.listingId !== listingId)
      const existing = lines.find((l) => l.listingId === listingId)
      if (existing) return lines.map((l) => (l === existing ? { ...l, qty: value } : l))
      return [...lines, { listingId, qty: value }]
    })
  }, [])

  const addToBasket = useCallback((listingId: string, qty?: number) => {
    const listing = getListing(listingId)
    if (!listing || listing.outOfStock) return
    const item = getProduce(listing.produceId)
    const add = qty ?? (item.unit === 'kg' ? 1 : item.step)
    setBasket((lines) => {
      const existing = lines.find((l) => l.listingId === listingId)
      if (existing) return lines.map((l) => (l === existing ? { ...l, qty: l.qty + add } : l))
      return [...lines, { listingId, qty: add }]
    })
  }, [])

  const qtyOf = useCallback(
    (listingId: string) => basket.find((l) => l.listingId === listingId)?.qty ?? 0,
    [basket],
  )

  const fillDemoBasket = useCallback(() => {
    setBasket(demoBasket.map((l) => ({ ...l })))
    setPrefModeState('delivery')
    setMarketModes({ ...demoModes })
    setMarketCouriers({})
    setMarketSlots({})
  }, [])

  const priced = useMemo(
    () => priceBasket(basket, member, modeOf, welcomeLeft, courierOf),
    // listingsVersion: a newly published listing can be in the basket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [basket, member, modeOf, welcomeLeft, courierOf, listingsVersion],
  )
  const groups = priced.groups
  const basketTotals = priced.totals

  /* --- The order ---------------------------------------------------------------- */

  const startOrder = useCallback(
    ({ groups: orderGroups, totals: orderTotals, usedWelcome }: Priced, payment: PaymentId) => {
      const placed: Order = {
        id: demoOrder.id,
        code: demoOrder.code,
        placedAt: clockTime(),
        payment,
        handoff,
        member,
        shipments: orderGroups.map((g) => {
          const market = getMarket(g.marketId)
          return {
            id: `${demoOrder.id}-${market.id}`,
            marketId: g.marketId,
            mode: g.mode,
            courier: g.courier,
            slot: market.slots[slotOf(g.marketId)] ?? market.slots[0],
            stalls: g.stalls.map((s) => ({ sellerId: s.sellerId, lines: s.lines, subtotal: s.regular - s.suki })),
            lines: g.lines,
            subtotal: g.subtotal,
            fee: g.fee,
            stage: 0,
          }
        }),
        totals: orderTotals,
      }
      setSimRunning(false)
      setElapsed(0)
      setOrder(placed)
      setBasket([])
      if (usedWelcome) setWelcomeLeft(false)
      return placed
    },
    [member, handoff, slotOf],
  )

  const placeOrder = useCallback(
    ({ payment }: { payment: PaymentId }) => startOrder(priced, payment),
    [priced, startOrder],
  )

  /* For the presenter: an order straight away, from whatever is in the
     basket or else the demo basket (two markets, one of them pick-up). */
  const placeDemoOrder = useCallback(() => {
    if (basket.length) return startOrder(priced, 'gcash')
    const demoModeOf = (marketId: MarketId): Mode => demoModes[marketId] ?? 'delivery'
    return startOrder(priceBasket(demoBasket, member, demoModeOf, welcomeLeft, courierOf), 'gcash')
  }, [basket.length, priced, member, welcomeLeft, courierOf, startOrder])

  const stageOf = useCallback((s: Shipment) => stagesFor[s.mode][s.stage], [])

  const playDay = useCallback(() => {
    if (!order) return
    const finished = order.shipments.every((s) => s.stage >= autoEnd(s.mode))
    if (finished) {
      /* Replaying a finished day starts it again from "Order placed". */
      setElapsed(0)
      setOrder({ ...order, shipments: order.shipments.map((s) => ({ ...s, stage: 0 })) })
    }
    setSimRunning(true)
  }, [order])

  const pauseDay = useCallback(() => setSimRunning(false), [])

  const nextStep = useCallback(() => {
    const marks = [...new Set(Object.values(stageAt))].sort((a, b) => a - b)
    const next = marks.find((m) => m > elapsed)
    if (next !== undefined) {
      setElapsed(next)
      return
    }
    /* Past the last delivery: hand over anything waiting at the stalls. */
    setOrder((o) =>
      o
        ? {
            ...o,
            shipments: o.shipments.map((s) =>
              s.mode === 'pickup' ? { ...s, stage: stagesFor.pickup.indexOf('done') } : s,
            ),
          }
        : o,
    )
  }, [elapsed])

  const jumpTo = useCallback(
    (stage: StageId) => {
      const target = order ?? placeDemoOrder()
      /* A little way into "On the way", so the rider is visibly moving. */
      const at = stage === 'onTheWay' ? stageAt.onTheWay + 2500 : stageAt[stage]
      const moved: Order = {
        ...target,
        shipments: target.shipments.map((s) => {
          const list = stagesFor[s.mode]
          const want = list.indexOf(stage)
          return { ...s, stage: want >= 0 ? want : reached(s.mode, at) }
        }),
      }
      setElapsed(Number.isFinite(at) ? at : 0)
      setOrder(moved)
      setSimRunning(stage === 'onTheWay')
      return moved
    },
    [order, placeDemoOrder],
  )

  const markPickedUp = useCallback((shipmentId: string) => {
    setOrder((o) =>
      o
        ? {
            ...o,
            shipments: o.shipments.map((s) =>
              s.id === shipmentId ? { ...s, stage: stagesFor[s.mode].indexOf('done') } : s,
            ),
          }
        : o,
    )
  }, [])

  /* --- Seller ----------------------------------------------------------------------- */

  const publishListing = useCallback((draft: Omit<Listing, 'id'>) => {
    const listing: Listing = { ...draft, id: `${draft.sellerId}-${draft.produceId}-${Date.now()}` }
    addListing(listing)
    setListingsVersion((v) => v + 1)
    return listing
  }, [])

  const feature = useCallback((listingId: string) => {
    featureListing(listingId)
    setListingsVersion((v) => v + 1)
  }, [])

  /* --- Everything else ------------------------------------------------------------------ */

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  }, [])

  const showToast = useCallback((text: string, action?: Toast['action']) => {
    toastSeq.current += 1
    setToast({ id: toastSeq.current, text, action })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const resetDemo = useCallback(() => {
    resetListings()
    setSimRunning(false)
    setElapsed(0)
    setMember(false)
    setProfile(defaultProfile)
    setFavorites([])
    setPrefModeState('delivery')
    setMarketModes({})
    setMarketCouriers({})
    setMarketSlots({})
    setHandoff('hand')
    setBasket([])
    setOrder(null)
    setSellerStep('new')
    setListingsVersion((v) => v + 1)
    setWelcomeLeft(true)
    setToast(null)
    setDemoKey((k) => k + 1)
  }, [])

  const value = useMemo<AppStateValue>(
    () => ({
      member,
      setMember,
      profile,
      updateProfile,
      favorites,
      toggleFavorite,
      prefMode,
      setPrefMode,
      modeOf,
      setMarketMode,
      courierOf,
      setMarketCourier,
      slotOf,
      setMarketSlot,
      handoff,
      setHandoff,
      basket,
      groups,
      basketTotals,
      welcomeLeft,
      qtyOf,
      setQty,
      addToBasket,
      fillDemoBasket,
      order,
      placeOrder,
      placeDemoOrder,
      stageOf,
      simRunning,
      playDay,
      pauseDay,
      nextStep,
      jumpTo,
      markPickedUp,
      sellerStep,
      setSellerStep,
      listingsVersion,
      publishListing,
      featureListing: feature,
      toast,
      showToast,
      dismissToast,
      resetDemo,
      demoKey,
    }),
    [
      member,
      profile,
      updateProfile,
      favorites,
      toggleFavorite,
      prefMode,
      setPrefMode,
      modeOf,
      setMarketMode,
      courierOf,
      setMarketCourier,
      slotOf,
      setMarketSlot,
      handoff,
      basket,
      groups,
      basketTotals,
      welcomeLeft,
      qtyOf,
      setQty,
      addToBasket,
      fillDemoBasket,
      order,
      placeOrder,
      placeDemoOrder,
      stageOf,
      simRunning,
      playDay,
      pauseDay,
      nextStep,
      jumpTo,
      markPickedUp,
      sellerStep,
      listingsVersion,
      publishListing,
      feature,
      toast,
      showToast,
      dismissToast,
      resetDemo,
      demoKey,
    ],
  )

  return (
    <AppStateContext.Provider value={value}>
      <ClockContext.Provider value={elapsed}>{children}</ClockContext.Provider>
    </AppStateContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>')
  return ctx
}

/** Milliseconds of demo time since the order was placed. */
export function useSimClock() {
  return useContext(ClockContext)
}

/** How far along its route a shipment's rider is, 0 to 1. */
export function riderProgress(elapsed: number) {
  return Math.max(0, Math.min(1, (elapsed - stageAt.onTheWay) / (stageAt.done - stageAt.onTheWay)))
}
