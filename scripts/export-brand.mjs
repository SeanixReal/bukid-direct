/* ==========================================================================
   Brand export for Canva / slides.

     npm run export:brand

   Writes ready-to-upload files to brand/: the logo mark (SVG + PNG, green and
   white), the wordmark (green and white), the app icon (SVG + PNG), a colour
   palette sheet and a plain list of hex codes. It also rewrites
   public/logo.svg, the browser-tab icon.

   Nothing here is drawn by hand: the mark's shapes are read from
   src/components/Logo.tsx and the colours from src/theme.css, so re-run this
   after either changes and every brand file follows.

   PNGs are rendered with a local Chrome or Edge in headless mode. Set
   CHROME_PATH to point at a different browser binary if needed.
   ========================================================================== */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'brand')
const SCALE = 2 // PNGs are rendered at 2x for crisp slides

/* --- Palette, read from theme.css ------------------------------------------ */

const themeCss = readFileSync(join(ROOT, 'src', 'theme.css'), 'utf8')
/* Only the :root block - the header comment also mentions @theme, so search
   for the end marker after :root, not from the top of the file. */
const rootStart = themeCss.indexOf(':root {')
const rootBlock = themeCss.slice(rootStart, themeCss.indexOf('@theme', rootStart))
const vars = Object.fromEntries(
  [...rootBlock.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]),
)
/* Resolves var(--x) references, e.g. inside the gradients. */
const resolveVars = (value) =>
  value.replace(/var\(--([a-z0-9-]+)\)/g, (_, name) => resolveVars(vars[name] ?? ''))
const v = (name) => {
  if (!vars[name]) throw new Error(`--${name} not found in theme.css`)
  return resolveVars(vars[name]).toUpperCase()
}

/* The colours worth putting in a Canva Brand Kit, in the order they matter. */
const palette = [
  { group: 'Brand greens', items: [
    { name: 'Emerald', token: 'primary', role: 'Main brand colour. Logo, headers, primary buttons.' },
    { name: 'Leaf', token: 'secondary', role: 'Accents, category chips, highlights.' },
    { name: 'Deep Green', token: 'primary-deep', role: 'Darkest green. Gradient ends, dark panels.' },
    { name: 'Pale Green', token: 'primary-soft', role: 'Pale surfaces and selected rows.' },
    { name: 'Leaf Mist', token: 'secondary-soft', role: 'Soft highlight panels.' },
  ]},
  { group: 'Status - use only for their meaning', items: [
    { name: 'Harvest Orange', token: 'accent', role: 'ONLY "Ready for pickup" and "Harvested today".' },
    { name: 'Orange Text', token: 'accent-strong', role: 'Orange wording on light backgrounds.' },
    { name: 'Alert Red', token: 'danger', role: 'Errors and "Out of stock" only.' },
  ]},
  { group: 'Neutrals', items: [
    { name: 'Ink', token: 'ink', role: 'Body text.' },
    { name: 'Muted Ink', token: 'ink-muted', role: 'Secondary text.' },
    { name: 'Canvas', token: 'canvas', role: 'Warm off-white screen background.' },
    { name: 'White', token: 'card', role: 'Cards.' },
    { name: 'Surface', token: 'surface', role: 'Soft panels.' },
    { name: 'Line', token: 'line', role: 'Borders and dividers.' },
  ]},
].map((g) => ({ ...g, items: g.items.map((c) => ({ ...c, hex: v(c.token) })) }))

const gradients = [
  { name: 'Brand gradient', token: 'grad-brand', role: 'Splash screen, headers, title slides.' },
].map((g) => {
  const css = resolveVars(vars[g.token])
  return { ...g, css, stops: [...css.matchAll(/#[0-9a-f]{6}/gi)].map((m) => m[0].toUpperCase()) }
})

/* --- Logo, read from Logo.tsx ------------------------------------------------ */

const logoSrc = readFileSync(join(ROOT, 'src', 'components', 'Logo.tsx'), 'utf8')
const PIN = logoSrc.match(/MARK_PIN =\s*'([^']+)'/)?.[1]
const SPROUT = logoSrc.match(/MARK_SPROUT =\s*'([^']+)'/)?.[1]
const boxMatch = logoSrc.match(/MARK_BOX = \{ x: ([\d.]+), y: ([\d.]+), w: ([\d.]+), h: ([\d.]+) \}/)
if (!PIN || !SPROUT || !boxMatch) throw new Error('Could not read the mark from Logo.tsx')
const BOX = { x: +boxMatch[1], y: +boxMatch[2], w: +boxMatch[3], h: +boxMatch[4] }

/* One colour, sprout cut out of the pin (evenodd), so the mark works on any
   background. */
function markSvg(color, size = 10) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}" width="${BOX.w * size}" height="${BOX.h * size}">
  <title>PresGo</title>
  <path fill="${color}" fill-rule="evenodd" d="${PIN} ${SPROUT}"/>
