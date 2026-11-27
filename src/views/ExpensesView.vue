<script setup lang="ts">
import { computed, ref } from 'vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import ExpenseForm from '../components/ExpenseForm.vue'
import ExpenseTable from '../components/ExpenseTable.vue'
import { useCurrency } from '../composables/useCurrency'
import { useExpensesStore } from '../stores/expenses'
import { CATEGORIES, type Category, type Expense, type NewExpense } from '../types'
import { expensesToCsv } from '../utils/csv'
import { localIsoDate } from '../utils/date'
import { sumAmounts } from '../utils/tax'

const store = useExpensesStore()
const { formatMoney } = useCurrency()

// Filter state lives in the view: it is UI state, not app data.
const category = ref<Category | ''>('')
const month = ref('') // YYYY-MM from <input type="month">
const onlyDeductible = ref(false)
const search = ref('')

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return store.expenses.filter(
    (e) =>
      (!category.value || e.category === category.value) &&
      (!month.value || e.date.startsWith(month.value)) &&
      (!onlyDeductible.value || e.deductible) &&
      (!term || e.description.toLowerCase().includes(term)),
  )
})
const filteredTotal = computed(() => sumAmounts(filtered.value))

function clearFilters() {
  category.value = ''
  month.value = ''
  onlyDeductible.value = false
  search.value = ''
}

// --- Editing: the table emits `edit`, the form receives the expense as `initial`.
const editing = ref<Expense | null>(null)

function startEdit(expense: Expense) {
  // A copy gives the form a new object each time, so clicking Edit again refills it.
  editing.value = { ...expense }
}

function onSubmit(input: NewExpense) {
  if (editing.value) {
    store.updateExpense(editing.value.id, input)
    editing.value = null
  } else {
    store.addExpense(input)
  }
}

// --- Removing, after confirmation.
const pendingRemoval = ref<Expense | null>(null)

function askRemove(id: string) {
  pendingRemoval.value = store.expenses.find((e) => e.id === id) ?? null
}

function confirmRemove() {
  const target = pendingRemoval.value
  if (!target) return
  store.removeExpense(target.id)
  if (editing.value?.id === target.id) editing.value = null
  pendingRemoval.value = null
}

// --- Export what is on screen (filters applied), newest first like the table.
function exportCsv() {
  const rows = [...filtered.value].sort((a, b) => b.date.localeCompare(a.date))
  // The BOM makes Excel read the file as UTF-8 (accents, currency symbols).
  const blob = new Blob(['﻿', expensesToCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `expenses-${localIsoDate()}.csv`
  link.click()
  // Free the memory once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
</script>

<template>
  <h1>Expenses</h1>
  <ExpenseForm :initial="editing" @submit="onSubmit" @cancel="editing = null" />

  <section class="filters">
    <label class="search">
      Search
      <input v-model="search" type="search" placeholder="Description contains…" />
    </label>
    <label>
      Category
      <select v-model="category">
        <option value="">All</option>
        <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>
    <label>
      Month
      <input v-model="month" type="month" />
    </label>
    <label class="checkbox">
      <input v-model="onlyDeductible" type="checkbox" />
      Deductible only
    </label>
    <button type="button" class="secondary" @click="clearFilters">Clear filters</button>
    <button type="button" class="secondary" :disabled="filtered.length === 0" @click="exportCsv">Export CSV</button>
    <p class="total">
      {{ filtered.length }} expense(s) · <strong>{{ formatMoney(filteredTotal) }}</strong>
    </p>
  </section>

  <ExpenseTable :expenses="filtered" @edit="startEdit" @remove="askRemove" />

  <ConfirmDialog
    :open="pendingRemoval !== null"
    title="Remove expense?"
    confirm-label="Remove"
    @confirm="confirmRemove"
    @cancel="pendingRemoval = null"
  >
    <template v-if="pendingRemoval">
      “{{ pendingRemoval.description }}” ({{ formatMoney(pendingRemoval.amount) }}) will be deleted. This can’t be
      undone.
    </template>
  </ConfirmDialog>
</template>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: end;
  margin: 1.25rem 0 1rem;
}
.filters label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--muted);
}
.filters .checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
.search input {
  min-width: 220px;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.total {
  margin: 0 0 0 auto;
}
</style>
