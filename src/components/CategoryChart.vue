<script setup lang="ts">
import * as d3 from 'd3'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { useCurrency } from '../composables/useCurrency'
import type { Category, CategoryTotal } from '../types'

const props = defineProps<{ data: CategoryTotal[] }>()
// D3 handles the DOM event; the component turns it into a Vue event the parent can listen to.
const emit = defineEmits<{ select: [category: Category] }>()

// A template ref gives us the real DOM element, which D3 needs to draw into.
const container = useTemplateRef<HTMLDivElement>('container')
const { formatMoney } = useCurrency()

const BAR_HEIGHT = 28
const MARGIN = { top: 8, right: 90, bottom: 8, left: 100 }

function render() {
  const el = container.value
  if (!el) return

  const width = el.clientWidth
  const height = MARGIN.top + MARGIN.bottom + props.data.length * BAR_HEIGHT

  // Vue owns the <div>; D3 owns everything inside it.
  d3.select(el).selectAll('*').remove()
  if (props.data.length === 0) return

  const svg = d3
    .select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    // `group`, not `img`: an image role would hide the clickable rows from screen readers.
    .attr('role', 'group')
    .attr('aria-label', 'Spending by category')

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.total) ?? 0])
    .range([MARGIN.left, Math.max(MARGIN.left, width - MARGIN.right)])

  const y = d3
    .scaleBand<string>()
    .domain(props.data.map((d) => d.category))
    .range([MARGIN.top, height - MARGIN.bottom])
    .padding(0.25)

  const rows = svg
    .selectAll('g.row')
    .data(props.data)
    .join('g')
    .attr('class', 'row')
    // Each row works like a link: clickable, focusable with Tab, activated with Enter or Space.
    .attr('role', 'link')
    .attr('tabindex', 0)
    .attr('aria-label', (d) => `${d.category}: ${formatMoney(d.total)}. Show expenses`)
    .on('click', (_event: MouseEvent, d) => emit('select', d.category))
    .on('keydown', (event: KeyboardEvent, d) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        emit('select', d.category)
      }
    })

  rows
    .append('text')
    .attr('x', MARGIN.left - 8)
    .attr('y', (d) => (y(d.category) ?? 0) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'end')
    .attr('class', 'label')
    .text((d) => d.category)

  rows
    .append('rect')
    .attr('x', x(0))
    .attr('y', (d) => y(d.category) ?? 0)
    .attr('height', y.bandwidth())
    .attr('rx', 4)
    .attr('class', 'bar')
    .attr('width', (d) => Math.max(0, x(d.total) - x(0)))

  rows
    .append('text')
    .attr('x', (d) => x(d.total) + 6)
    .attr('y', (d) => (y(d.category) ?? 0) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('class', 'value')
    .text((d) => formatMoney(d.total))
}

// Redraw when the data changes. flush: 'post' waits until Vue has updated the DOM.
watch(() => props.data, render, { deep: true, flush: 'post' })

// Redraw when the container is resized, debounced so a drag doesn't redraw 60 times a second.
let observer: ResizeObserver | undefined
let timer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  render()
  if (typeof ResizeObserver !== 'undefined' && container.value) {
    observer = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(render, 100)
    })
    observer.observe(container.value)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(timer)
})
</script>

<template>
  <div ref="container" class="chart"></div>
</template>

<style scoped>
.chart {
  width: 100%;
  min-height: 40px;
}
/* :deep() reaches elements that D3 created, which don't carry the scoped attribute. */
.chart :deep(.bar) {
  fill: var(--accent);
}
.chart :deep(.row) {
  cursor: pointer;
  outline: none;
}
.chart :deep(.row:hover .bar) {
  opacity: 0.8;
}
.chart :deep(.row:focus-visible .bar) {
  stroke: var(--text);
  stroke-width: 2;
}
.chart :deep(.label),
.chart :deep(.value) {
  font-size: 0.8rem;
  fill: var(--text);
}
</style>
