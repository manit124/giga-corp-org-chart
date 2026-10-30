<script setup>
import { onMounted, ref, shallowRef } from 'vue'
import { loadCsv, buildTree } from './lib/orgData.js'
import OrgChart from './components/OrgChart.vue'
import CostView from './components/CostView.vue'

const root = shallowRef(null)
const people = shallowRef([])
const error = ref('')
const tab = ref('chart')

onMounted(async () => {
  try {
    const rows = await loadCsv(`${import.meta.env.BASE_URL}data/people.csv`)
    root.value = buildTree(rows)
    people.value = root.value.descendants()
  } catch (e) {
    error.value = e.message
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col sm:h-dvh">
    <header class="border-b border-slate-200 bg-white px-4 pt-4 sm:px-6">
      <h1 class="text-xl font-semibold">Giga Corp Org Chart</h1>
      <nav class="mt-2 flex gap-5 text-sm">
        <button
          v-for="t in [{ id: 'chart', label: 'Org chart' }, { id: 'cost', label: 'Cost analysis' }]"
          :key="t.id"
          class="-mb-px border-b-2 pb-2"
          :class="tab === t.id ? 'border-indigo-600 font-medium' : 'border-transparent text-slate-500 hover:text-slate-800'"
          @click="tab = t.id"
        >
          {{ t.label }}
        </button>
      </nav>
    </header>

    <p v-if="error" class="m-4 rounded bg-red-50 p-3 text-sm text-red-700">Could not load data: {{ error }}</p>
    <p v-else-if="!root" class="p-6 text-sm text-slate-500">Loading 40,000 people…</p>

    <template v-else>
      <main v-show="tab === 'chart'" class="min-h-0 flex-1">
        <OrgChart :root="root" :people="people" />
      </main>
      <main v-if="tab === 'cost'" class="min-h-0 flex-1 overflow-auto">
        <CostView :people="people" />
      </main>
    </template>
  </div>
</template>
