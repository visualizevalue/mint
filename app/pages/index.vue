<template>
  <PageFrame>
    <header>
      <p>{{ config.public.description }}</p>

      <Connect @connected="$event => navigateTo({ name: 'id', params: { id: $event.address } })">
        <template #connected>
          <span></span>
        </template>
      </Connect>
    </header>
  </PageFrame>
</template>

<script setup>
const config = useRuntimeConfig()

definePageMeta({
  middleware: ['redirect-user-scope']
})

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
