<script setup lang="ts">
import { ref } from 'vue'
import { useExpensesStore } from '../stores/expenses'

const store = useExpensesStore()

// The input works in percent; the store keeps a fraction (27.5 -> 0.275).
const ratePercent = ref(store.taxRate * 100)
const message = ref('')
const error = ref('')

function saveRate() {
  error.value = ''
  message.value = ''
  try {
    store.setTaxRate(ratePercent.value / 100)
    message.value = 'Saved.'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not save.'
  }
}

function reset() {
  store.resetToSample()
  ratePercent.value = store.taxRate * 100
  message.value = 'Sample data restored.'
}
</script>

<template>
  <h1>Settings</h1>
  <section class="panel settings">
    <label>
      Marginal tax rate (%)
      <input v-model.number="ratePercent" type="number" min="0" max="100" step="0.5" />
    </label>
    <button type="button" @click="saveRate">Save rate</button>
    <p v-if="message" class="ok">{{ message }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </section>

  <section class="panel">
    <h2>Data</h2>
    <p>Everything is stored in this browser (localStorage). Nothing is sent to a server.</p>
    <button type="button" class="secondary" @click="reset">Restore sample data</button>
  </section>
</template>

<style scoped>
.settings {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: end;
}
.settings label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--muted);
}
.ok {
  color: var(--accent);
  margin: 0;
}
.error {
  color: var(--danger);
  margin: 0;
}
</style>
