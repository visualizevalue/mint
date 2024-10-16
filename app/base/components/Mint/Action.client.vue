<template>
  <Actions class="borderless">
    <Button @click="mint">{{ $t('mint_button') }}</Button>
  </Actions>

  <TransactionFlow
    ref="txFlow"
    :text="{
      title: {
        chain: 'Switch Chain',
        requesting: 'Confirm In Wallet',
        waiting: 'Transaction Submitted',
        complete: 'Success!'
      },
      lead: {
        chain: 'Requesting to switch chain...',
        requesting: 'Requesting Signature...',
        waiting: 'Checking mint Transaction...',
        complete: `New token minted...`,
      },
      action: {
        confirm: 'Mint',
        error: 'Retry',
        complete: 'OK',
      },
    }"
    skip-confirmation
    auto-close-success
    @complete="mintCreated"
  />
</template>

<script setup>
const props = defineProps({
  collection: Object,
})

const txFlow = ref()

const { mint, mintCreated } = useCreateMintFlow(props.collection, txFlow)
</script>

<style scoped>
menu {
  justify-content: flex-end;

  @media (--md) {
    grid-column: 2;
  }
}
</style>
