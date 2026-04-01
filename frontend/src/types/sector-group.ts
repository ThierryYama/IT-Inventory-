import type { AssetRecord } from './asset-record'
import type { AssetIsland } from './asset-island'

export interface SectorGroup {
  readonly id: number
  readonly sectorName: string
  readonly islandCount: number
  readonly assetCount: number
  readonly assets: readonly AssetRecord[]
  readonly islands: readonly AssetIsland[]
}
