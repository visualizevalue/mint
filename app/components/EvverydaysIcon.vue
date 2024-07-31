<template>
  <figure>
    <img src="/icon.svg" alt="Evverydays icon">
  </figure>
</template>

<style lang="postcss" scoped>
figure {
  border: var(--border);
  overflow: hidden;
  width: var(--size-10);
  height: var(--size-10);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--gray-900);

  > img {
    width: 69%;
  }
}
</style>
