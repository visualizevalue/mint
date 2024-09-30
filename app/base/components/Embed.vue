<template>
  <div class="embed">
    <iframe
      ref="frame"
      frameborder="0"
      :src="src"
    ></iframe>
  </div>
</template>

<script setup>
defineProps({
  src: String,
})
</script>

<style scoped>
.embed {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  position: relative;

  iframe {
    width: 100%;
    height: 100%;
    position: absolute;
    border: var(--border);
  }
}
</style>

