<script setup>
import { money, moneyFull, num, ratio, initials } from '../lib/format.js'

const props = defineProps({
  node: Object,
  open: Boolean,
  highlight: Boolean,
})
defineEmits(['toggle'])

const person = props.node.data
const stats = props.node.stats
const reports = props.node.children?.length || 0
</script>

<template>
  <div
    class="w-full rounded-lg border bg-white text-left shadow-sm sm:w-64"
    :class="highlight ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'"
  >
    <div class="flex gap-3 p-3">
      <div class="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
        {{ initials(person.name) }}
      </div>
      <div class="min-w-0">
        <p class="truncate font-semibold">{{ person.name }}</p>
        <p class="truncate text-sm text-slate-600">{{ person.title }}</p>
        <p class="truncate text-xs text-slate-400">{{ person.department }} · {{ person.location }}</p>
      </div>
    </div>

    <div v-if="reports" class="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-100 px-3 py-2 text-xs">
      <div><span class="text-slate-500">Descendants</span><br /><b>{{ num(stats.descendants) }}</b></div>
      <div><span class="text-slate-500">Managers below</span><br /><b>{{ num(stats.managers) }}</b></div>
      <div :title="moneyFull(stats.managementCost)"><span class="text-slate-500">Mgmt cost</span><br /><b>{{ money(stats.managementCost) }}</b></div>
      <div :title="moneyFull(stats.icCost)"><span class="text-slate-500">IC cost</span><br /><b>{{ money(stats.icCost) }}</b></div>
      <div :title="moneyFull(stats.totalCost)"><span class="text-slate-500">Total cost</span><br /><b>{{ money(stats.totalCost) }}</b></div>
      <div title="Individual contributors per manager"><span class="text-slate-500">IC : Mgr</span><br /><b>{{ ratio(stats.ratio) }}</b></div>
    </div>

    <div class="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs">
      <span class="text-slate-500" :title="moneyFull(person.salary)">Salary {{ money(person.salary) }}</span>
      <button v-if="reports" class="font-medium text-indigo-600 hover:underline" @click="$emit('toggle')">
        {{ open ? 'Hide' : 'Show' }} {{ reports }} {{ reports === 1 ? 'report' : 'reports' }}
      </button>
      <span v-else class="text-slate-400">No reports</span>
    </div>
  </div>
</template>
