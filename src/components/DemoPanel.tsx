import { useNavigate } from 'react-router-dom'
import {
  Camera,
  CircleAlert,
  CircleCheckBig,
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
import { READY_STAGE, useApp } from '../state/AppState'
import { orderStages } from '../data/sample'

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
    playOrderDay,
    pauseOrderDay,
    nextStage,
    setStage,
    member,
    setMember,
    fillDemoBasket,
    resetDemo,
  } = useApp()

  const stage = order ? orderStages[order.stage] : null

  const ensureOrder = () => order ?? placeDemoOrder()

  return (
    <aside className="animate-sheet-up fixed bottom-5 right-5 z-[2000] w-[288px] rounded-card bg-panel p-4 text-on-dark shadow-float">
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

      {/* --- Order day ------------------------------------------------------ */}
      <Label>Order day</Label>
      <div className="mb-2 rounded-md bg-on-dark/8 p-2.5">
        <p className="text-[12px] font-bold text-on-dark">
          {order ? `${order.id} · ${stage?.label}` : 'No order placed yet'}
        </p>
        <div className="mt-2 flex gap-1">
          {orderStages.map((s, i) => (
            <span
              key={s.id}
              className={`h-[5px] flex-1 rounded-full ${
                !order || i > order.stage
                  ? 'bg-on-dark/15'
                  : s.id === 'ready'
                    ? 'bg-accent'
                    : 'bg-secondary'
              }`}
            />
          ))}
        </div>
      </div>

      {order ? (
        <div className="mb-2 flex gap-1.5">
          <PanelButton
            Icon={simRunning ? Pause : Play}
            label={simRunning ? 'Pause' : order.stage >= READY_STAGE ? 'Replay day' : 'Play order day'}
            onClick={simRunning ? pauseOrderDay : playOrderDay}
            strong
          />
          <PanelButton Icon={SkipForward} label="Next" onClick={nextStage} narrow />
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
        Walks the order from harvest to the hub in about 15 seconds. When it is ready, the
        pickup screen takes over by itself.
      </p>

      {/* --- Buyer ------------------------------------------------------------ */}
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

      {/* --- Jumps -------------------------------------------------------------- */}
      <Label>Jump to</Label>
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          <PanelButton
            Icon={CircleCheckBig}
            label="Salamat!"
            onClick={() => {
              ensureOrder()
              navigate('/confirmed')
            }}
          />
          <PanelButton Icon={Tractor} label="Farmer view" onClick={() => navigate('/farmer')} />
        </div>
        <PanelButton
          Icon={PackageCheck}
          label="Ready for pickup"
          accent
          onClick={() => {
            ensureOrder()
            setStage(READY_STAGE)
            navigate('/ready')
          }}
        />
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
    <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-on-dark-muted">
      {children}
    </p>
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
        active
          ? 'bg-secondary text-on-secondary'
          : 'bg-on-dark/10 text-on-dark-muted hover:bg-on-dark/15'
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
    <span className="rounded-[5px] bg-on-dark/15 px-1.5 py-[1px] font-extrabold text-on-dark">
      {children}
    </span>
  )
}
