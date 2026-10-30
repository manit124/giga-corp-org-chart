<script setup>
import { computed, ref } from 'vue'
import { money, moneyFull, num, ratio } from '../lib/format.js'

const props = defineProps({ people: Array })

const groupBy = ref('department')

function add(group, node) {
  group.headcount++
  if (node.children) {
    group.managers++
    group.managementCost += node.data.salary
  } else {
    group.ics++
    group.icCost += node.data.salary
  }
}

function newGroup(name) {
  return { name, headcount: 0, managers: 0, ics: 0, managementCost: 0, icCost: 0 }
}

const totals = computed(() => {
  const t = newGroup('All')
  props.people.forEach((n) => add(t, n))
  const salaries = props.people.map((n) => n.data.salary).sort((a, b) => a - b)
  t.totalCost = t.managementCost + t.icCost
  t.median = salaries[Math.floor(salaries.length / 2)]
  return t
})

function groupPeople(getKey) {
  const groups = {}
  for (const n of props.people) {
    const key = getKey(n)
    groups[key] ??= newGroup(key)
    add(groups[key], n)
  }
  return Object.values(groups).map((g) => ({ ...g, totalCost: g.managementCost + g.icCost }))
}

const tableRows = computed(() => {
  const key = groupBy.value === 'department' ? (n) => n.data.department : (n) => n.data.location
  return groupPeople(key).sort((a, b) => b.totalCost - a.totalCost)
})

const levelRows = computed(() => groupPeople((n) => n.depth + 1).sort((a, b) => a.name - b.name))

const maxRow = (rows) => Math.max(...rows.map((r) => r.totalCost))
const barTitle = (r) =>
  `Management ${moneyFull(r.managementCost)} · IC ${moneyFull(r.icCost)} · Total ${moneyFull(r.totalCost)}`

const tiles = computed(() => {
  const t = totals.value
  const share = Math.round((t.managementCost / t.totalCost) * 100)
  return [
    { label: 'Headcount', value: num(t.headcount), sub: `${num(t.managers)} managers, ${num(t.ics)} ICs` },
    { label: 'Total payroll', value: money(t.totalCost), sub: moneyFull(t.totalCost) },
    { label: 'Management cost', value: money(t.managementCost), sub: `${share}% of payroll` },
    { label: 'IC cost', value: money(t.icCost), sub: `${100 - share}% of payroll` },
    { label: 'ICs per manager', value: ratio(t.ics / t.managers), sub: 'across the company' },
    { label: 'Average salary', value: money(t.totalCost / t.headcount), sub: `median ${money(t.median)}` },
  ]
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
    <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <div v-for="t in tiles" :key="t.label" class="rounded-lg border border-slate-200 bg-white p-4">
        <p class="text-xs text-slate-500">{{ t.label }}</p>
        <p class="mt-1 text-xl font-semibold">{{ t.value }}</p>
        <p class="text-xs text-slate-500">{{ t.sub }}</p>
      </div>
    </div>

    <p class="flex gap-4 text-xs text-slate-600">
      <span><span class="mr-1 inline-block size-2.5 rounded-sm bg-[var(--mgmt)]"></span>Management cost</span>
      <span><span class="mr-1 inline-block size-2.5 rounded-sm bg-[var(--ic)]"></span>IC cost</span>
    </p>

    <section class="rounded-lg border border-slate-200 bg-white p-4">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 class="font-semibold">Cost by {{ groupBy }}</h2>
        <select v-model="groupBy" class="rounded-md border border-slate-300 px-2 py-1 text-sm">
          <option value="department">Department</option>
          <option value="location">Location</option>
        </select>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[40rem] text-sm">
          <thead class="text-left text-xs text-slate-500">
            <tr class="border-b border-slate-200">
              <th class="py-2 font-medium capitalize">{{ groupBy }}</th>
              <th class="px-3 py-2 text-right font-medium">People</th>
              <th class="px-3 py-2 text-right font-medium">ICs / mgr</th>
              <th class="px-3 py-2 text-right font-medium">Avg salary</th>
              <th class="px-3 py-2 text-right font-medium">Total cost</th>
              <th class="w-1/3 py-2 pl-4 font-medium">Mgmt vs IC</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in tableRows" :key="r.name" class="border-b border-slate-100 last:border-0">
              <td class="py-2">{{ r.name }}</td>
              <td class="px-3 py-2 text-right whitespace-nowrap">{{ num(r.headcount) }}</td>
              <td class="px-3 py-2 text-right whitespace-nowrap">{{ ratio(r.managers ? r.ics / r.managers : null) }}</td>
              <td class="px-3 py-2 text-right whitespace-nowrap">{{ money(r.totalCost / r.headcount) }}</td>
              <td class="px-3 py-2 text-right whitespace-nowrap" :title="moneyFull(r.totalCost)">{{ money(r.totalCost) }}</td>
              <td class="py-2 pl-4">
                <div class="bar" :style="{ width: (r.totalCost / maxRow(tableRows)) * 100 + '%' }" :title="barTitle(r)">
                  <div class="bg-[var(--mgmt)]" :style="{ flex: r.managementCost }"></div>
                  <div class="bg-[var(--ic)]" :style="{ flex: r.icCost }"></div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="rounded-lg border border-slate-200 bg-white p-4">
      <h2 class="font-semibold">Cost by level</h2>
      <p class="mb-3 text-sm text-slate-500">Level 1 is the CEO. Hover a bar for the exact numbers.</p>
      <div class="space-y-2">
        <div v-for="r in levelRows" :key="r.name" class="grid grid-cols-[4.5rem_1fr_9rem] items-center gap-3 text-sm">
          <span class="text-slate-600">Level {{ r.name }}</span>
          <div class="bar h-4" :style="{ width: Math.max(0.5, (r.totalCost / maxRow(levelRows)) * 100) + '%' }" :title="barTitle(r)">
            <div v-if="r.managementCost" class="bg-[var(--mgmt)]" :style="{ flex: r.managementCost }"></div>
            <div v-if="r.icCost" class="bg-[var(--ic)]" :style="{ flex: r.icCost }"></div>
          </div>
          <span class="text-right whitespace-nowrap text-slate-600">{{ money(r.totalCost) }} <span class="text-xs text-slate-400">· {{ num(r.headcount) }}</span></span>
        </div>
      </div>
    </section>
  </div>
</template>
