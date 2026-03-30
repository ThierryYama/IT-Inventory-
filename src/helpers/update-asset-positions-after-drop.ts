import type { AssetRecord } from '../types/asset-record'
import { createSlug } from './create-slug'

interface UpdateAssetPositionsAfterDropParams {
  readonly assetRecords: readonly AssetRecord[]
  readonly activeAssetId: string
  readonly targetSectorId: string
  readonly targetPositionIndex: number
}

export function updateAssetPositionsAfterDrop(params: UpdateAssetPositionsAfterDropParams): readonly AssetRecord[] {
  const activeAsset: AssetRecord | undefined = params.assetRecords.find((asset: AssetRecord) => asset.id === params.activeAssetId)
  if (!activeAsset) {
    return params.assetRecords
  }
  if (createSlug(activeAsset.sector) !== params.targetSectorId) {
    return params.assetRecords
  }
  if (activeAsset.positionIndex === params.targetPositionIndex) {
    return params.assetRecords
  }
  const targetAsset: AssetRecord | undefined = params.assetRecords.find((asset: AssetRecord) =>
    createSlug(asset.sector) === params.targetSectorId && asset.positionIndex === params.targetPositionIndex,
  )
  return params.assetRecords.map((asset: AssetRecord) => {
    if (asset.id === activeAsset.id) {
      return {
        ...asset,
        positionIndex: params.targetPositionIndex,
      }
    }
    if (targetAsset && asset.id === targetAsset.id) {
      return {
        ...asset,
        positionIndex: activeAsset.positionIndex,
      }
    }
    return asset
  })
}
