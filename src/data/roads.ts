/* ==========================================================================
   Road data for the Pickup Hub map.

   Loads the committed src/data/roads.geojson - real Cebu City street geometry
   exported once from OpenStreetMap by scripts/fetch-roads.ts. The file is
   bundled, so the map never touches the network and the demo survives bad
   Wi-Fi.

   Road geometry (c) OpenStreetMap contributors, ODbL 1.0. The attribution on
   the map is required - please leave it in place.
   ========================================================================== */

/* Imported as text and parsed here: Vite serves unknown extensions as asset
   URLs, and we want the data itself, bundled. */
import raw from './roads.geojson?raw'

export type LonLat = [number, number]

export interface RoadFeature {
  type: 'Feature'
  id: string
  properties: {
    id: string
    name: string
    kind: 'primary' | 'secondary' | 'tertiary'
  }
  geometry: { type: 'MultiLineString'; coordinates: LonLat[][] }
}

const collection = JSON.parse(raw) as { features: RoadFeature[] }

export const roads: RoadFeature[] = collection.features

export const roadAttribution = '© OpenStreetMap contributors'
