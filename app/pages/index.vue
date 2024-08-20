<template>
  <PageFrame>
    <header>
      <p>{{ config.public.description }}</p>

      <ClientOnly>
        <Connect @connected="$event => navigateTo({ name: 'id', params: { id: $event.address } })">
          <template #connected>
            <span></span>
          </template>
        </Connect>
        <template #fallback>
          <Button>Connect</Button>
        </template>
      </ClientOnly>
    </header>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()

useMetaData({
  title: config.public.title,
  description: config.public.description,
})
</script>

<style lang="postcss" scoped>
header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacer);

  p {
    text-align: center;
    color: var(--muted);
  }
}

/* HEIGHT */
header {
  height: calc(100dvh - var(--navbar-height) * 3);
}
</style>
