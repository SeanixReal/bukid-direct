/* --------------------------------------------------------------------------
   THE PRESGO LOGO
   A location pin with a market stall cut out of it. One colour only: the
   stall is a hole, so the mark works on any background - green on light
   screens, white on green or dark ones.

   Nothing else in the app draws the logo. `npm run export:brand` reads the
   two paths below straight out of this file and writes public/logo.svg and
   everything in brand/, so after changing the mark, re-run it.
   -------------------------------------------------------------------------- */

import { useId } from 'react'

/* Drawn on a 48 x 48 grid. Flat shapes only, sized to stay legible at 24px:
   three tapered awning panels and an open counter represent market vendors, including
   fishers. The pin, proportions and inherited brand colours stay the same. */
export const MARK_PIN =
  'M24 3C14.89 3 7.5 10.39 7.5 19.5C7.5 30.6 19.3 41.2 22.4 44A2.4 2.4 0 0 0 25.6 44C28.7 41.2 40.5 30.6 40.5 19.5C40.5 10.39 33.11 3 24 3Z'
export const MARK_MARKET =
  'M16.5 12H20.5L19 18.5C19 20.16 17.66 21.5 16 21.5C14.34 21.5 13 20.16 13 18.5L16.5 12Z M22.5 12H25.5L27 18.5C27 20.16 25.66 21.5 24 21.5C22.34 21.5 21 20.16 21 18.5L22.5 12Z M27.5 12H31.5L35 18.5C35 20.16 33.66 21.5 32 21.5C30.34 21.5 29 20.16 29 18.5L27.5 12Z M15.5 22.5H18.5V28H29.5V22.5H32.5V29C32.5 30.38 31.38 31.5 30 31.5H18C16.62 31.5 15.5 30.38 15.5 29Z'

/* Tight box around the pin, so the mark lines up with text beside it. */
export const MARK_BOX = { x: 6.5, y: 2, w: 35, h: 43.6 }
export const MARK_RATIO = MARK_BOX.w / MARK_BOX.h

interface LogoProps {
  /* Height in px. The width follows the pin's proportions. */
  size?: number
  /* Colour comes from the text colour: text-primary, text-on-dark, ... */
  className?: string
  title?: string
}

export function Logo({ size = 48, className, title = 'PresGo' }: LogoProps) {
  const titleId = useId()
  return (
    <svg
      width={Math.round(size * MARK_RATIO * 10) / 10}
      height={size}
      viewBox={`${MARK_BOX.x} ${MARK_BOX.y} ${MARK_BOX.w} ${MARK_BOX.h}`}
      role="img"
      aria-labelledby={titleId}
      className={className}
    >
      <title id={titleId}>{title}</title>
      {/* evenodd turns the market stall into a hole in the pin. */}
      <path fill="currentColor" fillRule="evenodd" d={`${MARK_PIN} ${MARK_MARKET}`} />
    </svg>
  )
}

/* --------------------------------------------------------------------------
   Wordmark: "PresGo" in ExtraBold, in the same colour as the mark - as on
   the pitch deck. `size` is the type size in px; the mark scales with it.
   -------------------------------------------------------------------------- */

export function Wordmark({
  size = 20,
  tone = 'dark',
  stacked = false,
  className = '',
}: {
  size?: number
  /* "dark" = green, for light backgrounds. "light" = white, for green ones. */
  tone?: 'dark' | 'light'
  stacked?: boolean
  className?: string
}) {
  const color = tone === 'light' ? 'text-on-dark' : 'text-primary'

  if (stacked) {
    return (
      <div className={`flex flex-col items-center ${color} ${className}`}>
        <Logo size={size * 2.5} />
        <WordmarkText size={size} className="mt-[0.45em]" />
      </div>
    )
  }

  return (
    <div className={`flex items-center ${color} ${className}`} style={{ gap: size * 0.38 }}>
      <Logo size={size * 1.42} />
      <WordmarkText size={size} />
    </div>
  )
}

function WordmarkText({ size, className = '' }: { size: number; className?: string }) {
  return (
    <span
      className={`whitespace-nowrap font-extrabold leading-none tracking-[-0.02em] ${className}`}
      style={{ fontSize: size }}
    >
      PresGo
    </span>
  )
}
