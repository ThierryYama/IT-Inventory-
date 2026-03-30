export function createSlotId(sectorId: string, positionIndex: number): string {
  return `slot:${sectorId}:${positionIndex}`
}
