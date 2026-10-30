<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ people: Array })
const emit = defineEmits(['select'])

const query = ref('')
const open = ref(false)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (q.length < 2) return []
  return props.people.filter((n) => n.data.name.toLowerCase().includes(q)).slice(0, 8)
})

function pick(node) {
  query.value = node.data.name
  open.value = false
  emit('select', node)
}
</script>

<template>
  <div class="relative w-full sm:w-72">
    <input
      v-model="query"
      type="search"
      placeholder="Search by name…"
      class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      @focus="open = true"
      @input="open = true"
      @blur="open = false"
      @keydown.enter="results[0] && pick(results[0])"
    />
    <ul v-if="open && results.length" class="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white py-1 shadow-lg">
      <li
        v-for="n in results"
        :key="n.id"
        class="cursor-pointer px-3 py-1.5 text-sm hover:bg-slate-100"
        @mousedown.prevent="pick(n)"
      >
        {{ n.data.name }}
        <span class="block text-xs text-slate-500">{{ n.data.title }}</span>
      </li>
    </ul>
  </div>
</template>
