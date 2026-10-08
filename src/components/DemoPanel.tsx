import { useNavigate } from 'react-router-dom'
import {
  Camera,
  CircleAlert,
  CircleCheckBig,
  Navigation,
  PackageCheck,
  Pause,
  Play,
  RotateCcw,
  ShoppingBasket,
  SkipForward,
  Sprout,
  Tractor,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useApp } from '../state/AppState'
import { getFarm, stagesFor } from '../data/sample'

/* --------------------------------------------------------------------------
   Presenter controls. Live OUTSIDE the phone frame, so they never appear in a
   screenshot and never look like part of the app. Toggle with D.
   -------------------------------------------------------------------------- */

export function DemoPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const {
    order,
    simRunning,
    placeDemoOrder,
    playDay,
    pauseDay,
    nextStep,
    jumpTo,
    member,
    setMember,
    fillDemoBasket,
    resetDemo,
  } = useApp()

  const finished = order?.shipments.every((s) => s.stage >= stagesFor[s.mode].length - 1)
  const canPickup = !order || order.shipments.some((s) => s.mode === 'pickup')
  const canRide = !order || order.shipments.some((s) => s.mode === 'delivery')

  return (
    <aside className="animate-sheet-up fixed bottom-5 right-5 z-[2000] w-[300px] rounded-card bg-panel p-4 text-on-dark shadow-float">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-extrabold tracking-tight text-on-dark">Presenter controls</p>
          <p className="text-[11px] font-medium text-on-dark-muted">Not part of the app</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close presenter controls"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-on-dark/10 text-on-dark"
        >
          <X size={15} strokeWidth={2.6} />
        </button>
      </div>

      {/* --- Delivery day ----------------------------------------------------- */}
      <Label>Delivery day</Label>
      <div className="mb-2 space-y-2 rounded-md bg-on-dark/8 p-2.5">
        {order ? (
          order.shipments.map((s) => {
            const list = stagesFor[s.mode]
            return (
              <div key={s.id}>
                <p className="text-[12px] font-bold text-on-dark">
                  {getFarm(s.farmId).call} · {s.mode === 'pickup' ? 'Pick-up' : 'Delivery'}
                </p>
                <div className="mt-1 flex gap-1">
                  {list.map((id, i) => (
                    <span
                      key={id}
                      className={`h-[5px] flex-1 rounded-full ${
                        i > s.stage ? 'bg-on-dark/15' : id === 'ready' && i === s.stage ? 'bg-accent' : 'bg-secondary'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-[12px] font-bold text-on-dark">No order placed yet</p>
        )}
      </div>

      {order ? (
        <div className="mb-2 flex gap-1.5">
          <PanelButton
            Icon={simRunning ? Pause : Play}
            label={simRunning ? 'Pause' : finished ? 'Replay day' : 'Play delivery day'}
            onClick={simRunning ? pauseDay : playDay}
            strong
          />
          <PanelButton Icon={SkipForward} label="Next" onClick={nextStep} narrow />
        </div>
      ) : (
        <div className="mb-2">
          <PanelButton
            Icon={ShoppingBasket}
            label="Place a demo order"
            strong
            onClick={() => {
              placeDemoOrder()
              navigate('/confirmed')
            }}
          />
        </div>
      )}
      <p className="mb-3 text-[11px] font-medium leading-snug text-on-dark-muted">
        Harvest, packing and courier in about 25 seconds. The live map opens by itself when a
        rider sets off.
      </p>

      {/* --- Buyer -------------------------------------------------------------- */}
      <Label>Buyer</Label>
      <div className="mb-3 flex gap-1.5">
        <PanelToggle
          active={member}
          onClick={() => setMember(!member)}
          Icon={Sprout}
          label={member ? 'Direct Plus: on' : 'Direct Plus: off'}
        />
        <PanelToggle
          active={false}
          onClick={() => {
            fillDemoBasket()
            navigate('/basket')
          }}
          Icon={ShoppingBasket}
          label="Fill basket"
        />
      </div>

      {/* --- Jumps ----------------------------------------------------------------- */}
      <Label>Jump to</Label>
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          <PanelButton
            Icon={CircleCheckBig}
            label="Salamat!"
            onClick={() => {
              if (!order) placeDemoOrder()
              navigate('/confirmed')
            }}
          />
          <PanelButton Icon={Tractor} label="Seller" onClick={() => navigate('/seller')} />
        </div>
        {canRide && (
          <PanelButton
            Icon={Navigation}
            label="Rider on the way"
            onClick={() => {
              const moved = jumpTo('onTheWay')
              const riding = moved.shipments.find((s) => s.mode === 'delivery')
              if (riding) navigate(`/track/${riding.id}`)
            }}
          />
        )}
        {canPickup && (
          <PanelButton
            Icon={PackageCheck}
            label="Ready for pickup"
            accent
            onClick={() => {
              const moved = jumpTo('ready')
              const waiting = moved.shipments.find((s) => s.mode === 'pickup')
              if (waiting) navigate(`/ready/${waiting.id}`)
            }}
          />
        )}
        <PanelButton
          Icon={RotateCcw}
          label="Reset everything"
          onClick={() => {
            resetDemo()
            navigate('/')
          }}
        />
      </div>

      <p className="mt-3 border-t border-on-dark/10 pt-2.5 text-[11px] font-medium leading-snug text-on-dark-muted">
        <span className="font-bold text-on-dark">D</span> controls &middot;{' '}
        <span className="font-bold text-on-dark">S</span> save screenshot
      </p>
    </aside>
  )
}

function Label({ children }: { children: string }) {
  return (
    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-on-dark-muted">{children}</p>
  )
}

function PanelToggle({
  active,
  onClick,
  Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  Icon: LucideIcon
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-1 rounded-md px-1 py-2.5 text-[11px] font-bold transition-colors ${
        active ? 'bg-secondary text-on-secondary' : 'bg-on-dark/10 text-on-dark-muted hover:bg-on-dark/15'
      }`}
    >
      <Icon size={17} strokeWidth={2.4} />
      {label}
    </button>
  )
}

function PanelButton({
  Icon,
  label,
  onClick,
  accent = false,
  strong = false,
  narrow = false,
}: {
  Icon: LucideIcon
  label: string
  onClick: () => void
  accent?: boolean
  strong?: boolean
  narrow?: boolean
}) {
  const tone = accent
    ? 'bg-accent text-on-accent'
    : strong
      ? 'bg-secondary text-on-secondary'
      : 'bg-on-dark/10 text-on-dark hover:bg-on-dark/15'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-bold transition-colors ${
        narrow ? 'shrink-0' : 'w-full flex-1'
      } ${tone}`}
    >
      <Icon size={16} strokeWidth={2.5} />
      {label}
    </button>
  )
}

/* The small hint that sits beside the phone during a live demo. */
export function DemoHint() {
  return (
    <div className="fixed bottom-5 right-5 z-[1900] flex items-center gap-2 rounded-md bg-panel/85 px-3 py-2 text-[12px] font-semibold text-on-dark-muted backdrop-blur">
      Press <Key>D</Key> for demo controls <span className="opacity-40">|</span>
      <Key>S</Key> to save a screenshot
    </div>
  )
}

/* --- Screenshot status ------------------------------------------------------ */

export type ShotStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; file: string }
  | { kind: 'failed' }

/* Shown beside the phone, never inside it, so it is not in the image. */
export function ShotToast({ status }: { status: ShotStatus }) {
  if (status.kind === 'idle') return null

  const { Icon, text } =
    status.kind === 'saving'
      ? { Icon: Camera, text: 'Saving screenshot...' }
      : status.kind === 'saved'
        ? { Icon: CircleCheckBig, text: `Saved ${status.file}` }
        : { Icon: CircleAlert, text: 'Could not save the screenshot' }

  return (
    <div
      role="status"
      className="animate-sheet-up fixed left-1/2 top-5 z-[2100] flex -translate-x-1/2 items-center gap-2 rounded-md bg-panel px-3.5 py-2.5 text-[13px] font-semibold text-on-dark shadow-float"
    >
      <Icon size={16} strokeWidth={2.4} />
      {text}
    </div>
  )
}

function Key({ children }: { children: string }) {
  return (
    <span className="rounded-[5px] bg-on-dark/15 px-1.5 py-[1px] font-extrabold text-on-dark">{children}</span>
  )
}
