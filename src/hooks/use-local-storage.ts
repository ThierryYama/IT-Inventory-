import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

function readStoredValue<T>(storageKey: string, initialValue: T): T {
  if (typeof window === 'undefined') {
    return initialValue
  }
  const storedValue: string | null = window.localStorage.getItem(storageKey)
  if (storedValue === null) {
    return initialValue
  }
  try {
    return JSON.parse(storedValue) as T
  } catch {
    window.localStorage.removeItem(storageKey)
    return initialValue
  }
}

/**
 * Persists a React state value in localStorage.
 */
export function useLocalStorage<T>(
  storageKey: string,
  initialValue: T,
): readonly [T, Dispatch<SetStateAction<T>>, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => readStoredValue(storageKey, initialValue))
  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(storedValue))
    } catch {
      return
    }
  }, [storageKey, storedValue])
  function clearStoredValue(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey)
    }
    setStoredValue(initialValue)
  }
  return [storedValue, setStoredValue, clearStoredValue] as const
}
