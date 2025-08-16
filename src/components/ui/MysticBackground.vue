<template>
  <div class="mystic-background">
    <div class="myst-fog myst-fog-a"></div>
    <div class="myst-fog myst-fog-b"></div>

    <!-- Animated gear elements -->
    <div class="gear-container">
      <div class="gear gear-1 animate-slow-spin">
        <img src="/src/assets/images/gear-1.png" alt="" aria-hidden="true" />
      </div>
      <div class="gear gear-2 animate-slower-spin">
        <img src="/src/assets/images/gear-2.png" alt="" aria-hidden="true" />
      </div>
    </div>

    <!-- Subtle noise texture overlay -->
    <div class="noise-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  // Apply saved theme ASAP to avoid flash
  try {
    const saved = localStorage.getItem("myst-theme");
    const theme = saved === "parchment" ? "parchment" : "dark";
    document.documentElement.dataset.theme = theme;
  } catch (_) {
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

.gear-container {
  position: absolute;
  inset: 0;
  opacity: 0.03;
}

.gear {
  position: absolute;
  opacity: 0.6;
}

.gear-1 {
  top: 10%;
  right: 15%;
  width: 120px;
  height: 120px;
}

.gear-2 {
  bottom: 20%;
  left: 10%;
  width: 80px;
  height: 80px;
}

.gear img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Reduce filter complexity for better performance */
  filter: sepia(50%) brightness(0.8);
  /* Enable hardware acceleration */
  will-change: transform;
  transform: translateZ(0);
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: url("/new/public/images/noise.png");
  background-repeat: repeat;
  opacity: 0.015;
  mix-blend-mode: overlay;
}

:root[data-theme="parchment"] .gear img {
  filter: sepia(100%) saturate(150%) hue-rotate(20deg) brightness(0.5);
}

:root[data-theme="parchment"] .noise-overlay {
  opacity: 0.02;
  mix-blend-mode: multiply;
}

/* Pause animations when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  .gear {
    animation: none;
  }
}

/* Reduce animation complexity on mobile for better performance */
@media (max-width: 768px) {
  .gear-container {
    opacity: 0.02;
  }
  
  .gear img {
    /* Simplify filters on mobile */
    filter: brightness(0.9);
  }
}

/* Optimize for low-end devices */
@media (max-width: 480px) {
  .gear-container {
    opacity: 0.01;
  }
  
  .noise-overlay {
    display: none;
  }
}
</style>
