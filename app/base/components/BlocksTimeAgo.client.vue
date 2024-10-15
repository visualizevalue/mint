<template>
  <span>
    <template v-if="days">{{ days }}d</template>
    <template v-else-if="hours">{{ hours }}h</template>
    <template v-else-if="minutes">{{ minutes }}m</template>
    <template v-else>&#60;1m</template>
    <slot> ago</slot>
  </span>
</template>

<script setup>
const props = defineProps({
  blocks: BigInt,
})

const seconds = computed(() => Number(blocksToSeconds(props.blocks)))
const minutes = computed(() => Math.floor(seconds.value / 60))
const hours = computed(() => Math.floor(minutes.value / 60))
const days = computed(() => Math.floor(hours.value / 24))
</script>
