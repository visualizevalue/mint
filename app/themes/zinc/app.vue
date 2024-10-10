<template>
  <div>
    <AppHeader />

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

