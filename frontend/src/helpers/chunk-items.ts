export function chunkItems<Item>(items: readonly Item[], size: number): readonly (readonly Item[])[] {
  if (size <= 0) {
    return []
  }
  const chunks: Item[][] = []
  for (let index: number = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}
