<template>
  <dialog ref="dialog">
    <div v-if="dialogId === 'email_verified'" class="inner">
      <button class="close" @click="close"><Icon type="x" /></button>
      <h1>Email verified!</h1>
      <p>Thank you for verifying your email. We'll be in touch as soon as we're ready to launch.</p>
      <div class="actions">
        <button @click="close" class="button">Ok</button>
      </div>
    </div>
  </dialog>
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
    dialog.value.showModal()
  }
})
</script>

<style lang="postcss">
dialog {
  position: relative;
  padding: calc(var(--spacer)*2);
  max-width: var(--dialog-width);
  width: 100%;
  border: var(--border);

  &::backdrop {
    background-image: linear-gradient(
      45deg,
      var(--gray-z-0-semi),
      var(--gray-z-1-semi),
      var(--gray-z-2-semi)
    );
    backdrop-filter: var(--blur);
  }

  .inner {
    > .close {
      position: absolute;
      top: var(--spacer);
      right: var(--spacer);
      width: var(--size-4);
    }

    > h1 {
      padding-right: var(--size-6);
      font-family: var(--font-family-ui);
      font-size: var(--font-lg);
      text-transform: uppercase;
      margin-bottom: var(--size-3);
    }

    > .actions {
      margin-top: var(--spacer);
      display: flex;
      gap: var(--spacer);
      justify-content: flex-end;
    }
  }

}
</style>
