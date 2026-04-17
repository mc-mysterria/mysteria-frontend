<template>
  <div class="myst-page-header">
    <div class="myst-header-decoration" aria-hidden="true"></div>
    <h1 class="myst-header-label">
      <slot>{{ title }}</slot>
    </h1>
    <div class="myst-header-decoration" aria-hidden="true"></div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  title?: string;
  eyebrow?: string;
  subtitle?: string;
}>();
</script>

<style scoped>
/* Uses global myst-page-header styles from main.css */
.myst-page-header {
  margin-top: 20px;
  margin-bottom: 60px;
}
</style>
