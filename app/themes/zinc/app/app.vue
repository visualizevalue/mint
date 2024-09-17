<template>
  <div>
    <StickyAppHeader />

    <main>
      <NuxtPage />
    </main>

    <ToggleDarkMode />
  </div>
</template>

<style scoped>
main {
  display: grid;
  gap: var(--spacer);
}
</style>

