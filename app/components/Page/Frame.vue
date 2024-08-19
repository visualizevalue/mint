<template>
  <section class="frame">
    <slot />
  </section>
</template>

<script setup>

const props = defineProps({
  title: [String, Array],
})

const breadcrumbs = useAppBreadcrumb()
onMounted(() => {
  if (Array.isArray(props.title)) {
    breadcrumbs.value = props.title
  } else {
    breadcrumbs.value = []
  }
})
</script>

<style lang="postcss" scoped>
.frame {
  margin: 0 auto;
  gap: 0;
  max-width: 100vw;
  display: flex;
  height: fit-content;
  align-self: center;
  flex-direction: column;
  align-items: center;
  gap: var(--spacer);
  width: 100%;

  :deep(> *) {
    width: 100%;
    padding: var(--spacer);

    &:not(:last-child) {
      border-bottom: var(--border);
    }

    @media (--md) {
      padding: var(--spacer-lg) 0;
    }
  }

  @media (--sm) {
    min-height: 0;
  }
  @media (--md) {
    max-width: var(--content-width);
  }
}
</style>
