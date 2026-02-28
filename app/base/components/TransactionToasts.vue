<template>
  <TransitionGroup name="fade" tag="div" class="transaction-toasts">
    <a
      v-for="tx in txStore.pending"
      :key="tx.hash"
      :href="tx.txLink"
      target="_blank"
      class="transaction-toast"
    >
      <Icon
        :type="tx.status === 'waiting' ? 'loader' : 'check'"
        :class="{ spin: tx.status === 'waiting' }"
      />
      <span>{{ tx.status === 'complete' ? tx.completeText : tx.waitingText }}</span>
    </a>
  </TransitionGroup>
</template>

<script setup>
const txStore = useTransactionStore()
</script>

<style>
.transaction-toasts {
  position: fixed;
  top: var(--navbar-height);
  right: var(--size-6);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: var(--spacer-sm);
}

.transaction-toast {
  display: flex;
  align-items: center;
  gap: var(--spacer-sm);
  padding: var(--ui-padding-y) var(--ui-padding-x);
  background: var(--background);
  border: var(--border);
  font-size: var(--font-sm);
}
</style>
