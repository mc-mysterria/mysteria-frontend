<template>
  <div class="wiki-view">
    <iframe
      :src="wikiUrl"
      class="wiki-frame"
      title="Mysterria Wiki"
      allow="fullscreen"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { currentLanguage } = useI18n()

const wikiUrl = computed(() => {
  return currentLanguage.value === 'uk' 
    ? 'https://wiki.mysterria.net' 
    : 'https://wiki.mysterria.net/en'
})
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