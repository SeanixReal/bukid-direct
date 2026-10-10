import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronRight,
  Heart,
  Languages,
  MapPin,
  Sprout,
  Store,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Screen } from '../components/Screen'
import { Wordmark } from '../components/Logo'
import { Avatar, ModeSwitch, PlusTag, Segmented } from '../components/ui'
import { useApp } from '../state/AppState'
import { brand, languages, notifyChannels, peso, plusPlan, user } from '../data/sample'

export function Account() {
  const navigate = useNavigate()
  const { member, welcomeLeft, profile, updateProfile, favorites, prefMode, setPrefMode, showToast } = useApp()

  return (
    <Screen nav>
      <div className="px-5 pb-6 pt-2">
        {/* ---------------- Who ---------------- */}
        <div className="flex items-center gap-4">
          <Avatar initials={user.initials} size={68} tone="primary" />
          <div className="min-w-0">
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-ink">
              {user.fullName}
            </h1>
            <p className="text-[15px] font-semibold text-ink-muted">{user.address.area}</p>
            <p className="text-[13px] font-semibold text-ink-faint">{user.since}</p>
          </div>
        </div>

        {/* ---------------- Direct Plus ---------------- */}
        {member ? (
          <div className="mt-5 flex items-center gap-3.5 rounded-card border border-line bg-card p-4 shadow-card">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-soft text-primary">
              <Sprout size={23} strokeWidth={2.3} />
            </span>
            <div className="min-w-0 flex-1">
              <PlusTag label="Member" />
              <p className="mt-1 text-[15px] font-semibold leading-snug text-ink">
                {welcomeLeft && 'Your first delivery is free. '}Renews next month for{' '}
                {peso(plusPlan.price)}.
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate('/plus')}
            className="tappable bg-grad-brand mt-5 flex w-full items-center gap-3.5 rounded-card p-4 text-left shadow-card"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-on-dark/15 text-on-dark">
              <Sprout size={23} strokeWidth={2.3} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-extrabold text-on-dark">Join {plusPlan.name}</span>
              <span className="block text-[14px] font-semibold text-on-dark-muted">
                No service fee · free first delivery
              </span>
            </span>
            <ChevronRight size={20} strokeWidth={2.6} className="shrink-0 text-on-dark" />
          </button>
        )}

        {/* ---------------- Settings ---------------- */}
        <div className="mt-5 divide-y divide-line rounded-card border border-line bg-card px-4 shadow-card">
          <Row
            Icon={MapPin}
            label="Delivery address"
            onClick={() => showToast('Address book is not part of this prototype')}
            value={`${user.address.label} · ${user.address.street}`}
          />
          <Row Icon={Store} label="Usually">
            <ModeSwitch value={prefMode} onChange={setPrefMode} />
          </Row>
          <Row Icon={Bell} label="Order updates">
            <Segmented
              options={notifyChannels}
              value={profile.channel}
              onChange={(channel) => updateProfile({ channel })}
            />
          </Row>
          <Row Icon={Languages} label="Language">
            <Segmented
              options={languages}
              value={profile.language}
              onChange={(language) => updateProfile({ language })}
            />
          </Row>
          <Row Icon={Wallet} label="Payment" value="GCash" />
          <Row
            Icon={Heart}
            label="Saved produce"
            value={favorites.length ? `${favorites.length} saved` : 'None yet'}
          />
        </div>

        {/* ---------------- The other side ---------------- */}
        <button
          type="button"
          onClick={() => navigate('/seller')}
          className="tappable mt-3 flex w-full items-center gap-3.5 rounded-card border border-line bg-card p-4 text-left shadow-card"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <Store size={23} strokeWidth={2.2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-bold text-ink">Sell on {brand.name}</span>
            <span className="block text-[14px] font-medium text-ink-muted">
              The Seller Center, as Nong Romy sees it
            </span>
          </span>
          <ChevronRight size={20} strokeWidth={2.6} className="shrink-0 text-ink-faint" />
        </button>

        {/* ---------------- About ---------------- */}
        <div className="mt-8 flex flex-col items-center text-center">
          <Wordmark size={20} />
          <p className="mt-2 text-[14px] font-semibold text-ink-muted">{brand.tagline}</p>
          <p className="mt-1 text-[12px] font-medium text-ink-faint">
            Interface prototype · stalls, prices and people are made up
          </p>
        </div>
      </div>
    </Screen>
  )
}

function Row({
  Icon,
  label,
  value,
  onClick,
  children,
}: {
  Icon: LucideIcon
  label: string
  value?: string
  onClick?: () => void
  children?: ReactNode
}) {
  const head = (
    <span className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
        <Icon size={19} strokeWidth={2.3} />
      </span>
      <span className="min-w-0 flex-1 text-[16px] font-bold text-ink">{label}</span>
      {value && <span className="shrink-0 text-[15px] font-semibold text-ink-muted">{value}</span>}
      {onClick && <ChevronRight size={19} strokeWidth={2.6} className="shrink-0 text-ink-faint" />}
    </span>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="tappable block w-full py-3.5 text-left">
        {head}
      </button>
    )
  }
  return (
    <div className="py-3.5">
      {head}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
