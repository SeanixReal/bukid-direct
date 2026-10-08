import { useEffect, useMemo, useRef, useState } from 'react'
import { roadAttribution, roads } from '../data/roads'
import { homeAt, hubs } from '../data/sample'
import { MARK_BOX, MARK_PIN, MARK_SPROUT } from './Logo'

/* --------------------------------------------------------------------------
   The Pickup Hub map.

   Real Cebu City streets (src/data/roads.geojson) drawn as plain SVG lines,
   with a pin for every hub and a dot for "You". There are no map tiles, so
   it looks the same with the Wi-Fi off - and stays green and white instead
   of the blues of a normal street map.

   The view frames the hubs (or just `focusIds`) inside `padding`, so
   overlays such as a header or a bottom sheet never cover a pin.
   -------------------------------------------------------------------------- */

type LatLng = [number, number]
type Kind = 'tertiary' | 'secondary' | 'primary'

interface Pad {
  top: number
  right: number
  bottom: number
  left: number
}

const KINDS: Kind[] = ['tertiary', 'secondary', 'primary']
const ROAD_WIDTH: Record<Kind, number> = { tertiary: 2.4, secondary: 3.6, primary: 5.2 }

/* Closest the map will zoom in, in degrees (about 1.3 km). */
const MIN_SPAN = 0.012

function makeProjection(points: LatLng[], w: number, h: number, pad: Pad) {
  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity
  for (const [lat, lng] of points) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }
  const lat0 = (minLat + maxLat) / 2
  const lng0 = (minLng + maxLng) / 2
  /* Longitude degrees are shorter than latitude degrees this close to the
     equator by cos(latitude); without this the city looks stretched. */
  const kx = Math.cos((lat0 * Math.PI) / 180)
  const spanX = Math.max(maxLng - minLng, MIN_SPAN) * kx
  const spanY = Math.max(maxLat - minLat, MIN_SPAN)
  const availW = Math.max(w - pad.left - pad.right, 10)
  const availH = Math.max(h - pad.top - pad.bottom, 10)
  const scale = Math.min(availW / spanX, availH / spanY)
  const cx = pad.left + availW / 2
  const cy = pad.top + availH / 2
  return ([lat, lng]: LatLng): [number, number] => [
    cx + (lng - lng0) * kx * scale,
    cy - (lat - lat0) * scale,
  ]
}

