<script setup lang="ts">
import { useCurrency } from '../composables/useCurrency'

// Props are read-only inputs from the parent.
defineProps<{
  total: number
  deductible: number
  deductibleCount: number
  taxSavings: number
  taxRate: number
}>()

const { formatMoney, formatPercent } = useCurrency()
</script>

<template>
  <section class="cards">
    <article class="card">
      <h3>Total spent</h3>
      <p class="value">{{ formatMoney(total) }}</p>
    </article>
    <article class="card">
      <h3>Deductible</h3>
      <p class="value">{{ formatMoney(deductible) }}</p>
      <p class="hint">{{ deductibleCount }} {{ deductibleCount === 1 ? 'expense' : 'expenses' }}</p>
    </article>
    <article class="card highlight">
      <h3>Estimated tax savings</h3>
      <p class="value">{{ formatMoney(taxSavings) }}</p>
      <p class="hint">at a {{ formatPercent(taxRate) }} marginal rate</p>
    </article>
  </section>
</template>

<style scoped>
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
}
.card h3 {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
}
.value {
  margin: 0.35rem 0 0;
  font-size: 1.6rem;
  font-weight: 700;
}
.highlight {
  border-color: var(--accent);
}
.hint {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--muted);
}
</style>
