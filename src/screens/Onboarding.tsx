import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, HandCoins, MapPin, ShoppingBasket, Sunrise, type LucideIcon } from 'lucide-react'
import { BackButton, Screen, ScreenFooter } from '../components/Screen'
import { Button } from '../components/ui'
import { Logo } from '../components/Logo'
import { HubMap } from '../components/HubMap'
import { useApp } from '../state/AppState'
import {
  distanceKm,
  distanceText,
  farmerShare,
  getHub,
  hubs,
  schedule,
} from '../data/sample'

const STEPS = 2

export function Onboarding() {
  const navigate = useNavigate()
  const { hubId, setHubId } = useApp()
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
            <Button onClick={finish}>Start shopping at {getHub(hubId).name}</Button>
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
        {step === 0 ? <HowItWorks /> : <ChooseHub value={hubId} onChange={setHubId} />}
      </div>
    </Screen>
  )
}

/* --- 1. How it works ------------------------------------------------------- */

const steps: { Icon: LucideIcon; title: string; detail: string }[] = [
  {
    Icon: ShoppingBasket,
    title: "Shop this week's harvest",
    detail: `Order by ${schedule.cutoff}. Prices are agreed with the farmers.`,
  },
  {
    Icon: Sunrise,
    title: 'The farmers pick it for you',
    detail: 'Harvested the morning of your pickup, not days before.',
  },
  {
    Icon: MapPin,
    title: 'Collect it at your Pickup Hub',
    detail: 'Show your 4-digit code. In and out in two minutes.',
  },
]

function HowItWorks() {
  return (
    <>
      <Logo size={44} className="text-primary" />
      <h1 className="mt-4 text-[30px] font-extrabold leading-[1.12] tracking-tight text-ink">
        Straight from the farm to a hub near you
      </h1>
      <p className="mt-2 text-[16px] font-medium leading-snug text-ink-muted">
        Cebu farmers harvest what you order. You pick it up the next afternoon, still fresh.
      </p>

      <ol className="mt-6 space-y-3">
        {steps.map(({ Icon, title, detail }, i) => (
          <li
            key={title}
            className="flex items-start gap-3.5 rounded-card border border-line bg-card p-4 shadow-card"
          >
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon size={22} strokeWidth={2.3} />
              <span className="absolute -right-1 -top-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-primary text-[12px] font-extrabold text-on-primary ring-2 ring-card">
                {i + 1}
              </span>
            </span>
            <span className="min-w-0 pt-0.5">
              <span className="block text-[17px] font-bold leading-snug text-ink">{title}</span>
              <span className="mt-0.5 block text-[14px] font-medium leading-snug text-ink-muted">
                {detail}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex items-center gap-3 rounded-card bg-secondary-soft p-4">
        <HandCoins size={22} strokeWidth={2.3} className="shrink-0 text-primary" />
        <p className="text-[14px] font-semibold leading-snug text-on-secondary">
          <b className="font-extrabold">{Math.round(farmerShare * 100)}%</b> of every peso you spend
          on produce goes straight to the farm.
        </p>
      </div>
    </>
  )
}

/* --- 2. Choose a Pickup Hub ---------------------------------------------------- */

function ChooseHub({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <>
      <h1 className="text-[28px] font-extrabold leading-tight tracking-tight text-ink">
        Choose your Pickup Hub
      </h1>
      <p className="mt-1.5 text-[16px] font-medium leading-snug text-ink-muted">
        Pick the one closest to home or work. You can change it any time.
      </p>

      <HubMap
        selectedId={value}
        onSelect={onChange}
        compact
        padding={{ top: 60, right: 36, bottom: 34, left: 36 }}
        className="mt-4 h-[250px] rounded-card ring-1 ring-inset ring-line"
      />

      <ul className="mt-3 space-y-2.5">
        {hubs.map((hub) => {
          const active = hub.id === value
          return (
            <li key={hub.id}>
              <button
                type="button"
                onClick={() => onChange(hub.id)}
                aria-pressed={active}
                className={`tappable flex w-full items-center gap-3 rounded-card border p-3.5 text-left ${
                  active ? 'border-primary bg-primary-soft' : 'border-line bg-card'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    active ? 'bg-primary text-on-primary' : 'bg-surface text-ink-muted'
                  }`}
                >
                  <MapPin size={20} strokeWidth={2.4} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[16px] font-bold ${active ? 'text-primary' : 'text-ink'}`}>
                    {hub.name}
                  </span>
                  <span className="block truncate text-[13px] font-medium text-ink-muted">
                    {hub.host}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[13px] font-bold text-ink">
                    {distanceText(distanceKm(hub.at))}
                  </span>
                  <span
                    className={`ml-auto mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                      active ? 'border-primary bg-primary text-on-primary' : 'border-line'
                    }`}
                  >
                    {active && <Check size={14} strokeWidth={3.2} />}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </>
  )
}
