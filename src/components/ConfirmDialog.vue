<script setup lang="ts">
import { nextTick, useId, useTemplateRef, watch } from 'vue'

/**
 * A reusable confirmation dialog. The parent controls `open`; the message
 * comes through the default slot, so it can hold any markup.
 */
const props = withDefaults(
  defineProps<{ open: boolean; title: string; confirmLabel?: string; cancelLabel?: string }>(),
  { confirmLabel: 'Confirm', cancelLabel: 'Cancel' },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()

// Unique ids tie the title and message to the dialog for screen readers.
const titleId = useId()
const messageId = useId()
const cancelButton = useTemplateRef<HTMLButtonElement>('cancelButton')

// Focus the safe choice when the dialog opens, so pressing Enter never deletes by accident.
watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    cancelButton.value?.focus()
  },
)
</script>

<template>
  <div v-if="open" class="backdrop" @click.self="emit('cancel')" @keydown.esc="emit('cancel')">
    <div class="dialog" role="alertdialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="messageId">
      <h2 :id="titleId">{{ title }}</h2>
      <div :id="messageId" class="message">
        <slot />
      </div>
      <div class="actions">
        <button ref="cancelButton" type="button" class="secondary" @click="emit('cancel')">{{ cancelLabel }}</button>
        <button type="button" class="danger" @click="emit('confirm')">{{ confirmLabel }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(0 0 0 / 0.45);
  z-index: 10;
}
.dialog {
  width: min(420px, 100%);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 12px 32px rgb(0 0 0 / 0.25);
}
.message {
  color: var(--muted);
  margin: 0.25rem 0 1.25rem;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.danger {
  background: var(--danger);
  border-color: var(--danger);
}
</style>
