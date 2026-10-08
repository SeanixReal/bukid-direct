import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigation2 } from 'lucide-react'
import { roadAttribution, roads } from '../data/roads'
import { splitAt } from '../data/route'
import type { LatLng } from '../data/sample'
import { MARK_BOX, MARK_PIN, MARK_SPROUT } from './Logo'

/* --------------------------------------------------------------------------
   The city map.

   Real Cebu City streets (src/data/roads.geojson) drawn as plain SVG lines.
   There are no map tiles, so it looks the same with the Wi-Fi off - and
   stays green and white instead of the blues of a normal street map.

   It frames `frame` inside `padding`, so overlays such as a header or a
   bottom sheet never cover what matters, and can draw a route with a rider
   part-way along it, brand-mark pins and the buyer's "You" dot.
   -------------------------------------------------------------------------- */

type Kind = 'tertiary' | 'secondary' | 'primary'

interface Pad {
  top: number
  right: number
  bottom: number
  left: number
}

export interface MapMarker {
  id: string
  at: LatLng
  kind: 'home' | 'pin'
  label?: string
  onClick?: () => void
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
  /* Longitude degrees are shorter than latitude degrees by cos(latitude);
     without this the city looks stretched. */
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

function toPath(points: LatLng[], project: (p: LatLng) => [number, number]) {
  return points
    .map((p, i) => {
      const [x, y] = project(p)
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join('')
}

export function CityMap({
  frame,
  padding,
  route,
  progress,
  markers = [],
  className = '',
  attributionClassName = 'bottom-1.5 right-2',
}: {
  frame: LatLng[]
  padding?: Partial<Pad>
  route?: LatLng[]
  /* 0 to 1 along `route`: draws the rider there and fades the part behind. */
  progress?: number
  markers?: MapMarker[]
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

  const pad: Pad = { top: 48, right: 40, bottom: 40, left: 40, ...padding }
  const frameKey = `${size.w}x${size.h}|${frame.map((p) => p.join(',')).join(';')}|${pad.top},${pad.right},${pad.bottom},${pad.left}`

  const project = useMemo(
    () => makeProjection(frame, size.w, size.h, pad),
    // frameKey captures every input that changes the framing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [frameKey],
  )

  const streets = useMemo(() => {
    const d: Record<Kind, string> = { tertiary: '', secondary: '', primary: '' }
    for (const road of roads) {
      for (const part of road.geometry.coordinates) {
        d[road.properties.kind] += toPath(
          part.map(([lng, lat]) => [lat, lng] as LatLng),
          project,
        )
      }
    }
    return d
  }, [project])

  const rider = route && progress !== undefined ? splitAt(route, progress) : null
  const fullRoute = useMemo(() => (route ? toPath(route, project) : ''), [route, project])

  return (
    <div ref={box} className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {size.w > 0 && (
        <>
          <svg width={size.w} height={size.h} className="absolute inset-0" aria-hidden>
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {KINDS.map((k) => (
                <path
                  key={`c-${k}`}
                  d={streets[k]}
                  style={{ stroke: 'color-mix(in srgb, var(--ink-faint) 38%, var(--surface-2))' }}
                  strokeWidth={ROAD_WIDTH[k] + 2.6}
                />
              ))}
              {KINDS.map((k) => (
                <path key={`f-${k}`} d={streets[k]} stroke="var(--card)" strokeWidth={ROAD_WIDTH[k]} />
              ))}

              {route && (
                <>
                  <path d={fullRoute} stroke="var(--card)" strokeWidth={10} />
                  <path
                    d={fullRoute}
                    stroke="var(--primary)"
                    strokeWidth={5}
                    opacity={rider ? 0.3 : 1}
                  />
                  {rider && (
                    <path d={toPath(rider.rest, project)} stroke="var(--primary)" strokeWidth={5} />
                  )}
                </>
              )}
            </g>
          </svg>

          {markers.map((m) => {
            const [x, y] = project(m.at)
            return m.kind === 'home' ? (
              <YouDot key={m.id} x={x} y={y} label={m.label ?? 'You'} />
            ) : (
              <div key={m.id} className="absolute z-[2]" style={{ left: x, top: y }}>
                <button
                  type="button"
                  onClick={m.onClick}
                  disabled={!m.onClick}
                  aria-label={m.label}
                  className="absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center"
                >
                  {m.label && (
                    <span className="mb-1 whitespace-nowrap rounded-pill bg-ink px-2.5 py-1 text-[12px] font-extrabold text-on-dark shadow-card">
                      {m.label}
                    </span>
                  )}
                  <PinGlyph height={38} />
                </button>
              </div>
            )
          })}

          {rider && <RiderDot at={project(rider.at)} heading={rider.heading} />}
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
   stands off the streets. The tip sits on the spot. */
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

function YouDot({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <span className="absolute z-[1]" style={{ left: x, top: y }}>
      <span className="animate-halo absolute -left-[15px] -top-[15px] h-[30px] w-[30px] rounded-full bg-ink/20" />
      <span className="absolute -left-[8px] -top-[8px] h-[16px] w-[16px] rounded-full bg-ink shadow-card ring-[3px] ring-card" />
      <span className="absolute left-0 top-[11px] -translate-x-1/2 whitespace-nowrap rounded-pill bg-card px-2 py-[2px] text-[11px] font-extrabold text-ink shadow-card">
        {label}
      </span>
    </span>
  )
}

/* The courier, as an arrow pointing the way it is going. Moves smoothly
   between clock ticks. */
function RiderDot({ at: [x, y], heading }: { at: [number, number]; heading: number }) {
  return (
    <span
      className="absolute z-[3] transition-[left,top] duration-200 ease-linear"
      style={{ left: x, top: y }}
    >
      <span className="animate-halo absolute -left-[24px] -top-[24px] h-[48px] w-[48px] rounded-full bg-primary/25" />
      <span className="absolute -left-[19px] -top-[19px] flex h-[38px] w-[38px] items-center justify-center rounded-full bg-primary text-on-primary shadow-float ring-[3px] ring-card">
        <Navigation2
          size={19}
          strokeWidth={2.6}
          fill="currentColor"
          style={{ transform: `rotate(${heading}deg)` }}
        />
      </span>
    </span>
  )
}