function roadPaths(project: (p: LatLng) => [number, number]) {
  const d: Record<Kind, string> = { tertiary: '', secondary: '', primary: '' }
  for (const road of roads) {
    let s = ''
    for (const part of road.geometry.coordinates) {
      part.forEach(([lng, lat], i) => {
        const [x, y] = project([lat, lng])
        s += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
    }
    d[road.properties.kind] += s
  }
  return d
}

export function HubMap({
  selectedId,
  myHubId,
  onSelect,
  focusIds,
  padding,
  showYou = true,
  labels = true,
  compact = false,
  className = '',
  attributionClassName = 'bottom-1.5 right-2',
}: {
  selectedId?: string
  /* The buyer's own hub gets a small "Your hub" tag. */
  myHubId?: string
  onSelect?: (id: string) => void
  /* Frame only these hubs. Defaults to all of them. */
  focusIds?: string[]
  padding?: Partial<Pad>
  showYou?: boolean
  labels?: boolean
  compact?: boolean
  className?: string
  attributionClassName?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const pad: Pad = { top: 64, right: 44, bottom: 44, left: 44, ...padding }
  const focusKey = (focusIds ?? []).join(',')
  const frameKey = `${size.w}x${size.h}|${focusKey}|${pad.top},${pad.right},${pad.bottom},${pad.left}|${showYou}`

  const project = useMemo(() => {
    const framed = (focusIds?.length ? hubs.filter((h) => focusIds.includes(h.id)) : hubs).map(
      (h) => h.at,
    )
    if (showYou) framed.push(homeAt)
    return makeProjection(framed, size.w, size.h, pad)
    // frameKey captures every input that changes the framing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameKey])

  const paths = useMemo(() => roadPaths(project), [project])
  const pinHeight = compact ? 28 : 36

  return (
    <div ref={box} className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {size.w > 0 && (
        <>
          <svg width={size.w} height={size.h} className="absolute inset-0" aria-hidden>
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {KINDS.map((k) => (
                <path
                  key={`c-${k}`}
                  d={paths[k]}
                  style={{ stroke: 'color-mix(in srgb, var(--ink-faint) 38%, var(--surface-2))' }}
                  strokeWidth={ROAD_WIDTH[k] + 2.6}
                />
              ))}
              {KINDS.map((k) => (
                <path key={`f-${k}`} d={paths[k]} stroke="var(--card)" strokeWidth={ROAD_WIDTH[k]} />
              ))}
            </g>
          </svg>

          {showYou && <YouDot at={project(homeAt)} />}

          {hubs.map((hub) => {
            const [x, y] = project(hub.at)
            const selected = hub.id === selectedId
            const mine = hub.id === myHubId
            return (
              <div
                key={hub.id}
                className="absolute"
                style={{ left: x, top: y, zIndex: selected ? 3 : 2 }}
              >
                {selected && (
                  <span className="animate-halo absolute -left-[18px] -top-[10px] h-[20px] w-[36px] rounded-[50%] bg-primary/30" />
                )}
                <button
                  type="button"
                  onClick={() => onSelect?.(hub.id)}
                  aria-label={hub.name}
                  aria-pressed={selected}
                  disabled={!onSelect}
                  className="tappable absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center"
                >
                  {labels && (selected || mine) && (
                    <span
                      className={`mb-1 whitespace-nowrap rounded-pill px-2.5 py-1 text-[12px] font-extrabold shadow-card ${
                        selected ? 'bg-ink text-on-dark' : 'bg-card text-primary'
                      }`}
                    >
                      {selected ? hub.name : 'Your hub'}
                    </span>
                  )}
                  <PinGlyph height={selected ? pinHeight * 1.3 : pinHeight} />
                </button>
              </div>
            )
          })}
        </>
      )}

      <span
        className={`pointer-events-none absolute z-[4] rounded-sm bg-card/85 px-1.5 py-[1px] text-[9px] font-semibold text-ink-faint ${attributionClassName}`}
      >
        {roadAttribution}
      </span>
    </div>
  )
}

/* The logo mark as a map pin: green pin, white sprout, white outline so it
   stands off the streets. The tip sits on the hub's spot. */
function PinGlyph({ height }: { height: number }) {
  const box = { x: MARK_BOX.x - 1.6, y: MARK_BOX.y - 1.6, w: MARK_BOX.w + 3.2, h: MARK_BOX.h + 1.2 }
  return (
    <svg
      width={(height * box.w) / box.h}
      height={height}
      viewBox={`${box.x} ${box.y} ${box.w} ${box.h}`}
      className="overflow-visible"
      style={{ filter: 'drop-shadow(0 3px 3px rgb(var(--shadow-rgb) / 0.28))' }}
    >
      <path d={MARK_PIN} fill="var(--primary)" stroke="var(--card)" strokeWidth={2.6} />
      <path d={MARK_SPROUT} fill="var(--card)" />
    </svg>
  )
}

function YouDot({ at: [x, y] }: { at: [number, number] }) {
  return (
    <span className="absolute z-[1]" style={{ left: x, top: y }}>
      <span className="animate-halo absolute -left-[15px] -top-[15px] h-[30px] w-[30px] rounded-full bg-ink/20" />
      <span className="absolute -left-[8px] -top-[8px] h-[16px] w-[16px] rounded-full bg-ink shadow-card ring-[3px] ring-card" />
      <span className="absolute left-0 top-[11px] -translate-x-1/2 rounded-pill bg-card px-2 py-[2px] text-[11px] font-extrabold text-ink shadow-card">
        You
      </span>
    </span>
  )
}
