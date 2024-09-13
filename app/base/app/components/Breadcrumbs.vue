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

<style>
:root {
  --breadcrumb-nav-color:        var(--muted);
  --breadcrumb-nav-active-color: var(--muted);
  --breadcrumb-separator-color:  var(--muted);

  --breadcrumb-font-family:      var(--ui-font-family);
  --breadcrumb-font-size:        var(--ui-font-size);
  --breadcrumb-font-font-weight: var(--ui-font-weight);
  --breadcrumb-text-transform:   var(--ui-text-transform);
}
</style>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacer-sm);
  font-family: var(--breadcrumb-font-family);
  font-weight: var(--breadcrumb-font-weight);
  text-transform: var(--breadcrumb-text-transform);
  font-size: var(--breadcrumb-font-size);

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
    color: var(--breadcrumb-nav-color);
    transition: all var(--speed);

    &.router-link-active-exact,
    &:--highlight {
      color: var(--breadcrumb-nav-active-color);
    }
  }

  > span:not(:last-child):after {
    content: '/';
    color: var(--breadcrumb-separator-color);
    margin-left: var(--spacer-sm);
  }
}
</style>
