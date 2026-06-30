<template>
  <div class="wiki-view">
    <iframe
        :src="wikiUrl"
        allow="fullscreen"
        class="wiki-frame"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
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

const WIKI_ORIGIN = 'https://wiki.mysterria.net'

const handleSpaMessage = (event: MessageEvent) => {
  if (event.origin !== WIKI_ORIGIN) return
  if (event.data && event.data.type === 'spa-navigate') {
    if (event.data.path && typeof event.data.path === 'string' && event.data.path.startsWith('/')) {
      router.push(event.data.path)
    } else if (event.data.url && typeof event.data.url === 'string') {
      try {
        const url = new URL(event.data.url)
        if (url.origin === WIKI_ORIGIN) {
          window.location.assign(event.data.url)
        }
      } catch {
        // ignore invalid URLs
      }
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
      ? 'https://wiki.mysterria.net/uk'
      : 'https://wiki.mysterria.net'
})
</script>

<style scoped>
.wiki-view {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.wiki-frame {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
