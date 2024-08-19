<template>
  <Dialog ref="dialog">
    <div v-if="dialogId === 'email_verified'" class="inner">
      <button class="close" @click="close"><Icon type="x" /></button>
      <h1>Email verified!</h1>
      <p>Thank you for verifying your email. We'll be in touch as soon as we're ready to launch.</p>
      <div class="actions">
        <button @click="close" class="button">Ok</button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const KNOWN = [
  'email_verified'
]

const dialog = ref()
const dialogId = computed(() => route.query?.dialog)

const close = () => {
  dialog.value.close()
  router.replace({ query: { ...route.query, dialog: undefined }})
}

onMounted(() => {
  if (KNOWN.includes(dialogId.value)) {
    dialog.value.open()
  }
})
</script>

<style lang="postcss">
</style>
