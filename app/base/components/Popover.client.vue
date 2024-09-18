<template>
  <Button
    :popovertarget="id"
    class="gas link"
    ref="trigger"
    @mouseenter="() => popover.showPopover()"
  ><slot name="trigger" /></Button>

  <Teleport to="body">
    <div
      popover
      ref="popover"
      :id="id"
      :style="popoverPosition"
      @mouseleave="() => popover.hidePopover()"
    >
      <div class="arrow" :style="popoverArrowPosition"></div>
      <slot name="content" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useElementBounding, useElementSize, useWindowSize } from '@vueuse/core'

const {
  id,
} = defineProps({
  id: String,
})

const trigger = ref()
const popover = ref()

const { width: windowWidth } = useWindowSize()
const { width: dialogWidth } = useElementSize(popover, undefined, { box: 'border-box' })
const { x: targetX, y: targetY, width: targetWidth, height: targetHeight } = useElementBounding(trigger)
const targetCenterX = computed(() => targetX.value + targetWidth.value / 2)
const adjustmentX = computed(() => {
  const popoverLeft = targetCenterX.value - (dialogWidth.value / 2)
  const overflow = parseInt(`${windowWidth.value - (popoverLeft + dialogWidth.value) - 29}`)
  return overflow < 0 ? overflow : 0
})

const popoverPosition = computed(() => {
  return {
    left: targetCenterX.value + adjustmentX.value + 'px',
    top: targetY.value + targetHeight.value + 'px',
  }
})

const popoverArrowPosition = computed(() => {
  return {
    left: dialogWidth.value/2 - adjustmentX.value + 'px',
  }
})
</script>

<style scoped>
[popover] {
  --width: min(100vw - var(--spacer)*2, var(--dialog-width));

  position: fixed;
  overflow: visible;
  width: var(--width);
  margin: 0;
  transition: transform var(--speed), opacity var(--speed);
  margin-left: calc(-0.5 * var(--width));

  background: var(--background);
  padding: var(--spacer);
  border: var(--border);
  color: var(--color);
  box-shadow: var(--shadow);

  &:popover-open {
    opacity: 1;
    transform: translateY(var(--spacer-sm));
  }

  .arrow {
    position: absolute;
    border-top: var(--border);
    border-left: var(--border);
    background: var(--background);
    transform: rotate(45deg);
    margin-left: calc(-0.5 * var(--size-3));
    width: var(--size-3);
    height: var(--size-3);
    top: calc(-1 * var(--size-2) + 1px);
  }
}

@starting-style {
  [popover]:popover-open {
    opacity: 0;
    transform: translateY(var(--spacer-lg));
  }
}
</style>
