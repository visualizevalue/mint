<template>
  <span>
    <span class="at">@</span>
    <span class="name">{{ name }}</span>
    <span class="dot">.</span>
    <span class="tld">{{ tld }}</span>
  </span>
</template>

<script setup>
const props = defineProps({ user: Object })

const split = computed(() => props.user.domain.split('.'))
const name = computed(() => split.value[0])
const tld = computed(() => split.value[1])
</script>

<style lang="postcss" scoped>
span:has(> span) {
  font-family: var(--font-family-ui);
  text-transform: uppercase;
  color: var(--muted);

  .at,
  .dot,
  .tld {
    color: var(--gray-z-4);
  }

  .at {
    margin-left: calc(-1 * var(--size-0));
    display: none;
  }
}
</style>
