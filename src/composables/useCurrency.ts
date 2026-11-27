/**
 * A composable is just a function that packages reusable logic.
 * Components call it inside <script setup> and get back what they need.
 */
export function useCurrency(currency = 'USD', locale = 'en-US') {
  const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency })
  const compact = new Intl.NumberFormat(locale, { style: 'currency', currency, notation: 'compact' })
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 })

  return {
    formatMoney: (value: number) => formatter.format(value),
    /** Short form for chart axes: $1.5K instead of $1,500.00. */
    formatMoneyCompact: (value: number) => compact.format(value),
    formatPercent: (value: number) => percent.format(value),
  }
}
