/* ==========================================================================
   Street routing over the bundled road data - the rider's route on the
   tracking map and the directions to a pickup point.

   The street network is built once, when first needed: every vertex in
   roads.geojson is a node and every segment an edge. The export simplified
   the geometry, so crossing streets rarely share an exact point; a vertex
   that comes within JOIN_M of another street is joined to it instead. A few
   known gaps, where a short connecting street was dropped from the export,
   are bridged by hand below.

   This is for a believable line on a demo map, not turn-by-turn navigation.
   ========================================================================== */

import { roads } from './roads'
import type { LatLng } from './sample'

const JOIN_M = 60

/* Short connectors missing from the export. */
const BRIDGES: [LatLng, LatLng][] = [
  /* Salinas Drive Extension down to Gorordo Avenue (Lahug) */
  [
    [10.33115, 123.89809],
    [10.32827, 123.89747],
  ],
  /* Bonbon-Sudlon Road onto the Transcentral Highway (Balamban side) */
  [
    [10.37549, 123.8522],
    [10.37517, 123.85277],
  ],
]

const M_PER_LAT = 110_540
const M_PER_LNG = 111_320 * Math.cos((10.32 * Math.PI) / 180)

/** Metres between two points - flat-earth, fine across one city. */
export function metres(a: LatLng, b: LatLng) {
  return Math.hypot((a[0] - b[0]) * M_PER_LAT, (a[1] - b[1]) * M_PER_LNG)
}

interface Graph {
  nodes: LatLng[]
  edges: [number, number][][]
}

let graph: Graph | null = null

