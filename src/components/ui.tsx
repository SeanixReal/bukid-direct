import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Minus, PackageCheck, Plus, Sprout, Star, Store, Sunrise, Truck } from 'lucide-react'
import type { Mode } from '../data/sample'

/* --------------------------------------------------------------------------
   Small shared pieces: cards, buttons, chips, badges, steppers.

   Colour rules these pieces enforce:
     - primary green  : the ONE main button on a screen
     - secondary green: category chips and highlights
     - orange accent  : ONLY "Ready for pickup" and "Fresh today"
     - red            : only errors and "Out of stock"
   -------------------------------------------------------------------------- */

export function Card({
  children,
  className = '',
  as = 'div',
  ...rest
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'button'
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = 'block w-full rounded-card border border-line bg-card p-4 text-left shadow-card'
  if (as === 'button') {
    return (
      <button type="button" className={`tappable ${base} ${className}`} {...rest}>
        {children}
      </button>
    )
  }
  return <div className={`${base} ${className}`}>{children}</div>
}

/* --- Buttons ---------------------------------------------------------------- */

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'white'
  | 'onAccent'
  | 'outlineOnAccent'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover shadow-card',
  secondary: 'bg-primary-soft text-primary',
  ghost: 'bg-surface text-ink',
  outline: 'bg-card text-ink ring-1 ring-inset ring-line',
  white: 'bg-card text-primary shadow-card',
  onAccent: 'bg-on-accent text-on-dark shadow-card',
  outlineOnAccent: 'bg-transparent text-on-accent ring-2 ring-inset ring-on-accent/30',
}

export function Button({
  children,
  variant = 'primary',
  size = 'lg',
  className = '',
  ...rest
}: {
  children: ReactNode
  variant?: ButtonVariant
  size?: 'lg' | 'md' | 'sm'
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizing = {
    lg: 'h-[56px] px-6 text-[17px]',
    md: 'h-[46px] px-5 text-[15px]',
    sm: 'h-[38px] px-4 text-[14px]',
  }[size]
  return (
    <button
      type="button"
      className={`tappable inline-flex w-full items-center justify-center gap-2 rounded-pill font-bold tracking-tight disabled:opacity-45 ${sizing} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* --- Category chip (pill) ---------------------------------------------------- */

export function Chip({
  active,
  children,
  onClick,
  className = '',
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tappable flex h-[42px] shrink-0 items-center gap-1.5 rounded-pill px-[18px] text-[14px] font-bold ${
        active
          ? 'bg-secondary text-on-secondary shadow-card'
          : 'bg-card text-ink-muted ring-1 ring-inset ring-line'
      } ${className}`}
    >
      {children}
    </button>
  )
}

/* --- Badges ------------------------------------------------------------------ */

const badgeSize = {
  sm: 'h-[24px] gap-1 px-2.5 text-[11.5px]',
  md: 'h-[30px] gap-1.5 px-3 text-[13px]',
}

/** "Fresh today" - picked or laid today. A quiet white pill with an
    orange sunrise: one of the two places the accent is allowed. */
export function FreshBadge({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-pill bg-card font-bold text-ink shadow-card ${badgeSize[size]} ${className}`}
    >
      <Sunrise size={size === 'sm' ? 13 : 15} strokeWidth={2.6} className="text-accent-strong" />
      Fresh today
    </span>
  )
}

/** Orange: the other place the accent is allowed. */
export function ReadyBadge({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-pill bg-accent font-extrabold text-on-accent ${badgeSize[size]} ${className}`}
    >
      <PackageCheck size={size === 'sm' ? 13 : 15} strokeWidth={2.6} />
      Ready for pickup
    </span>
  )
}

export function SoldOutBadge({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-pill bg-danger font-extrabold text-on-danger ${badgeSize[size]} ${className}`}
    >
      Out of stock
    </span>
  )
}

/** Marks member prices and Direct Plus perks. */
export function PlusTag({ className = '', label = 'Direct Plus' }: { className?: string; label?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-pill bg-secondary-soft px-2.5 py-[3px] text-[12px] font-extrabold text-primary ${className}`}
    >
      <Sprout size={13} strokeWidth={2.8} />
      {label}
    </span>
  )
}

/* --- Quantity stepper ---------------------------------------------------------- */

