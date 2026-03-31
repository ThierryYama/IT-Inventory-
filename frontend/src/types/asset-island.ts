import type { AssetRecord } from './asset-record'

export interface AssetIsland {
  readonly id: string
  readonly name: string
  readonly slotStartIndex: number
  readonly assets: readonly AssetRecord[]
}
