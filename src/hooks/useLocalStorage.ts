import { useEffect, useState } from 'react'

/**
 * Persist a piece of state to localStorage.
 *
 * `sanitize` guards against data written by an older version of the app whose
 * shape no longer matches the current type. It receives the parsed value and
 * returns either a usable value (optionally repaired/migrated) or `null` to
 * discard it and fall back to `initialValue`. Without this, a schema change
 * silently crashes the component that reads the outdated shape (e.g. a Perk
 * saved before the `picks` array existed).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  sanitize?: (parsed: unknown) => T | null,
) {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(key)
    if (!stored) return initialValue
    try {
      const parsed = JSON.parse(stored) as unknown
      if (sanitize) {
        const cleaned = sanitize(parsed)
        return cleaned === null ? initialValue : cleaned
      }
      return parsed as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}
