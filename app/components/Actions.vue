<template>
  <menu>
    <slot />
  </menu>
</template>

<style lang="postcss" scoped>
menu {
  width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  display: flex;
  gap: var(--spacer);
  justify-content: flex-end;

  &:empty {
    display: none;
  }
}
</style>
