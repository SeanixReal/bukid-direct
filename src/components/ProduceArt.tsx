/* --------------------------------------------------------------------------
   Flat produce illustrations - one per product, plus the hills used on the
   splash screen and the farm pages.

   Drawn in code on a 120 x 100 grid, so the pictures stay sharp at any size
   and the demo needs no photos and no internet. Flat shapes only: one fill
   per shape, a darker shade, a soft highlight. Colours come from the
   --art-* and brand tokens in src/theme.css.
   -------------------------------------------------------------------------- */

import type { ReactNode } from 'react'
import type { Product, ProductId, Tint } from '../data/sample'
import { MARK_PIN, MARK_SPROUT } from './Logo'

type P = [number, number]

const rad = (deg: number) => (deg * Math.PI) / 180
const pt = ([x, y]: P) => `${x.toFixed(1)} ${y.toFixed(1)}`

/** Almond leaf from `base`, `len` long and `w` wide, pointing at `deg`
    (0 = right, 90 = down, -90 = up). */
function leaf(base: P, len: number, w: number, deg: number) {
  const dx = Math.cos(rad(deg))
  const dy = Math.sin(rad(deg))
  const tip: P = [base[0] + dx * len, base[1] + dy * len]
  const mid: P = [base[0] + dx * len * 0.5, base[1] + dy * len * 0.5]
  const c1: P = [mid[0] - dy * w, mid[1] + dx * w]
  const c2: P = [mid[0] + dy * w, mid[1] - dx * w]
  return `M${pt(base)}Q${pt(c1)} ${pt(tip)}Q${pt(c2)} ${pt(base)}Z`
}

const C = {
  leaf: 'var(--secondary)',
  leafDark: 'var(--primary)',
  lime: 'var(--art-lime)',
  pale: 'var(--art-pale)',
  shine: 'var(--card)',
  shadow: 'var(--art-shadow)',
}

function Ground({ rx = 40, cy = 88 }: { rx?: number; cy?: number }) {
  return <ellipse cx={60} cy={cy} rx={rx} ry={4.5} fill={C.shadow} />
}

function Shine({ cx, cy, rx, ry, deg = -30 }: { cx: number; cy: number; rx: number; ry: number; deg?: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      transform={`rotate(${deg} ${cx} ${cy})`}
      fill={C.shine}
      opacity={0.4}
    />
  )
}

/* --- Pieces ------------------------------------------------------------------ */

