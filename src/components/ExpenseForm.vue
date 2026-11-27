<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { CATEGORIES, type Expense, type NewExpense } from '../types'
import { localIsoDate } from '../utils/date'
import { validateExpense, type ExpenseErrors } from '../utils/tax'

// `initial` switches the form to edit mode: it is pre-filled and "Save changes" replaces "Add expense".
const props = defineProps<{ initial?: Expense | null }>()

// Events are how a child talks back to its parent.
const emit = defineEmits<{ submit: [expense: NewExpense]; cancel: [] }>()

function emptyForm() {
  return {
    description: '',
    amount: null as number | null,
    category: '' as NewExpense['category'] | '',
    date: localIsoDate(),
    deductible: false,
  }
}

function formFrom(expense: Expense) {
  return {
    description: expense.description,
    amount: expense.amount as number | null,
    category: expense.category as NewExpense['category'] | '',
    date: expense.date,
    deductible: expense.deductible,
  }
}

// `reactive` makes the whole object reactive; v-model binds each field to an input.
const form = reactive(emptyForm())
const errors = ref<ExpenseErrors>({})
const isEditing = computed(() => Boolean(props.initial))

// Props are read-only, so the form keeps its own copy and refills it whenever the parent
// passes another expense to edit (or `null` to go back to adding).
watch(
  () => props.initial,
  (expense) => {
    Object.assign(form, expense ? formFrom(expense) : emptyForm())
    errors.value = {}
  },
  { immediate: true },
)

function onSubmit() {
  const candidate: Partial<NewExpense> = {
    description: form.description,
    amount: form.amount ?? undefined,
    category: form.category || undefined,
    date: form.date,
    deductible: form.deductible,
  }
  errors.value = validateExpense(candidate)
  if (Object.keys(errors.value).length > 0) return

  emit('submit', candidate as NewExpense)
  Object.assign(form, emptyForm())
}
</script>

<template>
  <form class="expense-form" :class="{ editing: isEditing }" novalidate @submit.prevent="onSubmit">
    <label>
      Description
      <input v-model="form.description" name="description" type="text" placeholder="e.g. Health insurance" />
      <small v-if="errors.description" class="error">{{ errors.description }}</small>
    </label>

    <label>
      Amount
      <input v-model.number="form.amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" />
      <small v-if="errors.amount" class="error">{{ errors.amount }}</small>
    </label>

    <label>
      Category
      <select v-model="form.category" name="category">
        <option value="" disabled>Choose…</option>
        <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
      </select>
      <small v-if="errors.category" class="error">{{ errors.category }}</small>
    </label>

    <label>
      Date
      <input v-model="form.date" name="date" type="date" />
      <small v-if="errors.date" class="error">{{ errors.date }}</small>
    </label>

    <label class="checkbox">
      <input v-model="form.deductible" name="deductible" type="checkbox" />
      Tax deductible
    </label>

    <div class="buttons">
      <button type="submit">{{ isEditing ? 'Save changes' : 'Add expense' }}</button>
      <button v-if="isEditing" type="button" class="secondary" @click="emit('cancel')">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.expense-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem 1rem;
  align-items: end;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
}
.editing {
  border-color: var(--accent);
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--muted);
}
.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
.buttons {
  display: flex;
  gap: 0.5rem;
}
.buttons button {
  white-space: nowrap;
}
.error {
  color: var(--danger);
}
</style>
