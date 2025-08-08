<template>
  <div class="app">
    <MysticBackground />
    <NotificationContainer />
    <RouterView />
  </div>
  <div class="cursor-background" ref="cursor"></div>
</template>

<script setup lang="ts">
import NotificationContainer from "@/components/ui/NotificationContainer.vue";
import MysticBackground from "@/components/ui/MysticBackground.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { RouterView } from "vue-router";
import { useBalanceWatcher } from "@/stores/balance";
import { useUserWatcher } from "./stores/user";
import { useServicesWatcher } from "./stores/services";

useUserWatcher();
useBalanceWatcher();
useServicesWatcher();

const cursor = ref<HTMLDivElement | null>(null);
const cursorSize = 50;

const updateCursorPosition = (event: MouseEvent) => {
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

    cursor.value.style.left = `${x}px`;
    cursor.value.style.top = `${y}px`;
  }
};

onMounted(() => {
  // Initialize theme
  try {
    const saved = localStorage.getItem("myst-theme");
    const theme = saved === "parchment" ? "parchment" : "dark";
    document.documentElement.dataset.theme = theme;
  } catch (_) {
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
  width: 50px;
  height: 50px;
  background-color: var(--myst-gold);
  filter: blur(20px);
  border-radius: 50%;
  pointer-events: none;
  z-index: -2;
  opacity: 0.3;
}

@media (max-width: 576px) {
  .cursor-background {
    display: none;
  }
}
</style>
