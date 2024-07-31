<template>
  <div class="featured-practices">
    <PaginatedContent
      :url="url"
      :query="query"
      :auto-load="false"
      v-slot="{ items }"
      class="scroll-x hide-scrollbar"
    >
      <PracticeCard
        v-for="practice in items"
        :key="practice.id"
        :practice="practice"
      />
    </PaginatedContent>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const url = `${config.public.api}/practices`
const query = computed(() => {
  return new URLSearchParams({
    limit: 24,
    sort: '-featuredAt',
    'filter[featuredAt]': '!null',
  }).toString()
})
</script>

<style lang="postcss" scoped>
.featured-practices {
  width: 100%;
  container-type: inline-size;
  container-name: featured-practices;
  padding: 0;
  position: relative;

  :deep(> div) {
    width: 100%;
    max-width: none;
    display: flex;
    flex-wrap: nowrap;
    gap: var(--spacer);
    padding: 0 var(--spacer) var(--spacer);

    > article {
      @container featured-practices (min-width: 30rem) {
        min-width: 7.5rem;
      }
    }
  }

  @media (--md) {
    padding: 0;

    :deep(> div) {
      margin-left: calc(-1 * var(--size-6));
      margin-right: calc(-1 * var(--size-6));
      padding-left: var(--size-6);
      padding-right: var(--size-6);
      width: calc(100% + var(--size-6)*2)
    }

    &:before,
    &:after {
      content: '';
      width: var(--size-6);
      position: absolute;
      top: 0;
      height: 100%;
      z-index: 1;
    }

    &:before {
      left: calc(-1 * var(--size-6));
      background: linear-gradient(to left, transparent, var(--background));
    }

    &:after {
      right: calc(-1 * var(--size-6));
      width: calc(var(--size-6)*2);
      background: linear-gradient(to right, transparent 0%, var(--background) 50%);
    }
  }
}
</style>
