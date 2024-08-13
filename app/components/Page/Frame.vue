<template>
  <section class="frame">
    <header v-if="title">
      <h1 v-if="typeof title === 'string'">{{ title }}</h1>
      <Breadcrumbs v-else :items="title" />
      <slot name="header" />
    </header>

    <slot name="floating-top" />

    <div>
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: [String, Array],
})
</script>

<style lang="postcss" scoped>
.frame,
.frame > header,
.frame > div {
  display: flex;
  height: fit-content;
  align-self: center;
  flex-direction: column;
  align-items: center;
  gap: var(--spacer);
  width: 100%;
}

.frame {
  margin: 0 auto;
  gap: 0;
  background: var(--gray-z-1);
  max-width: 100vw;

  @media (--md) {
    max-width: var(--content-width);
    padding: var(--spacer) 0 var(--spacer-lg);
    background: var(--bg);
  }
}

.frame > header {
  flex-direction: row;
  justify-content: space-between;
  position: relative;
  padding: var(--spacer);

  > h1,
  > .breadcrumb {
    font-family: var(--font-family-ui);
    text-transform: uppercase;
    font-size: var(--font-base);
    text-align: center;
    width: 100%;
    padding: 0 var(--size-8);
    color: var(--muted);
  }

  > *:not(h1):not(.breadcrumb) {
    right: var(--spacer);
    position: absolute;
    align-self: center;
    display: flex;
    align-items: center;

    @media (--md) {
      right: 0;
    }
  }

  @media (--md) {
  }
}

.frame > div {
  background: var(--gray-z-1);
  border-top: var(--border);
  gap: 0;

  :deep(> *) {
    width: 100%;
    padding: var(--spacer);

    &:not(:last-child) {
      border-bottom: var(--border);
    }

    @media (--md) {
      padding: var(--spacer-lg);
    }
  }

  @media (--sm) {
    min-height: 0;
    border: var(--border);
  }
}
</style>
