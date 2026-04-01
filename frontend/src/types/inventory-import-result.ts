export interface InventoryImportResult {
  readonly fileName: string
  readonly totalRows: number
  readonly createdCount: number
  readonly updatedCount: number
  readonly sectorCount: number
  readonly islandCount: number
}
