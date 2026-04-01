interface ParsedSlotId {
  readonly islandId: number
  readonly slotIndex: number
}

export function parseSlotId(slotId: string): ParsedSlotId | null {
  const [prefix, islandIdValue, slotIndexValue] = slotId.split(':')
  if (prefix !== 'slot' || !islandIdValue || !slotIndexValue) {
    return null
  }
  const islandId: number = Number(islandIdValue)
  const slotIndex: number = Number(slotIndexValue)
  if (Number.isNaN(islandId) || Number.isNaN(slotIndex)) {
    return null
  }
  return {
    islandId,
    slotIndex,
  }
}
