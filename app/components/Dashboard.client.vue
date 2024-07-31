<template>
  <Authorized :domain="session?.domain" to="/login">
    <PageFrame title="Home">
      <template #floating-top>
        <FeaturedPractices />
      </template>

      <Timeline />
    </PageFrame>
  </Authorized>
</template>

<style lang="postcss" scoped>
</style>
