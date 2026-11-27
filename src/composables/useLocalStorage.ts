import { ref, watch, type Ref } from 'vue'

/**
 * A ref that loads itself from localStorage and saves itself on every change.
 *
 * - `defaultValue` is used when nothing is saved yet, the saved JSON is broken,
 *   or `isValid` rejects it. It is cloned, so the caller's object is never mutated.
 * - `deep: true` makes edits inside objects and arrays (e.g. `push`) trigger a save,
 *   not only replacing `.value`.
 * - Storage can be unavailable (private mode, quota): the ref then simply works in memory.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  isValid?: (value: unknown) => value is T,
): Ref<T> {
  function read(): T {
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) {
        const parsed: unknown = JSON.parse(raw)
        if (!isValid || isValid(parsed)) return parsed as T
      }
    } catch {
      // Unavailable storage or bad JSON: fall back to the default below.
    }
    return structuredClone(defaultValue)
  }

  const value = ref(read()) as Ref<T>

  watch(
    value,
    (current) => {
      try {
        localStorage.setItem(key, JSON.stringify(current))
      } catch {
        // Ignore: the app keeps working in memory.
      }
    },
    { deep: true },
  )

  return value
}
