<template>
  <div class="app">
    <NotificationContainer />
    <RouterView />
  </div>
  <div class="cursor-background" ref="cursor"></div>
  <Analytics />
</template>

<script setup lang="ts">
import NotificationContainer from "@/components/ui/NotificationContainer.vue";
import { onMounted, onUnmounted, ref } from "vue";
import { Analytics } from "@vercel/analytics/vue";
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
  document.addEventListener("mousemove", updateCursorPosition);
});

onUnmounted(() => {
  document.removeEventListener("mousemove", updateCursorPosition);
});
</script>

<style scoped>
.cursor-background {
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: #491d99;
  filter: blur(20px);
  border-radius: 50%;
  pointer-events: none;
  z-index: -5;
}

@media (max-width: 576px) {
  .cursor-background {
    display: none;
  }
}
</style>
