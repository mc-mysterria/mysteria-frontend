<template>
  <div class="wiki-view">
    <iframe
        :src="wikiUrl"
        allow="fullscreen"
        class="wiki-frame"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
        title="Mysterria Wiki"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted} from 'vue'
import {useRouter} from 'vue-router'
import {useI18n} from '@/composables/useI18n'

const router = useRouter()
const {currentLanguage} = useI18n()

const handleSpaMessage = (event: MessageEvent) => {
  if (event.data && event.data.type === 'spa-navigate') {
    if (event.data.path && event.data.path.startsWith('/')) {
      router.push(event.data.path)
    } else if (event.data.url) {
      window.location.assign(event.data.url)
    }
  }
}

onMounted(() => {
  window.addEventListener('message', handleSpaMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleSpaMessage)
})

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