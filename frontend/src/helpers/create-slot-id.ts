export function createSlotId(islandId: number, slotIndex: number): string {
  return `slot:${islandId}:${slotIndex}`
}
