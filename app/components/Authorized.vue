<template>
  <Authenticated>
    <slot v-if="isAuthorized" />
  </Authenticated>
</template>

<script setup>
const { domain, to, } = defineProps({
  domain: [String, null],
  to: {
    type: String,
    default: '/home',
  }
})
const { initiated, session } = useSession()

const isAuthorized = computed(() => session.value && domain === session.value?.domain)

const check = () => {
  if (! initiated.value) return
  if (! isAuthorized.value) navigateTo(to)
}

onMounted(() => check())
watch(initiated, () => check())
</script>
