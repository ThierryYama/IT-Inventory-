import { islandSize } from '../constants/island-size'
import type { AssetRecord } from '../types/asset-record'
import type { SectorGroup } from '../types/sector-group'
import { createSlug } from './create-slug'

function getSectorSlotCount(sectorAssets: readonly AssetRecord[]): number {
  const highestPositionIndex: number = sectorAssets.reduce(
    (currentHighestPositionIndex: number, asset: AssetRecord) => Math.max(currentHighestPositionIndex, asset.positionIndex),
    -1,
  )
  return Math.max(highestPositionIndex + 1, sectorAssets.length)
}

export function groupAssetsBySector(assets: readonly AssetRecord[]): readonly SectorGroup[] {
  const groupedAssets: Record<string, AssetRecord[]> = {}
  assets.forEach((asset: AssetRecord) => {
    const sectorName: string = asset.sector
    if (!groupedAssets[sectorName]) {
      groupedAssets[sectorName] = []
    }
    groupedAssets[sectorName].push(asset)
  })
  return Object.entries(groupedAssets)
    .sort(([leftSector], [rightSector]) => leftSector.localeCompare(rightSector, 'pt-BR'))
    .map(([sectorName, sectorAssets]: [string, AssetRecord[]]) => {
      const sortedSectorAssets: AssetRecord[] = [...sectorAssets].sort(
        (leftAsset: AssetRecord, rightAsset: AssetRecord) => leftAsset.positionIndex - rightAsset.positionIndex,
      )
      const sectorSlotCount: number = getSectorSlotCount(sortedSectorAssets)
      const islandCount: number = Math.max(1, Math.ceil(sectorSlotCount / islandSize))
      return {
        id: createSlug(sectorName),
        sectorName,
        assets: sortedSectorAssets,
        islands: Array.from({ length: islandCount }, (_, index: number) => {
          const slotStartIndex: number = index * islandSize
          return {
            id: `${createSlug(sectorName)}-ilha-${index + 1}`,
            name: `Ilha ${index + 1}`,
            slotStartIndex,
            assets: sortedSectorAssets.filter((asset: AssetRecord) =>
              asset.positionIndex >= slotStartIndex && asset.positionIndex < slotStartIndex + islandSize,
            ),
          }
        }),
      }
    })
}
