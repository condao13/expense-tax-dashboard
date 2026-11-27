import { describe, expect, it } from 'vitest'
import { localIsoDate } from './date'

describe('localIsoDate', () => {
  it('uses the local calendar date, zero-padded', () => {
    // Built from local parts, so the expected value does not depend on the machine's time zone.
    expect(localIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
    expect(localIsoDate(new Date(2026, 10, 25, 22, 0))).toBe('2026-11-25')
  })
})
