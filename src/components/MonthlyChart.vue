<script setup lang="ts">
import * as d3 from 'd3'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { useCurrency } from '../composables/useCurrency'
import type { MonthTotal } from '../types'

const props = defineProps<{ data: MonthTotal[] }>()

// Same pattern as CategoryChart: Vue owns the <div>, D3 draws inside it.
const container = useTemplateRef<HTMLDivElement>('container')
const { formatMoney, formatMoneyCompact } = useCurrency()

const HEIGHT = 220
const MARGIN = { top: 28, right: 24, bottom: 32, left: 56 }

// Months are stored as YYYY-MM; UTC avoids the label shifting a month in negative time zones.
const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
function formatMonth(month: string): string {
  return monthFormat.format(new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1)))
}

function render() {
  const el = container.value
  if (!el) return

  d3.select(el).selectAll('*').remove()
  if (props.data.length === 0) return

  const width = el.clientWidth
  const svg = d3
    .select(el)
    .append('svg')
    .attr('width', width)
    .attr('height', HEIGHT)
    .attr('role', 'img')
    .attr('aria-label', 'Spending by month')

  // scalePoint spreads the months evenly; padding keeps the first and last away from the edges.
  const x = d3
    .scalePoint<string>()
    .domain(props.data.map((d) => d.month))
    .range([MARGIN.left, Math.max(MARGIN.left, width - MARGIN.right)])
    .padding(0.5)

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(props.data, (d) => d.total) ?? 0])
    .nice()
    .range([HEIGHT - MARGIN.bottom, MARGIN.top])

  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(x).tickFormat(formatMonth).tickSizeOuter(0))

  svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(${MARGIN.left},0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(4)
        .tickFormat((value) => formatMoneyCompact(Number(value))),
    )

  const line = d3
    .line<MonthTotal>()
    .x((d) => x(d.month) ?? 0)
    .y((d) => y(d.total))

  svg.append('path').datum(props.data).attr('class', 'line').attr('d', line)

  const points = svg.selectAll('g.point').data(props.data).join('g').attr('class', 'point')

  points
    .append('circle')
    .attr('cx', (d) => x(d.month) ?? 0)
    .attr('cy', (d) => y(d.total))
    .attr('r', 4)
    .append('title')
    .text((d) => `${formatMonth(d.month)}: ${formatMoney(d.total)}`)

  points
    .append('text')
    .attr('x', (d) => x(d.month) ?? 0)
    .attr('y', (d) => y(d.total) - 10)
    .attr('text-anchor', 'middle')
    .attr('class', 'value')
    .text((d) => formatMoneyCompact(d.total))
}

// Redraw when the data changes. flush: 'post' waits until Vue has updated the DOM.
watch(() => props.data, render, { deep: true, flush: 'post' })

// Redraw on resize, debounced, and clean up when the component goes away.
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
.chart :deep(.line) {
  fill: none;
  stroke: var(--accent);
  stroke-width: 2;
}
.chart :deep(.point circle) {
  fill: var(--accent);
}
.chart :deep(.value) {
  font-size: 0.75rem;
  fill: var(--text);
}
.chart :deep(.axis text) {
  font-size: 0.75rem;
  fill: var(--muted);
}
.chart :deep(.axis path),
.chart :deep(.axis line) {
  stroke: var(--border);
}
</style>
