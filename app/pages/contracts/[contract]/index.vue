<template>
  <Authenticated>
    <PageFrame title="Home">
      <header>
        Contract Manage
      </header>

      <section v-if="isSuccess">
        <img :src="metadata.image" :alt="metadata.name">
        <h1>{{ metadata.name }} <small>{{ metadata.symbol }}</small></h1>
        <p>{{ metadata.description }}</p>
      </section>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
import { useReadContract } from '@wagmi/vue'

const route = useRoute()

const { isSuccess, data } = useReadContract({
  abi: MINT_ABI,
  address: route.params.contract,
  functionName: 'contractURI',
})
// TODO: Handle other kinds of contract URIs
const metadata = computed(() => {
  const json = Buffer.from(data.value.substring(29), `base64`).toString()
  return JSON.parse(json)
})
</script>

<style lang="postcss" scoped>
</style>
