export interface AssetHistoryRecord {
  readonly id: number
  readonly assetId: number
  readonly eventType: string
  readonly details: Record<string, unknown>
  readonly createdAt: string
  readonly updatedAt: string
}
