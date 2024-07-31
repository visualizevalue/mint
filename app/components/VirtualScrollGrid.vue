<template>
  <RecycleScroller
    :items="items"
    :item-size="itemSize"
    :item-secondary-size="itemHeight"
    :grid-items="gridItems"
    :key-field="ketField"
    v-slot="{ item, index, active }"
    class="virtual-scroller"
  >
    <slot :item="item" :index="index" :active="active" >
      <pre>{{ item }}</pre>
    </slot>
  </RecycleScroller>
</template>

<script setup>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'

const props = defineProps({
  items: Array,
  keyField: {
    type: String,
    default: 'id',
  },
  gridItems: {
    type: Number,
    default: 2,
  },
  itemSize: {
    type: Number,
    default: 69,
  },
  itemSecondarySize: {
    type: Number,
  },
})

const itemHeight = computed(() => props.itemSecondarySize || props.itemSize)
</script>

<style scoped>
</style>
