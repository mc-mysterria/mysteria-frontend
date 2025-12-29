<template>
  <div class="mystic-background">
    <div class="myst-fog myst-fog-a"></div>
    <div class="myst-fog myst-fog-b"></div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted} from "vue";

onMounted(() => {
  try {
    const saved = localStorage.getItem("myst-theme");
    document.documentElement.dataset.theme = saved === "parchment" ? "parchment" : "dark";
  } catch {
    document.documentElement.dataset.theme = "dark";
  }
});
</script>

<style scoped>
.mystic-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.gear img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: sepia(50%) brightness(0.8);
  will-change: transform;
  transform: translateZ(0);
}

:root[data-theme="parchment"] .gear img {
  filter: sepia(100%) saturate(150%) hue-rotate(20deg) brightness(0.5);
}

:root[data-theme="parchment"] {
  opacity: 0.02;
  mix-blend-mode: multiply;
}

</style>
