<template>
  <button
    @click="toggleTheme"
    class="theme-toggle"
    :aria-label="
      currentTheme === 'dark'
        ? 'Switch to parchment theme'
        : 'Switch to dark theme'
    "
  >
    <span v-if="currentTheme === 'dark'" class="theme-icon">☀️</span>
    <span v-else class="theme-icon">🌙</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const currentTheme = ref<"dark" | "parchment">("dark");

const toggleTheme = () => {
  const newTheme = currentTheme.value === "dark" ? "parchment" : "dark";
  currentTheme.value = newTheme;

  // Update document theme
  document.documentElement.dataset.theme = newTheme;

  // Save to localStorage
  try {
    localStorage.setItem("myst-theme", newTheme);
  } catch (_) {
    // Handle localStorage not available
  }
};

onMounted(() => {
  // Get saved theme
  try {
    const saved = localStorage.getItem("myst-theme");
    if (saved === "parchment" || saved === "dark") {
      currentTheme.value = saved;
      document.documentElement.dataset.theme = saved;
    }
  } catch (_) {
    // Handle localStorage not available
  }
});
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid color-mix(in srgb, white 15%, transparent);
  border-radius: 6px;
  background: color-mix(in srgb, var(--myst-bg) 60%, transparent);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  backdrop-filter: blur(8px);
}

.theme-toggle:hover {
  background: color-mix(in srgb, white 5%, transparent);
  border-color: color-mix(in srgb, white 30%, transparent);
}

.theme-icon {
  font-size: 14px;
  line-height: 1;
}
</style>
