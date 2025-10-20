<template>
  <Analytics />
  <div class="app">
    <MysticBackground />
    <NotificationContainer />
    
    <!-- Main Content -->
    <RouterView />
  </div>
  <div class="cursor-background" ref="cursor"></div>
</template>

<script setup lang="ts">
import NotificationContainer from "@/components/ui/NotificationContainer.vue";
import MysticBackground from "@/components/ui/MysticBackground.vue";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import { useBalanceWatcher } from "@/stores/balance";
import { useUserWatcher } from "./stores/user";
import { useServicesWatcher } from "./stores/services";
import { Analytics } from '@vercel/analytics/vue';

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
}, { immediate: false });

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
    const theme = saved === "parchment" ? "parchment" : "dark";
    document.documentElement.dataset.theme = theme;
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

/* Loading overlay styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  min-width: 300px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-ring {
  width: 48px;
  height: 48px;
  border: 3px solid transparent;
  border-radius: 50%;
  border-top: 3px solid var(--myst-gold, #4ade80);
  animation: spin 1s linear infinite;
  position: relative;
}

.spinner-ring::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top: 2px solid rgba(74, 222, 128, 0.3);
  animation: spin 2s linear infinite reverse;
}

.loading-text {
  color: var(--myst-ink, #ffffff);
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
  animation: pulse 2s ease-in-out infinite;
  text-align: center;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--myst-gold, #4ade80), rgba(74, 222, 128, 0.8));
  border-radius: 2px;
  width: 0%;
  animation: progress 0.5s ease-out forwards;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 20px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4));
  animation: shimmer 1s ease-in-out infinite;
}

/* Loading overlay transition animations */
.loading-overlay-enter-active,
.loading-overlay-leave-active {
  transition: all 0.3s ease;
}

.loading-overlay-enter-from,
.loading-overlay-leave-to {
  opacity: 0;
}

.loading-overlay-enter-active .loading-content,
.loading-overlay-leave-active .loading-content {
  transition: transform 0.3s ease;
}

.loading-overlay-enter-from .loading-content,
.loading-overlay-leave-to .loading-content {
  transform: scale(0.9) translateY(20px);
}

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
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
    width: 0%;
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
