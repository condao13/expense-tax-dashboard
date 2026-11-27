import { describe, expect, it } from 'vitest'
import type { Expense } from '../types'
import { csvField, expensesToCsv } from './csv'

const expense = (overrides: Partial<Expense>): Expense => ({
  id: '1',
  description: 'Dentist',
  amount: 180,
  category: 'Health',
  date: '2026-11-03',
  deductible: true,
  ...overrides,
})

describe('csv utils', () => {
  it('writes only the header for an empty list', () => {
    expect(expensesToCsv([])).toBe('Date,Description,Category,Amount,Deductible\r\n')
  })

  it('writes one row per expense with two decimals and Yes/No', () => {
    const csv = expensesToCsv([expense({}), expense({ id: '2', description: 'Rent', amount: 1500.5, deductible: false })])
    expect(csv.split('\r\n')).toEqual([
      'Date,Description,Category,Amount,Deductible',
      '2026-11-03,Dentist,Health,180.00,Yes',
      '2026-11-03,Rent,Health,1500.50,No',
      '',
    ])
  })

  it('quotes commas, quotes, line breaks and edge spaces', () => {
    expect(csvField('Rent, October')).toBe('"Rent, October"')
    expect(csvField('The "big" one')).toBe('"The ""big"" one"')
    expect(csvField('two\nlines')).toBe('"two\nlines"')
    expect(csvField(' padded ')).toBe('" padded "')
    expect(csvField('plain')).toBe('plain')
  })

  it('defuses values that a spreadsheet would run as formulas', () => {
    expect(csvField('=HYPERLINK("http://x")')).toBe(`"'=HYPERLINK(""http://x"")"`)
    expect(csvField('+1')).toBe("'+1")
    expect(csvField('-1')).toBe("'-1")
    expect(csvField('@SUM(A1)')).toBe("'@SUM(A1)")
  })
})