</svg>
`
}

const markGreen = markSvg(v('primary'))
const markWhite = markSvg(v('on-primary'))

/* App icon: flat green rounded square, white pin-and-sprout mark. */
const ICON = 512
const iconMarkH = ICON * 0.6
const iconMarkW = (iconMarkH * BOX.w) / BOX.h
const appIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ICON} ${ICON}" width="${ICON}" height="${ICON}">
  <title>PresGo</title>
  <rect width="${ICON}" height="${ICON}" rx="${ICON * 0.225}" fill="${v('primary')}"/>
  <svg x="${(ICON - iconMarkW) / 2}" y="${(ICON - iconMarkH) / 2 + ICON * 0.01}" width="${iconMarkW}" height="${iconMarkH}" viewBox="${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}">
    <path fill="${v('on-primary')}" fill-rule="evenodd" d="${PIN} ${SPROUT}"/>
  </svg>
</svg>
`

/* Browser-tab icon: green mark, white when the browser is in dark mode. */
const square = { x: 24 - BOX.h / 2, y: BOX.y, s: BOX.h }
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${square.x.toFixed(1)} ${square.y} ${square.s} ${square.s}">
  <title>PresGo</title>
  <style>
    path { fill: ${v('primary')}; }
    @media (prefers-color-scheme: dark) { path { fill: ${v('on-primary')}; } }
  </style>
  <path fill-rule="evenodd" d="${PIN} ${SPROUT}"/>
</svg>
`

/* --- Headless browser -------------------------------------------------------- */

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter(Boolean)
  const found = candidates.find((p) => existsSync(p))
  if (!found) throw new Error('No Chrome or Edge found. Set CHROME_PATH.')
  return found
}

const BROWSER = findBrowser()
const WORK = mkdtempSync(join(tmpdir(), 'presgo-brand-'))

/* A throwaway profile, so this never touches a Chrome window already open. */
const baseArgs = [
  '--headless=new',
  '--disable-gpu',
  '--hide-scrollbars',
  '--no-first-run',
  '--no-default-browser-check',
  `--user-data-dir=${join(WORK, 'profile')}`,
  '--virtual-time-budget=4000',
]

let pageCount = 0
function writePage(html) {
  const file = join(WORK, `page-${++pageCount}.html`)
  writeFileSync(file, html)
  return pathToFileURL(file).href
}

/** Renders the page's #art element and returns its size in CSS px. */
function measure(html) {
  const dom = execFileSync(BROWSER, [...baseArgs, '--dump-dom', writePage(html)], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  const m = dom.match(/data-size="(\d+)x(\d+)"/)
  if (!m) throw new Error('Could not measure artwork')
  return { w: Number(m[1]), h: Number(m[2]) }
}

function screenshot(html, file, w, h, transparent = true) {
  execFileSync(
    BROWSER,
    [
      ...baseArgs,
      `--force-device-scale-factor=${SCALE}`,
      `--window-size=${w},${h}`,
      ...(transparent ? ['--default-background-color=00000000'] : []),
      `--screenshot=${join(OUT, file)}`,
      writePage(html),
    ],
    { stdio: 'ignore' },
  )
  console.log(`  ${file}  (${w * SCALE}x${h * SCALE})`)
}

/* The app font, embedded so rendering never depends on the network. */
const fontB64 = readFileSync(
  join(ROOT, 'node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2'),
).toString('base64')

const page = (body, extraCss = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Jakarta'; src: url(data:font/woff2;base64,${fontB64}) format('woff2'); font-weight: 200 800; font-display: block; }
html, body { margin: 0; background: transparent; }
body { font-family: 'Jakarta', sans-serif; -webkit-font-smoothing: antialiased; }
${extraCss}
</style></head><body>${body}
<script>
  document.fonts.ready.then(() => {
    const r = document.getElementById('art').getBoundingClientRect();
    document.body.setAttribute('data-size', Math.ceil(r.width) + 'x' + Math.ceil(r.height));
  });
</script></body></html>`

const fill = (svg) => svg.replace(/width="[^"]*" height="[^"]*"/, 'width="100%" height="100%"')

/* --- Build ------------------------------------------------------------------- */

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })
console.log(`Exporting brand files to ${OUT}\n`)

writeFileSync(join(ROOT, 'public', 'logo.svg'), faviconSvg)
console.log('  ../public/logo.svg')

/* Logo mark: SVG for crisp scaling, PNG for anywhere SVG is awkward. */
writeFileSync(join(OUT, 'logo-mark.svg'), markGreen)
writeFileSync(join(OUT, 'logo-mark-white.svg'), markWhite)
writeFileSync(join(OUT, 'app-icon.svg'), appIconSvg)
console.log('  logo-mark.svg\n  logo-mark-white.svg\n  app-icon.svg')

const markW = Math.round(BOX.w * 12)
const markH = Math.round(BOX.h * 12)
const markPage = (svg) => page(`<div id="art" style="width:${markW}px;height:${markH}px">${fill(svg)}</div>`)
screenshot(markPage(markGreen), 'logo-mark.png', markW, markH)
screenshot(markPage(markWhite), 'logo-mark-white.png', markW, markH)

