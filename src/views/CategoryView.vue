<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ExpenseTable from '../components/ExpenseTable.vue'
import { useCurrency } from '../composables/useCurrency'
import { useExpensesStore } from '../stores/expenses'
import { isCategory, type Category } from '../types'
import { deductibleTotal, sumAmounts } from '../utils/tax'

const route = useRoute()
const store = useExpensesStore()
const { formatMoney } = useCurrency()

// The route param is any string the user typed in the URL: check it before trusting it.
// `computed` keeps it in sync if the param changes while this view stays mounted.
const name = computed(() => String(route.params.name ?? ''))
const category = computed<Category | null>(() => (isCategory(name.value) ? name.value : null))

const expenses = computed(() => store.expenses.filter((e) => e.category === category.value))
const total = computed(() => sumAmounts(expenses.value))
const deductible = computed(() => deductibleTotal(expenses.value))
</script>

<template>
  <RouterLink to="/" class="back">← Dashboard</RouterLink>

  <template v-if="category">
    <h1>{{ category }}</h1>
    <p class="summary">
      {{ expenses.length }} expense(s) · <strong>{{ formatMoney(total) }}</strong> ·
      {{ formatMoney(deductible) }} deductible
    </p>
    <ExpenseTable :expenses="expenses" :removable="false" :editable="false" />
  </template>

  <template v-else>
    <h1>Unknown category</h1>
    <p class="summary">There is no category called “{{ name }}”.</p>
  </template>
</template>

<style scoped>
.back {
  display: inline-block;
  margin-bottom: 0.75rem;
  text-decoration: none;
}
.summary {
  color: var(--muted);
  margin: -0.5rem 0 1rem;
}
</style>
