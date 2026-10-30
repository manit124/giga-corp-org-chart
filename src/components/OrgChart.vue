<script setup>
import { nextTick, onMounted, provide, reactive, ref } from 'vue'
import OrgNode from './OrgNode.vue'
import PersonSearch from './PersonSearch.vue'

const props = defineProps({ root: Object, people: Array })

const expanded = reactive(new Set([props.root.id]))
const highlightId = ref(null)
provide('expanded', expanded)
provide('highlightId', highlightId)

const box = ref(null)
const tree = ref(null)
const zoom = ref(1)

function setZoom(z) {
  zoom.value = Math.min(1.5, Math.max(0.2, Math.round(z * 100) / 100))
}

function fit() {
  const width = tree.value.getBoundingClientRect().width / zoom.value
  setZoom(Math.min(1, (box.value.clientWidth - 32) / width))
  nextTick(centerTop)
}

function centerTop() {
  box.value.scrollLeft = (box.value.scrollWidth - box.value.clientWidth) / 2
  box.value.scrollTop = 0
}

function reset() {
  expanded.clear()
  expanded.add(props.root.id)
  highlightId.value = null
  setZoom(1)
  nextTick(centerTop)
}

async function showPerson(node) {
  node.ancestors().forEach((a) => a !== node && expanded.add(a.id))
  highlightId.value = node.id
  await nextTick()
  box.value.querySelector(`[data-id="${node.id}"]`).scrollIntoView({ block: 'center', inline: 'center' })
}

onMounted(centerTop)
defineExpose({ showPerson })
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
      <PersonSearch :people="people" @select="showPerson" />
      <button class="btn" @click="reset">Reset</button>
      <button class="btn" @click="expanded.clear()">Collapse all</button>

      <div class="ml-auto hidden items-center gap-1 sm:flex">
        <button class="btn w-9" title="Zoom out" @click="setZoom(zoom - 0.1)">−</button>
        <span class="w-12 text-center text-sm text-slate-600">{{ Math.round(zoom * 100) }}%</span>
        <button class="btn w-9" title="Zoom in" @click="setZoom(zoom + 0.1)">+</button>
        <button class="btn" @click="fit">Fit</button>
      </div>
    </div>

    <div ref="box" class="flex-1 overflow-auto p-4 sm:p-6">
      <div ref="tree" class="org-tree sm:mx-auto sm:w-max" :style="{ zoom }">
        <ul>
          <OrgNode :node="root" />
        </ul>
      </div>
    </div>
  </div>
</template>
