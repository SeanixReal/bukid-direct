/* --------------------------------------------------------------------------
   THE BUKID DIRECT LOGO
   A location pin with a two-leaf sprout cut out of it. One colour only: the
   sprout is a hole, so the mark works on any background - green on light
   screens, white on green or dark ones.

   Nothing else in the app draws the logo. `npm run export:brand` reads the
   two paths below straight out of this file and writes public/logo.svg and
   everything in brand/, so after changing the mark, re-run it.
   -------------------------------------------------------------------------- */

import { useId } from 'react'

/* Drawn on a 48 x 48 grid. Flat shapes only, sized to stay legible at 24px:
   the leaves are chunky and the ring of pin around them never gets thinner
   than about 1.5px at that size. */
export const MARK_PIN =
  'M24 3C14.89 3 7.5 10.39 7.5 19.5C7.5 30.6 19.3 41.2 22.4 44A2.4 2.4 0 0 0 25.6 44C28.7 41.2 40.5 30.6 40.5 19.5C40.5 10.39 33.11 3 24 3Z'
export const MARK_SPROUT =
  'M22.27 32.52V24.74C19.14 23.88 13.86 20.65 12.57 15.55C18.12 14.6 21.72 19.61 24 22.15C25.97 18.8 28.83 12.41 35.23 12.21C34.95 18.17 29.5 22.67 25.73 24.31V32.52A1.73 1.73 0 0 1 22.27 32.52Z'

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

export function Logo({ size = 48, className, title = 'Bukid Direct' }: LogoProps) {
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
      {/* evenodd turns the sprout into a hole in the pin. */}
      <path fill="currentColor" fillRule="evenodd" d={`${MARK_PIN} ${MARK_SPROUT}`} />
    </svg>
  )
}

/* --------------------------------------------------------------------------
   Wordmark: "Bukid" in bold, "Direct" in regular weight, both in the same
   colour as the mark. `size` is the type size in px; the mark scales with it.
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
      className={`whitespace-nowrap leading-none tracking-[-0.02em] ${className}`}
      style={{ fontSize: size }}
    >
      <span className="font-extrabold">Bukid</span>
      <span className="font-normal"> Direct</span>
    </span>
  )
}
