export interface AssetRecord {
  readonly id: number
  readonly name: string
  readonly ipAddress: string | null
  readonly macAddress: string | null
  readonly wifiMacAddress: string | null
  readonly modelName: string | null
  readonly userName: string | null
  readonly processor: string | null
  readonly memory: string | null
  readonly storage: string | null
  readonly brand: string | null
  readonly partNumber: string | null
  readonly patrimony: string | null
  readonly desktopName: string | null
  readonly assetType: string | null
  readonly operatingSystem: string | null
  readonly sectorId: number
  readonly sectorName: string
  readonly islandId: number | null
  readonly islandSequenceNumber: number | null
  readonly slotIndex: number | null
  readonly createdAt: string
  readonly updatedAt: string
}