function build(): Graph {
  const nodes: LatLng[] = []
  const edges: [number, number][][] = []
  const partsOf: Set<number>[] = []
  const keyed = new Map<string, number>()
  const segments: [number, number, number][] = []

  const node = (lat: number, lng: number, part: number) => {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`
    let i = keyed.get(key)
    if (i === undefined) {
      i = nodes.length
      nodes.push([lat, lng])
      edges.push([])
      partsOf.push(new Set())
      keyed.set(key, i)
    }
    partsOf[i].add(part)
    return i
  }
  const link = (a: number, b: number, w: number) => {
    if (a === b) return
    edges[a].push([b, w])
    edges[b].push([a, w])
  }

  let part = 0
  for (const road of roads) {
    for (const line of road.geometry.coordinates) {
      let prev = -1
      for (const [lng, lat] of line) {
        const i = node(lat, lng, part)
        if (prev >= 0) {
          link(prev, i, metres(nodes[prev], nodes[i]))
          segments.push([prev, i, part])
        }
        prev = i
      }
      part++
    }
  }

  /* Junctions: bucket the segments on a grid, then join every vertex to any
     other street's segment that passes within JOIN_M of it. */
  const CELL = 0.0006
  const cellKey = (lat: number, lng: number) => `${Math.floor(lat / CELL)}:${Math.floor(lng / CELL)}`
  const grid = new Map<string, number[]>()
  segments.forEach(([a, b], si) => {
    const cells = new Set<string>()
    for (let t = 0; t <= 1.0001; t += 0.25) {
      cells.add(
        cellKey(
          nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t,
          nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t,
        ),
      )
    }
    for (const c of cells) {
      const list = grid.get(c)
      if (list) list.push(si)
      else grid.set(c, [si])
    }
  })

  nodes.forEach((v, vi) => {
    const row = Math.floor(v[0] / CELL)
    const col = Math.floor(v[1] / CELL)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        for (const si of grid.get(`${row + dr}:${col + dc}`) ?? []) {
          const [ia, ib, p] = segments[si]
          if (partsOf[vi].has(p)) continue
          const a = nodes[ia]
          const bx = (nodes[ib][1] - a[1]) * M_PER_LNG
          const by = (nodes[ib][0] - a[0]) * M_PER_LAT
          const px = (v[1] - a[1]) * M_PER_LNG
          const py = (v[0] - a[0]) * M_PER_LAT
          const len2 = bx * bx + by * by || 1
          const t = Math.max(0, Math.min(1, (px * bx + py * by) / len2))
          const gap = Math.hypot(px - t * bx, py - t * by)
          if (gap > JOIN_M) continue
          const len = Math.sqrt(len2)
          link(vi, ia, gap + t * len)
          link(vi, ib, gap + (1 - t) * len)
        }
      }
    }
  })

  for (const [from, to] of BRIDGES) {
    const a = nearestIn(nodes, from)
    const b = nearestIn(nodes, to)
    link(a, b, metres(nodes[a], nodes[b]))
  }

  return { nodes, edges }
}

function nearestIn(nodes: LatLng[], pt: LatLng) {
  let best = 0
  let bestD = Infinity
  nodes.forEach((n, i) => {
    const d = metres(n, pt)
    if (d < bestD) {
      bestD = d
      best = i
    }
  })
  return best
}

const cache = new Map<string, LatLng[]>()

/** Street route between two points. Falls back to a straight line if the
    two points are not connected in the road data. */
export function route(from: LatLng, to: LatLng): LatLng[] {
  const key = `${from.join(',')}>${to.join(',')}`
  const hit = cache.get(key)
  if (hit) return hit

  graph ??= build()
  const { nodes, edges } = graph
  const start = nearestIn(nodes, from)
  const goal = nearestIn(nodes, to)

  /* Dijkstra with a small binary heap. */
  const dist = new Float64Array(nodes.length).fill(Infinity)
  const prev = new Int32Array(nodes.length).fill(-1)
  const heap: [number, number][] = [[0, start]]
  dist[start] = 0
  const push = (item: [number, number]) => {
    heap.push(item)
    let i = heap.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (heap[parent][0] <= heap[i][0]) break
      ;[heap[parent], heap[i]] = [heap[i], heap[parent]]
      i = parent
    }
  }
  const pop = () => {
    const top = heap[0]
    const last = heap.pop()!
    if (heap.length) {
      heap[0] = last
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let m = i
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r
        if (m === i) break
        ;[heap[m], heap[i]] = [heap[i], heap[m]]
        i = m
      }
    }
    return top
  }

  while (heap.length) {
    const [d, u] = pop()
    if (d > dist[u]) continue
    if (u === goal) break
    for (const [v, w] of edges[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w
        prev[v] = u
        push([dist[v], v])
      }
    }
  }

  let path: LatLng[]
  if (!Number.isFinite(dist[goal])) {
    path = [from, to]
  } else {
    path = []
    for (let u = goal; u >= 0; u = prev[u]) path.push(nodes[u])
    path.reverse()
    /* Start and end exactly on the requested points. */
    if (metres(path[0], from) > 1) path.unshift(from)
    if (metres(path[path.length - 1], to) > 1) path.push(to)
  }

  cache.set(key, path)
  return path
}

/** Length of a path in metres. */
export function pathLength(path: LatLng[]) {
  let total = 0
  for (let i = 1; i < path.length; i++) total += metres(path[i - 1], path[i])
  return total
}

/** Compass heading from a to b, in degrees (0 = north, 90 = east). */
function heading(a: LatLng, b: LatLng) {
  const dy = (b[0] - a[0]) * M_PER_LAT
  const dx = (b[1] - a[1]) * M_PER_LNG
  return (Math.atan2(dx, dy) * 180) / Math.PI
}

/** The point `t` (0 to 1) of the way along a path, which way it is facing,
    and the rest of the path from there. */
export function splitAt(
  path: LatLng[],
  t: number,
): { at: LatLng; heading: number; rest: LatLng[] } {
  if (path.length < 2) return { at: path[0], heading: 0, rest: path }
  const target = Math.max(0, Math.min(1, t)) * pathLength(path)
  let run = 0
  for (let i = 1; i < path.length; i++) {
    const seg = metres(path[i - 1], path[i])
    if (seg > 0 && run + seg >= target) {
      const f = (target - run) / seg
      const at: LatLng = [
        path[i - 1][0] + (path[i][0] - path[i - 1][0]) * f,
        path[i - 1][1] + (path[i][1] - path[i - 1][1]) * f,
      ]
      return { at, heading: heading(path[i - 1], path[i]), rest: [at, ...path.slice(i)] }
    }
    run += seg
  }
  const n = path.length
  return { at: path[n - 1], heading: heading(path[n - 2], path[n - 1]), rest: [path[n - 1]] }
}
