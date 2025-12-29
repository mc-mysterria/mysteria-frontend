<template>
  <Analytics/>
  <div class="app">
    <MysticBackground/>
    <NotificationContainer/>

    <!-- Main Content -->
    <RouterView/>
  </div>
  <div ref="cursor" class="cursor-background"></div>
</template>

<script lang="ts" setup>
import NotificationContainer from "@/components/ui/NotificationContainer.vue";
import MysticBackground from "@/components/ui/MysticBackground.vue";
import {onMounted, onUnmounted, ref, watch} from "vue";
import {RouterView, useRoute} from "vue-router";
import {useBalanceWatcher} from "@/stores/balance";
import {useUserWatcher} from "./stores/user";
import {useServicesWatcher} from "./stores/services";
import {Analytics} from '@vercel/analytics/vue';

useUserWatcher();
useBalanceWatcher();
useServicesWatcher();

const route = useRoute();

// Force scroll to top on every route change
watch(() => route.path, () => {
  // Use requestAnimationFrame to ensure it happens after DOM updates
  requestAnimationFrame(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  });
}, {immediate: false});

const cursor = ref<HTMLDivElement | null>(null);
const cursorSize = 50;
let rafId: number | null = null;

const updateCursorPosition = (event: MouseEvent) => {
  if (cursor.value && !rafId) {
    rafId = requestAnimationFrame(() => {
      if (cursor.value) {
        const halfSize = cursorSize / 2;
        const x = Math.min(
            Math.max(event.pageX - halfSize, 0),
            window.innerWidth - cursorSize,
        );
        const y = Math.min(
            Math.max(event.pageY - halfSize, 0),
            document.documentElement.scrollHeight - cursorSize,
        );

        // Use transform instead of left/top for better performance
        cursor.value.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      rafId = null;
    });
  }
};

onMounted(() => {
  // Initialize theme
  try {
    const saved = localStorage.getItem("myst-theme");
    document.documentElement.dataset.theme = saved === "parchment" ? "parchment" : "dark";
  } catch {
    document.documentElement.dataset.theme = "dark";
  }

  document.addEventListener("mousemove", updateCursorPosition);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", updateCursorPosition);
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  position: relative;
}

.cursor-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 50px;
  height: 50px;
  background-color: var(--myst-gold);
  filter: blur(20px);
  border-radius: 50%;
  pointer-events: none;
  z-index: -2;
  opacity: 0.3;
  will-change: transform;
}

@media (max-width: 576px) {
  .cursor-background {
    display: none;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

@keyframes progress {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

@keyframes shimmer {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
