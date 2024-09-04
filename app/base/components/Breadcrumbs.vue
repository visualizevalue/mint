<template>
  <div class="breadcrumb">
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

<style lang="postcss" scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacer-sm);

  > span {
    white-space: nowrap;

    &:has(+ span > a) {
      display: none;

      @media (--md) {
        display: inherit;
      }
    }
  }

  > span > a {
    color: var(--gray-z-5);
    transition: all var(--speed);

    &.router-link-active-exact,
    &:--highlight {
      color: var(--color);
    }
  }

  > span:not(:last-child):after {
    content: '/';
    color: var(--gray-z-3);
    margin-left: var(--spacer-sm);
  }
}
</style>
