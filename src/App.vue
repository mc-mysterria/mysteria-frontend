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
import {useDailyBonusWatcher} from "./stores/dailyBonus";
import {useAccountNotificationsWatcher} from "./stores/notifications";
import {Analytics} from '@vercel/analytics/vue';

useUserWatcher();
useBalanceWatcher();
useServicesWatcher();
useDailyBonusWatcher();
useAccountNotificationsWatcher();

const route = useRoute();

// Force scroll to top on every route change.
// `behavior: "instant"` overrides the global `scroll-behavior: smooth`, which
// would otherwise animate the whole page back to the top on every navigation -
// on a long page that reads as the site lagging behind the click.
watch(() => route.path, () => {
  // Use requestAnimationFrame to ensure it happens after DOM updates
  requestAnimationFrame(() => {
    window.scrollTo({top: 0, left: 0, behavior: "instant"});
  });
}, {immediate: false});

const cursor = ref<HTMLDivElement | null>(null);
const cursorSize = 50;
let rafId: number | null = null;
let pointerX = 0;
let pointerY = 0;

/*
 * The glow is a fixed-position layer, so it only needs viewport coordinates.
 * Reading scrollHeight here (as the page-coordinate version did) forced a full
 * layout on every single mousemove frame, which showed up as sluggish scrolling
 * and hover feedback across the whole site.
 */
const paintCursor = () => {
  rafId = null;
  const element = cursor.value;
  if (!element) return;
  element.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
};

const updateCursorPosition = (event: MouseEvent) => {
  const halfSize = cursorSize / 2;
  pointerX = event.clientX - halfSize;
  pointerY = event.clientY - halfSize;
  if (!rafId) rafId = requestAnimationFrame(paintCursor);
};

onMounted(() => {
  // Always force dark theme for the mystical aesthetic
  document.documentElement.dataset.theme = "dark";

  document.addEventListener("mousemove", updateCursorPosition);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", updateCursorPosition);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<style scoped>
.app {
  min-height: 100vh;
  position: relative;
}

.cursor-background {
  /* fixed, not absolute: the glow tracks the pointer in viewport space, so it
     never has to be re-positioned against the document height while scrolling,
     and the blurred layer stays 50px instead of page-tall. */
  position: fixed;
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
