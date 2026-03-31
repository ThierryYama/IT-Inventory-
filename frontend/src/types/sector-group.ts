import type { AssetRecord } from './asset-record'
import type { AssetIsland } from './asset-island'

export interface SectorGroup {
  readonly id: string
  readonly sectorName: string
  readonly assets: readonly AssetRecord[]
  readonly islands: readonly AssetIsland[]
}
