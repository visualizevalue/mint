<template>
  <DynamicScroller
    :items="items"
    :min-item-size="minItemSize"
    :page-mode="true"
    :buffer="800"
    class="virtual-scroll"
  >
    <template v-slot="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :data-index="index"
      >
        <slot :item="item" :index="index" :active="active" />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
</template>

<script setup>
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'

const props = defineProps({
  items: Array,
  minItemSize: {
    type: Number,
    default: 69,
  },
  getSizeDependency: {
    type: Function,
    default: () => (item) => [item.body]
  },
})
</script>

<style scoped>
</style>
