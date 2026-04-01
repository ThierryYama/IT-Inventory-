import axios, { type AxiosInstance } from 'axios'
import type { AssetFormValues } from '../types/asset-form-values'
import type { AssetHistoryRecord } from '../types/asset-history-record'
import type { AssetMovePayload } from '../types/asset-move-payload'
import type { AssetIsland } from '../types/asset-island'
import type { AssetRecord } from '../types/asset-record'
import type { InventoryImportResult } from '../types/inventory-import-result'
import type { SectorGroup } from '../types/sector-group'
import type { SectorSummary } from '../types/sector-summary'

interface ApiAssetRecord {
  readonly id: number
  readonly name: string
  readonly ip_address: string | null
  readonly mac_address: string | null
  readonly wifi_mac_address: string | null
  readonly model_name: string | null
  readonly user_name: string | null
  readonly processor: string | null
  readonly memory: string | null
  readonly storage: string | null
  readonly brand: string | null
  readonly part_number: string | null
  readonly patrimony: string | null
  readonly desktop_name: string | null
  readonly asset_type: string | null
  readonly operating_system: string | null
  readonly sector_id: number
  readonly sector_name: string
  readonly island_id: number | null
  readonly island_sequence_number: number | null
  readonly slot_index: number | null
  readonly created_at: string
  readonly updated_at: string
}

interface ApiAssetHistoryRecord {
  readonly id: number
  readonly asset_id: number
  readonly event_type: string
  readonly details: Record<string, unknown>
  readonly created_at: string
  readonly updated_at: string
}

interface ApiInventoryImportResult {
  readonly file_name: string
  readonly total_rows: number
  readonly created_count: number
  readonly updated_count: number
  readonly sector_count: number
  readonly island_count: number
}

interface ApiSectorIslandsResponse {
  readonly id: number
  readonly name: string
  readonly islands: readonly ApiIsland[]
  readonly created_at: string
  readonly updated_at: string
}

interface ApiIsland {
  readonly id: number
  readonly sector_id: number
  readonly sequence_number: number
  readonly capacity: number
  readonly asset_count: number
  readonly assets: readonly ApiAssetRecord[]
  readonly created_at: string
  readonly updated_at: string
}

interface ApiSectorSummary {
  readonly id: number
  readonly name: string
  readonly island_count: number
  readonly asset_count: number
  readonly created_at: string
  readonly updated_at: string
}

interface ListAssetsParams {
  readonly search?: string
  readonly sector?: string
}

function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: '/api',
  })
}

function mapAssetRecord(asset: ApiAssetRecord): AssetRecord {
  return {
    id: asset.id,
    name: asset.name,
    ipAddress: asset.ip_address,
    macAddress: asset.mac_address,
    wifiMacAddress: asset.wifi_mac_address,
    modelName: asset.model_name,
    userName: asset.user_name,
    processor: asset.processor,
    memory: asset.memory,
    storage: asset.storage,
    brand: asset.brand,
    partNumber: asset.part_number,
    patrimony: asset.patrimony,
    desktopName: asset.desktop_name,
    assetType: asset.asset_type,
    operatingSystem: asset.operating_system,
    sectorId: asset.sector_id,
    sectorName: asset.sector_name,
    islandId: asset.island_id,
    islandSequenceNumber: asset.island_sequence_number,
    slotIndex: asset.slot_index,
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
  }
}

function mapAssetHistoryRecord(historyEntry: ApiAssetHistoryRecord): AssetHistoryRecord {
  return {
    id: historyEntry.id,
    assetId: historyEntry.asset_id,
    eventType: historyEntry.event_type,
    details: historyEntry.details,
    createdAt: historyEntry.created_at,
    updatedAt: historyEntry.updated_at,
  }
}

function mapInventoryImportResult(result: ApiInventoryImportResult): InventoryImportResult {
  return {
    fileName: result.file_name,
    totalRows: result.total_rows,
    createdCount: result.created_count,
    updatedCount: result.updated_count,
    sectorCount: result.sector_count,
    islandCount: result.island_count,
  }
}

function mapSectorSummary(sector: ApiSectorSummary): SectorSummary {
  return {
    id: sector.id,
    name: sector.name,
    islandCount: sector.island_count,
    assetCount: sector.asset_count,
    createdAt: sector.created_at,
    updatedAt: sector.updated_at,
  }
}

function mapAssetIsland(island: ApiIsland): AssetIsland {
  return {
    id: island.id,
    sectorId: island.sector_id,
    sequenceNumber: island.sequence_number,
    capacity: island.capacity,
    assetCount: island.asset_count,
    assets: island.assets.map(mapAssetRecord),
  }
}

