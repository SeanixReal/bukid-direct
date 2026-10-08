import { useEffect, useRef, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { PhoneFrame } from './components/PhoneFrame'
import { DemoHint, DemoPanel, ShotToast, type ShotStatus } from './components/DemoPanel'
import { Toast } from './components/Toast'
import { useApp } from './state/AppState'
import { savePhoneScreenshot } from './screenshot'

import { Splash } from './screens/Splash'
import { Onboarding } from './screens/Onboarding'
import { Shop } from './screens/Shop'
import { ProductScreen } from './screens/Product'
import { FarmScreen } from './screens/Farm'
import { Basket } from './screens/Basket'
import { Checkout } from './screens/Checkout'
import { Confirmed } from './screens/Confirmed'
import { Orders } from './screens/Orders'
import { Ready } from './screens/Ready'
import { Hubs } from './screens/Hubs'
import { Plus } from './screens/Plus'
import { Farmer } from './screens/Farmer'
import { Account } from './screens/Account'

export default function App() {
  const [demoOpen, setDemoOpen] = useState(false)
  const { demoKey } = useApp()
  const shot = usePhoneScreenshot()

  useReadyTakeover()

  /* S = save a screenshot, D = presenter controls. Ignored while typing so
     the search box still works normally. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.isContentEditable)
      ) {
        return
      }
      const key = e.key.toLowerCase()
      if (key !== 's' && key !== 'd' && key !== 'escape') return
      /* A shortcut key would otherwise light up a focus ring on whatever
         button was clicked last - and show it in the screenshot. */
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      if (key === 's') shot.takeRef.current()
      if (key === 'd') setDemoOpen((v) => !v)
      if (key === 'escape') setDemoOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shot.takeRef])

  return (
    <div className="flex min-h-full w-full items-center justify-center bg-stage p-6">
      <PhoneFrame ref={shot.phoneRef}>
        <AppRoutes key={demoKey} />
        <Toast />
      </PhoneFrame>

      {demoOpen ? <DemoPanel onClose={() => setDemoOpen(false)} /> : <DemoHint />}
      <ShotToast status={shot.status} />
    </div>
  )
}

/* --------------------------------------------------------------------------
   S saves the phone mockup as a PNG. Held in refs so the key handler never
   needs re-binding, and so a second press while saving is ignored.
   -------------------------------------------------------------------------- */
function usePhoneScreenshot() {
  const location = useLocation()
  const phoneRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<ShotStatus>({ kind: 'idle' })
  const busy = useRef(false)
  const pathRef = useRef(location.pathname)
  pathRef.current = location.pathname

  const takeRef = useRef(async () => {})
  takeRef.current = async () => {
    if (busy.current || !phoneRef.current) return
    busy.current = true
    setStatus({ kind: 'saving' })
    try {
      const file = await savePhoneScreenshot(phoneRef.current, pathRef.current)
      setStatus({ kind: 'saved', file })
    } catch (err) {
      console.error('Screenshot failed', err)
      setStatus({ kind: 'failed' })
    } finally {
      busy.current = false
    }
  }

  /* Let the confirmation fade after a few seconds. */
  useEffect(() => {
    if (status.kind !== 'saved' && status.kind !== 'failed') return
    const id = window.setTimeout(() => setStatus({ kind: 'idle' }), 3200)
    return () => window.clearTimeout(id)
  }, [status])

  return { phoneRef, takeRef, status }
}

/* --------------------------------------------------------------------------
   The moment the order reaches the hub, "Ready for pickup" takes over the
   screen - the way the real push notification would. The short delay lets
   the room see the step tick over on the order screen first.
   -------------------------------------------------------------------------- */
function useReadyTakeover() {
  const navigate = useNavigate()
  const location = useLocation()
  const { stageId } = useApp()
  const previous = useRef(stageId)

  /* Read through a ref so a route change does not re-trigger the effect. */
  const pathRef = useRef(location.pathname)
  pathRef.current = location.pathname

  useEffect(() => {
    const was = previous.current
    previous.current = stageId
    if (stageId !== 'ready' || was === 'ready') return
    const id = window.setTimeout(() => {
      if (pathRef.current !== '/ready') navigate('/ready')
    }, 1300)
    return () => window.clearTimeout(id)
  }, [stageId, navigate])
}

function AppRoutes() {
  const location = useLocation()

  return (
    /* Keyed on the path so each screen animates in and starts at the top. */
    <div key={location.pathname} className="animate-screen-in h-full">
      <Routes location={location}>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductScreen />} />
        <Route path="/farm/:id" element={<FarmScreen />} />
        <Route path="/basket" element={<Basket />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmed" element={<Confirmed />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/ready" element={<Ready />} />
        <Route path="/hubs" element={<Hubs />} />
        <Route path="/plus" element={<Plus />} />
        <Route path="/farmer" element={<Farmer />} />
        <Route path="/account" element={<Account />} />
        {/* Anything unknown goes to the shop rather than a blank screen. */}
        <Route path="*" element={<Navigate to="/shop" replace />} />
      </Routes>
    </div>
  )
}
