<script setup>
import { inject, nextTick, ref } from 'vue'
import PersonCard from './PersonCard.vue'

const props = defineProps({ node: Object })

const expanded = inject('expanded')
const highlightId = inject('highlightId')
const el = ref(null)

async function toggle() {
  const id = props.node.id
  if (expanded.has(id)) {
    expanded.delete(id)
    return
  }
  expanded.add(id)
  await nextTick()
  el.value.firstElementChild.scrollIntoView({ block: 'nearest', inline: 'center' })
}
</script>

<template>
  <li ref="el" :data-id="node.id">
    <PersonCard :node="node" :open="expanded.has(node.id)" :highlight="highlightId === node.id" @toggle="toggle" />
    <ul v-if="node.children && expanded.has(node.id)">
      <OrgNode v-for="child in node.children" :key="child.id" :node="child" />
    </ul>
  </li>
</template>
