<template>
  <menu>
    <slot />
  </menu>
</template>

<style scoped>
menu {
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacer-sm);

  &:empty {
    display: none;
  }

  &.centered {
    justify-content: center;
  }
}
</style>