function Tomato({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const top: P = [cx, cy - r * 0.84]
  return (
    <g>
      <ellipse cx={cx + r * 0.1} cy={cy + r * 0.1} rx={r * 1.04} ry={r * 0.92} fill="var(--art-tomato-dark)" />
      <ellipse cx={cx} cy={cy} rx={r * 1.04} ry={r * 0.92} fill="var(--art-tomato)" />
      <Shine cx={cx - r * 0.45} cy={cy - r * 0.32} rx={r * 0.22} ry={r * 0.12} deg={-35} />
      {[150, 195, 30, -15, 90].map((a) => (
        <path key={a} d={leaf(top, r * 0.52, r * 0.3, a)} fill={C.leafDark} />
      ))}
      <path
        d={`M${pt(top)}q0.5 ${-r * 0.2} ${r * 0.14} ${-r * 0.3}`}
        stroke={C.leafDark}
        strokeWidth={r * 0.13}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  )
}

function Carrot({ x, y, deg, s = 1 }: { x: number; y: number; deg: number; s?: number }) {
  const base: P = [0, -1]
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg}) scale(${s})`}>
      <path d={leaf(base, 22, 7, -90)} fill={C.leaf} />
      <path d={leaf(base, 19, 6.5, -118)} fill={C.leafDark} />
      <path d={leaf(base, 19, 6.5, -62)} fill={C.leafDark} />
      <path
        d="M-8.5 0C-8.5 -3.5 8.5 -3.5 8.5 0C8.5 14 3.4 32 0.9 42C0.4 43.6 -0.4 43.6 -0.9 42C-3.4 32 -8.5 14 -8.5 0Z"
        fill="var(--art-carrot)"
      />
      <path
        d="M-6.5 9L-1.5 9.6M2 16.5L6.4 16M-5.2 24L-1.4 24.4M1.2 31L3.6 30.6"
        stroke="var(--art-carrot-dark)"
        strokeWidth={1.7}
        strokeLinecap="round"
      />
      <Shine cx={-4.4} cy={6} rx={1.4} ry={5} deg={-4} />
    </g>
  )
}

function Potato({ cx, cy, rx, ry, deg }: { cx: number; cy: number; rx: number; ry: number; deg: number }) {
  return (
    <g transform={`rotate(${deg} ${cx} ${cy})`}>
      <ellipse cx={cx + 1.4} cy={cy + 1.8} rx={rx} ry={ry} fill="var(--art-potato-dark)" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="var(--art-potato)" />
      <Shine cx={cx - rx * 0.4} cy={cy - ry * 0.45} rx={rx * 0.28} ry={ry * 0.16} deg={-8} />
      <g fill="var(--art-potato-dark)">
        <ellipse cx={cx + rx * 0.35} cy={cy - ry * 0.2} rx={1.6} ry={1.1} />
        <ellipse cx={cx - rx * 0.15} cy={cy + ry * 0.35} rx={1.5} ry={1} />
        <ellipse cx={cx + rx * 0.62} cy={cy + ry * 0.35} rx={1.2} ry={0.9} />
      </g>
    </g>
  )
}

function Mango({ x, y, deg, s = 1, back = false }: { x: number; y: number; deg: number; s?: number; back?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg}) scale(${s})`}>
      <path
        d="M0 -16C16 -18 30 -8 30 6C30 18 18 24 6 22C-10 20 -26 12 -28 0C-30 -10 -16 -15 0 -16Z"
        fill={back ? 'var(--art-yellow-dark)' : 'var(--art-yellow)'}
      />
      {!back && (
        <>
          <path
            d="M30 6C30 18 18 24 6 22C-10 20 -26 12 -28 0C-20 9 -6 14 8 15C18 15.5 26 11 30 6Z"
            fill="var(--art-yellow-dark)"
          />
          <Shine cx={-8} cy={-6} rx={9} ry={3.6} deg={-12} />
        </>
      )}
      <path d="M-19 -12.5L-22 -18" stroke="var(--art-twine)" strokeWidth={3} strokeLinecap="round" />
      <path d={leaf([-21, -17], 20, 9, -160)} fill={C.leafDark} />
    </g>
  )
}

function Egg({ cx, cy, brown }: { cx: number; cy: number; brown?: boolean }) {
  const w = 19
  const h = 25
  const shape = (x: number, y: number) =>
    `M${x} ${y - h / 2}C${x + w * 0.6} ${y - h / 2} ${x + w / 2} ${y + h / 2} ${x} ${y + h / 2}C${x - w / 2} ${y + h / 2} ${x - w * 0.6} ${y - h / 2} ${x} ${y - h / 2}Z`
  return (
    <g>
      <path d={shape(cx + 1.4, cy + 1)} fill={brown ? 'var(--art-twine)' : 'var(--art-sack)'} />
      <path d={shape(cx, cy)} fill={brown ? 'var(--art-brown)' : 'var(--art-cream)'} />
      <Shine cx={cx - 3.6} cy={cy - 3} rx={1.8} ry={4} deg={10} />
    </g>
  )
}

function Banana({ deg }: { deg: number }) {
  return (
    <g transform={`rotate(${deg})`}>
      <path d="M0 -5Q24 -24 46 -15Q51 -13 50 -9Q49 -6 45 -6Q26 -2 2 7Q-3 2 0 -5Z" fill="var(--art-yellow)" />
      <path d="M2 7Q26 -2 45 -6L44.5 -9.5Q26 -6 1.5 2.5Z" fill="var(--art-yellow-dark)" />
      <path d="M46 -15Q51 -13 50 -9Q49 -6 45.5 -6.2Q47.5 -10 46 -15Z" fill="var(--art-twine)" />
    </g>
  )
}

function Calamansi({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx + r * 0.08} cy={cy + r * 0.1} r={r} fill={C.leafDark} />
      <circle cx={cx} cy={cy} r={r} fill={C.leaf} />
      <Shine cx={cx - r * 0.38} cy={cy - r * 0.38} rx={r * 0.26} ry={r * 0.16} deg={-40} />
    </g>
  )
}

