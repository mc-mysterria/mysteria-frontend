<template>
  <div class="wiki-view">
    <iframe
      src="https://wiki.mysterria.net"
      class="wiki-frame"
      title="Mysterria Wiki"
      allow="fullscreen"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
    />
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for basic iframe implementation
</script>

<style scoped>
.wiki-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
}

.wiki-frame {
  width: 100%;
  height: 100%;
  border: none;
}
</style>