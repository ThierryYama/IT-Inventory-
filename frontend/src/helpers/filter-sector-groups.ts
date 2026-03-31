import type { AssetRecord } from '../types/asset-record'
import type { SectorGroup } from '../types/sector-group'
import { groupAssetsBySector } from './group-assets-by-sector'
import { normalizeText } from './normalize-text'

interface FilterSectorGroupsParams {
  readonly sectorGroups: readonly SectorGroup[]
  readonly selectedSectorId: string
  readonly searchValue: string
}

function doesAssetMatchSearch(asset: AssetRecord, normalizedSearchValue: string): boolean {
  if (normalizedSearchValue === '') {
    return true
  }
  const searchableText: string = [
    asset.hostname,
    asset.userName,
    asset.macAddress,
    asset.location,
    asset.model,
    asset.notes,
    asset.sourceSheet,
  ].join(' ')
  return normalizeText(searchableText).includes(normalizedSearchValue)
}

export function filterSectorGroups(params: FilterSectorGroupsParams): readonly SectorGroup[] {
  const normalizedSearchValue: string = normalizeText(params.searchValue)
  const selectedSectorGroups: readonly SectorGroup[] = params.selectedSectorId === 'all'
    ? params.sectorGroups
    : params.sectorGroups.filter((sectorGroup: SectorGroup) => sectorGroup.id === params.selectedSectorId)
  const matchingAssets: readonly AssetRecord[] = selectedSectorGroups.flatMap((sectorGroup: SectorGroup) =>
    sectorGroup.assets.filter((asset: AssetRecord) => doesAssetMatchSearch(asset, normalizedSearchValue)),
  )
  return groupAssetsBySector(matchingAssets)
}
