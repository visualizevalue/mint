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
const updateBreadcrumbs = () => {
  if (Array.isArray(props.title)) {
    breadcrumbs.value = props.title
  } else {
    breadcrumbs.value = []
  }
}
onMounted(() => updateBreadcrumbs())
watch(props, () => updateBreadcrumbs())
</script>

<style scoped>
.frame {
  margin: 0 auto;
  gap: 0;
  max-width: 100vw;
  display: grid;
  width: 100%;

  &.inset {
    gap: var(--spacer);
    padding: var(--spacer);
    overflow-x: hidden;

    > *:not(.borderless) {
      border: var(--border);
      padding: var(--spacer);
    }
  }

  &:not(.inset) {
    > * {
      padding: var(--spacer);

      &:not(.borderless):not(:last-child) {
        border-bottom: var(--border);
      }

      @media (--md) {
        padding: var(--spacer-lg) var(--spacer);
      }
    }
  }

  :deep(> *) {
    width: 100%;
  }

  @media (--sm) {
    min-height: 0;
  }

  @media (--md) {
    max-width: var(--content-width);

    &.wide {
      max-width: var(--content-width-lg);
    }

    &.full {
      max-width: 100%;
    }
  }
}
</style>
