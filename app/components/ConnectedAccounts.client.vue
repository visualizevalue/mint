<template>
  <div>
    <Button v-if="twitterUser" class="left" disabled>
      <Icon type="twitter" />
      X (Twitter) Connected ({{ twitterUser }})
    </Button>
    <Button v-else :to="`${config.public.api}/oauth/twitter/redirect`" class="left">
      <Icon type="twitter" />
      Connect X (Twitter)
    </Button>

    <Button v-if="githubUser" class="left" disabled>
      <Icon type="github" />
      Github Connected ({{ githubUser }})
    </Button>
    <Button v-else :to="`${config.public.api}/oauth/github/redirect`" class="left">
      <Icon type="github" />
      Connect Github
    </Button>

    <Button v-if="facebookUser" class="left" disabled>
      <Icon type="facebook" />
      FaceBook Connected ({{ facebookUser }})
    </Button>
    <Button v-else :to="`${config.public.api}/oauth/facebook/redirect`" class="left">
      <Icon type="facebook" />
      Connect FaceBook
    </Button>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()

const { user } = defineProps({ user: Object })

const githubUser = computed(() => user?.socials?.github)
const twitterUser = computed(() => user?.socials?.twitter)
const facebookUser = computed(() => user?.socials?.facebook)
</script>

<style lang="postcss" scoped>
div {
  display: flex;
  gap: var(--spacer);
  flex-wrap: wrap;
}

.button {
  width: fit-content;
}
</style>
