<template>
  <div class="avatar">
    <Image v-if="user.pfp" :image="user.pfp" class="bordered round" />
    <span v-else>{{ user.domain.slice(0, 2) }}</span>
  </div>
</template>

<script setup>
const { user } = defineProps({
  user: Object,
})
</script>

<style scoped>
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 0;
  padding-bottom: 100%;
  position: relative;
  container-type: inline-size;
  container-name: avatar;

  > * {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
  }

  > span {
    font-family: var(--font-family-ui);
    text-transform: var(--text-transform-ui);
    font-size: var(--font-sm);
    color: var(--white);
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-sm);
    background: var(--gray-z-2);
    border-radius: 50%;
    border: var(--border);

    @container avatar (min-width: 2rem) {
      font-size: var(--font-base);
    }

    @container avatar (min-width: 2.75rem) {
      font-size: var(--font-lg);
    }

    @container avatar (min-width: 3.5rem) {
      font-size: var(--font-xl);
    }
  }
}
</style>