/* Wordmark: "PresGo" in ExtraBold, in the mark's colour. */
const wordmark = (svg, color) =>
  page(
    `<div id="art" class="lockup">
      <div class="mark">${fill(svg)}</div>
      <div class="name">PresGo</div>
    </div>`,
    `.lockup { display: inline-flex; align-items: center; gap: 30px; padding: 12px 16px; color: ${color}; }
     .mark { width: ${(BOX.w / BOX.h) * 150}px; height: 150px; }
     .name { font-size: 112px; font-weight: 800; letter-spacing: -0.02em; line-height: 1; white-space: nowrap; }`,
  )

for (const [file, html] of [
  ['logo-wordmark.png', wordmark(markGreen, v('primary'))],
  ['logo-wordmark-white.png', wordmark(markWhite, v('on-primary'))],
]) {
  const { w, h } = measure(html)
  screenshot(html, file, w, h)
}

screenshot(
  page(`<div id="art" style="width:${ICON}px;height:${ICON}px">${appIconSvg}</div>`),
  'app-icon.png',
  ICON,
  ICON,
)

/* Palette sheet: one image to drop into a slide or eyedrop from in Canva. */
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
const inkOn = (hex) => (lum(hex) > 0.4 ? v('ink') : v('card'))

const swatch = (c) => `
  <div class="sw">
    <div class="chip" style="background:${c.hex};color:${inkOn(c.hex)};${lum(c.hex) > 0.85 ? `box-shadow: inset 0 0 0 2px ${v('line')};` : ''}">
      <b>${c.hex}</b>
    </div>
    <div class="meta"><div class="n">${c.name}</div><div class="r">${c.role}</div></div>
  </div>`

const sheet = page(
  `<div id="art" class="sheet">
    <header>
      <div class="mark">${fill(markGreen)}</div>
      <div><h1>PresGo</h1><p>Preskong Lokal, On the Go &middot; Colour palette &middot; Typeface: Plus Jakarta Sans</p></div>
    </header>
    ${palette
      .map((g) => `<h2>${g.group}</h2><div class="row">${g.items.map(swatch).join('')}</div>`)
      .join('')}
    <h2>Gradient</h2>
    <div class="row">${gradients
      .map(
        (g) => `<div class="sw grad"><div class="chip" style="background:${g.css};color:${v('card')}"><b>${g.stops.join(' &rarr; ')}</b></div>
          <div class="meta"><div class="n">${g.name}</div><div class="r">${g.role}</div></div></div>`,
      )
      .join('')}</div>
    <footer>Generated from src/theme.css. Green and white stay calm, so orange always means "it's ready" or "picked today".</footer>
  </div>`,
  `.sheet { width: 1440px; box-sizing: border-box; padding: 56px 60px 44px; background: ${v('canvas')}; color: ${v('ink')}; }
   header { display: flex; align-items: center; gap: 22px; margin-bottom: 18px; }
   header .mark { width: ${(BOX.w / BOX.h) * 64}px; height: 64px; }
   h1 { margin: 0; font-size: 42px; font-weight: 800; letter-spacing: -0.02em; color: ${v('primary')}; }
   header p { margin: 4px 0 0; font-size: 17px; font-weight: 600; color: ${v('ink-muted')}; }
   h2 { margin: 30px 0 12px; font-size: 15px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: ${v('ink-muted')}; }
   .row { display: flex; flex-wrap: wrap; gap: 18px; }
   .sw { width: 202px; }
   .sw.grad { width: 426px; }
   .chip { height: 118px; border-radius: 20px; display: flex; align-items: flex-end; padding: 14px 16px; box-sizing: border-box; }
   .chip b { font-size: 19px; font-weight: 800; letter-spacing: 0.02em; }
   .meta { padding: 10px 2px 0; }
   .n { font-size: 18px; font-weight: 800; }
   .r { margin-top: 3px; font-size: 14px; font-weight: 500; line-height: 1.35; color: ${v('ink-muted')}; }
   footer { margin-top: 36px; font-size: 14px; font-weight: 600; color: ${v('ink-muted')}; }`,
)

screenshot(sheet, 'color-palette.png', 1440, measure(sheet).h, false)

/* Plain hex list, for typing into a Canva Brand Kit. */
const lines = [
  'PresGo - colour palette (from src/theme.css)',
  'Preskong Lokal, On the Go',
  'Typeface: Plus Jakarta Sans (ExtraBold for headings and the "PresGo" wordmark)',
  '',
  ...palette.flatMap((g) => [
    g.group.toUpperCase(),
    ...g.items.map((c) => `  ${c.hex}  ${c.name.padEnd(15)} ${c.role}`),
    '',
  ]),
  'GRADIENT',
  ...gradients.map((g) => `  ${g.stops.join(' -> ')}  ${g.name} - ${g.role}`),
  '',
  'Rule: orange is ONLY for "Ready for pickup" and "Harvested today". Never decoration.',
  'No blue anywhere.',
  '',
]
writeFileSync(join(OUT, 'colors.txt'), lines.join('\n'))
console.log('  colors.txt')

rmSync(WORK, { recursive: true, force: true })
console.log('\nDone.')
