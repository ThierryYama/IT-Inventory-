import type { AssetRecord } from '../types/asset-record'

export function assignSectorPositions(assets: readonly AssetRecord[]): readonly AssetRecord[] {
  const sectorCounters: Record<string, number> = {}
  return assets.map((asset: AssetRecord) => {
    const currentPositionIndex: number = sectorCounters[asset.sector] ?? 0
    sectorCounters[asset.sector] = currentPositionIndex + 1
    return {
      ...asset,
      positionIndex: currentPositionIndex,
    }
  })
}
