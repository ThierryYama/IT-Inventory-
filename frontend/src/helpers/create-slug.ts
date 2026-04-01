import { normalizeText } from './normalize-text'

export function createSlug(value: string): string {
  return normalizeText(value).replace(/\s+/g, '-')
}
