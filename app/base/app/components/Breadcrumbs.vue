<template>
  <div class="breadcrumbs">
    <span v-for="item in items">
      <NuxtLink v-if="item.to" :to="item.to">{{ item.text }}</NuxtLink>
      <template v-else>{{ item.text }}</template>
    </span>
  </div>
</template>

<script setup>
defineProps({
  items: Array,
})
</script>

<style scoped>
.breadcrumbs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacer-sm);
  font-family: var(--breadcrumb-font-family);
  font-weight: var(--breadcrumb-font-weight);
  text-transform: var(--breadcrumb-text-transform);
  font-size: var(--breadcrumb-font-size);
  letter-spacing: var(--breadcrumb-letter-spacing);

  > span {
    white-space: nowrap;
    align-self: baseline;

    &:has(+ span > a) {
      display: none;

      @media (--md) {
        display: inherit;
      }
    }
  }

  > span > a {
    background: var(--breadcrumb-background);
    color: var(--breadcrumb-color);
    border: var(--breadcrumb-border);
    border-radius: var(--breadcrumb-border-radius);
    transition: all var(--speed);

    &.router-link-active-exact,
    &:--highlight {
      color: var(--breadcrumb-active-color);
      background: var(--breadcrumb-background-highlight);
      border-color: var(--breadcrumb-border-color-highlight);
    }
  }

  > span:not(:last-child):after {
    content: '/';
    align-self: baseline;
    color: var(--breadcrumb-separator-color);
    margin-left: var(--spacer-sm);
  }
}
</style>
