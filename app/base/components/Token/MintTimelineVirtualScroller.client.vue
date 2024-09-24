<template>
  <div ref="wrapper">
    <RecycleScroller
      :items="mints"
      :item-size="itemSize"
      key-field="tx"
      list-class="token-mint-timeline-items"
      page-mode
    >
      <template #before>
        <slot name="before" />
      </template>

      <template #default="{ item: mint }">
        <TokenMintTimelineItem
          :mint="mint"
          :key="mint.tx"
          :block="block"
        />
      </template>

      <template #after>
        <slot name="after" />
      </template>
    </RecycleScroller>
  </div>
</template>

<script setup>
import { useElementSize } from '@vueuse/core'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

defineProps({
  mints: Array,
  block: BigInt,
})

const wrapper = ref()
const REM = 16
const { width: wrapperWidth } = useElementSize(wrapper)
const itemSize = computed(() => 24 * REM > wrapperWidth.value ? 60 : 40)
</script>

