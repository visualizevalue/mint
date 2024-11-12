<template>
  <Transition name="fade">
    <aside v-if="! dismissed" class="alert" :class="[type]">
      <button v-if="dismissable" @click="dismiss" class="close">
        <Icon type="close" />
      </button>
      <slot />
    </aside>
  </Transition>
</template>

<script setup>
import { useLocalStorage } from '@vueuse/core'

const props = defineProps({
  type: {
    type: String,
    default: 'info',
  },
  dismiss: {
    type: String,
  }
})

const dismissKey = computed(() => `alert:${props.dismiss}`)

const dismissed = useLocalStorage(dismissKey.value, false)
const dismissable = computed(() => !! props.dismiss)

const dismiss = () => {
  dismissed.value = true
}
</script>

<style scoped>
.alert {
  position: relative;
  display: grid;
  gap: var(--spacer-sm);

  &.info {
    border-color: var(--alert-info-border-color) !important;
    background-color: var(--alert-info-background-color);
    color: var(--alert-info-color);
  }

  :deep(> h1) {
    text-transform: uppercase;
    font-weight: bold;
  }

  :deep(> h1),
  :deep(> p) {
    font-size: var(--font-sm);
  }

  .close {
    position: absolute;
    width: var(--size-5);
    padding: var(--size-1);
    top: var(--spacer-sm);
    right: var(--spacer-sm);
    background: none;

    &:--highlight {
      background: none;
    }
  }
}
</style>

