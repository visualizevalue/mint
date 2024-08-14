<template>
  <Authenticated>
    <PageFrame title="Profile">
      <header>
        <h1>Profile {{ address }}</h1>
      </header>

      <section>
        <div v-if="isMe">
          <Button>Edit Profile</Button>
        </div>
        <div v-else>Cool Profile innit?</div>
      </section>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
import { useAccount } from '@wagmi/vue'

const { address: authAddress, isConnected } = useAccount()

const route = useRoute()
const address = route.params.address

const isMe = computed(() => address.toLowerCase() === authAddress.value.toLowerCase())
</script>

<style lang="postcss" scoped>
</style>
