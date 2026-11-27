<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import CategoryChart from '../components/CategoryChart.vue'
import ExpenseTable from '../components/ExpenseTable.vue'
import MonthlyChart from '../components/MonthlyChart.vue'
import SummaryCards from '../components/SummaryCards.vue'
import { useExpensesStore } from '../stores/expenses'
import type { Category } from '../types'

const store = useExpensesStore()
// storeToRefs keeps reactivity when destructuring state and getters.
const { total, deductible, deductibleCount, taxSavings, taxRate, byCategory, byMonth, latest } = storeToRefs(store)

const router = useRouter()
function openCategory(category: Category) {
  router.push({ name: 'category', params: { name: category } })
}
</script>

<template>
  <h1>Dashboard</h1>
  <SummaryCards
    :total="total"
    :deductible="deductible"
    :deductible-count="deductibleCount"
    :tax-savings="taxSavings"
    :tax-rate="taxRate"
  />

  <section class="panel">
    <h2>Spending by category</h2>
    <p class="hint">Click a bar to see its expenses.</p>
    <CategoryChart :data="byCategory" @select="openCategory" />
  </section>

  <section class="panel">
    <h2>Spending by month</h2>
    <MonthlyChart :data="byMonth" />
  </section>

  <section class="panel">
    <h2>Latest expenses</h2>
    <ExpenseTable :expenses="latest" :removable="false" :editable="false" />
    <RouterLink to="/expenses">See all expenses →</RouterLink>
  </section>
</template>

<style scoped>
.hint {
  margin: -0.5rem 0 0.75rem;
  font-size: 0.8rem;
  color: var(--muted);
}
</style>
