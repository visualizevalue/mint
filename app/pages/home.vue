<template>
  <Authenticated>
    <PageFrame title="Home">
      <header>
        <h1>{{ config.public.title }}</h1>
        <p>{{ config.public.description }}</p>
      </header>

      <section>
        <p>It doesn't look like you have deployed Mint collections.</p>
        <Button to="/create">Deploy your first</Button>
      </section>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const config = useRuntimeConfig()
</script>

<style lang="postcss" scoped>
</style>