function PechayStalk({ deg }: { deg: number }) {
  return (
    <g transform={`rotate(${deg})`}>
      <path d="M-5.5 0C-6.5 -14 -4.5 -26 -3.4 -36L3.4 -36C4.5 -26 6.5 -14 5.5 0Z" fill={C.pale} />
      <path d="M-1 -4L-0.6 -34" stroke={C.shine} strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
      <ellipse cx={0} cy={-52} rx={13.5} ry={21} fill={C.leafDark} />
      <path d="M0 -34L0 -66" stroke={C.leaf} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M0 -44L-6 -50M0 -52L6 -58M0 -56L-5 -61" stroke={C.leaf} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  )
}

/** One malunggay sprig: a thin stem with pairs of small round leaflets. */
function Sprig({ deg, len }: { deg: number; len: number }) {
  const ts = [0.32, 0.46, 0.6, 0.74, 0.88]
  return (
    <g transform={`rotate(${deg})`}>
      <path d={`M0 0Q4 ${-len * 0.5} 0 ${-len}`} stroke={C.leafDark} strokeWidth={2} fill="none" strokeLinecap="round" />
      {ts.map((t, i) => {
        const y = -len * t
        const x = 8 * t * (1 - t)
        return (
          <g key={t}>
            <ellipse cx={x - 6} cy={y + 1} rx={5} ry={3.1} transform={`rotate(-28 ${x - 6} ${y + 1})`} fill={i % 2 ? C.lime : C.leaf} />
            <ellipse cx={x + 6} cy={y + 1} rx={5} ry={3.1} transform={`rotate(28 ${x + 6} ${y + 1})`} fill={i % 2 ? C.leaf : C.lime} />
          </g>
        )
      })}
      <ellipse cx={0} cy={-len - 3} rx={3.1} ry={5} fill={C.leaf} />
    </g>
  )
}

/* --- The pictures ------------------------------------------------------------ */

const ART: Record<ProductId, () => ReactNode> = {
  tomatoes: () => (
    <>
      <Ground rx={44} />
      <Tomato cx={43} cy={56} r={18} />
      <Tomato cx={79} cy={58} r={17} />
      <Tomato cx={61} cy={66} r={21} />
    </>
  ),

  cabbage: () => (
    <>
      <Ground rx={38} />
      <circle cx={60} cy={55} r={32} fill={C.leaf} />
      <circle cx={60} cy={54} r={24.5} fill={C.pale} />
      <g stroke={C.lime} strokeWidth={2.6} fill="none" strokeLinecap="round">
        <path d="M60 78C56 66 50 50 43 38" />
        <path d="M60 78C61 63 61 48 60 33" />
        <path d="M60 78C64 66 70 50 77 38" />
      </g>
      <path d="M60 88C40 88 27 75 29 55C38 61 51 70 60 88Z" fill={C.lime} />
      <path d="M60 88C80 88 93 75 91 55C82 61 69 70 60 88Z" fill={C.lime} />
      <path d="M60 88C48 84 38 74 35 62" stroke={C.leaf} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      <path d="M60 88C72 84 82 74 85 62" stroke={C.leaf} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </>
  ),

  bellpepper: () => (
    <>
      <Ground rx={30} />
      <g transform="translate(60 60) scale(1.12) translate(-60 -60)">
        <path
          d="M60 36C52 30 40 33 39 46C38 60 41 76 48 83C52 87 57 85 60 81C63 85 68 87 72 83C79 76 82 60 81 46C80 33 68 30 60 36Z"
          fill="var(--art-tomato)"
        />
        <path d="M60 41C57.5 55 57.5 70 60 81" stroke="var(--art-tomato-dark)" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path d="M72 83C79 76 82 60 81 46C79 58 76 72 68 82Z" fill="var(--art-tomato-dark)" />
        <Shine cx={47} cy={52} rx={2.8} ry={9} deg={8} />
        <path d="M51 37.5C54 32 66 32 69 37.5C65 40 55 40 51 37.5Z" fill={C.leafDark} />
        <path d="M60 35C60 29 62.5 25.5 67 24.5" stroke={C.leafDark} strokeWidth={3.6} fill="none" strokeLinecap="round" />
      </g>
    </>
  ),

  eggplant: () => {
    const body = 'M4 -9C14 -15 32 -15 46 -11C58 -8 64 2 58 10C50 17 28 13 12 8C5 6 2 3 4 -9Z'
    const cap = 'M-3 -6C2 -13 12 -12 16 -6C12 -4 14 2 9 5C5 2 1 3 -3 2C0 -1 -1 -3 -3 -6Z'
    return (
      <>
        <Ground rx={42} />
        <g transform="translate(30 30) rotate(24)">
          <path d={body} fill="var(--art-eggplant-dark)" />
          <path d={cap} fill={C.leafDark} />
          <path d="M-2 -2L-11 -4" stroke={C.leafDark} strokeWidth={3.4} strokeLinecap="round" />
        </g>
        <g transform="translate(24 50) rotate(18) scale(1.08)">
          <path d={body} fill="var(--art-eggplant)" />
          <Shine cx={30} cy={-8.5} rx={11} ry={2.2} deg={2} />
          <path d={cap} fill={C.leafDark} />
          <path d="M-2 -2L-11 -4" stroke={C.leafDark} strokeWidth={3.4} strokeLinecap="round" />
        </g>
      </>
    )
  },

  sitaw: () => {
    const colors = [C.leaf, C.leafDark, C.lime, C.leaf, C.leafDark, C.lime, C.leaf]
    return (
      <>
        <Ground rx={46} />
        {colors.map((color, i) => {
          const o = (i - 3) * 4.4
          return (
            <path
              key={i}
              d={`M14 ${70 + o * 0.9}C40 ${64 + o} 72 ${44 + o} 106 ${40 + o * 0.55}`}
              stroke={color}
              strokeWidth={4.6}
              fill="none"
              strokeLinecap="round"
            />
          )
        })}
        <g transform="rotate(-24 58 55)">
          <rect x={53} y={36} width={11} height={38} rx={3} fill="var(--art-twine)" />
          <rect x={55.5} y={36} width={2.4} height={38} fill={C.shine} opacity={0.35} />
        </g>
      </>
    )
  },

  squash: () => (
    <>
      <Ground rx={44} />
      {/* Whole kalabasa */}
      <ellipse cx={46} cy={56} rx={30} ry={24} fill="var(--art-squash)" />
      <ellipse cx={46} cy={56} rx={16} ry={23.5} fill="var(--art-squash-light)" opacity={0.55} />
      <ellipse cx={46} cy={56} rx={5} ry={23.5} fill="var(--art-squash)" />
      <path d="M43 34C43 28 46 24 51 23L53.5 27C49.5 28 48.5 31 48.5 34Z" fill="var(--art-twine)" />
      {/* Cut half */}
      <ellipse cx={79} cy={71} rx={25} ry={17} fill="var(--art-squash)" />
      <ellipse cx={79} cy={70} rx={22} ry={14.5} fill="var(--art-squash-flesh)" />
      <ellipse cx={79} cy={70} rx={10.5} ry={6.5} fill="var(--art-cream)" />
      <g fill="var(--art-sack)">
        <ellipse cx={74} cy={69} rx={2.2} ry={1.2} />
        <ellipse cx={79} cy={72} rx={2.2} ry={1.2} />
        <ellipse cx={84} cy={68.5} rx={2.2} ry={1.2} />
      </g>
    </>
  ),

  lettuce: () => (
    <>
      <Ground rx={40} />
      <g fill={C.leaf}>
        <ellipse cx={60} cy={54} rx={35} ry={29} />
        {[-150, -125, -100, -75, -50, -25].map((a) => (
          <circle key={a} cx={60 + Math.cos(rad(a)) * 33} cy={56 + Math.sin(rad(a)) * 28} r={8} />
        ))}
      </g>
      <path d="M29 80C25 63 30 46 42 39C46 31 56 30 60 34C64 30 74 31 78 39C90 46 95 63 91 80Z" fill={C.lime} />
      <path d="M38 87C34 72 41 58 51 54C55 49 65 49 69 54C79 58 86 72 82 87Z" fill={C.pale} />
      <g stroke={C.lime} strokeWidth={2.2} strokeLinecap="round" fill="none">
        <path d="M60 87L60 57" />
        <path d="M60 77L51 65" />
        <path d="M60 77L69 65" />
      </g>
    </>
  ),

  pechay: () => (
    <>
      <Ground rx={36} />
      <g transform="translate(60 87)">
        <PechayStalk deg={-24} />
        <PechayStalk deg={24} />
        <PechayStalk deg={0} />
        <rect x={-9} y={-15} width={18} height={6} rx={2} fill="var(--art-twine)" />
      </g>
    </>
  ),

  malunggay: () => (
    <>
      <Ground rx={34} />
      <g transform="translate(60 86)">
        <Sprig deg={-28} len={58} />
        <Sprig deg={26} len={56} />
        <Sprig deg={-2} len={62} />
      </g>
    </>
  ),

  carrots: () => (
    <>
      <Ground rx={36} />
      <Carrot x={50} y={42} deg={22} />
      <Carrot x={70} y={42} deg={-22} />
      <Carrot x={60} y={40} deg={0} s={1.08} />
    </>
  ),

  potatoes: () => (
    <>
      <Ground rx={44} />
      <Potato cx={60} cy={52} rx={18} ry={13} deg={4} />
      <Potato cx={43} cy={67} rx={20} ry={14} deg={-10} />
      <Potato cx={77} cy={69} rx={19} ry={13.5} deg={12} />
    </>
  ),

  kamote: () => {
    const body = 'M4 -9C14 -15 32 -15 46 -11C58 -8 66 -2 70 2C64 6 56 11 44 12C26 13 10 9 4 9Z'
    return (
      <>
        <Ground rx={44} />
        <g transform="translate(30 42) rotate(4)">
          <path d={body} fill="var(--art-kamote-dark)" />
          <path d="M70 2C76 4 80 3 85 6" stroke="var(--art-kamote-dark)" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(20 66) rotate(-6) scale(1.06)">
          <path d={body} fill="var(--art-kamote)" />
          <path d="M70 2C76 4 80 3 85 6" stroke="var(--art-kamote)" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <Shine cx={30} cy={-8} rx={10} ry={2} deg={-2} />
          <ellipse cx={4} cy={0} rx={4} ry={9} fill="var(--art-yellow)" />
          <ellipse cx={4} cy={0} rx={2.2} ry={6} fill="var(--art-cream)" opacity={0.6} />
        </g>
      </>
    )
  },

  mangoes: () => (
    <>
      <Ground rx={42} />
      <Mango x={76} y={50} deg={-18} s={0.9} back />
      <Mango x={54} y={63} deg={8} />
    </>
  ),

  saba: () => (
    <>
      <Ground rx={42} />
      <g transform="translate(30 70)">
        <Banana deg={-44} />
        <Banana deg={-29} />
        <Banana deg={-14} />
        <Banana deg={1} />
        <path d="M-12 8C-8 4 -4 0 2 -3L4 2C-1 5 -5 9 -8 12Z" fill={C.leafDark} />
      </g>
    </>
  ),

  calamansi: () => (
    <>
      <Ground rx={40} />
      <path d={leaf([40, 40], 24, 11, -150)} fill={C.leafDark} />
      <path d={leaf([42, 41], 20, 9, -105)} fill={C.leaf} />
      <Calamansi cx={40} cy={52} r={9} />
      <Calamansi cx={58} cy={52} r={9.5} />
      <Calamansi cx={76} cy={58} r={9} />
      <Calamansi cx={47} cy={69} r={10.5} />
      <Calamansi cx={66} cy={72} r={11} />
      {/* One cut in half */}
      <circle cx={88} cy={78} r={10.5} fill={C.leaf} />
      <circle cx={88} cy={78} r={8.6} fill="var(--art-yellow)" />
      <g stroke={C.shine} strokeWidth={1.1} opacity={0.75}>
        {[0, 60, 120].map((a) => (
          <path
            key={a}
            d={`M${88 + Math.cos(rad(a)) * 8} ${78 + Math.sin(rad(a)) * 8}L${88 - Math.cos(rad(a)) * 8} ${78 - Math.sin(rad(a)) * 8}`}
          />
        ))}
      </g>
    </>
  ),

  eggs: () => (
    <>
      <Ground rx={44} />
      <rect x={18} y={64} width={84} height={8} rx={3} fill="var(--art-sack-dark)" />
      <Egg cx={30} cy={60} brown />
      <Egg cx={50} cy={58} />
      <Egg cx={70} cy={60} brown />
      <Egg cx={90} cy={58} />
      <path d="M17 70L103 70L97 89L23 89Z" fill="var(--art-sack-dark)" />
      <g fill="var(--art-sack)">
        {[30, 50, 70, 90].map((x) => (
          <path key={x} d={`M${x - 10.5} 70C${x - 9.5} 80 ${x + 9.5} 80 ${x + 10.5} 70Z`} />
        ))}
      </g>
    </>
  ),

  rice: () => (
    <>
      <Ground rx={36} />
      <path d="M36 42C31 54 29 71 33 85C51 89 69 89 87 85C91 71 89 54 84 42C74 38 46 38 36 42Z" fill="var(--art-sack)" />
      <path d="M41 41C44 32 49 27 53 22L67 22C71 27 76 32 79 41Z" fill="var(--art-sack)" />
      <path d="M53 22L67 22C66 26 62 27 60 27C58 27 54 26 53 22Z" fill="var(--art-sack-dark)" />
      <path d="M48 31L52 40M60 28L60 40M72 31L68 40" stroke="var(--art-sack-dark)" strokeWidth={1.6} strokeLinecap="round" />
      <rect x={44} y={34} width={32} height={6} rx={3} fill="var(--art-twine)" />
      <rect x={41} y={55} width={38} height={20} rx={5} fill={C.leafDark} />
      <g transform="translate(60 65) scale(0.34) translate(-24 -23.8)">
        <path fill="var(--card)" fillRule="evenodd" d={`${MARK_PIN} ${MARK_SPROUT}`} />
      </g>
      <g fill="var(--art-brown)">
        <ellipse cx={93} cy={86} rx={2.2} ry={1.3} transform="rotate(20 93 86)" />
        <ellipse cx={99} cy={84.5} rx={2.2} ry={1.3} transform="rotate(-25 99 84.5)" />
        <ellipse cx={96} cy={88.5} rx={2.2} ry={1.3} />
        <ellipse cx={26} cy={87} rx={2.2} ry={1.3} transform="rotate(-15 26 87)" />
      </g>
    </>
  ),
}

export const tintClass: Record<Tint, string> = {
  mint: 'bg-primary-soft',
  leaf: 'bg-secondary-soft',
  cream: 'bg-tint-cream',
  sand: 'bg-tint-sand',
}

/** Just the drawing, on a transparent background. The view is cropped a
    little inside the 120 x 100 grid so the produce fills its picture. */
export function ProduceArt({ id, className }: { id: ProductId; className?: string }) {
  return (
    <svg viewBox="12 14 96 80" className={className} aria-hidden>
      {ART[id]()}
    </svg>
  )
}

/** The drawing on its tinted picture background - what cards and thumbnails
    use. Size and corner radius come from `className`. */
export function ProductPicture({
  product,
  className = '',
  children,
}: {
  product: Product
  className?: string
  children?: ReactNode
}) {
  return (
    <div className={`relative overflow-hidden ${tintClass[product.tint]} ${className}`}>
      <ProduceArt
        id={product.id}
        className={`absolute inset-0 h-full w-full ${product.outOfStock ? 'opacity-55 grayscale-[0.6]' : ''}`}
      />
      {children}
    </div>
  )
}

/* --------------------------------------------------------------------------
   Rolling hills with crop rows - "bukid" means farm in Tagalog and mountain
   in Bisaya, and this is both. Stretches to fill its box along the bottom.
   -------------------------------------------------------------------------- */

export function Hills({ tone = 'onGreen', className = '' }: { tone?: 'onGreen' | 'onLight'; className?: string }) {
  const far = tone === 'onGreen' ? 'var(--primary)' : 'var(--secondary-soft)'
  const mid = tone === 'onGreen' ? 'var(--primary-deep)' : 'var(--art-pale)'
  const near = tone === 'onGreen' ? 'var(--secondary)' : 'var(--secondary)'
  const rows = tone === 'onGreen' ? 'var(--primary)' : 'var(--primary)'
  return (
    <svg viewBox="0 0 390 170" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <path d="M0 74C60 40 118 34 182 62C236 86 300 56 390 44L390 170L0 170Z" fill={far} opacity={tone === 'onGreen' ? 0.55 : 1} />
      <path d="M0 108C72 76 150 70 222 96C284 118 336 92 390 84L390 170L0 170Z" fill={mid} />
      <path d="M0 140C90 112 196 108 292 128C330 136 362 132 390 126L390 170L0 170Z" fill={near} />
      <g stroke={rows} strokeWidth={3} strokeLinecap="round" opacity={0.5} fill="none">
        <path d="M30 150C90 136 170 132 240 140" />
        <path d="M10 162C90 148 200 146 300 154" />
      </g>
    </svg>
  )
}