export function Stepper({
  label,
  onDec,
  onInc,
  size = 'md',
  decLabel = 'Less',
  incLabel = 'More',
  className = '',
}: {
  label: string
  onDec: () => void
  onInc: () => void
  size?: 'sm' | 'md'
  decLabel?: string
  incLabel?: string
  className?: string
}) {
  const btn = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11'
  const icon = size === 'sm' ? 16 : 19
  return (
    <div
      className={`inline-flex items-center rounded-pill bg-card p-1 shadow-card ring-1 ring-inset ring-line ${className}`}
    >
      <button
        type="button"
        onClick={onDec}
        aria-label={decLabel}
        className={`tappable flex items-center justify-center rounded-full bg-primary-soft text-primary ${btn}`}
      >
        <Minus size={icon} strokeWidth={2.8} />
      </button>
      <span
        className={`tabular min-w-[56px] px-1.5 text-center font-extrabold text-ink ${
          size === 'sm' ? 'text-[13px]' : 'text-[16px]'
        }`}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={onInc}
        aria-label={incLabel}
        className={`tappable flex items-center justify-center rounded-full bg-primary-soft text-primary ${btn}`}
      >
        <Plus size={icon} strokeWidth={2.8} />
      </button>
    </div>
  )
}

/* --- People ------------------------------------------------------------------- */

export function Avatar({
  initials,
  size = 44,
  tone = 'leaf',
  className = '',
}: {
  initials: string
  size?: number
  tone?: 'leaf' | 'primary' | 'onGreen'
  className?: string
}) {
  const tones = {
    leaf: 'bg-secondary-soft text-primary ring-1 ring-inset ring-line',
    primary: 'bg-primary text-on-primary',
    onGreen: 'bg-card text-primary',
  }
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-extrabold tracking-tight ${tones[tone]} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initials}
    </span>
  )
}

/* --- Segmented control (settings) ---------------------------------------------- */

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}) {
  return (
    <div className="flex rounded-pill bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          aria-pressed={o.id === value}
          className={`tappable h-9 flex-1 rounded-pill text-[14px] font-bold ${
            o.id === value ? 'bg-card text-primary shadow-card' : 'text-ink-muted'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* --- Delivery / Pick-up switch, like Grab and foodpanda ------------------------ */

export function ModeSwitch({
  value,
  onChange,
  size = 'md',
  className = '',
}: {
  value: Mode
  onChange: (mode: Mode) => void
  size?: 'sm' | 'md'
  className?: string
}) {
  const options: { id: Mode; label: string; Icon: typeof Truck }[] = [
    { id: 'delivery', label: 'Delivery', Icon: Truck },
    { id: 'pickup', label: 'Pick-up', Icon: Store },
  ]
  const sm = size === 'sm'
  return (
    <div className={`flex rounded-pill bg-surface p-1 ${className}`} role="group" aria-label="Delivery or pick-up">
      {options.map(({ id, label, Icon }) => {
        const active = id === value
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={`tappable flex flex-1 items-center justify-center gap-1.5 rounded-pill font-bold ${
              sm ? 'h-8 px-3 text-[13px]' : 'h-10 text-[15px]'
            } ${active ? 'bg-card text-primary shadow-card' : 'text-ink-muted'}`}
          >
            <Icon size={sm ? 14 : 17} strokeWidth={2.5} />
            {label}
          </button>
        )
      })}
    </div>
  )
}

/* --- Rating ---------------------------------------------------------------------- */

export function Rating({ value, count, className = '' }: { value: number; count?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${className}`}>
      <Star size={14} strokeWidth={0} fill="currentColor" className="text-primary" />
      <span className="text-ink">{value.toFixed(1)}</span>
      {count !== undefined && <span className="font-semibold text-ink-muted">({count})</span>}
    </span>
  )
}

/* --- Rows ---------------------------------------------------------------------- */

/** Label on the left, value on the right - used for order sums. */
export function SumRow({
  label,
  value,
  strong = false,
  tone = 'ink',
}: {
  label: ReactNode
  value: ReactNode
  strong?: boolean
  tone?: 'ink' | 'primary'
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-3 ${
        strong ? 'text-[18px] font-extrabold' : 'text-[15px] font-semibold'
      } ${tone === 'primary' ? 'text-primary' : strong ? 'text-ink' : 'text-ink-muted'}`}
    >
      <span>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  )
}
