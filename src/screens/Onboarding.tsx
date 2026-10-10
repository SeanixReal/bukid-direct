import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  HandCoins,
  Handshake,
  MapPin,
  Smartphone,
  Sprout,
  Store,
  Truck,
  type LucideIcon,
} from 'lucide-react'
import { BackButton, Screen, ScreenFooter } from '../components/Screen'
import { Button, ModeSwitch } from '../components/ui'
import { Logo } from '../components/Logo'
import { CityMap } from '../components/CityMap'
import { useApp } from '../state/AppState'
import { courierNames, homeAt, markets, sellerShare, user } from '../data/sample'

const STEPS = 2

export function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  const finish = () => navigate('/shop')

  return (
    <Screen
      footer={
        <ScreenFooter>
          {step === 0 ? (
            <Button onClick={() => setStep(1)}>
              Continue
              <ArrowRight size={19} strokeWidth={2.6} />
            </Button>
          ) : (
            <Button onClick={finish}>Start shopping</Button>
          )}
        </ScreenFooter>
      }
    >
      <div className="flex items-center gap-3 px-5 pb-4 pt-1">
        <BackButton onClick={() => (step > 0 ? setStep(step - 1) : navigate('/'))} />
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: STEPS }, (_, i) => (
            <span
              key={i}
              className={`h-[6px] flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-primary' : 'bg-surface-2'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={finish}
          className="tappable shrink-0 px-1 text-[15px] font-bold text-ink-muted"
        >
          Skip
        </button>
      </div>

      <div key={step} className="animate-screen-in px-5 pb-6">
        {step === 0 ? <HowItHelps /> : <WhereToDeliver />}
      </div>
    </Screen>
  )
}

/* --- 1. How it helps - the pitch deck's three promises ----------------------- */

const promises: { Icon: LucideIcon; title: string; detail: string }[] = [
  {
    Icon: Handshake,
    title: 'No middlemen',
    detail: 'Stalls and local growers sell straight to you.',
  },
  {
    Icon: Smartphone,
    title: 'Tap to order',
    detail: 'One basket from many stalls. No market trip.',
  },
  {
    Icon: HandCoins,
    title: 'Fair prices',
    detail: 'Market prices upfront, plus the delivery fare.',
  },
]

function HowItHelps() {
  return (
    <>
      <Logo size={44} className="text-primary" />
      <h1 className="mt-4 text-[30px] font-extrabold leading-[1.12] tracking-tight text-ink">
        Fresh from the market.
      </h1>
      <p className="mt-2 text-[16px] font-medium leading-snug text-ink-muted">
        Cebu's public markets on your phone: fresher food, fair prices, no market trip.
      </p>

      <ul className="mt-6 space-y-3">
        {promises.map(({ Icon, title, detail }) => (
          <li
            key={title}
            className="flex items-start gap-3.5 rounded-card border border-line bg-card p-4 shadow-card"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon size={22} strokeWidth={2.3} />
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-[17px] font-bold leading-snug text-ink">{title}</span>
              <span className="mt-0.5 block text-[14px] font-medium leading-snug text-ink-muted">
                {detail}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-3 rounded-card bg-secondary-soft p-4">
        <Sprout size={22} strokeWidth={2.3} className="shrink-0 text-primary" />
        <p className="text-[14px] font-semibold leading-snug text-on-secondary">
          <b className="font-extrabold">{Math.round(sellerShare * 100)}%</b> of what you pay for food goes
          straight to the stall. Many grow or catch it themselves.
        </p>
      </div>
    </>
  )
}

/* --- 2. Where to deliver --------------------------------------------------- */

function WhereToDeliver() {
  const { prefMode, setPrefMode } = useApp()

  return (
    <>
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink">
        Delivery or pick-up?
      </h1>
      <p className="mt-1.5 text-[16px] font-medium leading-snug text-ink-muted">
        You can switch any time, even per market.
      </p>

      <ModeSwitch value={prefMode} onChange={setPrefMode} className="mt-4" />

      <CityMap
        frame={[homeAt]}
        markers={[{ id: 'home', at: homeAt, kind: 'home', label: user.address.label }]}
        padding={{ top: 30, right: 30, bottom: 30, left: 30 }}
        className="mt-4 h-[200px] rounded-card ring-1 ring-inset ring-line"
      />

      <div className="mt-3 flex items-center gap-3 rounded-card border border-line bg-card p-4 shadow-card">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <MapPin size={20} strokeWidth={2.4} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-bold text-ink">
            {user.address.label} · {user.address.street}
          </span>
          <span className="block truncate text-[13px] font-medium text-ink-muted">
            {user.address.area} · {user.address.note}
          </span>
        </span>
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-card bg-surface p-4">
        {prefMode === 'pickup' ? (
          <Store size={20} strokeWidth={2.3} className="mt-0.5 shrink-0 text-primary" />
        ) : (
          <Truck size={20} strokeWidth={2.3} className="mt-0.5 shrink-0 text-primary" />
        )}
        <p className="text-[14px] font-semibold leading-snug text-ink-muted">
          {prefMode === 'pickup'
            ? `Collect at the stalls in any of the ${markets.length} markets, on your way home. Always free.`
            : `Pick ${courierNames}, at the courier's own fare. One rider brings everything from the same market.`}
        </p>
      </div>
    </>
  )
}
