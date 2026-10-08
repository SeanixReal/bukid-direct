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
  defaultHubId,
  demoBasket,
  demoOrder,
  getProduct,
  orderStages,
  type ChannelId,
  type LanguageId,
  type PaymentId,
  type ProductId,
  type SlotId,
  type StageId,
} from '../data/sample'
import { totals, type Line, type Totals } from './pricing'

/* --------------------------------------------------------------------------
   One small store for the whole prototype. No backend, no persistence - the
   presenter can reset it at any time from the demo panel (D).
   -------------------------------------------------------------------------- */

interface Profile {
  channel: ChannelId
  language: LanguageId
}

export interface Order {
  id: string
  code: string
  lines: Line[]
  totals: Totals
  member: boolean
  hubId: string
  slotId: SlotId
  payment: PaymentId
  placedAt: string
  /* Index into orderStages. */
  stage: number
}

export interface Toast {
  id: number
  text: string
  action?: { label: string; to: string }
}

interface AppStateValue {
  /* Buyer ---------------------------------------------------------------- */
  hubId: string
  setHubId: (id: string) => void
  member: boolean
  setMember: (on: boolean) => void
  profile: Profile
  updateProfile: (patch: Partial<Profile>) => void
  favorites: ProductId[]
  toggleFavorite: (id: ProductId) => void

  /* Basket --------------------------------------------------------------- */
  basket: Line[]
  basketTotals: Totals
  qtyOf: (id: ProductId) => number
  setQty: (id: ProductId, qty: number) => void
  addToBasket: (id: ProductId, qty?: number) => void
  fillDemoBasket: () => void

  /* The order ------------------------------------------------------------ */
  order: Order | null
  stageId: StageId | null
  placeOrder: (opts: { slotId: SlotId; payment: PaymentId }) => Order
  placeDemoOrder: () => Order
  simRunning: boolean
  playOrderDay: () => void
  pauseOrderDay: () => void
  nextStage: () => void
  /* Presenter shortcut: put the order straight on a stage. */
  setStage: (stage: number) => void
  markPickedUp: () => void

  /* Farmer view: products Nong Romy has ticked off as harvested. */
  harvested: ProductId[]
  toggleHarvested: (id: ProductId) => void
  harvestAll: (ids: ProductId[]) => void

  /* Little confirmation pill over the bottom of the screen. */
  toast: Toast | null
  showToast: (text: string, action?: Toast['action']) => void
  dismissToast: () => void

  resetDemo: () => void
  /* Bumped on reset so the router can remount cleanly. */
  demoKey: number
}

const defaultProfile: Profile = { channel: 'both', language: 'en' }

export const READY_STAGE = orderStages.findIndex((s) => s.id === 'ready')
const PICKED_UP_STAGE = orderStages.findIndex((s) => s.id === 'pickedUp')
const TICK_MS = 100

const AppStateContext = createContext<AppStateValue | null>(null)

