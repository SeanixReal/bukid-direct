import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, MapPin, Navigation, type LucideIcon } from 'lucide-react'
import { Screen } from '../components/Screen'
import { HubMap } from '../components/HubMap'
import { Button, Chip } from '../components/ui'
import { useApp } from '../state/AppState'
import { distanceKm, distanceText, getHub, hubs } from '../data/sample'

export function Hubs() {
  const navigate = useNavigate()
  const { hubId, setHubId, showToast } = useApp()
  const [selected, setSelected] = useState(hubId)
  const hub = getHub(selected)
  const mine = selected === hubId

  return (
    <Screen nav scroll={false}>
      <div className="shrink-0 px-5 pb-3 pt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink">Pickup Hubs</h1>
        <p className="text-[15px] font-semibold text-ink-muted">
          {hubs.length} hubs across Cebu City · open daily, {hubs[0].hours}
        </p>
      </div>

      <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-5 pb-3">
        {hubs.map((h) => (
          <Chip key={h.id} active={h.id === selected} onClick={() => setSelected(h.id)}>
            {h.area}
          </Chip>
        ))}
      </div>

      <div className="relative min-h-0 flex-1 border-t border-line">
        <div className="absolute inset-0">
          <HubMap
            selectedId={selected}
            myHubId={hubId}
            onSelect={setSelected}
            padding={{ top: 72, right: 44, bottom: 236, left: 44 }}
            className="h-full w-full"
            attributionClassName="top-2 right-2"
          />
        </div>

        {/* The selected hub, as a sheet over the bottom of the map */}
        <div
          key={selected}
          className="animate-sheet-up absolute inset-x-3 bottom-3 z-10 rounded-card bg-card p-4 shadow-float"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <MapPin size={22} strokeWidth={2.4} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-extrabold tracking-tight text-ink">{hub.name}</h2>
                {mine && (
                  <span className="rounded-pill bg-primary-soft px-2.5 py-[3px] text-[12px] font-extrabold text-primary">
                    Your hub
                  </span>
                )}
              </div>
              <p className="truncate text-[14px] font-semibold text-ink-muted">{hub.host}</p>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Fact Icon={Clock}>Daily, {hub.hours}</Fact>
            <Fact Icon={Navigation}>{distanceText(distanceKm(hub.at))}</Fact>
          </div>

          <div className="mt-3">
            {mine ? (
              <Button variant="secondary" onClick={() => navigate('/shop')}>
                Shop for pickup here
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setHubId(hub.id)
                  showToast(`${hub.name} is now your Pickup Hub`)
                }}
              >
                Make this my hub
              </Button>
            )}
          </div>
        </div>
      </div>
    </Screen>
  )
}

function Fact({ Icon, children }: { Icon: LucideIcon; children: ReactNode }) {
  return (
    <span className="flex flex-1 items-center gap-2 rounded-md bg-surface px-3 py-2.5 text-[14px] font-bold text-ink">
      <Icon size={17} strokeWidth={2.4} className="shrink-0 text-primary" />
      <span className="truncate">{children}</span>
    </span>
  )
}