function mapSectorGroup(sector: ApiSectorIslandsResponse): SectorGroup {
  const islands: readonly AssetIsland[] = sector.islands.map(mapAssetIsland)
  return {
    id: sector.id,
    sectorName: sector.name,
    islandCount: islands.length,
    assetCount: islands.reduce((total: number, island: AssetIsland) => total + island.assets.length, 0),
    assets: islands.flatMap((island: AssetIsland) => island.assets),
    islands,
  }
}

function normalizeOptionalValue(value: string): string | null {
  const trimmedValue: string = value.trim()
  return trimmedValue === '' ? null : trimmedValue
}

function buildAssetPayload(values: AssetFormValues): Record<string, string | null> {
  return {
    name: values.name.trim(),
    sector_name: values.sectorName.trim(),
    ip_address: normalizeOptionalValue(values.ipAddress),
    mac_address: normalizeOptionalValue(values.macAddress),
    wifi_mac_address: normalizeOptionalValue(values.wifiMacAddress),
    model_name: normalizeOptionalValue(values.modelName),
    user_name: normalizeOptionalValue(values.userName),
    processor: normalizeOptionalValue(values.processor),
    memory: normalizeOptionalValue(values.memory),
    storage: normalizeOptionalValue(values.storage),
    brand: normalizeOptionalValue(values.brand),
    part_number: normalizeOptionalValue(values.partNumber),
    patrimony: normalizeOptionalValue(values.patrimony),
    desktop_name: normalizeOptionalValue(values.desktopName),
    asset_type: normalizeOptionalValue(values.assetType),
    operating_system: normalizeOptionalValue(values.operatingSystem),
  }
}

const apiClient: AxiosInstance = createApiClient()

export const inventoryApi = {
  async createIsland(sectorName: string, capacity: number): Promise<AssetIsland> {
    const encodedSectorName: string = encodeURIComponent(sectorName)
    const response = await apiClient.post<ApiIsland>(`/sectors/${encodedSectorName}/islands`, {
      capacity,
    })
    return mapAssetIsland(response.data)
  },
  async deleteIsland(islandId: number): Promise<void> {
    await apiClient.delete(`/sectors/islands/${islandId}`)
  },
  async createAsset(values: AssetFormValues): Promise<AssetRecord> {
    const response = await apiClient.post<ApiAssetRecord>('/assets', buildAssetPayload(values))
    return mapAssetRecord(response.data)
  },
  async deleteAsset(assetId: number): Promise<void> {
    await apiClient.delete(`/assets/${assetId}`)
  },
  async exportAssetsCsv(): Promise<Blob> {
    const response = await apiClient.get<Blob>('/export', {
      responseType: 'blob',
    })
    return response.data
  },
  async fetchAssetHistory(assetId: number): Promise<readonly AssetHistoryRecord[]> {
    const response = await apiClient.get<readonly ApiAssetHistoryRecord[]>(`/assets/${assetId}/history`)
    return response.data.map(mapAssetHistoryRecord)
  },
  async fetchAssets(params: ListAssetsParams = {}): Promise<readonly AssetRecord[]> {
    const response = await apiClient.get<readonly ApiAssetRecord[]>('/assets', {
      params,
    })
    return response.data.map(mapAssetRecord)
  },
  async fetchSectorGroup(sectorName: string): Promise<SectorGroup> {
    const encodedSectorName: string = encodeURIComponent(sectorName)
    const response = await apiClient.get<ApiSectorIslandsResponse>(`/sectors/${encodedSectorName}/islands`)
    return mapSectorGroup(response.data)
  },
  async fetchSectors(): Promise<readonly SectorSummary[]> {
    const response = await apiClient.get<readonly ApiSectorSummary[]>('/sectors')
    return response.data.map(mapSectorSummary)
  },
  async importInventory(file: File): Promise<InventoryImportResult> {
    const formData: FormData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ApiInventoryImportResult>('/inventory/bulk-import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return mapInventoryImportResult(response.data)
  },
  async moveAsset(assetId: number, payload: AssetMovePayload): Promise<AssetRecord> {
    const response = await apiClient.patch<ApiAssetRecord>(`/assets/${assetId}/move`, {
      target_island_id: payload.targetIslandId,
      target_slot_index: payload.targetSlotIndex,
    })
    return mapAssetRecord(response.data)
  },
  async updateAsset(assetId: number, values: AssetFormValues): Promise<AssetRecord> {
    const response = await apiClient.patch<ApiAssetRecord>(`/assets/${assetId}`, buildAssetPayload(values))
    return mapAssetRecord(response.data)
  },
} as const