function clockTime(date = new Date()) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hubId, setHubId] = useState(defaultHubId)
  const [member, setMember] = useState(false)
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [favorites, setFavorites] = useState<ProductId[]>([])
  const [basket, setBasket] = useState<Line[]>([])
  const [order, setOrder] = useState<Order | null>(null)
  const [simRunning, setSimRunning] = useState(false)
  const [harvested, setHarvested] = useState<ProductId[]>([])
  const [toast, setToast] = useState<Toast | null>(null)
  const [demoKey, setDemoKey] = useState(0)

  /* Order-day clock, in ms of demo time. A ref so pausing keeps the place. */
  const elapsed = useRef(0)
  const toastSeq = useRef(0)

  /* --- Order day: walks the order through its stages ------------------ */
  useEffect(() => {
    if (!simRunning) return
    const id = window.setInterval(() => {
      elapsed.current += TICK_MS
      const reached = orderStages.reduce(
        (last, s, i) => (s.at <= elapsed.current ? i : last),
        0,
      )
      setOrder((o) => (o && reached > o.stage ? { ...o, stage: reached } : o))
      /* The day ends when the order is waiting at the hub. */
      if (reached >= READY_STAGE) setSimRunning(false)
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [simRunning])

  /* --- Basket ------------------------------------------------------------ */

  const setQty = useCallback((id: ProductId, qty: number) => {
    setBasket((lines) => {
      const value = Math.max(0, Math.round(qty * 10) / 10)
      if (value === 0) return lines.filter((l) => l.productId !== id)
      const existing = lines.find((l) => l.productId === id)
      if (existing) return lines.map((l) => (l === existing ? { ...l, qty: value } : l))
      return [...lines, { productId: id, qty: value }]
    })
  }, [])

  const addToBasket = useCallback((id: ProductId, qty?: number) => {
    const product = getProduct(id)
    if (!product || product.outOfStock) return
    const step = qty ?? (product.unit === 'kg' ? 1 : product.step)
    setBasket((lines) => {
      const existing = lines.find((l) => l.productId === id)
      if (existing) {
        return lines.map((l) => (l === existing ? { ...l, qty: l.qty + step } : l))
      }
      return [...lines, { productId: id, qty: step }]
    })
  }, [])

  const qtyOf = useCallback(
    (id: ProductId) => basket.find((l) => l.productId === id)?.qty ?? 0,
    [basket],
  )

  const fillDemoBasket = useCallback(() => {
    setBasket(demoBasket.map((l) => ({ ...l })))
  }, [])

  const basketTotals = useMemo(() => totals(basket, member), [basket, member])

  /* --- The order ---------------------------------------------------------- */

  const startOrder = useCallback(
    (lines: Line[], opts: { slotId: SlotId; payment: PaymentId }) => {
      const placed: Order = {
        id: demoOrder.id,
        code: demoOrder.code,
        lines,
        totals: totals(lines, member),
        member,
        hubId,
        slotId: opts.slotId,
        payment: opts.payment,
        placedAt: clockTime(),
        stage: 0,
      }
      elapsed.current = 0
      setSimRunning(false)
      setOrder(placed)
      setBasket([])
      return placed
    },
    [member, hubId],
  )

  const placeOrder = useCallback(
    (opts: { slotId: SlotId; payment: PaymentId }) => startOrder(basket, opts),
    [basket, startOrder],
  )

  /* For the presenter: an order straight away, from whatever is in the
     basket or else the demo basket. */
  const placeDemoOrder = useCallback(
    () =>
      startOrder(basket.length ? basket : demoBasket.map((l) => ({ ...l })), {
        slotId: 'early',
        payment: 'gcash',
      }),
    [basket, startOrder],
  )

  const playOrderDay = useCallback(() => {
    setOrder((o) => {
      if (!o) return o
      /* Replaying a finished day starts it again from "placed". */
      if (o.stage >= READY_STAGE) {
        elapsed.current = 0
        return { ...o, stage: 0 }
      }
      elapsed.current = Math.max(elapsed.current, orderStages[o.stage].at)
      return o
    })
    setSimRunning(true)
  }, [])

  const pauseOrderDay = useCallback(() => setSimRunning(false), [])

  const nextStage = useCallback(() => {
    setOrder((o) => {
      if (!o || o.stage >= PICKED_UP_STAGE) return o
      const stage = o.stage + 1
      if (stage < PICKED_UP_STAGE) elapsed.current = orderStages[stage].at
      return { ...o, stage }
    })
  }, [])

  const setStage = useCallback((stage: number) => {
    setSimRunning(false)
    elapsed.current = orderStages[Math.min(stage, READY_STAGE)].at
    setOrder((o) => (o ? { ...o, stage } : o))
  }, [])

  const markPickedUp = useCallback(() => {
    setSimRunning(false)
    setOrder((o) => (o ? { ...o, stage: PICKED_UP_STAGE } : o))
  }, [])

  /* --- Everything else ----------------------------------------------------- */

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }))
  }, [])

  const toggleFavorite = useCallback((id: ProductId) => {
    setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  }, [])

  const toggleHarvested = useCallback((id: ProductId) => {
    setHarvested((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]))
  }, [])

  const harvestAll = useCallback((ids: ProductId[]) => setHarvested(ids), [])

  const showToast = useCallback((text: string, action?: Toast['action']) => {
    toastSeq.current += 1
    setToast({ id: toastSeq.current, text, action })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const resetDemo = useCallback(() => {
    elapsed.current = 0
    setSimRunning(false)
    setHubId(defaultHubId)
    setMember(false)
    setProfile(defaultProfile)
    setFavorites([])
    setBasket([])
    setOrder(null)
    setHarvested([])
    setToast(null)
    setDemoKey((k) => k + 1)
  }, [])

  const stageId = order ? orderStages[order.stage].id : null

  const value = useMemo<AppStateValue>(
    () => ({
      hubId,
      setHubId,
      member,
      setMember,
      profile,
      updateProfile,
      favorites,
      toggleFavorite,
      basket,
      basketTotals,
      qtyOf,
      setQty,
      addToBasket,
      fillDemoBasket,
      order,
      stageId,
      placeOrder,
      placeDemoOrder,
      simRunning,
      playOrderDay,
      pauseOrderDay,
      nextStage,
      setStage,
      markPickedUp,
      harvested,
      toggleHarvested,
      harvestAll,
      toast,
      showToast,
      dismissToast,
      resetDemo,
      demoKey,
    }),
    [
      hubId,
      member,
      profile,
      updateProfile,
      favorites,
      toggleFavorite,
      basket,
      basketTotals,
      qtyOf,
      setQty,
      addToBasket,
      fillDemoBasket,
      order,
      stageId,
      placeOrder,
      placeDemoOrder,
      simRunning,
      playOrderDay,
      pauseOrderDay,
      nextStage,
      setStage,
      markPickedUp,
      harvested,
      toggleHarvested,
      harvestAll,
      toast,
      showToast,
      dismissToast,
      resetDemo,
      demoKey,
    ],
  )

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useApp must be used inside <AppStateProvider>')
  return ctx
}
