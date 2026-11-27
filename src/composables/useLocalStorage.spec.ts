import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useLocalStorage } from './useLocalStorage'

const isNumberList = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((n) => typeof n === 'number')

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('starts from a copy of the default when nothing is saved', () => {
    const fallback = [1, 2]
    const list = useLocalStorage('k', fallback)
    expect(list.value).toEqual([1, 2])
    list.value.push(3)
    expect(fallback).toEqual([1, 2])
  })

  it('loads a saved value', () => {
    localStorage.setItem('k', JSON.stringify([7, 8]))
    expect(useLocalStorage('k', [] as number[]).value).toEqual([7, 8])
  })

  it('falls back to the default for broken JSON or a value that fails validation', () => {
    localStorage.setItem('k', '{not json')
    expect(useLocalStorage('k', [0], isNumberList).value).toEqual([0])

    localStorage.setItem('k', JSON.stringify(['a']))
    expect(useLocalStorage('k', [0], isNumberList).value).toEqual([0])
  })

  it('saves when .value is replaced and when it is changed in place', async () => {
    const list = useLocalStorage('k', [1])

    list.value = [2]
    await nextTick()
    expect(localStorage.getItem('k')).toBe('[2]')

    list.value.push(3)
    await nextTick()
    expect(localStorage.getItem('k')).toBe('[2,3]')
  })
})
