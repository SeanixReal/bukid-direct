/* ==========================================================================
   Saves the phone mockup - frame, shadow and whatever screen is showing - as
   a transparent PNG, for pasting straight into slides.

   html-to-image redraws the DOM into an image, so the hub map, produce art
   and fonts all come out as they look on screen. It is loaded on first use
   only; the demo itself never needs it.
   ========================================================================== */

/* 3x of the 390-wide screen: sharp on a projector and in a Canva export. */
const PIXEL_RATIO = 3

/* Room around the phone in the image, for its shadow and side buttons. */
const PAD = { top: 24, right: 64, bottom: 104, left: 64 }

export async function savePhoneScreenshot(node: HTMLElement, pathname: string) {
  const { toBlob } = await import('html-to-image')

  /* The padding goes on the captured copy only, and the image grows to fit
     it, so the phone sits in the same place in every screenshot. */
  const rect = node.getBoundingClientRect()
  const options = {
    width: Math.ceil(rect.width) + PAD.left + PAD.right,
    height: Math.ceil(rect.height) + PAD.top + PAD.bottom,
    style: {
      margin: '0',
      boxSizing: 'border-box',
      padding: `${PAD.top}px ${PAD.right}px ${PAD.bottom}px ${PAD.left}px`,
    },
  }

  /* The first pass warms the image and font caches; without it the first
     screenshot of a session can come out with gaps. */
  await toBlob(node, { ...options, pixelRatio: 1 })
  const blob = await toBlob(node, { ...options, pixelRatio: PIXEL_RATIO })
  if (!blob) throw new Error('Nothing was captured')

  /* A Blob URL, not a data: URL. At 3x the PNG runs to several megabytes,
     and Chrome silently cancels downloads of data: URLs over 2 MB. */
  const url = URL.createObjectURL(blob)
  const file = `presgo-${screenName(pathname)}-${timeStamp()}.png`
  const link = document.createElement('a')
  link.href = url
  link.download = file
  document.body.appendChild(link)
  link.click()
  link.remove()
  /* Give the download a moment to start before releasing the memory. */
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return file
}

/** "/product/tomatoes" -> "product-tomatoes", "/" -> "splash". */
function screenName(pathname: string) {
  const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/gi, '-')
  return slug || 'splash'
}

function timeStamp() {
  const d = new Date()
  const two = (n: number) => String(n).padStart(2, '0')
  return `${two(d.getHours())}${two(d.getMinutes())}${two(d.getSeconds())}`
}
