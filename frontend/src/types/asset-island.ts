import type { AssetRecord } from './asset-record'

export interface AssetIsland {
  readonly id: number
  readonly sectorId: number
  readonly sequenceNumber: number
  readonly capacity: number
  readonly assetCount: number
  readonly assets: readonly AssetRecord[]
}
