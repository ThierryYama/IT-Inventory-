interface ParsedSlotId {
  readonly sectorId: string
  readonly positionIndex: number
}

export function parseSlotId(slotId: string): ParsedSlotId | null {
  const [prefix, sectorId, positionIndexValue] = slotId.split(':')
  if (prefix !== 'slot' || !sectorId || !positionIndexValue) {
    return null
  }
  const positionIndex: number = Number(positionIndexValue)
  if (Number.isNaN(positionIndex)) {
    return null
  }
  return {
    sectorId,
    positionIndex,
  }
}
