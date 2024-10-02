<template>
  <article class="token-full">
    <div class="frame">
      <Embed v-if="token.animationUrl" :src="token.animationUrl" />
      <Image v-else="token.image" :src="token.image" />
    </div>

    <Button :to="{ name: 'id-collection-tokenId' }">
      <Icon type="close" title="Close" />
    </Button>
  </article>
</template>

<script setup>
import { useScrollLock } from '@vueuse/core'

defineProps(['token'])

const isLocked = useScrollLock()

onMounted(() => {
  isLocked.value = true
})
</script>

<style scoped>
article {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 190;
  background: var(--background);

  > .frame {
    width: calc(min(100vw, 100dvh) - var(--spacer)*2);
  }

  > .button {
    position: absolute;
    top: var(--spacer);
    right: var(--spacer);
    z-index: 191;
  }
}
</style>
