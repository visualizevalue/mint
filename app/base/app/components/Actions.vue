<template>
  <menu>
    <slot />
  </menu>
</template>

<style scoped>
menu {
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacer-sm);

  &:empty {
    display: none;
  }
}
</style>
