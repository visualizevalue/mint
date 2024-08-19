<template>
  <Authenticated>
    <PageFrame :title="[
      {
        text: `Add existing`
      }
    ]">
      <form @submit.stop.prevent="add">
        <FormInput v-model="address" placeholder="Contract Address (0x...)" />

        <Button>Add</Button>
      </form>
    </PageFrame>
  </Authenticated>
</template>

<script setup>
const id = useArtistId()

const address = ref('')

const add = async () => {
  if (! isAddress(address.value)) {
    alert('Not an address')
    return
  }

  await navigateTo(`/${id.value}/${address.value}`)
}
</script>

<style lang="postcss" scoped>
form {
  width: 100%;
}
</style>
