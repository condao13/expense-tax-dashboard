<script setup lang="ts">
import { computed } from 'vue'
import { useCurrency } from '../composables/useCurrency'
import type { Expense } from '../types'

const props = withDefaults(defineProps<{ expenses: Expense[]; removable?: boolean; editable?: boolean }>(), {
  removable: true,
  editable: true,
})
const emit = defineEmits<{ remove: [id: string]; edit: [expense: Expense] }>()

const { formatMoney } = useCurrency()

/** Rows above this amount are shown in bold. */
const HIGH_AMOUNT = 1000

// `computed` re-runs only when `props.expenses` changes.
const sorted = computed(() => [...props.expenses].sort((a, b) => b.date.localeCompare(a.date)))
const hasActions = computed(() => props.removable || props.editable)
</script>

<template>
  <p v-if="sorted.length === 0" class="empty">No expenses yet.</p>
  <table v-else class="expense-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Category</th>
        <th class="num">Amount</th>
        <th>Deductible</th>
        <th v-if="hasActions" aria-label="Actions"></th>
      </tr>
    </thead>
    <tbody>
      <!-- Object syntax: the class is added only while the expression is true. -->
      <tr v-for="e in sorted" :key="e.id" :class="{ big: e.amount > HIGH_AMOUNT }">
        <td>{{ e.date }}</td>
        <td>{{ e.description }}</td>
        <td>{{ e.category }}</td>
        <td class="num">{{ formatMoney(e.amount) }}</td>
        <td>{{ e.deductible ? 'Yes' : 'No' }}</td>
        <td v-if="hasActions" class="actions">
          <button v-if="editable" class="link edit" type="button" @click="emit('edit', e)">Edit</button>
          <button v-if="removable" class="link remove" type="button" @click="emit('remove', e.id)">Remove</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.expense-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
th,
td {
  padding: 0.6rem 0.9rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
th {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 600;
}
.big td {
  font-weight: 700;
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.empty {
  color: var(--muted);
}
.actions {
  white-space: nowrap;
}
.link {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-weight: 500;
}
.link + .link {
  margin-left: 0.9rem;
}
.edit {
  color: var(--accent);
}
.remove {
  color: var(--danger);
}
</style>
